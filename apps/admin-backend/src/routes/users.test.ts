import { describe, it, expect, vi } from "vitest";
import app from "../app";

function createMockDB(opts: {
  total?: number;
  rows?: Record<string, unknown>[];
  runChanges?: number;
} = {}) {
  const total = opts.total ?? 3;
  const rows = opts.rows ?? [
    { username: "alice", total_td: 1000, current_td: 500, corporate_rank: "CTO", country: "US", updated_at: "2026-01-01", license_hash: "abcdef1234567890abcdef", credits_used: 5, user_status: "max" },
    { username: "bob", total_td: 200, current_td: 200, corporate_rank: "Intern", country: "UK", updated_at: "2026-01-02", license_hash: null, credits_used: 10, user_status: "free" },
    { username: "carol", total_td: 0, current_td: 0, corporate_rank: "Junior", country: "", updated_at: "2026-01-03", license_hash: "revoked123456789012", credits_used: 0, user_status: "revoked" },
  ];
  return {
    prepare: vi.fn((sql: string) => {
      const isCount = sql.includes("COUNT(*)");
      return {
        bind: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValue(isCount ? { total } : null),
        run: vi.fn().mockResolvedValue({ meta: { changes: opts.runChanges ?? 1 } }),
        all: vi.fn().mockResolvedValue({ results: rows }),
      };
    }),
    exec: vi.fn().mockResolvedValue({ results: [] }),
    batch: vi.fn().mockResolvedValue([]),
  };
}

function getUsers(env: Record<string, unknown>, query = "") {
  return app.request(`/api/users${query}`, {}, { ALLOWED_ORIGINS: "http://localhost:5174", ...env });
}

function postJSON(path: string, body: unknown, env: Record<string, unknown>) {
  return app.request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }, { ALLOWED_ORIGINS: "http://localhost:5174", ...env });
}

function putJSON(path: string, body: unknown, env: Record<string, unknown>) {
  return app.request(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }, { ALLOWED_ORIGINS: "http://localhost:5174", ...env });
}

describe("GET /api/users", () => {
  it("returns 500 when DB is not configured", async () => {
    const res = await getUsers({});
    expect(res.status).toBe(500);
  });

  it("returns paginated user list with masked hashes", async () => {
    const db = createMockDB();
    const res = await getUsers({ DB: db });
    expect(res.status).toBe(200);
    const data = await res.json() as { items: Record<string, unknown>[]; total: number };
    expect(data.total).toBe(3);
    expect(data.items).toHaveLength(3);
    // Max user hash should be masked
    const aliceHash = data.items[0].license_hash as string;
    expect(aliceHash).toContain("…");
    // Free user hash should be null
    expect(data.items[1].license_hash).toBeNull();
  });

  it("returns 400 for invalid status filter", async () => {
    const db = createMockDB();
    const res = await getUsers({ DB: db }, "?status=invalid");
    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toContain("Invalid status filter");
  });

  it("accepts valid status filters", async () => {
    const db = createMockDB();
    for (const status of ["free", "max", "revoked"]) {
      const res = await getUsers({ DB: db }, `?status=${status}`);
      expect(res.status).toBe(200);
    }
  });

  it("clamps limit to 200 max", async () => {
    const db = createMockDB();
    const res = await getUsers({ DB: db }, "?limit=999");
    expect(res.status).toBe(200);
    const data = await res.json() as { limit: number };
    expect(data.limit).toBe(200);
  });
});

describe("POST /api/users", () => {
  it("returns 400 when username is missing", async () => {
    const db = createMockDB();
    const res = await postJSON("/api/users", {}, { DB: db });
    expect(res.status).toBe(400);
  });

  it("creates a user successfully", async () => {
    const db = createMockDB();
    const res = await postJSON("/api/users", { username: "newuser" }, { DB: db });
    expect(res.status).toBe(200);
    const data = await res.json() as { success: boolean; username: string };
    expect(data.success).toBe(true);
    expect(data.username).toBe("newuser");
  });
});

describe("PUT /api/users/:username", () => {
  it("returns 400 when no fields are provided", async () => {
    const db = createMockDB();
    const res = await putJSON("/api/users/alice", {}, { DB: db });
    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toBe("No fields to update");
  });

  it("returns 400 when username is empty string", async () => {
    const db = createMockDB();
    const res = await putJSON("/api/users/alice", { username: "  " }, { DB: db });
    expect(res.status).toBe(400);
  });

  it("updates user fields successfully", async () => {
    const db = createMockDB();
    const res = await putJSON("/api/users/alice", { total_td: 999 }, { DB: db });
    expect(res.status).toBe(200);
    const data = await res.json() as { success: boolean };
    expect(data.success).toBe(true);
  });
});

describe("POST /api/users/:username/reset", () => {
  it("resets user TD to zero", async () => {
    const db = createMockDB();
    const res = await postJSON("/api/users/alice/reset", {}, { DB: db });
    expect(res.status).toBe(200);
    const data = await res.json() as { success: boolean; username: string };
    expect(data.success).toBe(true);
    expect(data.username).toBe("alice");
  });
});

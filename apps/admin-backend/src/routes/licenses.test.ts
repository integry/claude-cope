import { describe, it, expect, vi } from "vitest";
import app from "../app";

function createMockDB(opts: {
  total?: number;
  rows?: Record<string, unknown>[];
} = {}) {
  const total = opts.total ?? 2;
  const rows = opts.rows ?? [
    { id: 1, key_hash: "abcdef1234567890abcdef", status: "active", created_at: "2026-01-01", last_activated_at: "2026-01-02", username: "alice" },
    { id: 2, key_hash: "1234567890abcdef1234", status: "revoked", created_at: "2026-01-03", last_activated_at: null, username: null },
  ];
  return {
    prepare: vi.fn((sql: string) => {
      const isCount = sql.includes("COUNT(*)");
      return {
        bind: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValue(isCount ? { total } : null),
        run: vi.fn().mockResolvedValue({ meta: { changes: 0 } }),
        all: vi.fn().mockResolvedValue({ results: rows }),
      };
    }),
    exec: vi.fn().mockResolvedValue({ results: [] }),
    batch: vi.fn().mockResolvedValue([]),
  };
}

function getLicenses(env: Record<string, unknown>, query = "") {
  return app.request(`/api/licenses${query}`, {}, { ALLOWED_ORIGINS: "http://localhost:5174", ...env });
}

describe("GET /api/licenses", () => {
  it("returns 500 when DB is not configured", async () => {
    const res = await getLicenses({});
    expect(res.status).toBe(500);
  });

  it("returns paginated license list with masked hashes", async () => {
    const db = createMockDB();
    const res = await getLicenses({ DB: db });
    expect(res.status).toBe(200);
    const data = await res.json() as { items: Record<string, unknown>[]; total: number };
    expect(data.total).toBe(2);
    expect(data.items).toHaveLength(2);
    // Hashes should be masked — never the full value
    const firstHash = data.items[0].key_hash as string;
    expect(firstHash).toContain("…");
    expect(firstHash).not.toBe("abcdef1234567890abcdef");
  });

  it("respects limit and offset query params", async () => {
    const db = createMockDB();
    const res = await getLicenses({ DB: db }, "?limit=10&offset=5");
    expect(res.status).toBe(200);
    const data = await res.json() as { limit: number; offset: number };
    expect(data.limit).toBe(10);
    expect(data.offset).toBe(5);
  });

  it("clamps limit to 200 max", async () => {
    const db = createMockDB();
    const res = await getLicenses({ DB: db }, "?limit=500");
    expect(res.status).toBe(200);
    const data = await res.json() as { limit: number };
    expect(data.limit).toBe(200);
  });
});

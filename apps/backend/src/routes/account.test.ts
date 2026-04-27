import { describe, it, expect, vi } from "vitest";
import app from "../app";

// ---------------------------------------------------------------------------
// Mock DB helpers
// ---------------------------------------------------------------------------

/** Minimal D1-like mock that tracks queries and returns preconfigured results. */
function createMockDB(opts: {
  firstResults?: Record<string, unknown>;
  runChanges?: number;
} = {}) {
  const calls: { sql: string; bindings: unknown[] }[] = [];
  const stmt = () => ({
    first: vi.fn().mockResolvedValue(opts.firstResults ?? null),
    run: vi.fn().mockResolvedValue({ meta: { changes: opts.runChanges ?? 0 } }),
    all: vi.fn().mockResolvedValue({ results: [] }),
  });
  return {
    db: {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((...args: unknown[]) => {
          calls.push({ sql, bindings: args });
          return stmt();
        }),
        ...stmt(),
      })),
      exec: vi.fn().mockResolvedValue({ results: [] }),
      batch: vi.fn().mockResolvedValue([]),
    },
    calls,
  };
}

function mockKV(store: Record<string, string> = {}) {
  return {
    get: vi.fn((key: string) => Promise.resolve(store[key] ?? null)),
    put: vi.fn(() => Promise.resolve()),
    delete: vi.fn(() => Promise.resolve()),
  };
}

function postJSON(path: string, body: unknown, env: Record<string, unknown>) {
  return app.request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }, { ALLOWED_ORIGINS: "http://localhost:5173", ...env });
}

// ---------------------------------------------------------------------------
// /api/account/buy-generator
// ---------------------------------------------------------------------------

describe("POST /api/account/buy-generator", () => {
  it("returns 500 when DB is not configured", async () => {
    const res = await postJSON("/api/account/buy-generator", {
      username: "alice", generatorId: "stackoverflow-copy-paster", amount: 1, licenseKeyHash: "hash",
    }, {});
    expect(res.status).toBe(500);
  });

  it("returns 400 when required fields are missing", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/buy-generator", { username: "alice" }, { DB: db });
    expect(res.status).toBe(400);
  });

  it("returns 400 when amount is not a positive integer", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/buy-generator", {
      username: "alice", generatorId: "stackoverflow-copy-paster", amount: -1, licenseKeyHash: "hash",
    }, { DB: db });
    expect(res.status).toBe(400);
  });

  it("returns 400 when amount exceeds 1000", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/buy-generator", {
      username: "alice", generatorId: "stackoverflow-copy-paster", amount: 1001, licenseKeyHash: "hash",
    }, { DB: db });
    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toContain("max 1000");
  });

  it("returns 400 for unknown generatorId", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/buy-generator", {
      username: "alice", generatorId: "does-not-exist", amount: 1, licenseKeyHash: "hash",
    }, { DB: db });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toBe("Unknown generator");
  });

  it("returns 404 when profile is not found", async () => {
    const { db } = createMockDB({ firstResults: undefined });
    const res = await postJSON("/api/account/buy-generator", {
      username: "alice", generatorId: "stackoverflow-copy-paster", amount: 1, licenseKeyHash: "hash",
    }, { DB: db });
    expect(res.status).toBe(404);
  });

  it("returns 403 when license hash does not match", async () => {
    // First call returns the profile row (getProfileRow) with a different hash
    const { db } = createMockDB({
      firstResults: {
        username: "alice", license_hash: "other-hash",
        total_td: 1000, current_td: 1000, corporate_rank: "CTO",
        inventory: "{}", upgrades: "[]", achievements: "[]",
        buddy_type: null, buddy_is_shiny: 0,
        unlocked_themes: '["default"]', active_theme: "default",
        active_ticket: null, td_multiplier: 1,
      },
    });
    const res = await postJSON("/api/account/buy-generator", {
      username: "alice", generatorId: "stackoverflow-copy-paster", amount: 1, licenseKeyHash: "wrong-hash",
    }, { DB: db });
    expect(res.status).toBe(403);
  });
});

// ---------------------------------------------------------------------------
// /api/account/buy-upgrade
// ---------------------------------------------------------------------------

describe("POST /api/account/buy-upgrade", () => {
  it("returns 400 when required fields are missing", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/buy-upgrade", { username: "alice" }, { DB: db });
    expect(res.status).toBe(400);
  });

  it("returns 400 for unknown upgradeId", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/buy-upgrade", {
      username: "alice", upgradeId: "nonexistent", licenseKeyHash: "hash",
    }, { DB: db });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toBe("Unknown upgrade");
  });
});

// ---------------------------------------------------------------------------
// /api/account/buy-theme
// ---------------------------------------------------------------------------

describe("POST /api/account/buy-theme", () => {
  it("returns 400 when required fields are missing", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/buy-theme", { username: "alice" }, { DB: db });
    expect(res.status).toBe(400);
  });

  it("returns 400 for unknown themeId", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/buy-theme", {
      username: "alice", themeId: "nonexistent", licenseKeyHash: "hash",
    }, { DB: db });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toBe("Unknown theme");
  });
});

// ---------------------------------------------------------------------------
// /api/account/unlock-achievement
// ---------------------------------------------------------------------------

describe("POST /api/account/unlock-achievement", () => {
  it("returns 400 when required fields are missing", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/unlock-achievement", { username: "alice" }, { DB: db });
    expect(res.status).toBe(400);
  });

  it("returns 400 for unknown achievementId", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/unlock-achievement", {
      username: "alice", achievementId: "totally-fake", licenseKeyHash: "hash",
    }, { DB: db });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toBe("Unknown achievementId");
  });

  it("returns 404 when profile does not exist", async () => {
    const { db } = createMockDB({ firstResults: undefined });
    const res = await postJSON("/api/account/unlock-achievement", {
      username: "alice", achievementId: "the_leaker", licenseKeyHash: "hash",
    }, { DB: db });
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// /api/account/update-buddy
// ---------------------------------------------------------------------------

describe("POST /api/account/update-buddy", () => {
  it("returns 400 when required fields are missing", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/update-buddy", { buddyType: null, isShiny: false }, { DB: db });
    expect(res.status).toBe(400);
  });

  it("returns 400 when isShiny is not a boolean", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/update-buddy", {
      username: "alice", buddyType: null, isShiny: 1, licenseKeyHash: "hash",
    }, { DB: db });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toBe("isShiny must be a boolean");
  });

  it("returns 400 when isShiny is a string", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/update-buddy", {
      username: "alice", buddyType: null, isShiny: "true", licenseKeyHash: "hash",
    }, { DB: db });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toBe("isShiny must be a boolean");
  });

  it("returns 400 for unknown buddyType", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/update-buddy", {
      username: "alice", buddyType: "nonexistent", isShiny: false, licenseKeyHash: "hash",
    }, { DB: db });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toBe("Unknown buddyType");
  });

  it("returns 404 when profile does not exist", async () => {
    const { db } = createMockDB({ firstResults: undefined });
    const res = await postJSON("/api/account/update-buddy", {
      username: "alice", buddyType: null, isShiny: false, licenseKeyHash: "hash",
    }, { DB: db });
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// /api/account/update-ticket
// ---------------------------------------------------------------------------

describe("POST /api/account/update-ticket", () => {
  it("returns 400 when required fields are missing", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/update-ticket", { activeTicket: null }, { DB: db });
    expect(res.status).toBe(400);
  });

  it("returns 400 for malformed activeTicket (non-object)", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/update-ticket", {
      username: "alice", activeTicket: "not-an-object", licenseKeyHash: "hash",
    }, { DB: db });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toContain("activeTicket must be an object");
  });

  it("returns 400 for activeTicket with invalid sprintProgress", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/update-ticket", {
      username: "alice",
      activeTicket: { id: "t1", title: "Task", sprintProgress: -1, sprintGoal: 10 },
      licenseKeyHash: "hash",
    }, { DB: db });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toContain("sprintProgress");
  });

  it("returns 400 when sprintProgress exceeds sprintGoal", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/update-ticket", {
      username: "alice",
      activeTicket: { id: "t1", title: "Task", sprintProgress: 15, sprintGoal: 10 },
      licenseKeyHash: "hash",
    }, { DB: db });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toContain("sprintProgress cannot exceed");
  });

  it("returns 404 when profile does not exist", async () => {
    const { db } = createMockDB({ firstResults: undefined });
    const res = await postJSON("/api/account/update-ticket", {
      username: "alice",
      activeTicket: { id: "t1", title: "Task", sprintProgress: 5, sprintGoal: 10 },
      licenseKeyHash: "hash",
    }, { DB: db });
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// /api/account/shill
// ---------------------------------------------------------------------------

describe("POST /api/account/shill", () => {
  it("returns 500 when KV is not configured", async () => {
    const res = await postJSON("/api/account/shill", {}, {});
    expect(res.status).toBe(500);
  });

  it("returns 409 when shill credit was already claimed", async () => {
    // The session middleware sets sessionId from cookie; without a cookie
    // a random UUID is generated. We need a KV that returns "1" for
    // any shill:* key.
    const kv = mockKV({ "shill:test-session": "1" });
    const res = await app.request("/api/account/shill", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: "cope_session_id=test-session",
      },
      body: "{}",
    }, { ALLOWED_ORIGINS: "http://localhost:5173", QUOTA_KV: kv });
    expect(res.status).toBe(409);
  });

  it("grants shill credit on first claim", async () => {
    const kv = mockKV({});
    const res = await app.request("/api/account/shill", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: "cope_session_id=test-session",
      },
      body: "{}",
    }, { ALLOWED_ORIGINS: "http://localhost:5173", QUOTA_KV: kv });
    expect(res.status).toBe(200);
    const data = await res.json() as { success: boolean; creditsGranted: number };
    expect(data.success).toBe(true);
    expect(data.creditsGranted).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// /api/account/me
// ---------------------------------------------------------------------------

describe("GET /api/account/me", () => {
  it("returns found: false when KV is not configured", async () => {
    const res = await app.request("/api/account/me", {
      headers: { Cookie: "cope_session_id=test-session" },
    }, { ALLOWED_ORIGINS: "http://localhost:5173" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ found: false });
  });

  it("returns found: false when session has no mapped username", async () => {
    const kv = mockKV({});
    const res = await app.request("/api/account/me", {
      headers: { Cookie: "cope_session_id=test-session" },
    }, { ALLOWED_ORIGINS: "http://localhost:5173", QUOTA_KV: kv });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ found: false });
  });
});

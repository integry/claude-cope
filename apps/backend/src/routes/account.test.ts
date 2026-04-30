import { describe, it, expect, vi, afterEach } from "vitest";
import app from "../app";

function createMockDB(opts: {
  firstResults?: Record<string, unknown>;
  firstBySQL?: Record<string, Record<string, unknown> | null>;
  runChanges?: number;
} = {}) {
  const calls: { sql: string; bindings: unknown[] }[] = [];
  const resolveFirst = (sql: string) => {
    if (opts.firstBySQL) {
      for (const [pattern, result] of Object.entries(opts.firstBySQL)) {
        if (sql.includes(pattern)) return result;
      }
    }
    return opts.firstResults ?? null;
  };
  const stmt = (sql: string) => ({
    first: vi.fn().mockResolvedValue(resolveFirst(sql)),
    run: vi.fn().mockResolvedValue({ meta: { changes: opts.runChanges ?? 0 } }),
    all: vi.fn().mockResolvedValue({ results: [] }),
  });
  return {
    db: {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((...args: unknown[]) => {
          calls.push({ sql, bindings: args });
          return stmt(sql);
        }),
        ...stmt(sql),
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

function postWithSession(path: string, body: unknown, env: Record<string, unknown>, sid = "test-session") {
  return app.request(path, { method: "POST",
    headers: { "Content-Type": "application/json", Cookie: `cope_session_id=${sid}` },
    body: JSON.stringify(body),
  }, { ALLOWED_ORIGINS: "http://localhost:5173", ...env });
}

function getWithSession(path: string, env: Record<string, unknown>) {
  return app.request(path, { headers: { Cookie: "cope_session_id=test-session" } },
    { ALLOWED_ORIGINS: "http://localhost:5173", ...env });
}

const BASE_PROFILE = { username: "alice", license_hash: "hash", total_td: 1000, current_td: 1000,
  corporate_rank: "CTO", inventory: "{}", upgrades: "[]", achievements: "[]", buddy_type: null,
  buddy_is_shiny: 0, unlocked_themes: '["default"]', active_theme: "default", active_ticket: null,
  td_multiplier: 1 };

function profileWithHash(hash: string) {
  return { ...BASE_PROFILE, license_hash: hash };
}

function ownedMockDB(opts: { runChanges?: number } = {}) {
  return createMockDB({
    firstBySQL: {
      "SELECT username": BASE_PROFILE,
      "SELECT status": { status: "active" },
    },
    runChanges: opts.runChanges ?? 1,
  });
}

const GEN_BODY = { username: "alice", generatorId: "stackoverflow-copy-paster", amount: 1, licenseKeyHash: "hash" };

describe("POST /api/account/buy-generator", () => {
  it("returns 500 when DB is not configured", async () => { expect((await postJSON("/api/account/buy-generator", GEN_BODY, {})).status).toBe(500); });
  it("returns 400 when required fields are missing", async () => { expect((await postJSON("/api/account/buy-generator", { username: "alice" }, { DB: createMockDB().db })).status).toBe(400); });
  it("returns 400 when amount is not a positive integer", async () => { expect((await postJSON("/api/account/buy-generator", { ...GEN_BODY, amount: -1 }, { DB: createMockDB().db })).status).toBe(400); });
  it("returns 400 when amount exceeds 1000", async () => {
    const res = await postJSON("/api/account/buy-generator", { ...GEN_BODY, amount: 1001 }, { DB: createMockDB().db });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toContain("max 1000");
  });
  it("returns 400 for unknown generatorId", async () => {
    const res = await postJSON("/api/account/buy-generator", { ...GEN_BODY, generatorId: "does-not-exist" }, { DB: createMockDB().db });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toBe("Unknown generator");
  });
  it("returns 404 when profile is not found", async () => { expect((await postJSON("/api/account/buy-generator", GEN_BODY, { DB: createMockDB({ firstResults: undefined }).db })).status).toBe(404); });
  it("returns 403 when license hash does not match", async () => { expect((await postJSON("/api/account/buy-generator", { ...GEN_BODY, licenseKeyHash: "wrong-hash" }, { DB: createMockDB({ firstResults: profileWithHash("other-hash") }).db })).status).toBe(403); });
  it("returns 403 when license is revoked", async () => {
    const { db } = createMockDB({
      firstBySQL: { "SELECT username": BASE_PROFILE, "SELECT status": { status: "revoked" } },
    });
    const res = await postJSON("/api/account/buy-generator", GEN_BODY, { DB: db });
    expect(res.status).toBe(403);
    const data = await res.json() as { error: string };
    expect(data.error).toContain("revoked");
  });
  it("succeeds with valid ownership and sufficient TD", async () => { expect((await postJSON("/api/account/buy-generator", GEN_BODY, { DB: ownedMockDB().db })).status).toBe(200); });
  it("returns 409 when concurrent update causes zero changes", async () => { expect((await postJSON("/api/account/buy-generator", GEN_BODY, { DB: ownedMockDB({ runChanges: 0 }).db })).status).toBe(409); });
});
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
  it("succeeds when ownership is valid and update matches", async () => {
    const { db } = ownedMockDB();
    const res = await postJSON("/api/account/update-buddy", {
      username: "alice", buddyType: "Agile Snail", isShiny: false, licenseKeyHash: "hash",
    }, { DB: db });
    expect(res.status).toBe(200);
    const data = await res.json() as { success: boolean };
    expect(data.success).toBe(true);
  });
  it("returns 409 when update matches zero rows (revoked between check and write)", async () => {
    const { db } = ownedMockDB({ runChanges: 0 });
    const res = await postJSON("/api/account/update-buddy", {
      username: "alice", buddyType: null, isShiny: false, licenseKeyHash: "hash",
    }, { DB: db });
    expect(res.status).toBe(409);
  });
});
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
      username: "alice", licenseKeyHash: "hash",
      activeTicket: { id: "t1", title: "Task", sprintProgress: -1, sprintGoal: 10 },
    }, { DB: db });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toContain("sprintProgress");
  });
  it("returns 400 when sprintProgress exceeds sprintGoal", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/update-ticket", {
      username: "alice", licenseKeyHash: "hash",
      activeTicket: { id: "t1", title: "Task", sprintProgress: 15, sprintGoal: 10 },
    }, { DB: db });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toContain("sprintProgress cannot exceed");
  });
  it("returns 404 when profile does not exist", async () => {
    const { db } = createMockDB({ firstResults: undefined });
    const res = await postJSON("/api/account/update-ticket", {
      username: "alice", licenseKeyHash: "hash",
      activeTicket: { id: "t1", title: "Task", sprintProgress: 5, sprintGoal: 10 },
    }, { DB: db });
    expect(res.status).toBe(404);
  });
  it("succeeds when ownership is valid and update matches", async () => {
    const { db } = ownedMockDB();
    const res = await postJSON("/api/account/update-ticket", {
      username: "alice", licenseKeyHash: "hash",
      activeTicket: { id: "t1", title: "Task", sprintProgress: 5, sprintGoal: 10 },
    }, { DB: db });
    expect(res.status).toBe(200);
    const data = await res.json() as { success: boolean };
    expect(data.success).toBe(true);
  });
  it("returns 409 when update matches zero rows (revoked between check and write)", async () => {
    const { db } = ownedMockDB({ runChanges: 0 });
    const res = await postJSON("/api/account/update-ticket", {
      username: "alice", licenseKeyHash: "hash",
      activeTicket: { id: "t1", title: "Task", sprintProgress: 5, sprintGoal: 10 },
    }, { DB: db });
    expect(res.status).toBe(409);
  });
});
describe("POST /api/account/shill", () => {
  it("returns 500 when KV is not configured", async () => {
    const res = await postJSON("/api/account/shill", {}, {});
    expect(res.status).toBe(500);
  });
  it("returns 409 when shill credit was already claimed", async () => {
    const kv = mockKV({ "shill:test-session": "1" });
    const res = await postWithSession("/api/account/shill", {}, { QUOTA_KV: kv });
    expect(res.status).toBe(409);
  });
  it("grants shill credit on first claim", async () => {
    const kv = mockKV({});
    const res = await postWithSession("/api/account/shill", {}, { QUOTA_KV: kv });
    expect(res.status).toBe(200);
    const data = await res.json() as { success: boolean; creditsGranted: number };
    expect(data.success).toBe(true);
    expect(data.creditsGranted).toBe(5);
  });
});
describe("POST /api/account/checkout-license", () => {
  it("returns 400 when checkoutId is missing", async () => {
    const res = await postJSON("/api/account/checkout-license", {}, {
      POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org",
    });
    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toContain("checkoutId");
  });
  it("returns 500 when Polar is not configured", async () => {
    const res = await postJSON("/api/account/checkout-license", { checkoutId: "co_123" }, {});
    expect(res.status).toBe(500);
  });
  it("returns cached key from KV on repeated calls", async () => {
    const kv = mockKV({ "checkout_used:co_123": JSON.stringify(["COPE-ABC"]) });
    const res = await postWithSession("/api/account/checkout-license", { checkoutId: "co_123" },
      { POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org", QUOTA_KV: kv }, "s");
    expect(res.status).toBe(200);
    const data = await res.json() as { licenseKey: string; allKeys: string[] };
    expect(data.licenseKey).toBe("COPE-ABC");
    expect(data.allKeys).toEqual(["COPE-ABC"]);
  });
  it("handles legacy cached string (not JSON array) gracefully", async () => {
    const kv = mockKV({ "checkout_used:co_old": "COPE-LEGACY" });
    const res = await postWithSession("/api/account/checkout-license", { checkoutId: "co_old" },
      { POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org", QUOTA_KV: kv }, "s");
    expect(res.status).toBe(200);
    const data = await res.json() as { licenseKey: string; allKeys: string[] };
    expect(data.licenseKey).toBe("COPE-LEGACY");
    expect(data.allKeys).toEqual(["COPE-LEGACY"]);
  });
  it("returns cached multi-key team pack from KV", async () => {
    const keys = ["COPE-T1", "COPE-T2", "COPE-T3"];
    const kv = mockKV({ "checkout_used:co_team": JSON.stringify(keys) });
    const res = await postWithSession("/api/account/checkout-license", { checkoutId: "co_team" },
      { POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org", QUOTA_KV: kv }, "s");
    expect(res.status).toBe(200);
    const data = await res.json() as { licenseKey: string; allKeys: string[] };
    expect(data.licenseKey).toBe("COPE-T1");
    expect(data.allKeys).toEqual(keys);
  });
  it("returns 400 for invalid checkoutId format", async () => {
    expect((await postJSON("/api/account/checkout-license", { checkoutId: ";;;invalid" }, { POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org" })).status).toBe(400);
  });
  it("returns 403 when cached checkout was redeemed by a different session", async () => {
    const cachePayload = JSON.stringify({ keys: ["COPE-BOUND"], sessionId: "original-session" });
    const kv = mockKV({ "checkout_used:co_bound": cachePayload });
    const res = await postWithSession("/api/account/checkout-license", { checkoutId: "co_bound" },
      { POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org", QUOTA_KV: kv }, "different-session");
    expect(res.status).toBe(403);
    const data = await res.json() as { error: string };
    expect(data.error).toContain("already redeemed");
  });
  it("returns keys when cached checkout session matches the caller", async () => {
    const cachePayload = JSON.stringify({ keys: ["COPE-MINE"], sessionId: "my-session" });
    const kv = mockKV({ "checkout_used:co_mine": cachePayload });
    const res = await postWithSession("/api/account/checkout-license", { checkoutId: "co_mine" },
      { POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org", QUOTA_KV: kv }, "my-session");
    expect(res.status).toBe(200);
    const data = await res.json() as { licenseKey: string; allKeys: string[] };
    expect(data.licenseKey).toBe("COPE-MINE");
    expect(data.allKeys).toEqual(["COPE-MINE"]);
  });
  it("allows legacy cache entries without session binding (backward compat)", async () => {
    const kv = mockKV({ "checkout_used:co_legacy": JSON.stringify(["COPE-OLD"]) });
    const res = await postWithSession("/api/account/checkout-license", { checkoutId: "co_legacy" },
      { POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org", QUOTA_KV: kv }, "any-session");
    expect(res.status).toBe(200);
    const data = await res.json() as { licenseKey: string; allKeys: string[] };
    expect(data.licenseKey).toBe("COPE-OLD");
  });
  describe("non-cached Polar fetch path", () => {
    const origFetch = globalThis.fetch;
    afterEach(() => { globalThis.fetch = origFetch; });
    const penv = { POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org", QUOTA_KV: mockKV({}) };
    const T = "2026-01-02T00:00:00Z";
    const co = (id: string) => postWithSession("/api/account/checkout-license", { checkoutId: id }, { ...penv, QUOTA_KV: mockKV({}) }, "s");
    function stubPolar(checkout: object, lk?: object) {
      globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
        const u = typeof input === "string" ? input : input.toString();
        if (u.includes("/v1/checkouts/")) return new Response(JSON.stringify(checkout));
        if (u.includes("/v1/license-keys/")) return new Response(JSON.stringify(lk ?? { items: [] }));
        return origFetch(input as RequestInfo, undefined);
      }) as typeof fetch;
    }
    it("returns single key for successful checkout", async () => {
      stubPolar({ organization_id: "org", status: "succeeded", customer_id: "c1", created_at: T }, { items: [{ key: "COPE-NEW", created_at: "2026-01-02T00:00:05Z", status: "granted" }] });
      const res = await co("co_new");
      expect(res.status).toBe(200);
      expect(((await res.json()) as { allKeys: string[] }).allKeys).toEqual(["COPE-NEW"]);
    });
    it("returns multiple keys for team-pack", async () => {
      stubPolar({ organization_id: "org", status: "succeeded", customer_id: "c1", created_at: T }, { items: ["T1", "T2", "T3"].map((k, i) => ({ key: `COPE-${k}`, created_at: `2026-01-02T00:00:0${i + 1}Z`, status: "granted" })) });
      expect(((await (await co("co_tp")).json()) as { allKeys: string[] }).allKeys).toEqual(["COPE-T1", "COPE-T2", "COPE-T3"]);
    });
    it("returns 409 when no granted keys exist", async () => {
      stubPolar({ organization_id: "org", status: "succeeded", customer_id: "c1", created_at: T }, { items: [{ key: "X", created_at: "2026-01-02T00:00:05Z", status: "pending" }] });
      expect((await co("co_p")).status).toBe(409);
    });
    it("returns 403 for wrong organization", async () => {
      stubPolar({ organization_id: "other", status: "succeeded", customer_id: "c1" });
      expect((await co("co_wo")).status).toBe(403);
    });
    it("returns 400 for unknown checkout (Polar 404)", async () => {
      globalThis.fetch = vi.fn(async () => new Response("{}", { status: 404 })) as typeof fetch;
      expect((await co("co_inv")).status).toBe(400);
    });
    it("excludes keys outside 5-minute window", async () => {
      stubPolar({ organization_id: "org", status: "succeeded", customer_id: "c1", created_at: T }, { items: [{ key: "THIS", created_at: "2026-01-02T00:00:10Z", status: "granted" }, { key: "LATER", created_at: "2026-01-02T01:00:00Z", status: "granted" }] });
      expect(((await (await co("co_w")).json()) as { allKeys: string[] }).allKeys).toEqual(["THIS"]);
    });
  });
});
describe("GET /api/account/me", () => {
  it("returns found: false when KV is not configured", async () => {
    const res = await getWithSession("/api/account/me", {});
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ found: false });
  });
  it("returns found: false when session has no mapped username", async () => {
    const kv = mockKV({});
    const res = await getWithSession("/api/account/me", { QUOTA_KV: kv });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ found: false });
  });
});

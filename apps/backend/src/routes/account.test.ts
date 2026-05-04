/* eslint-disable max-lines */
import { describe, it, expect, vi } from "vitest";
import app from "../app";
import { createMockDB, mockKV, postJSON, BASE_PROFILE, profileWithHash, ownedMockDB } from "./account.test-helpers";

const GEN_BODY = { username: "alice", generatorId: "stackoverflow-copy-paster", amount: 1, licenseKeyHash: "hash" };

describe("POST /api/account/buy-generator", () => {
  it("returns 500 when DB is not configured", async () => {
    const res = await postJSON("/api/account/buy-generator", GEN_BODY, {});
    expect(res.status).toBe(500);
  });
  it("returns 400 when required fields are missing", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/buy-generator", { username: "alice" }, { DB: db });
    expect(res.status).toBe(400);
  });
  it("returns 400 when amount is not a positive integer", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/buy-generator", { ...GEN_BODY, amount: -1 }, { DB: db });
    expect(res.status).toBe(400);
  });
  it("returns 400 when amount exceeds 1000", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/buy-generator", { ...GEN_BODY, amount: 1001 }, { DB: db });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toContain("max 1000");
  });
  it("returns 400 for unknown generatorId", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/buy-generator", { ...GEN_BODY, generatorId: "does-not-exist" }, { DB: db });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toBe("Unknown generator");
  });
  it("returns 404 when profile is not found", async () => {
    const { db } = createMockDB({ firstResults: undefined });
    const res = await postJSON("/api/account/buy-generator", GEN_BODY, { DB: db });
    expect(res.status).toBe(404);
  });
  it("returns 403 when license hash does not match", async () => {
    const { db } = createMockDB({ firstResults: profileWithHash("other-hash") });
    const res = await postJSON("/api/account/buy-generator", { ...GEN_BODY, licenseKeyHash: "wrong-hash" }, { DB: db });
    expect(res.status).toBe(403);
  });
  it("returns 403 when license is revoked", async () => {
    const { db } = createMockDB({ firstBySQL: { "SELECT username": BASE_PROFILE, "SELECT status": { status: "revoked" } } });
    const res = await postJSON("/api/account/buy-generator", GEN_BODY, { DB: db });
    expect(res.status).toBe(403);
    expect(((await res.json()) as { error: string }).error).toContain("revoked");
  });
  it("returns 403 when license row is stale even if status is still active", async () => {
    const staleDate = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString();
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn(() => ({
          first: vi.fn().mockResolvedValue(
            sql.includes("FROM licenses")
              ? { status: "active", last_activated_at: staleDate }
              : BASE_PROFILE,
          ),
          run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
        })),
      })),
    };
    const res = await postJSON("/api/account/buy-generator", GEN_BODY, { DB: db });
    expect(res.status).toBe(403);
    expect(((await res.json()) as { error: string }).error).toContain("revoked");
  });
  it("succeeds with valid ownership and sufficient TD", async () => {
    const { db } = ownedMockDB();
    const res = await postJSON("/api/account/buy-generator", GEN_BODY, { DB: db });
    expect(res.status).toBe(200);
    expect(((await res.json()) as { success: boolean }).success).toBe(true);
  });
  it("returns 409 when concurrent update causes zero changes", async () => {
    const { db } = ownedMockDB({ runChanges: 0 });
    const res = await postJSON("/api/account/buy-generator", GEN_BODY, { DB: db });
    expect(res.status).toBe(409);
  });
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
    const ticket = { id: "t1", title: "Task", sprintProgress: -1, sprintGoal: 10 };
    const res = await postJSON("/api/account/update-ticket", { username: "alice", activeTicket: ticket, licenseKeyHash: "hash" }, { DB: db });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toContain("sprintProgress");
  });
  it("returns 400 when sprintProgress exceeds sprintGoal", async () => {
    const { db } = createMockDB();
    const ticket = { id: "t1", title: "Task", sprintProgress: 15, sprintGoal: 10 };
    const res = await postJSON("/api/account/update-ticket", { username: "alice", activeTicket: ticket, licenseKeyHash: "hash" }, { DB: db });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toContain("sprintProgress cannot exceed");
  });
  it("returns 404 when profile does not exist", async () => {
    const { db } = createMockDB({ firstResults: undefined });
    const ticket = { id: "t1", title: "Task", sprintProgress: 5, sprintGoal: 10 };
    const res = await postJSON("/api/account/update-ticket", { username: "alice", activeTicket: ticket, licenseKeyHash: "hash" }, { DB: db });
    expect(res.status).toBe(404);
  });
  it("succeeds when ownership is valid and update matches", async () => {
    const { db } = ownedMockDB();
    const ticket = { id: "t1", title: "Task", sprintProgress: 5, sprintGoal: 10 };
    const res = await postJSON("/api/account/update-ticket", { username: "alice", activeTicket: ticket, licenseKeyHash: "hash" }, { DB: db });
    expect(res.status).toBe(200);
    const data = await res.json() as { success: boolean };
    expect(data.success).toBe(true);
  });
  it("returns 409 when update matches zero rows (revoked between check and write)", async () => {
    const { db } = ownedMockDB({ runChanges: 0 });
    const ticket = { id: "t1", title: "Task", sprintProgress: 5, sprintGoal: 10 };
    const res = await postJSON("/api/account/update-ticket", { username: "alice", activeTicket: ticket, licenseKeyHash: "hash" }, { DB: db });
    expect(res.status).toBe(409);
  });
});

describe("POST /api/account/update-alias", () => {
  it("returns 500 when DB is not configured", async () => {
    const res = await postJSON("/api/account/update-alias", {
      username: "alice", newAlias: "alice-new", licenseKeyHash: "hash",
    }, {});
    expect(res.status).toBe(500);
  });
  it("returns 400 when username or newAlias is missing", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/update-alias", { username: "alice" }, { DB: db });
    expect(res.status).toBe(400);
  });
  it("returns 403 when licenseKeyHash is missing (free user)", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/update-alias", { username: "alice", newAlias: "alice-new" }, { DB: db });
    expect(res.status).toBe(403);
    expect(((await res.json()) as { error: string }).error).toContain("Max license");
  });
  it("returns 400 when alias is too short", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/update-alias", { username: "alice", newAlias: "ab", licenseKeyHash: "hash" }, { DB: db });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toContain("between 3 and 33");
  });
  it("returns 400 when alias is too long", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/update-alias", { username: "alice", newAlias: "a".repeat(34), licenseKeyHash: "hash" }, { DB: db });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toContain("between 3 and 33");
  });
  it("returns 400 when alias contains invalid characters", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/update-alias", { username: "alice", newAlias: "bad name!", licenseKeyHash: "hash" }, { DB: db });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toContain("letters, numbers");
  });
  it("returns 400 when alias has no letters", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/update-alias", { username: "alice", newAlias: "123", licenseKeyHash: "hash" }, { DB: db });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toContain("at least one letter");
  });
  it("returns 404 when profile does not exist", async () => {
    const { db } = createMockDB({ firstResults: undefined });
    const res = await postJSON("/api/account/update-alias", { username: "alice", newAlias: "alice-new", licenseKeyHash: "hash" }, { DB: db });
    expect(res.status).toBe(404);
  });
  it("returns 403 when license hash does not match", async () => {
    const { db } = createMockDB({ firstResults: profileWithHash("other-hash") });
    const res = await postJSON("/api/account/update-alias", { username: "alice", newAlias: "alice-new", licenseKeyHash: "wrong-hash" }, { DB: db });
    expect(res.status).toBe(403);
  });
  it("returns 403 when license is revoked", async () => {
    const { db } = createMockDB({ firstBySQL: { "SELECT username": BASE_PROFILE, "SELECT status": { status: "revoked" } } });
    const res = await postJSON("/api/account/update-alias", { username: "alice", newAlias: "alice-new", licenseKeyHash: "hash" }, { DB: db });
    expect(res.status).toBe(403);
    expect(((await res.json()) as { error: string }).error).toContain("revoked");
  });
  it("returns 400 when new alias matches current username", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/update-alias", { username: "alice", newAlias: "Alice", licenseKeyHash: "hash" }, { DB: db });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toContain("same as the current username");
  });
  it("succeeds with valid ownership and available alias", async () => {
    const { db } = createMockDB({ firstBySQL: { "SELECT username": BASE_PROFILE, "SELECT status": { status: "active" }, "LOWER(username)": null }, runChanges: 1 });
    db.batch = vi.fn().mockResolvedValue([
      { meta: { changes: 1 } },
      { meta: { changes: 1 } },
      { meta: { changes: 1 } },
      { meta: { changes: 1 } },
    ]);
    const kv = mockKV({ "session_user:test-session": "alice" });
    const res = await postJSON("/api/account/update-alias", { username: "alice", newAlias: "alice-new", licenseKeyHash: "hash" }, { DB: db, QUOTA_KV: kv });
    expect(res.status).toBe(200);
    expect((await res.json() as { success: boolean }).success).toBe(true);
    expect(db.batch).toHaveBeenCalledTimes(1);
    expect((db.batch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]).toHaveLength(4);
  });
  it("returns 409 when alias is already taken", async () => {
    const { db } = createMockDB({ firstBySQL: { "SELECT username": BASE_PROFILE, "SELECT status": { status: "active" }, "LOWER(username)": { "1": 1 } }, runChanges: 1 });
    const res = await postJSON("/api/account/update-alias", { username: "alice", newAlias: "taken-name", licenseKeyHash: "hash" }, { DB: db });
    expect(res.status).toBe(409);
    expect(((await res.json()) as { error: string }).error).toContain("already taken");
  });
  it("returns 409 when UNIQUE constraint violation occurs on user_scores update", async () => {
    const { db } = createMockDB({ firstBySQL: { "SELECT username": BASE_PROFILE, "SELECT status": { status: "active" }, "LOWER(username)": null }, runChanges: 1 });
    db.batch = vi.fn().mockRejectedValue(new Error("UNIQUE constraint failed: user_scores.username"));
    const res = await postJSON("/api/account/update-alias", {
      username: "alice", newAlias: "alice-new", licenseKeyHash: "hash",
    }, { DB: db });
    expect(res.status).toBe(409);
    expect(((await res.json()) as { error: string }).error).toContain("already taken");
  });
  it("returns 429 when alias change limit is reached (D1 atomic claim returns 0 changes)", async () => {
    const { db } = createMockDB({ firstBySQL: { "SELECT username": BASE_PROFILE, "SELECT status": { status: "active" } }, runChanges: 0 });
    const res = await postJSON("/api/account/update-alias", { username: "alice", newAlias: "alice-new", licenseKeyHash: "hash" }, { DB: db });
    expect(res.status).toBe(429);
    expect(((await res.json()) as { error: string }).error).toContain("limit reached");
  });
  it("rolls back rate-limit token when alias DB update fails", async () => {
    const { db } = createMockDB({ firstBySQL: { "SELECT username": BASE_PROFILE, "SELECT status": { status: "active" }, "LOWER(username)": { "1": 1 } }, runChanges: 1 });
    const res = await postJSON("/api/account/update-alias", { username: "alice", newAlias: "taken-name", licenseKeyHash: "hash" }, { DB: db });
    expect(res.status).toBe(409);
    const rollbackCalls = (db.prepare as ReturnType<typeof vi.fn>).mock.calls.filter(
      (args: unknown[]) => typeof args[0] === "string" && args[0].includes("alias_rate_limits") && args[0].includes("MAX(change_count - 1"),
    );
    expect(rollbackCalls.length).toBe(1);
  });
  it("returns 409 and guards secondary tables when user_scores update returns 0 rows (revoked license)", async () => {
    const { db } = createMockDB({ firstBySQL: { "SELECT username": BASE_PROFILE, "SELECT status": { status: "active" }, "LOWER(username)": null }, runChanges: 0 });
    const originalPrepare = db.prepare as ReturnType<typeof vi.fn>;
    db.prepare = vi.fn((sql: string) => {
      const base = originalPrepare(sql);
      const originalBind = base.bind;
      base.bind = vi.fn((...args: unknown[]) => {
        const bound = originalBind(...args);
        const origRun = bound.run;
        bound.run = vi.fn(async () => {
          if (sql.includes("alias_rate_limits") && sql.includes("INSERT")) {
            return { meta: { changes: 1 } };
          }
          return origRun();
        });
        return bound;
      });
      return base;
    }) as unknown as typeof db.prepare;
    db.batch = vi.fn().mockResolvedValue([{ meta: { changes: 0 } }, { meta: { changes: 0 } }, { meta: { changes: 0 } }, { meta: { changes: 0 } }]);
    const res = await postJSON("/api/account/update-alias", { username: "alice", newAlias: "alice-new", licenseKeyHash: "hash" }, { DB: db });
    expect(res.status).toBe(409);
    expect(db.batch).toHaveBeenCalled();
  });
});

describe("POST /api/account/shill", () => {
  const shillReq = (env: Record<string, unknown>) => app.request("/api/account/shill", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: "cope_session_id=test-session" },
    body: "{}",
  }, { ALLOWED_ORIGINS: "http://localhost:5173", ...env });

  it("returns 500 when KV is not configured", async () => {
    const res = await postJSON("/api/account/shill", {}, {});
    expect(res.status).toBe(500);
  });
  it("returns 409 when shill credit was already claimed", async () => {
    expect((await shillReq({ QUOTA_KV: mockKV({ "shill:test-session": "1" }) })).status).toBe(409);
  });
  it("grants shill credit on first claim", async () => {
    const res = await shillReq({ QUOTA_KV: mockKV({}) });
    expect(res.status).toBe(200);
    const data = await res.json() as { success: boolean; creditsGranted: number };
    expect(data.success).toBe(true);
    expect(data.creditsGranted).toBe(5);
  });
});

describe("GET /api/account/me", () => {
  const meReq = (env: Record<string, unknown>) => app.request("/api/account/me", {
    headers: { Cookie: "cope_session_id=test-session" },
  }, { ALLOWED_ORIGINS: "http://localhost:5173", ...env });

  it("returns found: false when KV is not configured", async () => {
    const res = await meReq({});
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ found: false });
  });
  it("returns found: false when session has no mapped username", async () => {
    const res = await meReq({ QUOTA_KV: mockKV({}) });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ found: false });
  });
  it("returns the mapped free profile when the session username exists", async () => {
    const kv = mockKV({ "session_user:test-session": "alice" });
    const { db } = createMockDB({ firstBySQL: { "SELECT username": { ...BASE_PROFILE, license_hash: null } } });
    const res = await meReq({ QUOTA_KV: kv, DB: db });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      found: true,
      username: "alice",
      isPro: false,
      profile: {
        username: "alice",
        corporate_rank: "Junior Code Monkey",
      },
    });
  });
  it("repairs a single-hop renamed session mapping", async () => {
    const kv = mockKV({
      "session_user:test-session": "alice",
      "renamed:alice": "bob",
    });
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((username: string) => ({
          first: vi.fn().mockResolvedValue(
            sql.includes("licenses")
              ? null
              : username === "bob"
                ? { ...BASE_PROFILE, username: "bob", license_hash: null }
                : null,
          ),
        })),
      })),
    };
    const res = await meReq({ QUOTA_KV: kv, DB: db });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      found: true,
      username: "bob",
      profile: { username: "bob" },
    });
    expect(kv.put).toHaveBeenCalledWith("session_user:test-session", "bob", expect.any(Object));
  });
  it("prefers rename redirects over a reclaimed stale username", async () => {
    const kv = mockKV({
      "session_user:test-session": "alice",
      "renamed:alice": "bob",
    });
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((username: string) => ({
          first: vi.fn().mockResolvedValue(
            sql.includes("licenses")
              ? null
              : username === "alice"
                ? { ...BASE_PROFILE, username: "alice", current_td: 5, total_td: 5, license_hash: null }
                : username === "bob"
                  ? { ...BASE_PROFILE, username: "bob", current_td: 1000, total_td: 1000, license_hash: null }
                  : null,
          ),
        })),
      })),
    };
    const res = await meReq({ QUOTA_KV: kv, DB: db });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      found: true,
      username: "bob",
      profile: { username: "bob" },
    });
  });
  it("collapses multi-hop rename chains to the final alias", async () => {
    const kv = mockKV({
      "session_user:test-session": "alice",
      "renamed:alice": "bob",
      "renamed:bob": "carol",
    });
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((username: string) => ({
          first: vi.fn().mockResolvedValue(
            sql.includes("licenses")
              ? null
              : username === "carol"
                ? { ...BASE_PROFILE, username: "carol", license_hash: null }
                : null,
          ),
        })),
      })),
    };
    const res = await meReq({ QUOTA_KV: kv, DB: db });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      found: true,
      username: "carol",
      profile: { username: "carol" },
    });
    expect(kv.put).toHaveBeenCalledWith("session_user:test-session", "carol", expect.any(Object));
    expect(kv.put).toHaveBeenCalledWith("renamed:alice", "carol", expect.any(Object));
  });
  it("repairs rename chains longer than five hops", async () => {
    const kv = mockKV({
      "session_user:test-session": "alice",
      "renamed:alice": "bob",
      "renamed:bob": "carol",
      "renamed:carol": "dave",
      "renamed:dave": "erin",
      "renamed:erin": "frank",
      "renamed:frank": "grace",
    });
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((username: string) => ({
          first: vi.fn().mockResolvedValue(
            sql.includes("licenses")
              ? null
              : username === "grace"
                ? { ...BASE_PROFILE, username: "grace", license_hash: null }
                : null,
          ),
        })),
      })),
    };
    const res = await meReq({ QUOTA_KV: kv, DB: db });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      found: true,
      username: "grace",
      profile: { username: "grace" },
    });
    expect(kv.put).toHaveBeenCalledWith("session_user:test-session", "grace", expect.any(Object));
    expect(kv.put).toHaveBeenCalledWith("renamed:alice", "grace", expect.any(Object));
  });
  it("marks revoked licensed users as non-pro in the /me payload", async () => {
    const kv = mockKV({ "session_user:test-session": "alice" });
    const staleDate = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString();
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((value: string) => ({
          first: vi.fn().mockResolvedValue(
            sql.includes("FROM licenses")
              ? { status: "active", last_activated_at: staleDate }
              : value === "alice"
                ? { ...BASE_PROFILE, license_hash: "pro-hash", corporate_rank: "CTO" }
                : null,
          ),
        })),
      })),
    };
    const res = await meReq({ QUOTA_KV: kv, DB: db });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      found: true,
      username: "alice",
      isPro: false,
      revoked: true,
      profile: {
        username: "alice",
        corporate_rank: "Junior Code Monkey",
      },
    });
  });
});

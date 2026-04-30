import { describe, it, expect, vi } from "vitest";
import app from "../app";
import { createMockDB, mockKV, postJSON, BASE_PROFILE, profileWithHash, ownedMockDB } from "./account.test-helpers";

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
    const { db } = createMockDB({ firstResults: profileWithHash("other-hash") });
    const res = await postJSON("/api/account/buy-generator", {
      username: "alice", generatorId: "stackoverflow-copy-paster", amount: 1, licenseKeyHash: "wrong-hash",
    }, { DB: db });
    expect(res.status).toBe(403);
  });
  it("returns 403 when license is revoked", async () => {
    const { db } = createMockDB({ firstBySQL: { "SELECT username": BASE_PROFILE, "SELECT status": { status: "revoked" } } });
    const res = await postJSON("/api/account/buy-generator", {
      username: "alice", generatorId: "stackoverflow-copy-paster", amount: 1, licenseKeyHash: "hash",
    }, { DB: db });
    expect(res.status).toBe(403);
    expect(((await res.json()) as { error: string }).error).toContain("revoked");
  });
  it("succeeds with valid ownership and sufficient TD", async () => {
    const { db } = ownedMockDB();
    const res = await postJSON("/api/account/buy-generator", {
      username: "alice", generatorId: "stackoverflow-copy-paster", amount: 1, licenseKeyHash: "hash",
    }, { DB: db });
    expect(res.status).toBe(200);
    const data = await res.json() as { success: boolean };
    expect(data.success).toBe(true);
  });
  it("returns 409 when concurrent update causes zero changes", async () => {
    const { db } = ownedMockDB({ runChanges: 0 });
    const res = await postJSON("/api/account/buy-generator", {
      username: "alice", generatorId: "stackoverflow-copy-paster", amount: 1, licenseKeyHash: "hash",
    }, { DB: db });
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
  it("succeeds when ownership is valid and update matches", async () => {
    const { db } = ownedMockDB();
    const res = await postJSON("/api/account/update-ticket", {
      username: "alice",
      activeTicket: { id: "t1", title: "Task", sprintProgress: 5, sprintGoal: 10 },
      licenseKeyHash: "hash",
    }, { DB: db });
    expect(res.status).toBe(200);
    const data = await res.json() as { success: boolean };
    expect(data.success).toBe(true);
  });
  it("returns 409 when update matches zero rows (revoked between check and write)", async () => {
    const { db } = ownedMockDB({ runChanges: 0 });
    const res = await postJSON("/api/account/update-ticket", {
      username: "alice",
      activeTicket: { id: "t1", title: "Task", sprintProgress: 5, sprintGoal: 10 },
      licenseKeyHash: "hash",
    }, { DB: db });
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
    const res = await postJSON("/api/account/update-alias", {
      username: "alice", newAlias: "ab", licenseKeyHash: "hash",
    }, { DB: db });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toContain("between 3 and 33");
  });
  it("returns 400 when alias is too long", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/update-alias", {
      username: "alice", newAlias: "a".repeat(34), licenseKeyHash: "hash",
    }, { DB: db });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toContain("between 3 and 33");
  });
  it("returns 400 when alias contains invalid characters", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/update-alias", {
      username: "alice", newAlias: "bad name!", licenseKeyHash: "hash",
    }, { DB: db });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toContain("letters, numbers");
  });
  it("returns 400 when alias has no letters", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/update-alias", {
      username: "alice", newAlias: "123", licenseKeyHash: "hash",
    }, { DB: db });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toContain("at least one letter");
  });
  it("returns 404 when profile does not exist", async () => {
    const { db } = createMockDB({ firstResults: undefined });
    const res = await postJSON("/api/account/update-alias", {
      username: "alice", newAlias: "alice-new", licenseKeyHash: "hash",
    }, { DB: db });
    expect(res.status).toBe(404);
  });
  it("returns 403 when license hash does not match", async () => {
    const { db } = createMockDB({ firstResults: profileWithHash("other-hash") });
    const res = await postJSON("/api/account/update-alias", {
      username: "alice", newAlias: "alice-new", licenseKeyHash: "wrong-hash",
    }, { DB: db });
    expect(res.status).toBe(403);
  });
  it("returns 403 when license is revoked", async () => {
    const { db } = createMockDB({ firstBySQL: { "SELECT username": BASE_PROFILE, "SELECT status": { status: "revoked" } } });
    const res = await postJSON("/api/account/update-alias", {
      username: "alice", newAlias: "alice-new", licenseKeyHash: "hash",
    }, { DB: db });
    expect(res.status).toBe(403);
    expect(((await res.json()) as { error: string }).error).toContain("revoked");
  });
  it("succeeds with valid ownership and available alias", async () => {
    const { db } = createMockDB({ firstBySQL: { "SELECT username": BASE_PROFILE, "SELECT status": { status: "active" }, "LOWER(username)": null }, runChanges: 1 });
    db.batch = vi.fn().mockResolvedValue([{ meta: { changes: 1 } }, { meta: { changes: 0 } }]);
    const kv = mockKV({ "session_user:test-session": "alice" });
    const res = await postJSON("/api/account/update-alias", {
      username: "alice", newAlias: "alice-new", licenseKeyHash: "hash",
    }, { DB: db, QUOTA_KV: kv });
    expect(res.status).toBe(200);
    const data = await res.json() as { success: boolean };
    expect(data.success).toBe(true);
  });
  it("returns 409 when alias is already taken", async () => {
    const { db } = createMockDB({ firstBySQL: { "SELECT username": BASE_PROFILE, "SELECT status": { status: "active" }, "LOWER(username)": { "1": 1 } } });
    const res = await postJSON("/api/account/update-alias", {
      username: "alice", newAlias: "taken-name", licenseKeyHash: "hash",
    }, { DB: db });
    expect(res.status).toBe(409);
    expect(((await res.json()) as { error: string }).error).toContain("already taken");
  });
  it("returns 409 when UNIQUE constraint violation occurs during batch", async () => {
    const { db } = createMockDB({ firstBySQL: { "SELECT username": BASE_PROFILE, "SELECT status": { status: "active" }, "LOWER(username)": null }, runChanges: 1 });
    db.batch = vi.fn().mockRejectedValue(new Error("UNIQUE constraint failed: user_scores.username"));
    const kv = mockKV({ "session_user:test-session": "alice" });
    const res = await postJSON("/api/account/update-alias", {
      username: "alice", newAlias: "alice-new", licenseKeyHash: "hash",
    }, { DB: db, QUOTA_KV: kv });
    expect(res.status).toBe(409);
    expect(((await res.json()) as { error: string }).error).toContain("already taken");
  });
  it("returns 429 when alias change limit is reached", async () => {
    const { db } = createMockDB({ firstBySQL: { "SELECT username": BASE_PROFILE, "SELECT status": { status: "active" }, "LOWER(username)": null }, runChanges: 1 });
    const today = new Date().toISOString().slice(0, 10);
    const kv = mockKV({ [`alias_changes:hash:${today}`]: "3" });
    const res = await postJSON("/api/account/update-alias", {
      username: "alice", newAlias: "alice-new", licenseKeyHash: "hash",
    }, { DB: db, QUOTA_KV: kv });
    expect(res.status).toBe(429);
    expect(((await res.json()) as { error: string }).error).toContain("limit reached");
  });
});

describe("POST /api/account/shill", () => {
  it("returns 500 when KV is not configured", async () => {
    const res = await postJSON("/api/account/shill", {}, {});
    expect(res.status).toBe(500);
  });
  it("returns 409 when shill credit was already claimed", async () => {
    const kv = mockKV({ "shill:test-session": "1" });
    const res = await app.request("/api/account/shill", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: "cope_session_id=test-session" },
      body: "{}",
    }, { ALLOWED_ORIGINS: "http://localhost:5173", QUOTA_KV: kv });
    expect(res.status).toBe(409);
  });
  it("grants shill credit on first claim", async () => {
    const kv = mockKV({});
    const res = await app.request("/api/account/shill", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: "cope_session_id=test-session" },
      body: "{}",
    }, { ALLOWED_ORIGINS: "http://localhost:5173", QUOTA_KV: kv });
    expect(res.status).toBe(200);
    const data = await res.json() as { success: boolean; creditsGranted: number };
    expect(data.success).toBe(true);
    expect(data.creditsGranted).toBe(5);
  });
});

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

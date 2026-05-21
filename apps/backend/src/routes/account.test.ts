/* eslint-disable max-lines */
import { describe, it, expect, vi, afterEach } from "vitest";
import app from "../app";
import { ACCOUNT_TEST_SQL } from "./account.test-helpers";
import { createMockDB, mockKV, postJSON, postRaw, postWithSession, getWithSession, BASE_PROFILE, profileWithHash, ownedMockDB, GEN_BODY } from "./account.test-utils";
import { storeClaimedKeys } from "./accountHelpers";
import { hashKey } from "../utils/quota";
import { signFreeAccountCookieValue } from "../utils/freeAccountIdentity";
import { FREE_TIER_RANK_CAP, PROMOTE_ACCESS_DENIED_MESSAGE, SUPPORTER_VANITY_TITLES } from "../gameConstants";

const CLAIM_SECRET = "tok";

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
    const { db } = createMockDB({ firstBySQL: { [ACCOUNT_TEST_SQL.getProfileRow]: BASE_PROFILE, [ACCOUNT_TEST_SQL.getLicenseStatus]: { status: "revoked" } } });
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
  it("succeeds for a session-authenticated Max user without licenseKeyHash", async () => {
    const kv = mockKV({ "session_user:test-session": "alice" });
    const paidProfile = { ...BASE_PROFILE, current_td: 6000 };
    const { db } = createMockDB({
      firstBySQL: {
        [ACCOUNT_TEST_SQL.getProfileRow]: paidProfile,
        [ACCOUNT_TEST_SQL.getProfile]: paidProfile,
        [ACCOUNT_TEST_SQL.getLicenseStatus]: { status: "active", last_activated_at: new Date().toISOString() },
      },
      runChanges: 1,
    });
    const res = await postWithSession("/api/account/buy-generator", {
      username: "alice",
      generatorId: "intern",
      amount: 1,
    }, { DB: db, QUOTA_KV: kv });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true });
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
  it("succeeds for a session-authenticated Max user without licenseKeyHash", async () => {
    const kv = mockKV({ "session_user:test-session": "alice" });
    const paidProfile = {
      ...BASE_PROFILE,
      current_td: 6000,
      inventory: "{\"intern\":1}",
      upgrades: "[]",
    };
    const { db } = createMockDB({
      firstBySQL: {
        [ACCOUNT_TEST_SQL.getProfileRow]: paidProfile,
        [ACCOUNT_TEST_SQL.getProfile]: paidProfile,
        [ACCOUNT_TEST_SQL.getLicenseStatus]: { status: "active", last_activated_at: new Date().toISOString() },
      },
      runChanges: 1,
    });
    const res = await postWithSession("/api/account/buy-upgrade", {
      username: "alice",
      upgradeId: "intern-boost-copypaster",
    }, { DB: db, QUOTA_KV: kv });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true });
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
  it("succeeds for a session-authenticated Max user without licenseKeyHash", async () => {
    const kv = mockKV({ "session_user:test-session": "alice" });
    const paidProfile = { ...BASE_PROFILE, current_td: 6000 };
    const { db } = createMockDB({
      firstBySQL: {
        [ACCOUNT_TEST_SQL.getProfileRow]: paidProfile,
        [ACCOUNT_TEST_SQL.getProfile]: paidProfile,
        [ACCOUNT_TEST_SQL.getLicenseStatus]: { status: "active", last_activated_at: new Date().toISOString() },
      },
      runChanges: 1,
    });
    const res = await postWithSession("/api/account/buy-theme", {
      username: "alice",
      themeId: "amber",
    }, { DB: db, QUOTA_KV: kv });
    expect(res.status).toBe(200);
    expect(((await res.json()) as { success: boolean }).success).toBe(true);
  });
  it("falls back to USAGE_KV for a session-authenticated Max user without licenseKeyHash", async () => {
    const kv = mockKV({ "session_user:test-session": "alice" });
    const paidProfile = { ...BASE_PROFILE, current_td: 6000 };
    const { db } = createMockDB({
      firstBySQL: {
        [ACCOUNT_TEST_SQL.getProfileRow]: paidProfile,
        [ACCOUNT_TEST_SQL.getProfile]: paidProfile,
        [ACCOUNT_TEST_SQL.getLicenseStatus]: { status: "active", last_activated_at: new Date().toISOString() },
      },
      runChanges: 1,
    });
    const res = await postWithSession("/api/account/buy-theme", {
      username: "alice",
      themeId: "amber",
    }, { DB: db, USAGE_KV: kv });
    expect(res.status).toBe(200);
    expect(((await res.json()) as { success: boolean }).success).toBe(true);
  });
  it("repairs renamed session bindings and accepts a stale aliased username", async () => {
    const kv = mockKV({
      "session_user:test-session": "alice",
      "renamed:alice": "bob",
    });
    const paidProfile = { ...BASE_PROFILE, username: "bob", current_td: 6000 };
    const activeLicense = { status: "active", last_activated_at: new Date().toISOString() };
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((value: string) => ({
          first: vi.fn().mockResolvedValue(
            sql.includes("FROM licenses")
              ? activeLicense
              : value === "bob"
                ? paidProfile
                : null,
          ),
          run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
        })),
      })),
    };

    const res = await postWithSession("/api/account/buy-theme", {
      username: "alice",
      themeId: "amber",
    }, { DB: db, QUOTA_KV: kv });

    expect(res.status).toBe(200);
    expect(((await res.json()) as { success: boolean }).success).toBe(true);
    expect(kv.put).toHaveBeenCalledWith("session_user:test-session", "bob", expect.any(Object));
  });
  it("preserves mixed-case session usernames when following rename redirects", async () => {
    const kv = mockKV({
      "session_user:test-session": "Alice",
      "renamed:Alice": "Bob",
    });
    const paidProfile = { ...BASE_PROFILE, username: "Bob", current_td: 6000 };
    const activeLicense = { status: "active", last_activated_at: new Date().toISOString() };
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((value: string) => ({
          first: vi.fn().mockResolvedValue(
            sql.includes("FROM licenses")
              ? activeLicense
              : value === "Bob"
                ? paidProfile
                : null,
          ),
          run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
        })),
      })),
    };

    const res = await postWithSession("/api/account/buy-theme", {
      username: "Alice",
      themeId: "amber",
    }, { DB: db, QUOTA_KV: kv });

    expect(res.status).toBe(200);
    expect(((await res.json()) as { success: boolean }).success).toBe(true);
    expect(kv.put).toHaveBeenCalledWith("session_user:test-session", "Bob", expect.any(Object));
  });
  it("accepts stale requested aliases when the session is already rebound to the renamed username", async () => {
    const kv = mockKV({
      "session_user:test-session": "Bob",
      "renamed:Alice": "Bob",
    });
    const paidProfile = { ...BASE_PROFILE, username: "Bob", current_td: 6000 };
    const activeLicense = { status: "active", last_activated_at: new Date().toISOString() };
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((value: string) => ({
          first: vi.fn().mockResolvedValue(
            sql.includes("FROM licenses")
              ? activeLicense
              : value === "Bob"
                ? paidProfile
                : null,
          ),
          run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
        })),
      })),
    };

    const res = await postWithSession("/api/account/buy-theme", {
      username: "Alice",
      themeId: "amber",
    }, { DB: db, QUOTA_KV: kv });

    expect(res.status).toBe(200);
    expect(((await res.json()) as { success: boolean }).success).toBe(true);
  });
  it("returns not_found for a mixed-case renamed alias when the rebound profile row is missing", async () => {
    const kv = mockKV({
      "session_user:test-session": "Bob",
      "renamed:Alice": "Bob",
    });

    const res = await postWithSession("/api/account/buy-theme", {
      username: "Alice",
      themeId: "amber",
    }, { DB: createMockDB({ firstResults: undefined }).db, QUOTA_KV: kv });

    expect(res.status).toBe(404);
    expect(await res.json()).toMatchObject({
      error: "Profile not found",
    });
  });
  it("falls back to the session for buy-theme when a mismatched licenseKeyHash is present", async () => {
    const kv = mockKV({ "session_user:test-session": "alice" });
    const paidProfile = { ...BASE_PROFILE, current_td: 6000 };
    const { db } = createMockDB({
      firstBySQL: {
        [ACCOUNT_TEST_SQL.getProfileRow]: paidProfile,
        [ACCOUNT_TEST_SQL.getProfile]: paidProfile,
        [ACCOUNT_TEST_SQL.getLicenseStatus]: { status: "active", last_activated_at: new Date().toISOString() },
      },
      runChanges: 1,
    });
    const res = await postWithSession("/api/account/buy-theme", {
      username: "alice",
      themeId: "amber",
      licenseKeyHash: "stale-hash",
    }, { DB: db, QUOTA_KV: kv });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      success: true,
    });
  });
  it("rejects a purchase without licenseKeyHash when there is no authenticated session", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/buy-theme", {
      username: "alice",
      themeId: "amber",
    }, { DB: db });
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({
      error: expect.stringContaining("Session authentication is required"),
      errorCode: "session_auth_required",
    });
  });
  it("rejects a session-authenticated purchase when the session is bound to a different username", async () => {
    const kv = mockKV({ "session_user:test-session": "bob" });
    const res = await postWithSession("/api/account/buy-theme", {
      username: "alice",
      themeId: "amber",
    }, { DB: createMockDB().db, QUOTA_KV: kv });
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({
      error: expect.stringContaining("session user does not match"),
      errorCode: "session_user_mismatch",
    });
  });
  it("rejects a session-authenticated free user without licenseKeyHash", async () => {
    const kv = mockKV({ "session_user:test-session": "alice" });
    const { db } = createMockDB({
      firstBySQL: {
        [ACCOUNT_TEST_SQL.getProfileRow]: { ...BASE_PROFILE, license_hash: null, current_td: 6000 },
      },
    });
    const res = await postWithSession("/api/account/buy-theme", {
      username: "alice",
      themeId: "amber",
    }, { DB: db, QUOTA_KV: kv });
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({
      error: expect.stringContaining("active Max license"),
      errorCode: "active_max_license_required",
    });
  });
  it("rejects a session-authenticated revoked user without licenseKeyHash", async () => {
    const kv = mockKV({ "session_user:test-session": "alice" });
    const paidProfile = { ...BASE_PROFILE, current_td: 6000 };
    const { db } = createMockDB({
      firstBySQL: {
        [ACCOUNT_TEST_SQL.getProfileRow]: paidProfile,
        [ACCOUNT_TEST_SQL.getLicenseStatus]: { status: "revoked", last_activated_at: new Date().toISOString() },
      },
    });
    const res = await postWithSession("/api/account/buy-theme", {
      username: "alice",
      themeId: "amber",
    }, { DB: db, QUOTA_KV: kv });
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({
      error: expect.stringContaining("revoked"),
      errorCode: "license_inactive",
    });
  });
});

describe("POST /api/account/update-theme", () => {
  it("returns 400 when required fields are missing", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/update-theme", { username: "alice" }, { DB: db });
    expect(res.status).toBe(400);
  });

  it("returns 400 for unknown themeId", async () => {
    const { db } = createMockDB();
    const res = await postJSON("/api/account/update-theme", {
      username: "alice", themeId: "nonexistent", licenseKeyHash: "hash",
    }, { DB: db });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toBe("Unknown theme");
  });

  it("persists the active theme for a session-authenticated Max user without licenseKeyHash", async () => {
    const kv = mockKV({ "session_user:test-session": "alice" });
    const paidProfile = {
      ...BASE_PROFILE,
      current_td: 6000,
      unlocked_themes: '["default","amber"]',
      active_theme: "default",
    };
    const updatedProfile = { ...paidProfile, active_theme: "amber" };
    const { db } = createMockDB({
      firstBySQL: {
        [ACCOUNT_TEST_SQL.getProfileRow]: paidProfile,
        [ACCOUNT_TEST_SQL.getProfile]: updatedProfile,
        [ACCOUNT_TEST_SQL.getLicenseStatus]: { status: "active", last_activated_at: new Date().toISOString() },
      },
      runChanges: 1,
    });
    const res = await postWithSession("/api/account/update-theme", {
      username: "alice",
      themeId: "amber",
    }, { DB: db, QUOTA_KV: kv });
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; profile: { active_theme: string } };
    expect(body.success).toBe(true);
    expect(body.profile.active_theme).toBe("amber");
  });

  it("rejects persisting the default theme with a revoked hash and no valid session", async () => {
    const revokedProfile = {
      ...BASE_PROFILE,
      current_td: 6000,
      unlocked_themes: '["default","amber"]',
      active_theme: "amber",
    };
    const { db } = createMockDB({
      firstBySQL: {
        [ACCOUNT_TEST_SQL.getProfileRow]: revokedProfile,
        [ACCOUNT_TEST_SQL.getLicenseStatus]: { status: "revoked", last_activated_at: new Date().toISOString() },
      },
    });
    const res = await postJSON("/api/account/update-theme", {
      username: "alice",
      themeId: "default",
      licenseKeyHash: "hash",
    }, { DB: db });
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({
      error: expect.stringContaining("revoked"),
      errorCode: "license_inactive",
    });
  });

  it("rejects persisting the default theme for a session-authenticated user whose Max license is no longer active", async () => {
    const kv = mockKV({ "session_user:test-session": "alice" });
    const revokedProfile = {
      ...BASE_PROFILE,
      current_td: 6000,
      unlocked_themes: '["default","amber"]',
      active_theme: "amber",
    };
    const { db } = createMockDB({
      firstBySQL: {
        [ACCOUNT_TEST_SQL.getProfileRow]: revokedProfile,
        [ACCOUNT_TEST_SQL.getLicenseStatus]: { status: "revoked", last_activated_at: new Date().toISOString() },
      },
      runChanges: 1,
    });
    const res = await postWithSession("/api/account/update-theme", {
      username: "alice",
      themeId: "default",
    }, { DB: db, QUOTA_KV: kv });
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({
      error: expect.stringContaining("revoked"),
      errorCode: "license_inactive",
    });
  });
  it("accepts a stale mixed-case requested alias when the session is already rebound to the renamed username", async () => {
    const kv = mockKV({
      "session_user:test-session": "Bob",
      "renamed:Alice": "Bob",
    });
    const paidProfile = {
      ...BASE_PROFILE,
      username: "Bob",
      current_td: 6000,
      unlocked_themes: '["default","amber"]',
      active_theme: "default",
    };
    const updatedProfile = { ...paidProfile, active_theme: "amber" };
    const activeLicense = { status: "active", last_activated_at: new Date().toISOString() };
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((value: string) => ({
          first: vi.fn().mockResolvedValue(
            sql.includes("FROM licenses")
              ? activeLicense
              : value === "Bob"
                ? (sql.includes(ACCOUNT_TEST_SQL.getProfileRow) ? paidProfile : updatedProfile)
                : null,
          ),
          run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
        })),
      })),
    };

    const res = await postWithSession("/api/account/update-theme", {
      username: "Alice",
      themeId: "amber",
    }, { DB: db, QUOTA_KV: kv });

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      success: true,
      profile: { active_theme: "amber" },
    });
  });

  it("falls back to the rebound session profile when a stale local hash points at a renamed username", async () => {
    const kv = mockKV({
      "session_user:test-session": "Bob",
      "renamed:Alice": "Bob",
    });
    const reboundProfile = {
      ...BASE_PROFILE,
      username: "Bob",
      current_td: 6000,
      unlocked_themes: '["default","amber"]',
      active_theme: "default",
    };
    const updatedProfile = { ...reboundProfile, active_theme: "default" };
    const activeLicense = { status: "active", last_activated_at: new Date().toISOString() };
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((value: string) => ({
          first: vi.fn().mockResolvedValue(
            sql.includes("FROM licenses")
              ? activeLicense
              : value === "Bob"
                ? (sql.includes(ACCOUNT_TEST_SQL.getProfileRow) ? reboundProfile : updatedProfile)
                : null,
          ),
          run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
        })),
      })),
    };

    const res = await postWithSession("/api/account/update-theme", {
      username: "Alice",
      themeId: "default",
      licenseKeyHash: "stale-hash",
    }, { DB: db, QUOTA_KV: kv });

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      success: true,
      profile: { active_theme: "default" },
    });
  });

  it("falls back to the session profile when a stale local hash belongs to a different existing account", async () => {
    const kv = mockKV({ "session_user:test-session": "alice" });
    const aliceProfile = {
      ...BASE_PROFILE,
      current_td: 6000,
      unlocked_themes: '["default","amber"]',
      active_theme: "amber",
    };
    const updatedAliceProfile = { ...aliceProfile, active_theme: "default" };
    const otherProfile = {
      ...BASE_PROFILE,
      username: "bob",
      license_hash: "stale-hash",
      current_td: 6000,
      unlocked_themes: '["default","amber"]',
      active_theme: "default",
    };
    const activeLicense = { status: "active", last_activated_at: new Date().toISOString() };
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((value: string) => ({
          first: vi.fn().mockResolvedValue(
            sql.includes("FROM licenses")
              ? activeLicense
              : value === "alice"
                ? (sql.includes(ACCOUNT_TEST_SQL.getProfileRow) ? aliceProfile : updatedAliceProfile)
                : value === "bob"
                  ? otherProfile
                  : null,
          ),
          run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
        })),
      })),
    };

    const res = await postWithSession("/api/account/update-theme", {
      username: "alice",
      themeId: "default",
      licenseKeyHash: "stale-hash",
    }, { DB: db, QUOTA_KV: kv });

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      success: true,
      profile: { active_theme: "default" },
    });
  });

  it("rejects equip requests for themes that are not unlocked", async () => {
    const kv = mockKV({ "session_user:test-session": "alice" });
    const paidProfile = { ...BASE_PROFILE, current_td: 6000, active_theme: "default" };
    const { db } = createMockDB({
      firstBySQL: {
        [ACCOUNT_TEST_SQL.getProfileRow]: paidProfile,
        [ACCOUNT_TEST_SQL.getProfile]: paidProfile,
        [ACCOUNT_TEST_SQL.getLicenseStatus]: { status: "active", last_activated_at: new Date().toISOString() },
      },
      runChanges: 1,
    });
    const res = await postWithSession("/api/account/update-theme", {
      username: "alice",
      themeId: "amber",
    }, { DB: db, QUOTA_KV: kv });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toBe("Theme is not unlocked");
  });

  it("lets executive supporters equip included premium themes without buying them first", async () => {
    const kv = mockKV({ "session_user:test-session": "alice" });
    const paidProfile = {
      ...BASE_PROFILE,
      current_td: 6000,
      is_executive_supporter: 1,
      unlocked_themes: '["default"]',
      active_theme: "default",
    };
    const updatedProfile = { ...paidProfile, active_theme: "syntax-error" };
    const { db } = createMockDB({
      firstBySQL: {
        [ACCOUNT_TEST_SQL.getProfileRow]: paidProfile,
        [ACCOUNT_TEST_SQL.getProfile]: updatedProfile,
        [ACCOUNT_TEST_SQL.getLicenseStatus]: { status: "active", last_activated_at: new Date().toISOString() },
      },
      runChanges: 1,
    });
    const res = await postWithSession("/api/account/update-theme", {
      username: "alice",
      themeId: "syntax-error",
    }, { DB: db, QUOTA_KV: kv });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      success: true,
      profile: {
        active_theme: "syntax-error",
        unlocked_themes: ["default", "amber", "syntax-error"],
      },
    });
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
  it("succeeds for a session-authenticated Max user without licenseKeyHash", async () => {
    const kv = mockKV({ "session_user:test-session": "alice" });
    const paidProfile = {
      ...BASE_PROFILE,
      achievements: "[]",
    };
    const { db } = createMockDB({
      firstBySQL: {
        [ACCOUNT_TEST_SQL.getProfileRow]: paidProfile,
        [ACCOUNT_TEST_SQL.getProfile]: paidProfile,
        [ACCOUNT_TEST_SQL.getLicenseStatus]: { status: "active", last_activated_at: new Date().toISOString() },
      },
      runChanges: 1,
    });
    const res = await postWithSession("/api/account/unlock-achievement", {
      username: "alice",
      achievementId: "the_leaker",
    }, { DB: db, QUOTA_KV: kv });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true });
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
  it("succeeds for a session-authenticated Max user without licenseKeyHash", async () => {
    const kv = mockKV({ "session_user:test-session": "alice" });
    const paidProfile = {
      ...BASE_PROFILE,
      buddy_type: null,
      buddy_is_shiny: false,
    };
    const { db } = createMockDB({
      firstBySQL: {
        [ACCOUNT_TEST_SQL.getProfileRow]: paidProfile,
        [ACCOUNT_TEST_SQL.getProfile]: {
          ...paidProfile,
          buddy_type: "Agile Snail",
          buddy_is_shiny: 1,
        },
        [ACCOUNT_TEST_SQL.getLicenseStatus]: { status: "active", last_activated_at: new Date().toISOString() },
      },
      runChanges: 1,
    });
    const res = await postWithSession("/api/account/update-buddy", {
      username: "alice",
      buddyType: "Agile Snail",
      isShiny: true,
    }, { DB: db, QUOTA_KV: kv });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true });
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
  it("succeeds for a session-authenticated Max user without licenseKeyHash", async () => {
    const kv = mockKV({ "session_user:test-session": "alice" });
    const paidProfile = {
      ...BASE_PROFILE,
      active_ticket: null,
    };
    const ticket = { id: "t1", title: "Task", sprintProgress: 5, sprintGoal: 10 };
    const { db } = createMockDB({
      firstBySQL: {
        [ACCOUNT_TEST_SQL.getProfileRow]: paidProfile,
        [ACCOUNT_TEST_SQL.getProfile]: { ...paidProfile, active_ticket: JSON.stringify(ticket) },
        [ACCOUNT_TEST_SQL.getLicenseStatus]: { status: "active", last_activated_at: new Date().toISOString() },
      },
      runChanges: 1,
    });
    const res = await postWithSession("/api/account/update-ticket", {
      username: "alice",
      activeTicket: ticket,
    }, { DB: db, QUOTA_KV: kv });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true });
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
    const { db } = createMockDB({ firstBySQL: { [ACCOUNT_TEST_SQL.getProfileRow]: BASE_PROFILE, [ACCOUNT_TEST_SQL.getLicenseStatus]: { status: "revoked" } } });
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
    const { db } = createMockDB({
      firstBySQL: {
        [ACCOUNT_TEST_SQL.getProfile]: {
          ...BASE_PROFILE,
          username: "alice-new",
          license_hash: undefined,
        },
        [ACCOUNT_TEST_SQL.getProfileRow]: BASE_PROFILE,
        [ACCOUNT_TEST_SQL.getLicenseStatus]: { status: "active" },
        [ACCOUNT_TEST_SQL.aliasTakenLookup]: null,
        [ACCOUNT_TEST_SQL.aliasHistoryLookup]: null,
      },
      runChanges: 1,
    });
    db.batch = vi.fn().mockResolvedValue([
      { meta: { changes: 1 } },
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
    expect((db.batch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]).toHaveLength(5);
  });
  it("succeeds when secondary table updates affect 0 rows but the profile rename succeeds", async () => {
    const { db } = createMockDB({
      firstBySQL: {
        [ACCOUNT_TEST_SQL.getProfile]: {
          ...BASE_PROFILE,
          username: "alice-new",
          license_hash: undefined,
        },
        [ACCOUNT_TEST_SQL.getProfileRow]: BASE_PROFILE,
        [ACCOUNT_TEST_SQL.getLicenseStatus]: { status: "active" },
        [ACCOUNT_TEST_SQL.aliasTakenLookup]: null,
        [ACCOUNT_TEST_SQL.aliasHistoryLookup]: null,
      },
      runChanges: 1,
    });
    db.batch = vi.fn().mockResolvedValue([
      { meta: { changes: 1 } },
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
  });
  it("returns 409 when alias is already taken", async () => {
    const { db } = createMockDB({
      firstBySQL: {
        [ACCOUNT_TEST_SQL.getProfile]: {
          ...BASE_PROFILE,
          license_hash: undefined,
        },
        [ACCOUNT_TEST_SQL.getProfileRow]: BASE_PROFILE,
        [ACCOUNT_TEST_SQL.getLicenseStatus]: { status: "active" },
        [ACCOUNT_TEST_SQL.aliasTakenLookup]: { "1": 1 },
        [ACCOUNT_TEST_SQL.aliasHistoryLookup]: null,
      },
      runChanges: 1,
    });
    const res = await postJSON("/api/account/update-alias", { username: "alice", newAlias: "taken-name", licenseKeyHash: "hash" }, { DB: db });
    expect(res.status).toBe(409);
    expect(((await res.json()) as { error: string }).error).toContain("already taken");
  });
  it("returns 409 when UNIQUE constraint violation occurs on user_scores update", async () => {
    const { db } = createMockDB({
      firstBySQL: {
        [ACCOUNT_TEST_SQL.getProfile]: {
          ...BASE_PROFILE,
          license_hash: undefined,
        },
        [ACCOUNT_TEST_SQL.getProfileRow]: BASE_PROFILE,
        [ACCOUNT_TEST_SQL.getLicenseStatus]: { status: "active" },
        [ACCOUNT_TEST_SQL.aliasTakenLookup]: null,
        [ACCOUNT_TEST_SQL.aliasHistoryLookup]: null,
      },
      runChanges: 1,
    });
    db.batch = vi.fn().mockRejectedValue(new Error("UNIQUE constraint failed: user_scores.username"));
    const res = await postJSON("/api/account/update-alias", {
      username: "alice", newAlias: "alice-new", licenseKeyHash: "hash",
    }, { DB: db });
    expect(res.status).toBe(409);
    expect(((await res.json()) as { error: string }).error).toContain("already taken");
  });
  it("returns 429 when alias change limit is reached (D1 atomic claim returns 0 changes)", async () => {
    const { db } = createMockDB({
      firstBySQL: {
        [ACCOUNT_TEST_SQL.getProfile]: {
          ...BASE_PROFILE,
          license_hash: undefined,
        },
        [ACCOUNT_TEST_SQL.getProfileRow]: BASE_PROFILE,
        [ACCOUNT_TEST_SQL.getLicenseStatus]: { status: "active" },
        [ACCOUNT_TEST_SQL.aliasHistoryLookup]: null,
      },
      runChanges: 0,
    });
    db.batch = vi.fn().mockResolvedValue([
      { meta: { changes: 0 } },
      { meta: { changes: 0 } },
      { meta: { changes: 0 } },
      { meta: { changes: 0 } },
      { meta: { changes: 0 } },
    ]);
    const res = await postJSON("/api/account/update-alias", { username: "alice", newAlias: "alice-new", licenseKeyHash: "hash" }, { DB: db });
    expect(res.status).toBe(429);
    expect(((await res.json()) as { error: string }).error).toContain("limit reached");
    expect((db.prepare as ReturnType<typeof vi.fn>).mock.calls.some(
      (args: unknown[]) => typeof args[0] === "string" && args[0].includes("DELETE FROM alias_rate_limits"),
    )).toBe(true);
  });
  it("does not consume an alias-rate-limit token when the rename fails before the transaction", async () => {
    const { db } = createMockDB({
      firstBySQL: {
        [ACCOUNT_TEST_SQL.getProfile]: {
          ...BASE_PROFILE,
          license_hash: undefined,
        },
        [ACCOUNT_TEST_SQL.getProfileRow]: BASE_PROFILE,
        [ACCOUNT_TEST_SQL.getLicenseStatus]: { status: "active" },
        [ACCOUNT_TEST_SQL.aliasTakenLookup]: { "1": 1 },
        [ACCOUNT_TEST_SQL.aliasHistoryLookup]: null,
      },
      runChanges: 1,
    });
    const res = await postJSON("/api/account/update-alias", { username: "alice", newAlias: "taken-name", licenseKeyHash: "hash" }, { DB: db });
    expect(res.status).toBe(409);
    const aliasRateLimitCalls = (db.prepare as ReturnType<typeof vi.fn>).mock.calls.filter(
      (args: unknown[]) => typeof args[0] === "string" && args[0].includes("INSERT INTO alias_rate_limits"),
    );
    expect(aliasRateLimitCalls.length).toBe(0);
    expect(db.batch).not.toHaveBeenCalled();
  });
  it("returns 409 and guards secondary tables when user_scores update returns 0 rows (revoked license)", async () => {
    const { db } = createMockDB({
      firstBySQL: {
        [ACCOUNT_TEST_SQL.getProfile]: {
          ...BASE_PROFILE,
          license_hash: undefined,
        },
        [ACCOUNT_TEST_SQL.getProfileRow]: BASE_PROFILE,
        [ACCOUNT_TEST_SQL.getLicenseStatus]: { status: "active" },
        [ACCOUNT_TEST_SQL.aliasTakenLookup]: null,
        [ACCOUNT_TEST_SQL.aliasHistoryLookup]: null,
      },
      runChanges: 0,
    });
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
    db.batch = vi.fn().mockResolvedValue([{ meta: { changes: 1 } }, { meta: { changes: 0 } }, { meta: { changes: 0 } }, { meta: { changes: 0 } }, { meta: { changes: 0 } }]);
    const res = await postJSON("/api/account/update-alias", { username: "alice", newAlias: "alice-new", licenseKeyHash: "hash" }, { DB: db });
    expect(res.status).toBe(409);
    expect(db.batch).toHaveBeenCalled();
    expect((db.prepare as ReturnType<typeof vi.fn>).mock.calls.some(
      (args: unknown[]) => typeof args[0] === "string" && args[0].includes("SET change_count = change_count - 1"),
    )).toBe(true);
  });
  it("returns 409 when the destination alias still has historical activity", async () => {
    const { db } = createMockDB({
      firstBySQL: {
        [ACCOUNT_TEST_SQL.getProfile]: {
          ...BASE_PROFILE,
          license_hash: undefined,
        },
        [ACCOUNT_TEST_SQL.getProfileRow]: BASE_PROFILE,
        [ACCOUNT_TEST_SQL.getLicenseStatus]: { status: "active" },
        [ACCOUNT_TEST_SQL.aliasTakenLookup]: null,
        [ACCOUNT_TEST_SQL.aliasHistoryLookup]: { "1": 1 },
      },
      runChanges: 1,
    });
    const res = await postJSON("/api/account/update-alias", { username: "alice", newAlias: "alice-new", licenseKeyHash: "hash" }, { DB: db });
    expect(res.status).toBe(409);
    expect(((await res.json()) as { error: string }).error).toContain("historical activity");
    expect(db.batch).not.toHaveBeenCalled();
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

describe("POST /api/account/checkout-license", () => {
  it("returns 400 when checkoutId is missing", async () => {
    const res = await postJSON("/api/account/checkout-license", {}, {
      CHECKOUT_CLAIM_SECRET: CLAIM_SECRET, POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org",
    });
    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toContain("checkoutId");
  });
  it("returns 400 for malformed JSON bodies", async () => {
    const res = await postRaw("/api/account/checkout-license", "{", {
      CHECKOUT_CLAIM_SECRET: CLAIM_SECRET,
      POLAR_ACCESS_TOKEN: "tok",
      POLAR_ORGANIZATION_ID: "org",
      DB: createMockDB({ runChanges: 1 }).db,
    });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toContain("Invalid JSON");
  });
  it("returns 500 when Polar is not configured", async () => {
    const res = await postJSON("/api/account/checkout-license", { checkoutId: "co_123" }, {});
    expect(res.status).toBe(500);
  });
  it("redeems checkout without KV when DB and Polar are available", async () => {
    const origFetch = globalThis.fetch;
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const u = typeof input === "string" ? input : input.toString();
      if (u.includes("/v1/checkouts/")) {
        return new Response(JSON.stringify({ organization_id: "org", status: "succeeded", customer_id: "c1", created_at: "2026-01-02T00:00:00Z", metadata: { reference_id: "s" } }));
      }
      if (u.includes("/v1/license-keys/")) {
        return new Response(JSON.stringify({ items: [{ key: "COPE-NOKV", created_at: "2026-01-02T00:00:05Z", status: "granted" }] }));
      }
      return origFetch(input as RequestInfo, undefined);
    }) as typeof fetch;
    try {
      const res = await postWithSession("/api/account/checkout-license", { checkoutId: "co_nokv" },
        { CHECKOUT_CLAIM_SECRET: CLAIM_SECRET, POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org", DB: createMockDB({ runChanges: 1 }).db }, "s");
      expect(res.status).toBe(200);
      expect(((await res.json()) as { allKeys: string[] }).allKeys).toEqual(["COPE-NOKV"]);
    } finally {
      globalThis.fetch = origFetch;
    }
  });
  it("returns cached key from KV on repeated calls", async () => {
    const kv = mockKV({ "checkout_used:co_123": JSON.stringify({ keys: ["COPE-ABC"], sessionId: "s" }) });
    const res = await postWithSession("/api/account/checkout-license", { checkoutId: "co_123" },
      { CHECKOUT_CLAIM_SECRET: CLAIM_SECRET, POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org", QUOTA_KV: kv }, "s");
    expect(res.status).toBe(200);
    const data = await res.json() as { licenseKey: string; allKeys: string[] };
    expect(data.licenseKey).toBe("COPE-ABC");
    expect(data.allKeys).toEqual(["COPE-ABC"]);
  });
  it("handles legacy cached string (not JSON array) gracefully", async () => {
    const kv = mockKV({ "checkout_used:co_old": "COPE-LEGACY" });
    let encryptedKeys: string | null = null;
    const seedDb = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((...args: unknown[]) => ({
          run: vi.fn().mockImplementation(async () => {
            if (sql.includes("UPDATE checkout_claims SET encrypted_keys")) encryptedKeys = args[0] as string;
            return { meta: { changes: 1 } };
          }),
        })),
      })),
    } as unknown as D1Database;
    await storeClaimedKeys(seedDb, "co_old", ["COPE-LEGACY"], CLAIM_SECRET);
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn(() => ({
          first: vi.fn().mockImplementation(async () => {
            if (sql.includes("SELECT session_id, encrypted_keys FROM checkout_claims")) return { session_id: "s", encrypted_keys: encryptedKeys };
            return null;
          }),
          run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
          all: vi.fn().mockResolvedValue({ results: [] }),
        })),
        first: vi.fn().mockResolvedValue(null),
        run: vi.fn().mockResolvedValue({ meta: { changes: 0 } }),
        all: vi.fn().mockResolvedValue({ results: [] }),
      })),
      exec: vi.fn().mockResolvedValue({ results: [] }),
      batch: vi.fn().mockResolvedValue([]),
    };
    const res = await postWithSession("/api/account/checkout-license", { checkoutId: "co_old" },
      { CHECKOUT_CLAIM_SECRET: CLAIM_SECRET, POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org", QUOTA_KV: kv, DB: db }, "s");
    expect(res.status).toBe(200);
    const data = await res.json() as { licenseKey: string; allKeys: string[] };
    expect(data.licenseKey).toBe("COPE-LEGACY");
    expect(data.allKeys).toEqual(["COPE-LEGACY"]);
  });
  it("returns cached multi-key team pack from KV", async () => {
    const keys = ["COPE-T1", "COPE-T2", "COPE-T3"];
    const kv = mockKV({ "checkout_used:co_team": JSON.stringify({ keys, sessionId: "s" }) });
    const res = await postWithSession("/api/account/checkout-license", { checkoutId: "co_team" },
      { CHECKOUT_CLAIM_SECRET: CLAIM_SECRET, POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org", QUOTA_KV: kv }, "s");
    expect(res.status).toBe(200);
    const data = await res.json() as { licenseKey: string; allKeys: string[] };
    expect(data.licenseKey).toBe("COPE-T1");
    expect(data.allKeys).toEqual(keys);
  });
  it("assigns supporter checkout entitlement to the first returned key", async () => {
    const origFetch = globalThis.fetch;
    const { db, calls } = createMockDB({ runChanges: 1 });
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const u = typeof input === "string" ? input : input.toString();
      if (u.includes("/v1/checkouts/?")) {
        return new Response(JSON.stringify({ items: [] }));
      }
      if (u.includes("/v1/checkouts/")) {
        return new Response(JSON.stringify({
          organization_id: "org",
          status: "succeeded",
          customer_id: "c1",
          created_at: "2026-01-02T00:00:00Z",
          metadata: { reference_id: "s", tier: "Executive Supporter Tier" },
        }));
      }
      if (u.includes("/v1/license-keys/")) {
        return new Response(JSON.stringify({ items: ["T1", "T2"].map((k, i) => ({ key: `COPE-${k}`, created_at: `2026-01-02T00:00:0${i + 1}Z`, status: "granted" })) }));
      }
      return origFetch(input as RequestInfo, undefined);
    }) as typeof fetch;
    try {
      const res = await postWithSession("/api/account/checkout-license", { checkoutId: "co_supporter" },
        { CHECKOUT_CLAIM_SECRET: CLAIM_SECRET, POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org", DB: db }, "s");
      expect(res.status).toBe(200);
      const checkoutClaimInsert = calls.find((call) => call.sql.includes("INSERT INTO checkout_claims"));
      expect(checkoutClaimInsert?.bindings).toEqual(["co_supporter", "s", "2026-01-02T00:00:00Z", 1]);
      const supporterClaimInsert = calls.find((call) => call.sql.includes("INSERT INTO checkout_key_claims"));
      expect(supporterClaimInsert?.bindings.slice(0, 4)).toEqual([
        expect.any(String),
        1,
        expect.any(String),
        0,
      ]);
    } finally {
      globalThis.fetch = origFetch;
    }
  });
  it("returns 400 for invalid checkoutId format", async () => {
    expect((await postJSON("/api/account/checkout-license", { checkoutId: ";;;invalid" }, {
      CHECKOUT_CLAIM_SECRET: CLAIM_SECRET, POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org",
    })).status).toBe(400);
  });
  it("returns 403 when cached checkout was redeemed by a different session", async () => {
    const cachePayload = JSON.stringify({ keys: ["COPE-BOUND"], sessionId: "original-session" });
    const kv = mockKV({ "checkout_used:co_bound": cachePayload });
    const res = await postWithSession("/api/account/checkout-license", { checkoutId: "co_bound" },
      { CHECKOUT_CLAIM_SECRET: CLAIM_SECRET, POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org", QUOTA_KV: kv }, "different-session");
    expect(res.status).toBe(403);
    const data = await res.json() as { error: string };
    expect(data.error).toContain("already redeemed");
  });
  it("returns keys when cached checkout session matches the caller", async () => {
    const cachePayload = JSON.stringify({ keys: ["COPE-MINE"], sessionId: "my-session" });
    const kv = mockKV({ "checkout_used:co_mine": cachePayload });
    const res = await postWithSession("/api/account/checkout-license", { checkoutId: "co_mine" },
      { CHECKOUT_CLAIM_SECRET: CLAIM_SECRET, POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org", QUOTA_KV: kv }, "my-session");
    expect(res.status).toBe(200);
    const data = await res.json() as { licenseKey: string; allKeys: string[] };
    expect(data.licenseKey).toBe("COPE-MINE");
    expect(data.allKeys).toEqual(["COPE-MINE"]);
  });
  it("reuses legacy cache entries only when D1 confirms the stored claim", async () => {
    const kv = mockKV({ "checkout_used:co_legacy": JSON.stringify(["COPE-STALE"]) });
    let encryptedKeys: string | null = null;
    const seedDb = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((...args: unknown[]) => ({
          run: vi.fn().mockImplementation(async () => {
            if (sql.includes("UPDATE checkout_claims SET encrypted_keys")) encryptedKeys = args[0] as string;
            return { meta: { changes: 1 } };
          }),
        })),
      })),
    } as unknown as D1Database;
    await storeClaimedKeys(seedDb, "co_legacy", ["COPE-OLD"], CLAIM_SECRET);
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn(() => ({
          first: vi.fn().mockImplementation(async () => {
            if (sql.includes("SELECT session_id, encrypted_keys FROM checkout_claims")) return { session_id: "any-session", encrypted_keys: encryptedKeys };
            return null;
          }),
          run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
          all: vi.fn().mockResolvedValue({ results: [] }),
        })),
        first: vi.fn().mockResolvedValue(null),
        run: vi.fn().mockResolvedValue({ meta: { changes: 0 } }),
        all: vi.fn().mockResolvedValue({ results: [] }),
      })),
      exec: vi.fn().mockResolvedValue({ results: [] }),
      batch: vi.fn().mockResolvedValue([]),
    };
    const res = await postWithSession("/api/account/checkout-license", { checkoutId: "co_legacy" },
      { CHECKOUT_CLAIM_SECRET: CLAIM_SECRET, POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org", QUOTA_KV: kv, DB: db }, "any-session");
    expect(res.status).toBe(200);
    const data = await res.json() as { licenseKey: string; allKeys: string[] };
    expect(data.licenseKey).toBe("COPE-OLD");
    expect(data.allKeys).toEqual(["COPE-OLD"]);
  });
  it("ignores legacy cache entries when D1 has no stored claim and falls back to Polar", async () => {
    const origFetch = globalThis.fetch;
    const kv = mockKV({ "checkout_used:co_legacy_miss": JSON.stringify(["COPE-STALE"]) });
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const u = typeof input === "string" ? input : input.toString();
      if (u.includes("/v1/checkouts/")) {
        return new Response(JSON.stringify({ organization_id: "org", status: "succeeded", customer_id: "c1", created_at: "2026-01-02T00:00:00Z", metadata: { reference_id: "s" } }));
      }
      if (u.includes("/v1/license-keys/")) {
        return new Response(JSON.stringify({ items: [{ key: "COPE-FRESH", created_at: "2026-01-02T00:00:05Z", status: "granted" }] }));
      }
      return origFetch(input as RequestInfo, undefined);
    }) as typeof fetch;
    try {
      const res = await postWithSession("/api/account/checkout-license", { checkoutId: "co_legacy_miss" },
        { CHECKOUT_CLAIM_SECRET: CLAIM_SECRET, POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org", QUOTA_KV: kv, DB: createMockDB({ runChanges: 1 }).db }, "s");
      expect(res.status).toBe(200);
      expect(((await res.json()) as { allKeys: string[] }).allKeys).toEqual(["COPE-FRESH"]);
    } finally {
      globalThis.fetch = origFetch;
    }
  });
  it("deletes malformed cache entries before falling back to Polar", async () => {
    const origFetch = globalThis.fetch;
    const kv = mockKV({ "checkout_used:co_bad": "{broken" });
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const u = typeof input === "string" ? input : input.toString();
      if (u.includes("/v1/checkouts/")) {
        return new Response(JSON.stringify({ organization_id: "org", status: "succeeded", customer_id: "c1", created_at: "2026-01-02T00:00:00Z", metadata: { reference_id: "s" } }));
      }
      if (u.includes("/v1/license-keys/")) {
        return new Response(JSON.stringify({ items: [{ key: "COPE-FRESH", created_at: "2026-01-02T00:00:05Z", status: "granted" }] }));
      }
      return origFetch(input as RequestInfo, undefined);
    }) as typeof fetch;
    try {
      const res = await postWithSession("/api/account/checkout-license", { checkoutId: "co_bad" },
        { CHECKOUT_CLAIM_SECRET: CLAIM_SECRET, POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org", QUOTA_KV: kv, DB: createMockDB({ runChanges: 1 }).db }, "s");
      expect(res.status).toBe(200);
      expect(kv.delete).toHaveBeenCalledWith("checkout_used:co_bad");
    } finally {
      globalThis.fetch = origFetch;
    }
  });
  it("continues to Polar when malformed cache cleanup fails", async () => {
    const origFetch = globalThis.fetch;
    const kv = mockKV({ "checkout_used:co_bad_delete": "{broken" });
    kv.delete = vi.fn().mockRejectedValue(new Error("KV unavailable"));
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const u = typeof input === "string" ? input : input.toString();
      if (u.includes("/v1/checkouts/")) {
        return new Response(JSON.stringify({ organization_id: "org", status: "succeeded", customer_id: "c1", created_at: "2026-01-02T00:00:00Z", metadata: { reference_id: "s" } }));
      }
      if (u.includes("/v1/license-keys/")) {
        return new Response(JSON.stringify({ items: [{ key: "COPE-FRESH", created_at: "2026-01-02T00:00:05Z", status: "granted" }] }));
      }
      return origFetch(input as RequestInfo, undefined);
    }) as typeof fetch;
    try {
      const res = await postWithSession("/api/account/checkout-license", { checkoutId: "co_bad_delete" },
        { CHECKOUT_CLAIM_SECRET: CLAIM_SECRET, POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org", QUOTA_KV: kv, DB: createMockDB({ runChanges: 1 }).db }, "s");
      expect(res.status).toBe(200);
      expect(((await res.json()) as { allKeys: string[] }).allKeys).toEqual(["COPE-FRESH"]);
    } finally {
      globalThis.fetch = origFetch;
    }
  });
  describe("non-cached Polar fetch path", () => {
    const origFetch = globalThis.fetch;
    afterEach(() => { globalThis.fetch = origFetch; });
    const T = "2026-01-02T00:00:00Z";
    const co = (id: string) => postWithSession("/api/account/checkout-license", { checkoutId: id }, {
      CHECKOUT_CLAIM_SECRET: CLAIM_SECRET,
      POLAR_ACCESS_TOKEN: "tok",
      POLAR_ORGANIZATION_ID: "org",
      QUOTA_KV: mockKV({}),
      DB: createMockDB({ runChanges: 1 }).db,
    }, "s");
    function stubPolar(checkout: object, lk?: object) {
      const payload = { metadata: { reference_id: "s" }, ...checkout } as object;
      globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
        const u = typeof input === "string" ? input : input.toString();
        if (u.includes("/v1/checkouts/")) return new Response(JSON.stringify(payload));
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
    it("redeems a checkout from Polar customer session token return URLs", async () => {
      globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
        const u = typeof input === "string" ? input : input.toString();
        if (u.includes("/v1/customer-portal/orders/")) {
          return new Response(JSON.stringify({ items: [{ paid: true, checkout_id: "co_from_token", product: { name: "Executive Supporter - 5 Licenses" } }] }));
        }
        if (u.includes("/v1/license-keys/")) {
          return new Response(JSON.stringify({ items: [{ key: "COPE-FROM-TOKEN", created_at: "2026-01-02T00:00:05Z", status: "granted" }] }));
        }
        if (u.includes("/v1/checkouts/?")) {
          return new Response(JSON.stringify({ items: [] }));
        }
        if (u.includes("/v1/checkouts/co_from_token")) {
          return new Response(JSON.stringify({ organization_id: "org", status: "succeeded", customer_id: "c1", created_at: T, metadata: { reference_id: "s" } }));
        }
        return origFetch(input as RequestInfo, undefined);
      }) as typeof fetch;

      const { db, calls } = createMockDB({ runChanges: 1 });
      const res = await postWithSession("/api/account/checkout-license", { customerSessionToken: "polar_cst_return_1234567890" }, {
        CHECKOUT_CLAIM_SECRET: CLAIM_SECRET,
        POLAR_ACCESS_TOKEN: "tok",
        POLAR_ORGANIZATION_ID: "org",
        QUOTA_KV: mockKV({}),
        DB: db,
      }, "s");

      expect(res.status).toBe(200);
      expect(((await res.json()) as { allKeys: string[] }).allKeys).toEqual(["COPE-FROM-TOKEN"]);
      const checkoutClaimInsert = calls.find((call) => call.sql.includes("INSERT INTO checkout_claims"));
      expect(checkoutClaimInsert?.bindings).toEqual(["co_from_token", "s", T, 1]);
      const keyClaimInsert = calls.find((call) => call.sql.includes("INSERT INTO checkout_key_claims"));
      expect(keyClaimInsert?.bindings[1]).toBe(1);
    });
    it("returns multiple keys for team-pack", async () => {
      stubPolar({ organization_id: "org", status: "succeeded", customer_id: "c1", created_at: T }, { items: ["T1", "T2", "T3"].map((k, i) => ({ key: `COPE-${k}`, created_at: `2026-01-02T00:00:0${i + 1}Z`, status: "granted" })) });
      expect(((await (await co("co_tp")).json()) as { allKeys: string[] }).allKeys).toEqual(["COPE-T1", "COPE-T2", "COPE-T3"]);
    });
    it("does not assign later purchase keys to an earlier checkout redeemed first", async () => {
      stubPolar(
        { organization_id: "org", status: "succeeded", customer_id: "c1", created_at: T },
        {
          items: [
            { key: "COPE-A1", created_at: "2026-01-02T00:00:10Z", status: "granted" },
            { key: "COPE-A2", created_at: "2026-01-02T00:00:20Z", status: "granted" },
            { key: "COPE-B1", created_at: "2026-01-02T00:05:10Z", status: "granted" },
            { key: "COPE-B2", created_at: "2026-01-02T00:05:20Z", status: "granted" },
          ],
        },
      );
      globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
        const u = typeof input === "string" ? input : input.toString();
        if (u.includes("/v1/checkouts/co_a")) {
          return new Response(JSON.stringify({ organization_id: "org", status: "succeeded", customer_id: "c1", created_at: T, metadata: { reference_id: "s" } }));
        }
        if (u.includes("/v1/checkouts/?")) {
          return new Response(JSON.stringify({
            items: [
              { id: "co_b", created_at: "2026-01-02T00:05:00Z", status: "succeeded" },
              { id: "co_a", created_at: T, status: "succeeded" },
            ],
          }));
        }
        if (u.includes("/v1/license-keys/")) {
          return new Response(JSON.stringify({
            items: [
              { key: "COPE-A1", created_at: "2026-01-02T00:00:10Z", status: "granted" },
              { key: "COPE-A2", created_at: "2026-01-02T00:00:20Z", status: "granted" },
              { key: "COPE-B1", created_at: "2026-01-02T00:05:10Z", status: "granted" },
              { key: "COPE-B2", created_at: "2026-01-02T00:05:20Z", status: "granted" },
            ],
          }));
        }
        return origFetch(input as RequestInfo, undefined);
      }) as typeof fetch;

      const res = await co("co_a");
      expect(res.status).toBe(200);

      const data = await res.json() as { allKeys: string[] };
      expect(data.allKeys).toEqual(["COPE-A1", "COPE-A2"]);
    });
    it("returns 409 when no granted keys exist", async () => {
      stubPolar({ organization_id: "org", status: "succeeded", customer_id: "c1", created_at: T }, { items: [{ key: "X", created_at: "2026-01-02T00:00:05Z", status: "pending" }] });
      expect((await co("co_p")).status).toBe(409);
    });
    it("returns 409 instead of re-issuing keys already claimed by another checkout", async () => {
      stubPolar({ organization_id: "org", status: "succeeded", customer_id: "c1", created_at: T }, { items: [{ key: "COPE-DUPE", created_at: "2026-01-02T00:00:05Z", status: "granted" }] });
      const dupeHash = await hashKey("COPE-DUPE");
      const dedupDB = {
        prepare: vi.fn((sql: string) => ({
          bind: vi.fn(() => ({
            first: vi.fn().mockResolvedValue(sql.includes("SELECT session_id, encrypted_keys FROM checkout_claims") ? { session_id: "s", encrypted_keys: null } : null),
            run: vi.fn().mockResolvedValue({ meta: { changes: sql.includes("INSERT INTO checkout_claims") ? 1 : 0 } }),
            all: vi.fn().mockResolvedValue({ results: [{ license_key_hash: dupeHash, checkout_id: "other-checkout" }] }),
          })),
          first: vi.fn().mockResolvedValue(null),
          run: vi.fn().mockResolvedValue({ meta: { changes: 0 } }),
          all: vi.fn().mockResolvedValue({ results: [] }),
        })),
        exec: vi.fn().mockResolvedValue({ results: [] }),
        batch: vi.fn().mockResolvedValue([]),
      };
      const res = await postWithSession("/api/account/checkout-license", { checkoutId: "co_dupe" },
        { CHECKOUT_CLAIM_SECRET: CLAIM_SECRET, POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org", QUOTA_KV: mockKV({}), DB: dedupDB }, "s");
      expect(res.status).toBe(409);
      expect(((await res.json()) as { error: string }).error).toContain("already claimed");
    });
    it("returns 409 when another checkout wins part of an overlapping key set", async () => {
      stubPolar({ organization_id: "org", status: "succeeded", customer_id: "c1", created_at: T }, {
        items: [
          { key: "COPE-1", created_at: "2026-01-02T00:00:05Z", status: "granted" },
          { key: "COPE-2", created_at: "2026-01-02T00:00:06Z", status: "granted" },
        ],
      });
      let storedKeys: string | null = null;
      const keyOwners = new Map<string, string>([[await hashKey("COPE-1"), "other-checkout"]]);
      const db = {
        prepare: vi.fn((sql: string) => ({
          bind: vi.fn((...args: unknown[]) => ({
            first: vi.fn().mockImplementation(async () => {
              if (sql.includes("SELECT session_id, encrypted_keys FROM checkout_claims")) return { session_id: "s", encrypted_keys: storedKeys };
              if (sql.includes("SELECT encrypted_keys FROM checkout_claims")) return { encrypted_keys: storedKeys };
              return null;
            }),
            run: vi.fn().mockImplementation(async () => {
              if (sql.includes("INSERT INTO checkout_claims")) return { meta: { changes: 1 } };
              if (sql.includes("INSERT INTO checkout_key_claims")) {
                const bindings = args as string[];
                const checkoutId = bindings[bindings.length - 1]!;
                const licenseKeyHashes = bindings.slice(0, -2).filter((_, index) => index % 2 === 0);
                const hasConflict = licenseKeyHashes.some((licenseKeyHash) => keyOwners.has(licenseKeyHash) && keyOwners.get(licenseKeyHash) !== checkoutId);
                if (hasConflict) return { meta: { changes: 0 } };
                for (const licenseKeyHash of licenseKeyHashes) {
                  if (!keyOwners.has(licenseKeyHash)) keyOwners.set(licenseKeyHash, checkoutId);
                }
                return { meta: { changes: licenseKeyHashes.length } };
              }
              if (sql.includes("UPDATE checkout_claims SET encrypted_keys")) {
                storedKeys = args[0] as string;
                return { meta: { changes: 1 } };
              }
              return { meta: { changes: 0 } };
            }),
            all: vi.fn().mockImplementation(async () => ({
              results: sql.includes("SELECT license_key_hash, checkout_id FROM checkout_key_claims")
                ? (args as string[]).map((licenseKeyHash) => ({ license_key_hash: licenseKeyHash, checkout_id: keyOwners.get(licenseKeyHash)! }))
                : [],
            })),
          })),
          first: vi.fn().mockResolvedValue(null),
          run: vi.fn().mockResolvedValue({ meta: { changes: 0 } }),
          all: vi.fn().mockResolvedValue({ results: [] }),
        })),
        exec: vi.fn().mockResolvedValue({ results: [] }),
        batch: vi.fn().mockResolvedValue([]),
      };
      const res = await postWithSession("/api/account/checkout-license", { checkoutId: "co_overlap" },
        { CHECKOUT_CLAIM_SECRET: CLAIM_SECRET, POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org", QUOTA_KV: mockKV({}), DB: db }, "s");
      expect(res.status).toBe(409);
      expect(((await res.json()) as { error: string }).error).toContain("full license set");
      expect(keyOwners.get(await hashKey("COPE-2"))).toBeUndefined();
    });
    it("returns 403 for wrong organization", async () => {
      stubPolar({ organization_id: "other", status: "succeeded", customer_id: "c1" });
      expect((await co("co_wo")).status).toBe(403);
    });
    it("returns 400 for unknown checkout (Polar 404)", async () => {
      globalThis.fetch = vi.fn(async () => new Response("{}", { status: 404 })) as typeof fetch;
      expect((await co("co_inv")).status).toBe(400);
    });
    it("excludes keys outside 15-minute window", async () => {
      stubPolar({ organization_id: "org", status: "succeeded", customer_id: "c1", created_at: T }, { items: [{ key: "THIS", created_at: "2026-01-02T00:00:10Z", status: "granted" }, { key: "LATER", created_at: "2026-01-02T01:00:00Z", status: "granted" }] });
      expect(((await (await co("co_w")).json()) as { allKeys: string[] }).allKeys).toEqual(["THIS"]);
    });
    it("returns 503 when checkout claim table is missing (infrastructure failure)", async () => {
      stubPolar({ organization_id: "org", status: "succeeded", customer_id: "c1", created_at: T });
      const failDB = {
        prepare: vi.fn((sql: string) => ({
          bind: vi.fn(() => ({
            first: vi.fn().mockResolvedValue(null),
            run: sql.includes("checkout_claims")
              ? vi.fn().mockRejectedValue(new Error("no such table: checkout_claims"))
              : vi.fn().mockResolvedValue({ meta: { changes: 0 } }),
            all: vi.fn().mockResolvedValue({ results: [] }),
          })),
          first: vi.fn().mockResolvedValue(null),
          run: vi.fn().mockResolvedValue({ meta: { changes: 0 } }),
          all: vi.fn().mockResolvedValue({ results: [] }),
        })),
        exec: vi.fn().mockResolvedValue({ results: [] }),
        batch: vi.fn().mockResolvedValue([]),
      };
      const res = await postWithSession("/api/account/checkout-license", { checkoutId: "co_infra" },
        { CHECKOUT_CLAIM_SECRET: CLAIM_SECRET, POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org", QUOTA_KV: mockKV({}), DB: failDB }, "s");
      expect(res.status).toBe(503);
      const data = await res.json() as { error: string };
      expect(data.error).toContain("try again");
    });
    it("returns 503 when atomic key claiming fails", async () => {
      stubPolar({ organization_id: "org", status: "succeeded", customer_id: "c1", created_at: T }, { items: [{ key: "COPE-NEW", created_at: "2026-01-02T00:00:05Z", status: "granted" }] });
      const failDB = {
        prepare: vi.fn((sql: string) => ({
          bind: vi.fn(() => ({
            first: vi.fn().mockResolvedValue(sql.includes("SELECT session_id, encrypted_keys FROM checkout_claims") ? { session_id: "s", encrypted_keys: null } : null),
            run: vi.fn().mockResolvedValue({ meta: { changes: sql.includes("INSERT INTO checkout_claims") ? 1 : 0 } }),
            all: sql.includes("SELECT license_key_hash, checkout_id FROM checkout_key_claims")
              ? vi.fn().mockRejectedValue(new Error("D1_ERROR: checkout_key_claims unavailable"))
              : vi.fn().mockResolvedValue({ results: [] }),
          })),
          first: vi.fn().mockResolvedValue(null),
          run: vi.fn().mockResolvedValue({ meta: { changes: 0 } }),
          all: vi.fn().mockResolvedValue({ results: [] }),
        })),
        exec: vi.fn().mockResolvedValue({ results: [] }),
        batch: vi.fn().mockResolvedValue([]),
      };
      const res = await postWithSession("/api/account/checkout-license", { checkoutId: "co_dedupfail" },
        { CHECKOUT_CLAIM_SECRET: CLAIM_SECRET, POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org", QUOTA_KV: mockKV({}), DB: failDB }, "s");
      expect(res.status).toBe(503);
      expect(((await res.json()) as { error: string }).error).toContain("atomically claim");
    });
    it("returns 503 when storing claimed keys fails", async () => {
      stubPolar({ organization_id: "org", status: "succeeded", customer_id: "c1", created_at: T }, { items: [{ key: "COPE-NEW", created_at: "2026-01-02T00:00:05Z", status: "granted" }] });
      const newKeyHash = await hashKey("COPE-NEW");
      const failDB = {
        prepare: vi.fn((sql: string) => ({
          bind: vi.fn(() => ({
            first: vi.fn().mockResolvedValue(sql.includes("SELECT session_id, encrypted_keys FROM checkout_claims") ? { session_id: "s", encrypted_keys: null } : null),
            run: sql.includes("UPDATE checkout_claims SET encrypted_keys")
              ? vi.fn().mockRejectedValue(new Error("D1_ERROR: cannot update encrypted_keys"))
              : vi.fn().mockResolvedValue({ meta: { changes: sql.includes("INSERT INTO checkout_claims") ? 1 : 0 } }),
            all: vi.fn().mockResolvedValue({ results: [{ license_key_hash: newKeyHash, checkout_id: "co_storefail" }] }),
          })),
          first: vi.fn().mockResolvedValue(null),
          run: vi.fn().mockResolvedValue({ meta: { changes: 0 } }),
          all: vi.fn().mockResolvedValue({ results: [] }),
        })),
        exec: vi.fn().mockResolvedValue({ results: [] }),
        batch: vi.fn().mockResolvedValue([]),
      };
      const res = await postWithSession("/api/account/checkout-license", { checkoutId: "co_storefail" },
        { CHECKOUT_CLAIM_SECRET: CLAIM_SECRET, POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org", QUOTA_KV: mockKV({}), DB: failDB }, "s");
      expect(res.status).toBe(503);
      expect(((await res.json()) as { error: string }).error).toContain("record claimed license keys");
    });
    it("reuses stored claimed keys from D1 for the same checkout before hitting Polar again", async () => {
      const kv = mockKV({});
      let encryptedKeys: string | null = null;
      const seedDb = {
        prepare: vi.fn((sql: string) => ({
          bind: vi.fn((...args: unknown[]) => ({
            run: vi.fn().mockImplementation(async () => {
              if (sql.includes("UPDATE checkout_claims SET encrypted_keys")) encryptedKeys = args[0] as string;
              return { meta: { changes: 1 } };
            }),
          })),
        })),
      } as unknown as D1Database;
      await storeClaimedKeys(seedDb, "co_stored", ["COPE-STORED"], CLAIM_SECRET);
      const db = {
        prepare: vi.fn((sql: string) => ({
          bind: vi.fn(() => ({
            first: vi.fn().mockImplementation(async () => {
              if (sql.includes("SELECT session_id, encrypted_keys FROM checkout_claims")) return { session_id: "s", encrypted_keys: encryptedKeys };
              return null;
            }),
            run: vi.fn().mockResolvedValue({ meta: { changes: sql.includes("INSERT INTO checkout_claims") ? 1 : 0 } }),
            all: vi.fn().mockResolvedValue({ results: [] }),
          })),
          first: vi.fn().mockResolvedValue(null),
          run: vi.fn().mockResolvedValue({ meta: { changes: 0 } }),
          all: vi.fn().mockResolvedValue({ results: [] }),
        })),
        exec: vi.fn().mockResolvedValue({ results: [] }),
        batch: vi.fn().mockResolvedValue([]),
      };
      const origFetch = globalThis.fetch;
      globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
        const u = typeof input === "string" ? input : input.toString();
        if (u.includes("/v1/checkouts/")) {
          return new Response(JSON.stringify({ organization_id: "org", status: "succeeded", customer_id: "c1", created_at: T }));
        }
        throw new Error(`unexpected fetch: ${u}`);
      }) as typeof fetch;
      try {
        const res = await postWithSession("/api/account/checkout-license", { checkoutId: "co_stored" },
          { CHECKOUT_CLAIM_SECRET: CLAIM_SECRET, POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org", QUOTA_KV: kv, DB: db }, "s");
        expect(res.status).toBe(200);
        expect(((await res.json()) as { allKeys: string[] }).allKeys).toEqual(["COPE-STORED"]);
        expect(kv.put).toHaveBeenCalled();
        expect(globalThis.fetch).not.toHaveBeenCalled();
      } finally {
        globalThis.fetch = origFetch;
      }
    });
    it("falls back to Polar for the same session when a stored claim is unreadable after secret rotation", async () => {
      let encryptedKeys: string | null = null;
      const seedDb = {
        prepare: vi.fn((sql: string) => ({
          bind: vi.fn((...args: unknown[]) => ({
            run: vi.fn().mockImplementation(async () => {
              if (sql.includes("UPDATE checkout_claims SET encrypted_keys")) encryptedKeys = args[0] as string;
              return { meta: { changes: 1 } };
            }),
          })),
        })),
      } as unknown as D1Database;
      await storeClaimedKeys(seedDb, "co_rotated", ["COPE-OLD"], "old-secret");
      const db = {
        prepare: vi.fn((sql: string) => ({
          bind: vi.fn((...args: unknown[]) => ({
            first: vi.fn().mockImplementation(async () => {
              if (sql.includes("SELECT session_id, encrypted_keys FROM checkout_claims")) return { session_id: "s", encrypted_keys: encryptedKeys };
              if (sql.includes("SELECT session_id, claimed_at FROM checkout_claims")) return { session_id: "s", claimed_at: T };
              if (sql.includes("SELECT encrypted_keys FROM checkout_claims")) return { encrypted_keys: encryptedKeys };
              return null;
            }),
            run: vi.fn().mockImplementation(async () => {
              if (sql.includes("INSERT INTO checkout_claims")) return { meta: { changes: 0 } };
              if (sql.includes("INSERT INTO checkout_key_claims")) return { meta: { changes: 1 } };
              if (sql.includes("UPDATE checkout_claims SET encrypted_keys")) {
                encryptedKeys = args[0] as string;
                return { meta: { changes: 1 } };
              }
              return { meta: { changes: 0 } };
            }),
            all: vi.fn().mockImplementation(async () => ({
              results: sql.includes("SELECT license_key_hash, checkout_id FROM checkout_key_claims")
                ? [{ license_key_hash: args[0] as string, checkout_id: "co_rotated" }]
                : [],
            })),
          })),
          first: vi.fn().mockResolvedValue(null),
          run: vi.fn().mockResolvedValue({ meta: { changes: 0 } }),
          all: vi.fn().mockResolvedValue({ results: [] }),
        })),
        exec: vi.fn().mockResolvedValue({ results: [] }),
        batch: vi.fn().mockResolvedValue([]),
      };
      const origFetch = globalThis.fetch;
      globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
        const u = typeof input === "string" ? input : input.toString();
        if (u.includes("/v1/checkouts/co_rotated")) {
          return new Response(JSON.stringify({ organization_id: "org", status: "succeeded", customer_id: "c1", created_at: T }));
        }
        if (u.includes("/v1/checkouts/?")) {
          return new Response(JSON.stringify({ items: [{ id: "co_rotated", created_at: T, status: "succeeded" }] }));
        }
        if (u.includes("/v1/license-keys/")) {
          return new Response(JSON.stringify({ items: [{ key: "COPE-FRESH", created_at: "2026-01-02T00:00:05Z", status: "granted" }] }));
        }
        throw new Error(`unexpected fetch: ${u}`);
      }) as typeof fetch;
      try {
        const res = await postWithSession("/api/account/checkout-license", { checkoutId: "co_rotated" },
          { CHECKOUT_CLAIM_SECRET: "new-secret", POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org", QUOTA_KV: mockKV({}), DB: db }, "s");
        expect(res.status).toBe(200);
        expect(((await res.json()) as { allKeys: string[] }).allKeys).toEqual(["COPE-FRESH"]);
      } finally {
        globalThis.fetch = origFetch;
      }
    });
    it("surfaces corrupted stored claims instead of silently re-fetching from Polar", async () => {
      const db = {
        prepare: vi.fn((sql: string) => ({
          bind: vi.fn(() => ({
            first: vi.fn().mockImplementation(async () => {
              if (sql.includes("SELECT session_id, encrypted_keys FROM checkout_claims")) {
                return { session_id: "s", encrypted_keys: "{broken" };
              }
              return null;
            }),
            run: vi.fn().mockResolvedValue({ meta: { changes: 0 } }),
            all: vi.fn().mockResolvedValue({ results: [] }),
          })),
          first: vi.fn().mockResolvedValue(null),
          run: vi.fn().mockResolvedValue({ meta: { changes: 0 } }),
          all: vi.fn().mockResolvedValue({ results: [] }),
        })),
        exec: vi.fn().mockResolvedValue({ results: [] }),
        batch: vi.fn().mockResolvedValue([]),
      };
      const origFetch = globalThis.fetch;
      globalThis.fetch = vi.fn(async () => {
        throw new Error("Polar should not be queried for corrupted stored claims");
      }) as typeof fetch;
      try {
        const res = await postWithSession("/api/account/checkout-license", { checkoutId: "co_corrupt" },
          { CHECKOUT_CLAIM_SECRET: CLAIM_SECRET, POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org", QUOTA_KV: mockKV({}), DB: db }, "s");
        expect(res.status).toBe(503);
        expect(((await res.json()) as { error: string }).error).toContain("corrupted");
        expect(globalThis.fetch).not.toHaveBeenCalled();
      } finally {
        globalThis.fetch = origFetch;
      }
    });
    it("rejects a checkout whose Polar reference_id is bound to another session", async () => {
      stubPolar({ organization_id: "org", status: "succeeded", customer_id: "c1", created_at: T, metadata: { reference_id: "buyer-session" } });
      const res = await postWithSession("/api/account/checkout-license", { checkoutId: "co_bound_polar" },
        { CHECKOUT_CLAIM_SECRET: CLAIM_SECRET, POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org", QUOTA_KV: mockKV({}), DB: createMockDB({ runChanges: 1 }).db }, "attacker-session");
      expect(res.status).toBe(403);
      expect(((await res.json()) as { error: string }).error).toContain("different session");
    });
    it("fails closed when Polar checkout metadata omits reference_id", async () => {
      stubPolar({ organization_id: "org", status: "succeeded", customer_id: "c1", created_at: T, metadata: {} });
      const res = await co("co_unbound");
      expect(res.status).toBe(500);
      expect(((await res.json()) as { error: string }).error).toContain("session binding metadata");
    });
    it("returns 503 for generic DB runtime error during claim", async () => {
      stubPolar({ organization_id: "org", status: "succeeded", customer_id: "c1", created_at: T });
      const failDB = {
        prepare: vi.fn((sql: string) => ({
          bind: vi.fn(() => ({
            first: vi.fn().mockResolvedValue(null),
            run: sql.includes("INSERT INTO checkout_claims")
              ? vi.fn().mockRejectedValue(new Error("D1_ERROR: internal error"))
              : vi.fn().mockResolvedValue({ meta: { changes: 0 } }),
            all: vi.fn().mockResolvedValue({ results: [] }),
          })),
          first: vi.fn().mockResolvedValue(null),
          run: vi.fn().mockResolvedValue({ meta: { changes: 0 } }),
          all: vi.fn().mockResolvedValue({ results: [] }),
        })),
        exec: vi.fn().mockResolvedValue({ results: [] }),
        batch: vi.fn().mockResolvedValue([]),
      };
      const res = await postWithSession("/api/account/checkout-license", { checkoutId: "co_dberr" },
        { CHECKOUT_CLAIM_SECRET: CLAIM_SECRET, POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org", QUOTA_KV: mockKV({}), DB: failDB }, "s");
      expect(res.status).toBe(503);
      const data = await res.json() as { error: string };
      expect(data.error).toContain("try again");
    });
    it("does not treat a stale cache session mismatch as authoritative when D1 confirms the caller owns the claim", async () => {
      const cachePayload = JSON.stringify({ keys: ["COPE-BOUND"], sessionId: "original-session" });
      const kv = mockKV({ "checkout_used:co_nomatch": cachePayload });
      let encryptedKeys: string | null = null;
      const seedDb = {
        prepare: vi.fn((sql: string) => ({
          bind: vi.fn((...args: unknown[]) => ({
            run: vi.fn().mockImplementation(async () => {
              if (sql.includes("UPDATE checkout_claims SET encrypted_keys")) encryptedKeys = args[0] as string;
              return { meta: { changes: 1 } };
            }),
          })),
        })),
      } as unknown as D1Database;
      await storeClaimedKeys(seedDb, "co_nomatch", ["COPE-REAL"], CLAIM_SECRET);
      const dbSpy = {
        prepare: vi.fn((sql: string) => ({
          bind: vi.fn(() => ({
            first: vi.fn().mockImplementation(async () => {
              if (sql.includes("SELECT session_id, encrypted_keys FROM checkout_claims")) {
                return { session_id: "attacker-session", encrypted_keys: encryptedKeys };
              }
              return null;
            }),
            run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
            all: vi.fn().mockResolvedValue({ results: [] }),
          })),
          first: vi.fn().mockResolvedValue(null),
          run: vi.fn().mockResolvedValue({ meta: { changes: 0 } }),
          all: vi.fn().mockResolvedValue({ results: [] }),
        })),
        exec: vi.fn().mockResolvedValue({ results: [] }),
        batch: vi.fn().mockResolvedValue([]),
      };
      const res = await postWithSession("/api/account/checkout-license", { checkoutId: "co_nomatch" },
        { CHECKOUT_CLAIM_SECRET: CLAIM_SECRET, POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org", QUOTA_KV: kv, DB: dbSpy }, "attacker-session");
      expect(res.status).toBe(200);
      expect(((await res.json()) as { allKeys: string[] }).allKeys).toEqual(["COPE-REAL"]);
      expect((dbSpy.prepare as ReturnType<typeof vi.fn>).mock.calls.some(
        (args: unknown[]) => typeof args[0] === "string" && args[0].includes("SELECT session_id, encrypted_keys FROM checkout_claims"),
      )).toBe(true);
    });
    it("reads KV only once on the miss path before checking stored claims", async () => {
      stubPolar({ organization_id: "org", status: "succeeded", customer_id: "c1", created_at: T }, { items: [{ key: "COPE-MISS", created_at: "2026-01-02T00:00:05Z", status: "granted" }] });
      const kv = mockKV({});
      const res = await postWithSession("/api/account/checkout-license", { checkoutId: "co_single_kv" }, {
        CHECKOUT_CLAIM_SECRET: CLAIM_SECRET,
        POLAR_ACCESS_TOKEN: "tok",
        POLAR_ORGANIZATION_ID: "org",
        QUOTA_KV: kv,
        DB: createMockDB({ runChanges: 1 }).db,
      }, "s");
      expect(res.status).toBe(200);
      expect(kv.get).toHaveBeenCalledTimes(1);
    });
    it("ignores stale session-bound KV keys when D1 has newer stored keys", async () => {
      const kv = mockKV({ "checkout_used:co_stale_cache": JSON.stringify({ keys: ["COPE-OLD"], sessionId: "s" }) });
      let encryptedKeys: string | null = null;
      const seedDb = {
        prepare: vi.fn((sql: string) => ({
          bind: vi.fn((...args: unknown[]) => ({
            run: vi.fn().mockImplementation(async () => {
              if (sql.includes("UPDATE checkout_claims SET encrypted_keys")) encryptedKeys = args[0] as string;
              return { meta: { changes: 1 } };
            }),
          })),
        })),
      } as unknown as D1Database;
      await storeClaimedKeys(seedDb, "co_stale_cache", ["COPE-NEW"], CLAIM_SECRET);
      const db = {
        prepare: vi.fn((sql: string) => ({
          bind: vi.fn(() => ({
            first: vi.fn().mockImplementation(async () => {
              if (sql.includes("SELECT session_id, encrypted_keys FROM checkout_claims")) return { session_id: "s", encrypted_keys: encryptedKeys };
              return null;
            }),
            run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
            all: vi.fn().mockResolvedValue({ results: [] }),
          })),
          first: vi.fn().mockResolvedValue(null),
          run: vi.fn().mockResolvedValue({ meta: { changes: 0 } }),
          all: vi.fn().mockResolvedValue({ results: [] }),
        })),
        exec: vi.fn().mockResolvedValue({ results: [] }),
        batch: vi.fn().mockResolvedValue([]),
      };
      const origFetch = globalThis.fetch;
      globalThis.fetch = vi.fn(async () => {
        throw new Error("Polar should not be queried when D1 already has the claim");
      }) as typeof fetch;
      try {
        const res = await postWithSession("/api/account/checkout-license", { checkoutId: "co_stale_cache" }, {
          CHECKOUT_CLAIM_SECRET: CLAIM_SECRET,
          POLAR_ACCESS_TOKEN: "tok",
          POLAR_ORGANIZATION_ID: "org",
          QUOTA_KV: kv,
          DB: db,
        }, "s");
        expect(res.status).toBe(200);
        expect(((await res.json()) as { allKeys: string[] }).allKeys).toEqual(["COPE-NEW"]);
        expect(globalThis.fetch).not.toHaveBeenCalled();
      } finally {
        globalThis.fetch = origFetch;
      }
    });
  });
});

describe("GET /api/account/me", () => {
  const meReq = (env: Record<string, unknown>) => app.request("/api/account/me", {
    headers: { Cookie: "cope_session_id=test-session" },
  }, { ALLOWED_ORIGINS: "http://localhost:5173", ...env });

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
  it("restores a free profile from the signed account cookie when the session mapping is missing", async () => {
    const kv = mockKV({});
    const { db } = createMockDB({
      firstBySQL: {
        [ACCOUNT_TEST_SQL.getProfileRowByAccountId]: { ...BASE_PROFILE, license_hash: null, account_id: "acct-123" },
      },
    });
    const cookieValue = await signFreeAccountCookieValue("secret", "acct-123");
    const res = await app.request("/api/account/me", {
      headers: {
        Cookie: `cope_session_id=test-session; cope_free_account=${cookieValue}`,
      },
    }, {
      ALLOWED_ORIGINS: "http://localhost:5173",
      QUOTA_KV: kv,
      DB: db,
      FREE_ACCOUNT_COOKIE_SECRET: "secret",
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      found: true,
      username: "alice",
      isPro: false,
      profile: {
        username: "alice",
      },
    });
    expect(kv.put).toHaveBeenCalledWith("session_user:test-session", "alice", expect.any(Object));
  });
  it("does not restore a licensed profile from a stale free-account cookie", async () => {
    const kv = mockKV({});
    const { db } = createMockDB({
      firstBySQL: {
        [ACCOUNT_TEST_SQL.getProfileRowByAccountId]: { ...BASE_PROFILE, license_hash: "pro-hash", account_id: "acct-123" },
      },
    });
    const cookieValue = await signFreeAccountCookieValue("secret", "acct-123");
    const res = await app.request("/api/account/me", {
      headers: {
        Cookie: `cope_session_id=test-session; cope_free_account=${cookieValue}`,
      },
    }, {
      ALLOWED_ORIGINS: "http://localhost:5173",
      QUOTA_KV: kv,
      DB: db,
      FREE_ACCOUNT_COOKIE_SECRET: "secret",
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ found: false });
    expect(kv.put).not.toHaveBeenCalled();
  });
  it("returns the mapped free profile when the session username exists", async () => {
    const kv = mockKV({ "session_user:test-session": "alice" });
    const { db } = createMockDB({ firstBySQL: { [ACCOUNT_TEST_SQL.getProfileRow]: { ...BASE_PROFILE, license_hash: null } } });
    const res = await meReq({ QUOTA_KV: kv, DB: db });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      found: true,
      username: "alice",
      isPro: false,
      profile: {
        username: "alice",
        corporate_rank: "Junior Code Monkey",
        is_executive_supporter: false,
      },
    });
  });
  it("returns executive supporter entitlement in the restored paid profile", async () => {
    const kv = mockKV({ "session_user:test-session": "alice" });
    const { db } = createMockDB({
      firstBySQL: {
        [ACCOUNT_TEST_SQL.getProfileRow]: { ...BASE_PROFILE, is_executive_supporter: 1 },
        [ACCOUNT_TEST_SQL.getLicenseStatus]: { status: "active", last_activated_at: new Date().toISOString() },
      },
    });
    const res = await meReq({ QUOTA_KV: kv, DB: db });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      found: true,
      isPro: true,
      profile: {
        username: "alice",
        is_executive_supporter: true,
        unlocked_themes: ["default", "amber", "syntax-error"],
      },
    });
  });
  it("does not reissue the free-account cookie for a mapped Pro profile", async () => {
    const kv = mockKV({ "session_user:test-session": "alice" });
    const { db } = createMockDB({
      firstBySQL: {
        [ACCOUNT_TEST_SQL.getProfileRow]: BASE_PROFILE,
        [ACCOUNT_TEST_SQL.getLicenseStatus]: { status: "active", last_activated_at: new Date().toISOString() },
      },
    });
    const res = await meReq({ QUOTA_KV: kv, DB: db, FREE_ACCOUNT_COOKIE_SECRET: "secret" });
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toBeNull();
  });
  it("applies the free-tier rank cap in the response without writing on /me", async () => {
    const kv = mockKV({ "session_user:test-session": "alice" });
    const { db } = createMockDB({
      firstBySQL: {
        [ACCOUNT_TEST_SQL.getProfileRow]: { ...BASE_PROFILE, license_hash: null, corporate_rank: "CTO" },
      },
      runChanges: 1,
    });
    const res = await meReq({ QUOTA_KV: kv, DB: db });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      found: true,
      username: "alice",
      profile: {
        username: "alice",
        corporate_rank: FREE_TIER_RANK_CAP,
      },
    });
    expect((db.prepare as ReturnType<typeof vi.fn>).mock.calls.some(
      (args: unknown[]) => typeof args[0] === "string" && args[0].includes("UPDATE user_scores") && args[0].includes("corporate_rank = ?"),
    )).toBe(false);
  });
  it("restores a username-only session even before a user_scores row exists", async () => {
    const kv = mockKV({ "session_user:test-session": "alice" });
    const { db } = createMockDB({ firstBySQL: { [ACCOUNT_TEST_SQL.getProfileRow]: null } });
    const res = await meReq({ QUOTA_KV: kv, DB: db });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      found: true,
      username: "alice",
      isPro: false,
      profile: null,
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
  it("prefers a reclaimed username row over a stale rename redirect", async () => {
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
      username: "alice",
      profile: { username: "alice", current_td: 5, total_td: 5 },
    });
    expect(kv.put).not.toHaveBeenCalledWith("session_user:test-session", "bob", expect.any(Object));
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
  it("does not repair session mappings to a renamed target without a backing profile", async () => {
    const kv = mockKV({
      "session_user:test-session": "alice",
      "renamed:alice": "bob",
    });
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn(() => ({
          first: vi.fn().mockResolvedValue(sql.includes("licenses") ? null : null),
        })),
      })),
    };
    const res = await meReq({ QUOTA_KV: kv, DB: db });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ found: false });
    expect(kv.put).not.toHaveBeenCalledWith("session_user:test-session", "bob", expect.any(Object));
    expect(kv.delete).toHaveBeenCalledWith("session_user:test-session");
  });
  it("falls back to the original profile when a rename redirect points at a missing target", async () => {
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
                ? { ...BASE_PROFILE, username: "alice", license_hash: null }
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
      profile: { username: "alice" },
    });
    expect(kv.delete).not.toHaveBeenCalledWith("session_user:test-session");
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
    expect(kv.put).toHaveBeenCalledWith("renamed:bob", "grace", expect.any(Object));
  });
  it("restores rename-back sessions when the redirect chain cycles to the original username", async () => {
    const kv = mockKV({
      "session_user:test-session": "alice",
      "renamed:alice": "bob",
      "renamed:bob": "alice",
    });
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((username: string) => ({
          first: vi.fn().mockResolvedValue(
            sql.includes("licenses")
              ? null
              : username === "alice"
                ? { ...BASE_PROFILE, username: "alice", license_hash: null }
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
      profile: { username: "alice" },
    });
    expect(kv.delete).not.toHaveBeenCalledWith("session_user:test-session");
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
        display_rank: null,
        is_executive_supporter: false,
      },
    });
  });

  it("suppresses stale supporter vanity fields for revoked licenses in /me", async () => {
    const kv = mockKV({ "session_user:test-session": "alice" });
    const staleDate = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString();
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((value: string) => ({
          first: vi.fn().mockResolvedValue(
            sql.includes("FROM licenses")
              ? { status: "active", last_activated_at: staleDate }
              : value === "alice"
                ? {
                  ...BASE_PROFILE,
                  license_hash: "pro-hash",
                  corporate_rank: "CTO",
                  display_rank: SUPPORTER_VANITY_TITLES[0]!.title,
                  is_executive_supporter: 1,
                }
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
        corporate_rank: FREE_TIER_RANK_CAP,
        display_rank: null,
        is_executive_supporter: false,
      },
    });
  });
});

describe("license SQL guard alignment", () => {
  it("uses the same stale-license cutoff in SQL write guards", async () => {
    const { db, calls } = ownedMockDB();
    const res = await postJSON("/api/account/update-buddy", {
      username: "alice", buddyType: "Agile Snail", isShiny: false, licenseKeyHash: "hash",
    }, { DB: db });
    expect(res.status).toBe(200);
    const updateCall = calls.find((call) => call.sql.includes("UPDATE user_scores SET buddy_type"));
    expect(updateCall?.sql).toContain("datetime(last_activated_at) >= datetime('now', '-90 days')");
  });
});

describe("POST /api/account/update-display-rank", () => {
  it("rejects non-supporters with the HR error copy", async () => {
    const { db } = createMockDB({
      firstBySQL: {
        [ACCOUNT_TEST_SQL.getProfileRow]: { ...BASE_PROFILE, is_executive_supporter: 0 },
        [ACCOUNT_TEST_SQL.getLicenseStatus]: { status: "active", last_activated_at: new Date().toISOString() },
        [ACCOUNT_TEST_SQL.getProfile]: { ...BASE_PROFILE, is_executive_supporter: 0 },
      },
      runChanges: 1,
    });

    const res = await postJSON("/api/account/update-display-rank", {
      username: "alice",
      displayRank: SUPPORTER_VANITY_TITLES[1]!.title,
      licenseKeyHash: "hash",
    }, { DB: db });

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: PROMOTE_ACCESS_DENIED_MESSAGE });
  });

  it("persists supporter vanity titles separately from corporate_rank", async () => {
    const selectedTitle = SUPPORTER_VANITY_TITLES[2]!.title;
    const { db, calls } = createMockDB({
      firstBySQL: {
        [ACCOUNT_TEST_SQL.getProfileRow]: { ...BASE_PROFILE, is_executive_supporter: 1 },
        [ACCOUNT_TEST_SQL.getLicenseStatus]: { status: "active", last_activated_at: new Date().toISOString() },
        [ACCOUNT_TEST_SQL.getProfile]: { ...BASE_PROFILE, is_executive_supporter: 1, display_rank: selectedTitle },
      },
      runChanges: 1,
    });

    const res = await postJSON("/api/account/update-display-rank", {
      username: "alice",
      displayRank: selectedTitle,
      licenseKeyHash: "hash",
    }, { DB: db });

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      success: true,
      profile: {
        corporate_rank: "CTO",
        display_rank: selectedTitle,
        is_executive_supporter: true,
      },
    });
    expect(calls.some((call) => call.sql.includes("UPDATE user_scores SET display_rank = ?") && call.bindings[0] === selectedTitle)).toBe(true);
    expect(calls.some((call) => call.sql.includes("corporate_rank = ?"))).toBe(false);
  });

  it("broadcasts activation when display-rank selection claims supporter status for the first time", async () => {
    const selectedTitle = SUPPORTER_VANITY_TITLES[1]!.title;
    const supporterHash = await hashKey("COPE-SUPPORTER-DISPLAY");
    let currentSupporter = 0;
    let currentDisplayRank: string | null = null;
    let claimedSupporterHash: string | null = null;
    let pendingSupporter = 0;
    let pendingDisplayRank: string | null = null;
    let transactionOpen = false;
    const recentEvents: string[] = [];
    const calls: { sql: string; bindings: unknown[] }[] = [];
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((...bindings: unknown[]) => {
          calls.push({ sql, bindings });
          return {
            sql,
            bindings,
            first: vi.fn().mockImplementation(async () => {
              if (sql.includes("license_hash, account_id FROM user_scores WHERE username = ?")) {
                return { ...BASE_PROFILE, license_hash: supporterHash, is_executive_supporter: currentSupporter };
              }
              if (sql.includes("SELECT status, last_activated_at FROM licenses")) {
                return { status: "active", last_activated_at: new Date().toISOString() };
              }
              if (sql.includes("FROM checkout_key_claims ckc") && sql.includes("JOIN checkout_claims cc")) {
                return { checkout_id: "co_1" };
              }
              if (sql.includes("SELECT license_key_hash FROM checkout_key_claims WHERE checkout_id = ? AND is_executive_supporter = 1")) {
                return claimedSupporterHash ? { license_key_hash: claimedSupporterHash } : null;
              }
              if (sql.includes("SELECT is_executive_supporter FROM checkout_key_claims WHERE license_key_hash = ?")) {
                return { is_executive_supporter: 1 };
              }
              if (sql.includes("SELECT username, total_td, current_td, corporate_rank")) {
                return {
                  ...BASE_PROFILE,
                  license_hash: supporterHash,
                  is_executive_supporter: currentSupporter,
                  display_rank: currentDisplayRank,
                };
              }
              return null;
            }),
            run: vi.fn().mockImplementation(async () => {
              if (sql.includes("UPDATE checkout_key_claims") && sql.includes("SET is_executive_supporter = CASE WHEN license_key_hash = ? THEN 1 ELSE 0 END")) {
                claimedSupporterHash = supporterHash;
                return { meta: { changes: 1 } };
              }
              if (sql.includes("SET is_executive_supporter = 1")) {
                const changes = currentSupporter === 0 ? 1 : 0;
                if (changes > 0) {
                  pendingSupporter = 1;
                  pendingDisplayRank = bindings[0] as string | null;
                }
                return { meta: { changes } };
              }
              if (sql.includes("INSERT INTO recent_events")) {
                recentEvents.push(String(bindings[0]));
                return { meta: { changes: 1 } };
              }
              if (sql.includes("DELETE FROM recent_events")) {
                return { meta: { changes: 1 } };
              }
              if (sql.includes("UPDATE user_scores SET display_rank = ?")) {
                currentDisplayRank = bindings[0] as string | null;
                return { meta: { changes: 1 } };
              }
              return { meta: { changes: 1 } };
            }),
          };
        }),
        first: vi.fn().mockResolvedValue(null),
        run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
      })),
      exec: vi.fn().mockImplementation(async (sql: string) => {
        if (sql === "BEGIN TRANSACTION") {
          transactionOpen = true;
          pendingSupporter = currentSupporter;
          pendingDisplayRank = currentDisplayRank;
          return { results: [] };
        }
        if (sql === "COMMIT") {
          if (transactionOpen) {
            currentSupporter = pendingSupporter;
            currentDisplayRank = pendingDisplayRank;
          }
          transactionOpen = false;
          return { results: [] };
        }
        if (sql === "ROLLBACK") {
          transactionOpen = false;
          pendingSupporter = currentSupporter;
          pendingDisplayRank = currentDisplayRank;
          return { results: [] };
        }
        return { results: [] };
      }),
    };

    const res = await postWithSession("/api/account/update-display-rank", {
      username: "alice",
      displayRank: selectedTitle,
      licenseKeyHash: supporterHash,
    }, { DB: db }, "owner-session");

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      success: true,
      profile: {
        is_executive_supporter: true,
        display_rank: selectedTitle,
      },
    });
    expect(recentEvents).toEqual([
      "[LIVE] 👑 alice just expensed the Executive Supporter Pack. Respect the grift.",
    ]);
    expect(calls.some((call) => call.sql.includes("SET is_executive_supporter = 1") && call.bindings[0] === selectedTitle)).toBe(true);
  });

  it("falls back to a plain display-rank update when supporter activation wins concurrently", async () => {
    const selectedTitle = SUPPORTER_VANITY_TITLES[1]!.title;
    const supporterHash = await hashKey("COPE-SUPPORTER-RACE");
    let currentSupporter = 0;
    let currentDisplayRank: string | null = null;
    let claimedSupporterHash: string | null = null;
    const recentEvents: string[] = [];
    const calls: { sql: string; bindings: unknown[] }[] = [];
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((...bindings: unknown[]) => {
          calls.push({ sql, bindings });
          return {
            sql,
            bindings,
            first: vi.fn().mockImplementation(async () => {
              if (sql.includes("license_hash, account_id FROM user_scores WHERE username = ?")) {
                return { ...BASE_PROFILE, license_hash: supporterHash, is_executive_supporter: currentSupporter };
              }
              if (sql.includes("SELECT status, last_activated_at FROM licenses")) {
                return { status: "active", last_activated_at: new Date().toISOString() };
              }
              if (sql.includes("FROM checkout_key_claims ckc") && sql.includes("JOIN checkout_claims cc")) {
                return { checkout_id: "co_1" };
              }
              if (sql.includes("SELECT license_key_hash FROM checkout_key_claims WHERE checkout_id = ? AND is_executive_supporter = 1")) {
                return claimedSupporterHash ? { license_key_hash: claimedSupporterHash } : null;
              }
              if (sql.includes("SELECT is_executive_supporter FROM checkout_key_claims WHERE license_key_hash = ?")) {
                return { is_executive_supporter: 1 };
              }
              if (sql.includes("SELECT username, total_td, current_td, corporate_rank")) {
                return {
                  ...BASE_PROFILE,
                  license_hash: supporterHash,
                  is_executive_supporter: currentSupporter,
                  display_rank: currentDisplayRank,
                };
              }
              return null;
            }),
            run: vi.fn().mockImplementation(async () => {
              if (sql.includes("UPDATE checkout_key_claims") && sql.includes("SET is_executive_supporter = CASE WHEN license_key_hash = ? THEN 1 ELSE 0 END")) {
                claimedSupporterHash = supporterHash;
                return { meta: { changes: 1 } };
              }
              if (sql.includes("SET is_executive_supporter = 1")) {
                currentSupporter = 1;
                return { meta: { changes: 0 } };
              }
              if (sql.includes("INSERT INTO recent_events")) {
                recentEvents.push(String(bindings[0]));
                return { meta: { changes: 1 } };
              }
              if (sql.includes("DELETE FROM recent_events")) {
                return { meta: { changes: 1 } };
              }
              if (sql.includes("UPDATE user_scores SET display_rank = ?")) {
                currentDisplayRank = bindings[0] as string | null;
                return { meta: { changes: 1 } };
              }
              return { meta: { changes: 1 } };
            }),
          };
        }),
        first: vi.fn().mockResolvedValue(null),
        run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
      })),
      exec: vi.fn().mockImplementation(async (sql: string) => {
        if (sql === "BEGIN TRANSACTION") {
          return { results: [] };
        }
        if (sql === "ROLLBACK") {
          return { results: [] };
        }
        if (sql === "COMMIT") {
          return { results: [] };
        }
        return { results: [] };
      }),
    };

    const res = await postWithSession("/api/account/update-display-rank", {
      username: "alice",
      displayRank: selectedTitle,
      licenseKeyHash: supporterHash,
    }, { DB: db }, "owner-session");

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      success: true,
      profile: {
        is_executive_supporter: true,
        display_rank: selectedTitle,
      },
    });
    expect(recentEvents).toEqual([]);
    expect(calls.some((call) => call.sql.includes("UPDATE user_scores SET display_rank = ?") && call.bindings[0] === selectedTitle)).toBe(true);
  });

  it("does not let a different session claim the supporter vanity entitlement first", async () => {
    const selectedTitle = SUPPORTER_VANITY_TITLES[2]!.title;
    const supporterHash = await hashKey("COPE-T1");
    const { db } = createMockDB({
      firstBySQL: {
        [ACCOUNT_TEST_SQL.getProfileRow]: { ...BASE_PROFILE, license_hash: supporterHash, is_executive_supporter: 0 },
        [ACCOUNT_TEST_SQL.getLicenseStatus]: { status: "active", last_activated_at: new Date().toISOString() },
        [ACCOUNT_TEST_SQL.getProfile]: { ...BASE_PROFILE, license_hash: supporterHash, is_executive_supporter: 0 },
      },
      runChanges: 1,
    });
    const origFetch = globalThis.fetch;
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const u = typeof input === "string" ? input : input.toString();
      if (u.includes("/v1/checkouts/?")) {
        return new Response(JSON.stringify({ items: [] }));
      }
      if (u.includes("/v1/checkouts/")) {
        return new Response(JSON.stringify({
          organization_id: "org",
          status: "succeeded",
          customer_id: "c1",
          created_at: "2026-01-02T00:00:00Z",
          metadata: { reference_id: "owner-session", product_slug: "executive-supporter" },
        }));
      }
      if (u.includes("/v1/license-keys/")) {
        return new Response(JSON.stringify({ items: [{ key: "COPE-T1", created_at: "2026-01-02T00:00:01Z", status: "granted" }] }));
      }
      return origFetch(input as RequestInfo, undefined);
    }) as typeof fetch;

    try {
      await postWithSession("/api/account/checkout-license", { checkoutId: "co_supporter" }, {
        DB: db,
        CHECKOUT_CLAIM_SECRET: CLAIM_SECRET,
        POLAR_ACCESS_TOKEN: "tok",
        POLAR_ORGANIZATION_ID: "org",
      }, "owner-session");

      const res = await postWithSession("/api/account/update-display-rank", {
        username: "alice",
        displayRank: selectedTitle,
        licenseKeyHash: supporterHash,
      }, { DB: db }, "teammate-session");

      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ error: PROMOTE_ACCESS_DENIED_MESSAGE });
    } finally {
      globalThis.fetch = origFetch;
    }
  });

  it("trims displayRank before validating and persisting it", async () => {
    const selectedTitle = SUPPORTER_VANITY_TITLES[1]!.title;
    const { db, calls } = createMockDB({
      firstBySQL: {
        [ACCOUNT_TEST_SQL.getProfileRow]: { ...BASE_PROFILE, is_executive_supporter: 1 },
        [ACCOUNT_TEST_SQL.getLicenseStatus]: { status: "active", last_activated_at: new Date().toISOString() },
        [ACCOUNT_TEST_SQL.getProfile]: { ...BASE_PROFILE, is_executive_supporter: 1, display_rank: selectedTitle },
      },
      runChanges: 1,
    });

    const res = await postJSON("/api/account/update-display-rank", {
      username: "alice",
      displayRank: ` ${selectedTitle} `,
      licenseKeyHash: "hash",
    }, { DB: db });

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      success: true,
      profile: { display_rank: selectedTitle },
    });
    expect(calls.some((call) => call.sql.includes("UPDATE user_scores SET display_rank = ?") && call.bindings[0] === selectedTitle)).toBe(true);
  });

  it("allows clearing a vanity title back to the organic rank", async () => {
    const { db, calls } = createMockDB({
      firstBySQL: {
        [ACCOUNT_TEST_SQL.getProfileRow]: { ...BASE_PROFILE, is_executive_supporter: 1, display_rank: SUPPORTER_VANITY_TITLES[0]!.title },
        [ACCOUNT_TEST_SQL.getLicenseStatus]: { status: "active", last_activated_at: new Date().toISOString() },
        [ACCOUNT_TEST_SQL.getProfile]: { ...BASE_PROFILE, is_executive_supporter: 1, display_rank: null },
      },
      runChanges: 1,
    });

    const res = await postJSON("/api/account/update-display-rank", {
      username: "alice",
      displayRank: null,
      licenseKeyHash: "hash",
    }, { DB: db });

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      success: true,
      profile: {
        corporate_rank: "CTO",
        display_rank: null,
      },
    });
    expect(calls.some((call) => call.sql.includes("UPDATE user_scores SET display_rank = ?") && call.bindings[0] === null)).toBe(true);
  });
});

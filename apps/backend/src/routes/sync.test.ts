/* eslint-disable max-lines */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock validatePolarKey before importing app
vi.mock("../utils/polar", () => ({
  validatePolarKey: vi.fn(),
  syncPolarUsage: vi.fn(),
}));

import app from "../app";
import { validatePolarKey } from "../utils/polar";
import { hashKey } from "../utils/quota";
import { BASE_PROFILE, createMockDB, mockKV, postJSON, postWithSession } from "./account.test-utils";

const mockedValidatePolarKey = vi.mocked(validatePolarKey);

function postSync(body: unknown, env: Record<string, unknown>) {
  return app.request("/api/account/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: "cope_session_id=test-session" },
    body: JSON.stringify(body),
  }, { ALLOWED_ORIGINS: "http://localhost:5173", ...env });
}

function postCheckoutLicense(body: unknown, env: Record<string, unknown>) {
  return app.request("/api/account/checkout-license", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: "cope_session_id=test-session" },
    body: JSON.stringify(body),
  }, { ALLOWED_ORIGINS: "http://localhost:5173", ...env });
}

const PROFILE_ROW = {
  ...BASE_PROFILE,
  license_hash: "testhash",
  total_td: 100,
  current_td: 100,
  corporate_rank: "Junior Code Monkey",
  country: "",
  credits_used: 0,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/account/sync", () => {
  it("returns 400 when licenseKey is missing", async () => {
    const res = await postSync({}, {});
    expect(res.status).toBe(400);
  });

  it("returns 500 when Polar is not configured", async () => {
    const res = await postSync({ licenseKey: "COPE-TEST" }, {});
    expect(res.status).toBe(500);
  });

  it("returns 403 when Polar validates the key as invalid", async () => {
    mockedValidatePolarKey.mockResolvedValue({ valid: false, status: "revoked" });
    const kv = mockKV();
    const { db } = createMockDB();
    const res = await postSync({ licenseKey: "COPE-INVALID" }, {
      DB: db, QUOTA_KV: kv,
      POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org",
    });
    expect(res.status).toBe(403);
  });

  it("returns 409 when username is already taken by a different license", async () => {
    mockedValidatePolarKey.mockResolvedValue({ valid: true, status: "activated", id: "polar-id" });
    // getProfileByLicenseHash (WHERE license_hash = ?) returns null
    // username lookup (WHERE username = ?) finds it owned by another license
    const { db } = createMockDB();
    // Override prepare to track SQL-aware routing
    db.prepare = vi.fn((sql: string) => {
      const isProfileByHash = sql.includes("WHERE license_hash = ?");
      const isUsernameCheck = sql.includes("WHERE LOWER(username) = LOWER(?)");
      return {
        bind: vi.fn(() => {
          return {
            first: vi.fn().mockResolvedValue(
              isProfileByHash ? null :
              isUsernameCheck ? { license_hash: "other-hash" } :
              null
            ),
            run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
            all: vi.fn().mockResolvedValue({ results: [] }),
          };
        }),
        first: vi.fn().mockResolvedValue(null),
        run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
        all: vi.fn().mockResolvedValue({ results: [] }),
      };
    }) as unknown as typeof db.prepare;
    const kv = mockKV();
    const res = await postSync({ licenseKey: "COPE-TEST", username: "alice" }, {
      DB: db, QUOTA_KV: kv,
      POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org",
    });
    expect(res.status).toBe(409);
  });

  it("does NOT activate license when profile resolution fails", async () => {
    mockedValidatePolarKey.mockResolvedValue({ valid: true, status: "activated", id: "polar-id" });
    const calls: { sql: string; bindings: unknown[] }[] = [];
    const db = {
      prepare: vi.fn((sql: string) => {
        const isProfileByHash = sql.includes("WHERE license_hash = ?");
        const isUsernameCheck = sql.includes("WHERE LOWER(username) = LOWER(?)");
        return {
          bind: vi.fn((...args: unknown[]) => {
            calls.push({ sql, bindings: args });
            return {
              first: vi.fn().mockResolvedValue(
                isProfileByHash ? null :
                isUsernameCheck ? { license_hash: "other-hash" } :
                null
              ),
              run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
              all: vi.fn().mockResolvedValue({ results: [] }),
            };
          }),
          first: vi.fn().mockResolvedValue(null),
          run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
          all: vi.fn().mockResolvedValue({ results: [] }),
        };
      }),
      exec: vi.fn().mockResolvedValue({ results: [] }),
      batch: vi.fn().mockResolvedValue([]),
    };
    const kv = mockKV();
    const res = await postSync({ licenseKey: "COPE-TEST", username: "alice" }, {
      DB: db, QUOTA_KV: kv,
      POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org",
    });
    expect(res.status).toBe(409);
    // The licenses INSERT should NOT have been called (no orphaned side effects)
    const licenseInserts = calls.filter(c => c.sql.includes("INSERT INTO licenses"));
    expect(licenseInserts).toHaveLength(0);
    // KV quota should NOT have been provisioned
    const polarPuts = (kv.put as ReturnType<typeof vi.fn>).mock.calls.filter(
      (c: unknown[]) => typeof c[0] === "string" && (c[0] as string).startsWith("polar:"),
    );
    expect(polarPuts).toHaveLength(0);
  });

  it("succeeds and provisions license when profile resolves", async () => {
    mockedValidatePolarKey.mockResolvedValue({ valid: true, status: "activated", id: "polar-id" });
    // getProfileByLicenseHash returns existing profile (restore case)
    const { db, calls } = createMockDB({
      firstBySQL: {
        "license_hash =": PROFILE_ROW,
      },
    });
    const kv = mockKV();
    const res = await postSync({ licenseKey: "COPE-TEST" }, {
      DB: db, QUOTA_KV: kv,
      POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org",
    });
    expect(res.status).toBe(200);
    const data = await res.json() as { success: boolean; restored: boolean };
    expect(data.success).toBe(true);
    expect(data.restored).toBe(true);
    // License should have been activated AFTER successful profile resolution
    const licenseInserts = calls.filter(c => c.sql.includes("INSERT INTO licenses"));
    expect(licenseInserts.length).toBeGreaterThan(0);
  });

  it("broadcasts executive supporter activation on first sync and does not duplicate it on later syncs", async () => {
    mockedValidatePolarKey.mockResolvedValue({ valid: true, status: "activated", id: "polar-id" });
    const supporterHash = await hashKey("COPE-SUPPORTER");
    let currentSupporter = 0;
    let pendingSupporter = 0;
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
              if (sql.includes("SELECT is_executive_supporter FROM checkout_key_claims")) {
                return { is_executive_supporter: 1 };
              }
              if (sql.includes("SELECT username, is_executive_supporter FROM user_scores WHERE license_hash = ?")) {
                return { username: "alice", is_executive_supporter: currentSupporter };
              }
              if (sql.includes("WHERE license_hash = ?")) {
                return { ...PROFILE_ROW, license_hash: supporterHash, is_executive_supporter: currentSupporter };
              }
              return null;
            }),
            run: vi.fn().mockImplementation(async () => {
              if (sql.includes("UPDATE user_scores")) {
                const changes = currentSupporter === 0 ? 1 : 0;
                if (changes > 0) {
                  pendingSupporter = 1;
                }
                return { meta: { changes } };
              }
              if (sql.includes("INSERT INTO recent_events")) {
                recentEvents.push(String(bindings[0]));
                return { meta: { changes: 1 } };
              }
              return { meta: { changes: 1 } };
            }),
            all: vi.fn().mockResolvedValue({ results: [] }),
          };
        }),
        run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
        first: vi.fn().mockResolvedValue(null),
        all: vi.fn().mockResolvedValue({ results: [] }),
      })),
      exec: vi.fn().mockImplementation(async (sql: string) => {
        if (sql === "BEGIN TRANSACTION") {
          transactionOpen = true;
          pendingSupporter = currentSupporter;
          return { results: [] };
        }
        if (sql === "COMMIT") {
          if (transactionOpen) {
            currentSupporter = pendingSupporter;
          }
          transactionOpen = false;
          return { results: [] };
        }
        if (sql === "ROLLBACK") {
          transactionOpen = false;
          pendingSupporter = currentSupporter;
          return { results: [] };
        }
        return { results: [] };
      }),
    };
    const kv = mockKV();

    const firstRes = await postSync({ licenseKey: "COPE-SUPPORTER" }, {
      DB: db, QUOTA_KV: kv,
      POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org",
    });
    expect(firstRes.status).toBe(200);
    expect(await firstRes.json()).toMatchObject({
      success: true,
      profile: { is_executive_supporter: true },
    });

    const secondRes = await postSync({ licenseKey: "COPE-SUPPORTER" }, {
      DB: db, QUOTA_KV: kv,
      POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org",
    });
    expect(secondRes.status).toBe(200);
    expect(await secondRes.json()).toMatchObject({
      success: true,
      profile: { is_executive_supporter: true },
    });

    expect(recentEvents).toEqual([
      "[LIVE] 👑 alice just expensed the Executive Supporter Pack. Respect the grift.",
    ]);
  });

  it("retries executive supporter activation after a transient recent-events insert failure", async () => {
    mockedValidatePolarKey.mockResolvedValue({ valid: true, status: "activated", id: "polar-id" });
    const supporterHash = await hashKey("COPE-SUPPORTER");
    let currentSupporter = 0;
    let pendingSupporter = 0;
    let failNextRecentEventInsert = true;
    let transactionOpen = false;
    const recentEvents: string[] = [];
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((...bindings: unknown[]) => ({
          sql,
          bindings,
          first: vi.fn().mockImplementation(async () => {
            if (sql.includes("SELECT is_executive_supporter FROM checkout_key_claims")) {
              return { is_executive_supporter: 1 };
            }
            if (sql.includes("SELECT username, is_executive_supporter FROM user_scores WHERE license_hash = ?")) {
              return { username: "alice", is_executive_supporter: currentSupporter };
            }
            if (sql.includes("WHERE license_hash = ?")) {
              return { ...PROFILE_ROW, license_hash: supporterHash, is_executive_supporter: currentSupporter };
            }
            return null;
          }),
          run: vi.fn().mockImplementation(async () => {
            if (sql.includes("UPDATE user_scores")) {
              const changes = currentSupporter === 0 ? 1 : 0;
              if (changes > 0) {
                pendingSupporter = 1;
              }
              return { meta: { changes } };
            }
            if (sql.includes("INSERT INTO recent_events")) {
              if (failNextRecentEventInsert) {
                failNextRecentEventInsert = false;
                throw new Error("recent event insert failed");
              }
              recentEvents.push(String(bindings[0]));
              return { meta: { changes: 1 } };
            }
            return { meta: { changes: 1 } };
          }),
          all: vi.fn().mockResolvedValue({ results: [] }),
        })),
        run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
        first: vi.fn().mockResolvedValue(null),
        all: vi.fn().mockResolvedValue({ results: [] }),
      })),
      exec: vi.fn().mockImplementation(async (sql: string) => {
        if (sql === "BEGIN TRANSACTION") {
          transactionOpen = true;
          pendingSupporter = currentSupporter;
          return { results: [] };
        }
        if (sql === "COMMIT") {
          if (transactionOpen) {
            currentSupporter = pendingSupporter;
          }
          transactionOpen = false;
          return { results: [] };
        }
        if (sql === "ROLLBACK") {
          transactionOpen = false;
          pendingSupporter = currentSupporter;
          return { results: [] };
        }
        return { results: [] };
      }),
    };
    const kv = mockKV();

    const firstRes = await postSync({ licenseKey: "COPE-SUPPORTER" }, {
      DB: db, QUOTA_KV: kv,
      POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org",
    });
    expect(firstRes.status).toBe(500);
    expect(currentSupporter).toBe(0);

    const secondRes = await postSync({ licenseKey: "COPE-SUPPORTER" }, {
      DB: db, QUOTA_KV: kv,
      POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org",
    });
    expect(secondRes.status).toBe(200);
    expect(await secondRes.json()).toMatchObject({
      success: true,
      profile: { is_executive_supporter: true },
    });
    expect(currentSupporter).toBe(1);
    expect(recentEvents).toEqual([
      "[LIVE] 👑 alice just expensed the Executive Supporter Pack. Respect the grift.",
    ]);
  });

  it("rolls back license activation when KV provisioning fails", async () => {
    mockedValidatePolarKey.mockResolvedValue({ valid: true, status: "activated", id: "polar-id" });
    const calls: { sql: string; bindings: unknown[] }[] = [];
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((...args: unknown[]) => {
          calls.push({ sql, bindings: args });
          return {
            first: vi.fn().mockResolvedValue(
              sql.includes("SELECT status, last_activated_at FROM licenses") ? null :
              sql.includes("WHERE license_hash = ?") ? PROFILE_ROW :
              null,
            ),
            run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
            all: vi.fn().mockResolvedValue({ results: [] }),
          };
        }),
        first: vi.fn().mockResolvedValue(null),
        run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
        all: vi.fn().mockResolvedValue({ results: [] }),
      })),
      exec: vi.fn().mockResolvedValue({ results: [] }),
      batch: vi.fn().mockResolvedValue([]),
    };
    const kv = {
      get: vi.fn(() => Promise.resolve(null)),
      put: vi.fn((key: string) => (
        key.startsWith("polar:")
          ? Promise.reject(new Error("kv unavailable"))
          : Promise.resolve()
      )),
      delete: vi.fn(() => Promise.resolve()),
    };

    const res = await postSync({ licenseKey: "COPE-TEST" }, {
      DB: db, QUOTA_KV: kv,
      POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org",
    });

    expect(res.status).toBe(500);
    expect(calls.some((c) => c.sql.includes("DELETE FROM licenses"))).toBe(true);
    expect((kv.delete as ReturnType<typeof vi.fn>).mock.calls.map((call) => call[0])).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^polar:/),
        expect.stringMatching(/^polar_revoked:/),
        expect.stringMatching(/^polar_id:/),
      ]),
    );
    expect(calls.some((c) => c.sql.includes("INSERT INTO recent_events"))).toBe(false);
  });

  it("does not apply supporter activation when sync provisioning fails first", async () => {
    mockedValidatePolarKey.mockResolvedValue({ valid: true, status: "activated", id: "polar-id" });
    const supporterHash = await hashKey("COPE-SUPPORTER");
    const calls: { sql: string; bindings: unknown[] }[] = [];
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((...args: unknown[]) => {
          calls.push({ sql, bindings: args });
          return {
            sql,
            bindings: args,
            first: vi.fn().mockResolvedValue(
              sql.includes("SELECT status, last_activated_at FROM licenses") ? null :
              sql.includes("WHERE license_hash = ?") ? { ...PROFILE_ROW, license_hash: supporterHash, is_executive_supporter: 0 } :
              sql.includes("SELECT is_executive_supporter FROM checkout_key_claims") ? { is_executive_supporter: 1 } :
              sql.includes("SELECT username, is_executive_supporter FROM user_scores WHERE license_hash = ?") ? { username: "alice", is_executive_supporter: 0 } :
              null,
            ),
            run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
            all: vi.fn().mockResolvedValue({ results: [] }),
          };
        }),
        first: vi.fn().mockResolvedValue(null),
        run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
        all: vi.fn().mockResolvedValue({ results: [] }),
      })),
      exec: vi.fn().mockResolvedValue({ results: [] }),
      batch: vi.fn().mockResolvedValue([]),
    };
    const kv = {
      get: vi.fn(() => Promise.resolve(null)),
      put: vi.fn((key: string) => (
        key.startsWith("polar:")
          ? Promise.reject(new Error("kv unavailable"))
          : Promise.resolve()
      )),
      delete: vi.fn(() => Promise.resolve()),
    };

    const res = await postSync({ licenseKey: "COPE-SUPPORTER" }, {
      DB: db, QUOTA_KV: kv,
      POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org",
    });

    expect(res.status).toBe(500);
    expect(calls.some((call) => call.sql.includes("UPDATE user_scores") && call.sql.includes("SET is_executive_supporter = 1"))).toBe(false);
    expect(calls.some((call) => call.sql.includes("INSERT INTO recent_events"))).toBe(false);
  });

  it("rolls back a newly created profile when provisioning fails after insert", async () => {
    mockedValidatePolarKey.mockResolvedValue({ valid: true, status: "activated", id: "polar-id" });
    const calls: { sql: string; bindings: unknown[] }[] = [];
    const db = {
      prepare: vi.fn((sql: string) => {
        const isProfileByHash = sql.includes("WHERE license_hash = ?");
        const isUsernameCheck = sql.includes("WHERE LOWER(username) = LOWER(?)");
        const isGetProfile = sql.includes("FROM user_scores WHERE username = ?");
        return {
          bind: vi.fn((...args: unknown[]) => {
            calls.push({ sql, bindings: args });
            return {
              first: vi.fn().mockResolvedValue(
                isProfileByHash ? null :
                isUsernameCheck ? null :
                isGetProfile ? { ...PROFILE_ROW, username: String(args[0]), license_hash: "testhash" } :
                sql.includes("SELECT status, last_activated_at FROM licenses") ? null :
                null,
              ),
              run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
              all: vi.fn().mockResolvedValue({ results: [] }),
            };
          }),
          first: vi.fn().mockResolvedValue(null),
          run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
          all: vi.fn().mockResolvedValue({ results: [] }),
        };
      }),
      exec: vi.fn().mockResolvedValue({ results: [] }),
      batch: vi.fn().mockResolvedValue([]),
    };
    const kv = {
      get: vi.fn(() => Promise.resolve(null)),
      put: vi.fn((key: string) => (
        key.startsWith("polar:")
          ? Promise.reject(new Error("kv unavailable"))
          : Promise.resolve()
      )),
      delete: vi.fn(() => Promise.resolve()),
    };

    const res = await postSync({ licenseKey: "COPE-TEST", username: "alice" }, {
      DB: db, QUOTA_KV: kv,
      POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org",
    });

    expect(res.status).toBe(500);
    expect(calls.some((c) => c.sql.includes("DELETE FROM user_scores WHERE username = ? AND license_hash = ?"))).toBe(true);
  });

  it("detaches a just-attached license when provisioning fails after upgrading a free account", async () => {
    mockedValidatePolarKey.mockResolvedValue({ valid: true, status: "activated", id: "polar-id" });
    const calls: { sql: string; bindings: unknown[] }[] = [];
    const kv = {
      get: vi.fn((key: string) => Promise.resolve(key === "session_user:test-session" ? "alice" : null)),
      put: vi.fn((key: string) => (
        key.startsWith("polar:")
          ? Promise.reject(new Error("kv unavailable"))
          : Promise.resolve()
      )),
      delete: vi.fn(() => Promise.resolve()),
    };
    const db = {
      prepare: vi.fn((sql: string) => {
        const isProfileByHash = sql.includes("WHERE license_hash = ?");
        const isUsernameCheck = sql.includes("WHERE LOWER(username) = LOWER(?)");
        const isGetProfile = sql.includes("FROM user_scores WHERE username = ?");
        return {
          bind: vi.fn((...args: unknown[]) => {
            calls.push({ sql, bindings: args });
            return {
              first: vi.fn().mockResolvedValue(
                isProfileByHash ? null :
                isUsernameCheck ? { username: "alice", license_hash: null } :
                isGetProfile ? { ...PROFILE_ROW, username: "alice", license_hash: "testhash" } :
                sql.includes("SELECT status, last_activated_at FROM licenses") ? null :
                null,
              ),
              run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
              all: vi.fn().mockResolvedValue({ results: [] }),
            };
          }),
          first: vi.fn().mockResolvedValue(null),
          run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
          all: vi.fn().mockResolvedValue({ results: [] }),
        };
      }),
      exec: vi.fn().mockResolvedValue({ results: [] }),
      batch: vi.fn().mockResolvedValue([]),
    };

    const res = await postSync({ licenseKey: "COPE-TEST", username: "alice" }, {
      DB: db, QUOTA_KV: kv,
      POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org",
    });

    expect(res.status).toBe(500);
    const rollbackCall = calls.find((c) => c.sql.includes("UPDATE user_scores SET username = ?, license_hash = NULL"));
    expect(rollbackCall).toBeDefined();
    expect(rollbackCall?.bindings).toEqual(["alice", "alice", expect.any(String)]);
  });

  it("restores the original username casing when free-account upgrade rollback follows a case-only rename", async () => {
    mockedValidatePolarKey.mockResolvedValue({ valid: true, status: "activated", id: "polar-id" });
    const calls: { sql: string; bindings: unknown[] }[] = [];
    const kv = {
      get: vi.fn((key: string) => Promise.resolve(key === "session_user:test-session" ? "alice" : null)),
      put: vi.fn((key: string) => (
        key.startsWith("polar:")
          ? Promise.reject(new Error("kv unavailable"))
          : Promise.resolve()
      )),
      delete: vi.fn(() => Promise.resolve()),
    };
    const db = {
      prepare: vi.fn((sql: string) => {
        const isProfileByHash = sql.includes("WHERE license_hash = ?");
        const isUsernameCheck = sql.includes("WHERE LOWER(username) = LOWER(?)");
        const isGetProfile = sql.includes("FROM user_scores WHERE username = ?");
        return {
          bind: vi.fn((...args: unknown[]) => {
            calls.push({ sql, bindings: args });
            return {
              first: vi.fn().mockResolvedValue(
                isProfileByHash ? null :
                isUsernameCheck ? { username: "alice", license_hash: null } :
                isGetProfile ? { ...PROFILE_ROW, username: "ALICE", license_hash: "testhash" } :
                sql.includes("SELECT status, last_activated_at FROM licenses") ? null :
                null,
              ),
              run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
              all: vi.fn().mockResolvedValue({ results: [] }),
            };
          }),
          first: vi.fn().mockResolvedValue(null),
          run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
          all: vi.fn().mockResolvedValue({ results: [] }),
        };
      }),
      exec: vi.fn().mockResolvedValue({ results: [] }),
      batch: vi.fn().mockResolvedValue([]),
    };

    const res = await postSync({ licenseKey: "COPE-TEST", username: "ALICE" }, {
      DB: db, QUOTA_KV: kv,
      POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org",
    });

    expect(res.status).toBe(500);
    const rollbackCall = calls.find((c) => c.sql.includes("UPDATE user_scores SET username = ?, license_hash = NULL"));
    expect(rollbackCall?.bindings).toEqual(["alice", "ALICE", expect.any(String)]);
  });

  it("restores a previous NULL last_activated_at when license provisioning rollback runs", async () => {
    mockedValidatePolarKey.mockResolvedValue({ valid: true, status: "activated", id: "polar-id" });
    const calls: { sql: string; bindings: unknown[] }[] = [];
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((...args: unknown[]) => {
          calls.push({ sql, bindings: args });
          return {
            first: vi.fn().mockResolvedValue(
              sql.includes("SELECT status, last_activated_at FROM licenses")
                ? { status: "revoked", last_activated_at: null }
                : sql.includes("WHERE license_hash = ?")
                  ? PROFILE_ROW
                  : null,
            ),
            run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
            all: vi.fn().mockResolvedValue({ results: [] }),
          };
        }),
        first: vi.fn().mockResolvedValue(null),
        run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
        all: vi.fn().mockResolvedValue({ results: [] }),
      })),
      exec: vi.fn().mockResolvedValue({ results: [] }),
      batch: vi.fn().mockResolvedValue([]),
    };
    const kv = {
      get: vi.fn(() => Promise.resolve(null)),
      put: vi.fn((key: string) => (
        key.startsWith("polar:")
          ? Promise.reject(new Error("kv unavailable"))
          : Promise.resolve()
      )),
      delete: vi.fn(() => Promise.resolve()),
    };

    const res = await postSync({ licenseKey: "COPE-TEST" }, {
      DB: db, QUOTA_KV: kv,
      POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org",
    });

    expect(res.status).toBe(500);
    const rollbackCall = calls.find((c) => c.sql.includes("UPDATE licenses SET status = ?, last_activated_at = ?"));
    expect(rollbackCall?.bindings).toEqual(["revoked", null, expect.any(String)]);
  });

  it("upgrades an existing free account even when the requested username only changes casing", async () => {
    mockedValidatePolarKey.mockResolvedValue({ valid: true, status: "activated", id: "polar-id" });
    const calls: { sql: string; bindings: unknown[] }[] = [];
    const kv = {
      get: vi.fn((key: string) => Promise.resolve(key === "session_user:test-session" ? "alice" : null)),
      put: vi.fn(() => Promise.resolve()),
      delete: vi.fn(() => Promise.resolve()),
    };
    const db = {
      prepare: vi.fn((sql: string) => {
        const isProfileByHash = sql.includes("WHERE license_hash = ?");
        const isUsernameCheck = sql.includes("WHERE LOWER(username) = LOWER(?)");
        const isGetProfile = sql.includes("td_multiplier FROM user_scores WHERE username = ?");
        return {
          bind: vi.fn((...args: unknown[]) => {
            calls.push({ sql, bindings: args });
            return {
              first: vi.fn().mockResolvedValue(
                isProfileByHash ? null :
                isUsernameCheck ? { username: "alice", license_hash: null } :
                isGetProfile ? { ...PROFILE_ROW, username: "ALICE", license_hash: "testhash" } :
                sql.includes("SELECT status, last_activated_at FROM licenses") ? null :
                null
              ),
              run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
              all: vi.fn().mockResolvedValue({ results: [] }),
            };
          }),
          first: vi.fn().mockResolvedValue(null),
          run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
          all: vi.fn().mockResolvedValue({ results: [] }),
        };
      }),
      exec: vi.fn().mockResolvedValue({ results: [] }),
      batch: vi.fn().mockResolvedValue([]),
    };

    const res = await postSync({ licenseKey: "COPE-TEST", username: "ALICE" }, {
      DB: db, QUOTA_KV: kv,
      POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org",
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      success: true,
      profile: { username: "ALICE" },
    });
    expect(calls.some((c) => c.sql.includes("UPDATE user_scores SET username = ?, license_hash = ?"))).toBe(true);
  });

  it("still succeeds when session binding fails after provisioning", async () => {
    mockedValidatePolarKey.mockResolvedValue({ valid: true, status: "activated", id: "polar-id" });
    const { db } = createMockDB({
      firstBySQL: {
        "license_hash =": PROFILE_ROW,
        "SELECT status, last_activated_at FROM licenses": null,
      },
    });
    const kv = {
      get: vi.fn(() => Promise.resolve(null)),
      put: vi.fn((key: string) => (
        key === "session_user:test-session"
          ? Promise.reject(new Error("session kv unavailable"))
          : Promise.resolve()
      )),
      delete: vi.fn(() => Promise.resolve()),
    };

    const res = await postSync({ licenseKey: "COPE-TEST" }, {
      DB: db, QUOTA_KV: kv,
      POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org",
    });

    expect(res.status).toBe(200);
    expect((await res.json() as { success: boolean }).success).toBe(true);
  });

  it("hydrates executive supporter entitlement into the sync response profile", async () => {
    mockedValidatePolarKey.mockResolvedValue({ valid: true, status: "activated", id: "polar-id" });
    const { db } = createMockDB({
      firstBySQL: {
        "license_hash =": PROFILE_ROW,
        "SELECT is_executive_supporter FROM checkout_key_claims": { is_executive_supporter: 1 },
      },
    });
    const kv = mockKV();

    const res = await postSync({ licenseKey: "COPE-TEST" }, {
      DB: db, QUOTA_KV: kv,
      POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org",
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      success: true,
      profile: { is_executive_supporter: true },
    });
  });

  it("activates executive supporter when the checkout owner syncs the first team key", async () => {
    mockedValidatePolarKey.mockResolvedValue({ valid: true, status: "activated", id: "polar-id" });
    const origFetch = globalThis.fetch;
    const supporterHash = await hashKey("COPE-SUPPORTER");
    const { db } = createMockDB({
      firstBySQL: {
        "license_hash =": { ...PROFILE_ROW, license_hash: supporterHash },
        "license_hash, account_id FROM user_scores WHERE username = ?": { ...PROFILE_ROW, license_hash: supporterHash, is_executive_supporter: 0 },
        "SELECT status, last_activated_at FROM licenses": { status: "active", last_activated_at: new Date().toISOString() },
        "SELECT username, total_td, current_td, corporate_rank, display_rank, inventory, upgrades, achievements, is_executive_supporter, buddy_type, buddy_is_shiny, unlocked_themes, active_theme, active_ticket, td_multiplier FROM user_scores WHERE username = ?": {
          ...PROFILE_ROW,
          is_executive_supporter: 1,
          display_rank: "Mid-Level Googler",
        },
      },
      runChanges: 1,
    });
    const kv = mockKV();

    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.includes("/v1/checkouts/?")) {
        return new Response(JSON.stringify({ items: [] }));
      }
      if (url.includes("/v1/checkouts/")) {
        return new Response(JSON.stringify({
          organization_id: "org",
          status: "succeeded",
          customer_id: "cust-1",
          created_at: "2026-01-02T00:00:00Z",
          metadata: { reference_id: "test-session", tier: "Executive Supporter - 2 Licenses" },
        }));
      }
      if (url.includes("/v1/license-keys/")) {
        return new Response(JSON.stringify({
          items: [
            { key: "COPE-SUPPORTER", created_at: "2026-01-02T00:00:01Z", status: "granted" },
            { key: "COPE-TEAMMATE", created_at: "2026-01-02T00:00:02Z", status: "granted" },
          ],
        }));
      }
      throw new Error(`Unexpected fetch: ${url}`);
    }) as typeof fetch;

    try {
      const checkoutRes = await postCheckoutLicense({ checkoutId: "co_supporter" }, {
        DB: db,
        QUOTA_KV: kv,
        CHECKOUT_CLAIM_SECRET: "secret",
        POLAR_ACCESS_TOKEN: "tok",
        POLAR_ORGANIZATION_ID: "org",
      });
      expect(checkoutRes.status).toBe(200);
      expect(await checkoutRes.json()).toMatchObject({
        licenseKey: "COPE-SUPPORTER",
        allKeys: ["COPE-SUPPORTER", "COPE-TEAMMATE"],
      });

      const syncRes = await postSync({ licenseKey: "COPE-SUPPORTER" }, {
        DB: db,
        QUOTA_KV: kv,
        POLAR_ACCESS_TOKEN: "tok",
        POLAR_ORGANIZATION_ID: "org",
      });
      expect(syncRes.status).toBe(200);
      expect(await syncRes.json()).toMatchObject({
        success: true,
        profile: { is_executive_supporter: true },
      });

    } finally {
      globalThis.fetch = origFetch;
    }
  });

  it("does not let the first synced teammate key auto-claim supporter entitlement", async () => {
    mockedValidatePolarKey.mockResolvedValue({ valid: true, status: "activated", id: "polar-id" });
    const origFetch = globalThis.fetch;
    const { db } = createMockDB({
      firstBySQL: {
        "license_hash =": PROFILE_ROW,
      },
    });
    const kv = mockKV();

    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.includes("/v1/checkouts/?")) {
        return new Response(JSON.stringify({ items: [] }));
      }
      if (url.includes("/v1/checkouts/")) {
        return new Response(JSON.stringify({
          organization_id: "org",
          status: "succeeded",
          customer_id: "cust-1",
          created_at: "2026-01-02T00:00:00Z",
          metadata: { reference_id: "test-session", tier: "Executive Supporter - 2 Licenses" },
        }));
      }
      if (url.includes("/v1/license-keys/")) {
        return new Response(JSON.stringify({
          items: [
            { key: "COPE-SUPPORTER", created_at: "2026-01-02T00:00:01Z", status: "granted" },
            { key: "COPE-TEAMMATE", created_at: "2026-01-02T00:00:02Z", status: "granted" },
          ],
        }));
      }
      throw new Error(`Unexpected fetch: ${url}`);
    }) as typeof fetch;

    try {
      await postCheckoutLicense({ checkoutId: "co_supporter" }, {
        DB: db,
        QUOTA_KV: kv,
        CHECKOUT_CLAIM_SECRET: "secret",
        POLAR_ACCESS_TOKEN: "tok",
        POLAR_ORGANIZATION_ID: "org",
      });

      const teammateSyncRes = await postWithSession("/api/account/sync", {
        licenseKey: "COPE-TEAMMATE",
      }, {
        DB: db,
        QUOTA_KV: kv,
        POLAR_ACCESS_TOKEN: "tok",
        POLAR_ORGANIZATION_ID: "org",
      }, "test-session");
      expect(teammateSyncRes.status).toBe(200);
      expect(await teammateSyncRes.json()).toMatchObject({
        success: true,
        profile: { is_executive_supporter: false },
      });
    } finally {
      globalThis.fetch = origFetch;
    }
  });

  it("preserves existing supporter entitlement when no supporter claim row exists", async () => {
    mockedValidatePolarKey.mockResolvedValue({ valid: true, status: "activated", id: "polar-id" });
    const supporterProfile = { ...PROFILE_ROW, is_executive_supporter: 1, display_rank: "Mid-Level Googler" };
    const { db, calls } = createMockDB({
      firstBySQL: {
        "license_hash =": supporterProfile,
        "SELECT is_executive_supporter FROM checkout_key_claims": null,
        "SELECT is_executive_supporter FROM user_scores": { is_executive_supporter: 1 },
      },
    });
    const kv = mockKV();

    const res = await postSync({ licenseKey: "COPE-TEST" }, {
      DB: db, QUOTA_KV: kv,
      POLAR_ACCESS_TOKEN: "tok", POLAR_ORGANIZATION_ID: "org",
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      success: true,
      profile: { is_executive_supporter: true, display_rank: "Mid-Level Googler" },
    });
    expect(calls.some((call) => call.sql.includes("UPDATE user_scores"))).toBe(false);
    expect(calls.some((call) => call.sql.includes("SELECT is_executive_supporter FROM user_scores"))).toBe(true);
  });
});

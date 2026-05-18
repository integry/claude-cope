/* eslint-disable max-lines */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock validatePolarKey before importing app
vi.mock("../utils/polar", () => ({
  validatePolarKey: vi.fn(),
  syncPolarUsage: vi.fn(),
}));

import app from "../app";
import { validatePolarKey } from "../utils/polar";

const mockedValidatePolarKey = vi.mocked(validatePolarKey);

function createMockDB(opts: {
  firstBySQL?: Record<string, Record<string, unknown> | null>;
  runChanges?: number;
} = {}) {
  const calls: { sql: string; bindings: unknown[] }[] = [];
  const checkoutClaims = new Map<string, { sessionId?: string; encryptedKeys: string | null }>();
  const keyOwners = new Map<string, { checkoutId: string; isExecutiveSupporter: number }>();
  const resolveFirst = (sql: string, bindings: unknown[]) => {
    if (sql.includes("SELECT session_id, encrypted_keys FROM checkout_claims WHERE checkout_id = ?")) {
      const checkoutId = bindings[0] as string;
      if (!checkoutClaims.has(checkoutId)) return null;
      const claim = checkoutClaims.get(checkoutId)!;
      return { session_id: claim.sessionId ?? null, encrypted_keys: claim.encryptedKeys ?? null };
    }
    if (sql.includes("SELECT encrypted_keys FROM checkout_claims WHERE checkout_id = ?")) {
      const checkoutId = bindings[0] as string;
      if (!checkoutClaims.has(checkoutId)) return null;
      return { encrypted_keys: checkoutClaims.get(checkoutId)?.encryptedKeys ?? null };
    }
    if (sql.includes("SELECT is_executive_supporter FROM checkout_key_claims WHERE license_key_hash = ?")) {
      const licenseKeyHash = bindings[0] as string;
      const claim = keyOwners.get(licenseKeyHash);
      return claim ? { is_executive_supporter: claim.isExecutiveSupporter } : null;
    }
    if (opts.firstBySQL) {
      for (const [pattern, result] of Object.entries(opts.firstBySQL)) {
        if (sql.includes(pattern)) return result;
      }
    }
    return null;
  };
  const stmt = (sql: string) => ({
    first: vi.fn().mockImplementation(() => Promise.resolve(resolveFirst(sql, []))),
    run: vi.fn().mockResolvedValue({ meta: { changes: opts.runChanges ?? 1 } }),
    all: vi.fn().mockResolvedValue({ results: [] }),
  });
  return {
    db: {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((...args: unknown[]) => {
          calls.push({ sql, bindings: args });
          return {
            first: vi.fn().mockResolvedValue(resolveFirst(sql, args)),
            run: vi.fn().mockImplementation(async () => {
              if (sql.includes("INSERT INTO checkout_claims")) {
                const [checkoutId, sessionId] = args as [string, string];
                if (checkoutClaims.has(checkoutId)) return { meta: { changes: 0 } };
                checkoutClaims.set(checkoutId, { sessionId, encryptedKeys: null });
                return { meta: { changes: 1 } };
              }
              if (sql.includes("UPDATE checkout_claims SET encrypted_keys")) {
                const [encryptedKeys, checkoutId] = args as [string, string];
                const claim = checkoutClaims.get(checkoutId);
                if (!claim) return { meta: { changes: 0 } };
                claim.encryptedKeys = encryptedKeys;
                return { meta: { changes: 1 } };
              }
              if (sql.includes("INSERT INTO checkout_key_claims")) {
                const checkoutId = (args as string[])[args.length - 1]!;
                const incomingClaims = (args as string[])
                  .slice(0, -2)
                  .reduce<Array<{ licenseKeyHash: string; isExecutiveSupporter: number }>>((claims, value, index, values) => {
                    if (index % 2 === 0) {
                      claims.push({
                        licenseKeyHash: value,
                        isExecutiveSupporter: values[index + 1] as number,
                      });
                    }
                    return claims;
                  }, []);
                const hasConflict = incomingClaims.some(({ licenseKeyHash }) => keyOwners.has(licenseKeyHash) && keyOwners.get(licenseKeyHash)?.checkoutId !== checkoutId);
                if (hasConflict) return { meta: { changes: 0 } };
                let inserted = 0;
                for (const { licenseKeyHash, isExecutiveSupporter } of incomingClaims) {
                  if (keyOwners.has(licenseKeyHash)) continue;
                  keyOwners.set(licenseKeyHash, { checkoutId, isExecutiveSupporter });
                  inserted += 1;
                }
                return { meta: { changes: inserted } };
              }
              return { meta: { changes: opts.runChanges ?? 1 } };
            }),
            all: vi.fn().mockImplementation(async () => {
              if (sql.includes("SELECT license_key_hash, checkout_id FROM checkout_key_claims")) {
                return {
                  results: (args as string[])
                    .filter((licenseKeyHash) => keyOwners.has(licenseKeyHash))
                    .map((licenseKeyHash) => ({
                      license_key_hash: licenseKeyHash,
                      checkout_id: keyOwners.get(licenseKeyHash)!.checkoutId,
                    })),
                };
              }
              return { results: [] };
            }),
          };
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
  username: "alice", license_hash: "testhash",
  total_td: 100, current_td: 100, corporate_rank: "Junior Code Monkey",
  inventory: "{}", upgrades: "[]", achievements: "[]", is_executive_supporter: 0,
  buddy_type: null, buddy_is_shiny: 0,
  unlocked_themes: '["default"]', active_theme: "default",
  active_ticket: null, td_multiplier: 1,
  country: "", credits_used: 0,
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

  it("grants executive supporter on checkout redemption and returns it on the next sync", async () => {
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
          metadata: { reference_id: "test-session", tier: "Executive Supporter" },
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

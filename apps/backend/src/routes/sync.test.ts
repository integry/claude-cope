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
  const resolveFirst = (sql: string) => {
    if (opts.firstBySQL) {
      for (const [pattern, result] of Object.entries(opts.firstBySQL)) {
        if (sql.includes(pattern)) return result;
      }
    }
    return null;
  };
  const stmt = (sql: string) => ({
    first: vi.fn().mockResolvedValue(resolveFirst(sql)),
    run: vi.fn().mockResolvedValue({ meta: { changes: opts.runChanges ?? 1 } }),
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

function postSync(body: unknown, env: Record<string, unknown>) {
  return app.request("/api/account/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: "cope_session_id=test-session" },
    body: JSON.stringify(body),
  }, { ALLOWED_ORIGINS: "http://localhost:5173", ...env });
}

const PROFILE_ROW = {
  username: "alice", license_hash: "testhash",
  total_td: 100, current_td: 100, corporate_rank: "Junior Code Monkey",
  inventory: "{}", upgrades: "[]", achievements: "[]",
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
    let callCount = 0;
    const { db } = createMockDB();
    // Override prepare to track SQL-aware routing
    db.prepare = vi.fn((sql: string) => {
      const isProfileByHash = sql.includes("WHERE license_hash = ?");
      const isUsernameCheck = sql.includes("WHERE username = ?");
      return {
        bind: vi.fn(() => {
          callCount++;
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
        const isUsernameCheck = sql.includes("WHERE username = ?");
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
    // The request should fail (username taken by different license)
    expect(res.status).toBeGreaterThanOrEqual(400);
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
});

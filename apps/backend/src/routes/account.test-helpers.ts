import { vi } from "vitest";
import app from "../app";

function normalizeSql(sql: string) {
  return sql.replace(/\s+/g, " ").trim();
}

export const ACCOUNT_TEST_SQL = {
  getProfile: normalizeSql("SELECT username, total_td, current_td, corporate_rank, inventory, upgrades, achievements, buddy_type, buddy_is_shiny, unlocked_themes, active_theme, active_ticket, td_multiplier FROM user_scores WHERE username = ?"),
  getProfileRow: normalizeSql("SELECT username, total_td, current_td, corporate_rank, inventory, upgrades, achievements, buddy_type, buddy_is_shiny, unlocked_themes, active_theme, active_ticket, td_multiplier, license_hash FROM user_scores WHERE username = ?"),
  getLicenseStatus: normalizeSql("SELECT status, last_activated_at FROM licenses WHERE key_hash = ?"),
  aliasTakenLookup: normalizeSql("SELECT 1 FROM user_scores WHERE LOWER(username) = LOWER(?) AND username != ?"),
} as const;

export function createMockDB(opts: {
  firstResults?: Record<string, unknown>;
  firstBySQL?: Record<string, Record<string, unknown> | null>;
  runChanges?: number;
} = {}) {
  const calls: { sql: string; bindings: unknown[] }[] = [];
  const firstBySQL = opts.firstBySQL
    ? Object.fromEntries(Object.entries(opts.firstBySQL).map(([sql, result]) => [normalizeSql(sql), result]))
    : null;
  const resolveFirst = (sql: string) => {
    if (firstBySQL) {
      const normalizedSql = normalizeSql(sql);
      if (normalizedSql in firstBySQL) return firstBySQL[normalizedSql] ?? null;
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

export function mockKV(store: Record<string, string> = {}) {
  return {
    get: vi.fn((key: string) => Promise.resolve(store[key] ?? null)),
    put: vi.fn(() => Promise.resolve()),
    delete: vi.fn(() => Promise.resolve()),
  };
}

export function postJSON(path: string, body: unknown, env: Record<string, unknown>) {
  return app.request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }, { ALLOWED_ORIGINS: "http://localhost:5173", ...env });
}

export const BASE_PROFILE = {
  username: "alice", license_hash: "hash",
  total_td: 1000, current_td: 1000, corporate_rank: "CTO",
  inventory: "{}", upgrades: "[]", achievements: "[]",
  buddy_type: null, buddy_is_shiny: 0,
  unlocked_themes: '["default"]', active_theme: "default",
  active_ticket: null, td_multiplier: 1,
};

export function profileWithHash(hash: string) {
  return { ...BASE_PROFILE, license_hash: hash };
}

function withoutLicenseHash<T extends { license_hash: string | null }>(row: T): Omit<T, "license_hash"> {
  const { license_hash, ...rest } = row;
  void license_hash;
  return rest;
}

export function ownedMockDB(opts: { runChanges?: number } = {}) {
  return createMockDB({
    firstBySQL: {
      [ACCOUNT_TEST_SQL.getProfile]: withoutLicenseHash(BASE_PROFILE),
      [ACCOUNT_TEST_SQL.getProfileRow]: BASE_PROFILE,
      [ACCOUNT_TEST_SQL.getLicenseStatus]: { status: "active" },
    },
    runChanges: opts.runChanges ?? 1,
  });
}

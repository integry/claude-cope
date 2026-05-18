import { vi } from "vitest";
import app from "../app";
import { BASE_PROFILE } from "./account.test-utils";

export const ACCOUNT_TEST_SQL = {
  getProfile: "td_multiplier FROM user_scores WHERE username = ?",
  getProfileRow: "td_multiplier, license_hash, account_id FROM user_scores WHERE username = ?",
  getProfileRowByAccountId: "td_multiplier, license_hash, account_id FROM user_scores WHERE account_id = ?",
  getLicenseStatus: "FROM licenses WHERE key_hash = ?",
  aliasTakenLookup: "SELECT 1 FROM user_scores WHERE LOWER(username) = LOWER(?) AND username != ?",
  aliasHistoryLookup: "FROM completed_tasks",
} as const;

export function createMockDB(opts: {
  firstResults?: Record<string, unknown>;
  firstBySQL?: Record<string, Record<string, unknown> | null>;
  runChanges?: number;
} = {}) {
  const calls: { sql: string; bindings: unknown[] }[] = [];
  const firstBySQL = opts.firstBySQL ?? null;
  const resolveFirst = (sql: string) => {
    if (firstBySQL) {
      for (const [pattern, result] of Object.entries(firstBySQL)) {
        if (sql.includes(pattern)) return result ?? null;
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

import { vi } from "vitest";
import app from "../app";

export function makeDB(existing?: { total_td: number; current_td: number; last_sync_time?: string; license_hash?: string | null; corporate_rank?: string; account_id?: string | null }, opts?: { licenseActive?: boolean }) {
  const bound: unknown[] = [];
  let lastSQL = "";
  const batchedStatements: unknown[] = [];
  return {
    db: {
      prepare: vi.fn((sql: string) => {
        const isMigrationBookkeeping = sql.includes("schema_migrations");
        if (!isMigrationBookkeeping) lastSQL = sql;
        const isSelect = sql.trim().toUpperCase().startsWith("SELECT");
        const isLicenseCheck = sql.includes("licenses");
        return {
          bind: vi.fn((...args: unknown[]) => {
            if (!isMigrationBookkeeping) bound.push(...args);
            return {
              first: vi.fn().mockImplementation(() => {
                if (isLicenseCheck) {
                  return Promise.resolve(opts?.licenseActive ? { status: "active", last_activated_at: new Date().toISOString() } : null);
                }
                return Promise.resolve(isSelect ? (existing ?? null) : null);
              }),
              run: vi.fn().mockResolvedValue({ success: true }),
            };
          }),
          all: vi.fn().mockResolvedValue({ results: [] }),
          run: vi.fn().mockResolvedValue({ success: true }),
        };
      }),
      batch: vi.fn((stmts: unknown[]) => {
        batchedStatements.push(...stmts);
        return Promise.resolve(stmts.map(() => ({ success: true })));
      }),
    },
    bound,
    batchedStatements,
    getSQL: () => lastSQL,
  };
}

export function makeDBWithTasks(
  existing: { total_td: number; current_td: number; last_sync_time?: string } | undefined,
  tickets: Record<string, { technical_debt: number }>,
  claimedTickets: string[] = [],
  batchShouldFail = false,
) {
  const bound: unknown[] = [];
  let lastSQL = "";
  const batchedStatements: unknown[] = [];
  return {
    db: {
      prepare: vi.fn((sql: string) => {
        const isMigrationBookkeeping = sql.includes("schema_migrations");
        if (!isMigrationBookkeeping) lastSQL = sql;
        return {
          bind: vi.fn((...args: unknown[]) => {
            if (!isMigrationBookkeeping) bound.push(...args);
            const isUserScoresSelect = sql.includes("user_scores") && sql.trim().toUpperCase().startsWith("SELECT");
            const isBacklogSelect = sql.includes("community_backlog");
            const isCompletedSelect = sql.includes("completed_tasks") && sql.trim().toUpperCase().startsWith("SELECT");
            return {
              first: vi.fn().mockImplementation(() => {
                if (isUserScoresSelect) return Promise.resolve(existing ?? null);
                if (isBacklogSelect) {
                  const ticketId = args[0] as string;
                  return Promise.resolve(tickets[ticketId] ?? null);
                }
                if (isCompletedSelect) {
                  const ticketId = args[1] as string;
                  return Promise.resolve(claimedTickets.includes(ticketId) ? { "1": 1 } : null);
                }
                return Promise.resolve(null);
              }),
              run: vi.fn().mockResolvedValue({ success: true }),
            };
          }),
          all: vi.fn().mockResolvedValue({ results: [] }),
          run: vi.fn().mockResolvedValue({ success: true }),
        };
      }),
      batch: vi.fn((stmts: unknown[]) => {
        batchedStatements.push(...stmts);
        if (batchShouldFail) return Promise.reject(new Error("D1 batch transaction failed"));
        return Promise.resolve(stmts.map(() => ({ success: true })));
      }),
    },
    bound,
    batchedStatements,
    getSQL: () => lastSQL,
  };
}

export function mockKV(initial?: string | Record<string, string | null>) {
  const map = new Map<string, string | null>();
  const fallbackSessionUsername = typeof initial === "string" ? initial : null;
  if (typeof initial === "string") {
    map.set("session_user:test-session", initial);
  } else if (initial) {
    for (const [key, value] of Object.entries(initial)) {
      map.set(key, value);
    }
  }
  return {
    get: vi.fn((key: string) => {
      if (map.has(key)) return Promise.resolve(map.get(key) ?? null);
      if (fallbackSessionUsername && key.startsWith("session_user:")) return Promise.resolve(fallbackSessionUsername);
      return Promise.resolve(null);
    }),
    put: vi.fn((key: string, value: string) => {
      map.set(key, value);
      return Promise.resolve();
    }),
    delete: vi.fn(() => Promise.resolve()),
  };
}

export function postScore(
  db: unknown,
  body: Record<string, unknown>,
  headers?: Record<string, string>,
  kv = mockKV(body.username as string | undefined),
  env: Record<string, unknown> = {},
) {
  return app.request(
    "/api/score",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
    },
    { ALLOWED_ORIGINS: "http://localhost:5173", DB: db, QUOTA_KV: kv, ...env }
  );
}

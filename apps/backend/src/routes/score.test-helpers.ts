import { vi } from "vitest";
import app from "../app";

export function makeDB(existing?: { total_td: number; current_td: number; last_sync_time?: string; license_hash?: string | null; corporate_rank?: string }, opts?: { licenseActive?: boolean }) {
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

export function mockKV(boundUsername?: string) {
  return {
    get: vi.fn((key: string) => {
      if (key.startsWith("session_user:")) return Promise.resolve(boundUsername ?? null);
      return Promise.resolve(null);
    }),
    put: vi.fn(() => Promise.resolve()),
    delete: vi.fn(() => Promise.resolve()),
  };
}

export function makeCheckAliasDB(opts: {
  licenseActive?: boolean;
  usernameTaken?: boolean;
}) {
  return {
    prepare: vi.fn((sql: string) => {
      const isMigrationBookkeeping = sql.includes("schema_migrations");
      return {
        bind: vi.fn(() => ({
          first: vi.fn().mockImplementation(() => {
            if (isMigrationBookkeeping) return Promise.resolve(null);
            if (sql.includes("licenses")) {
              return Promise.resolve(
                opts.licenseActive
                  ? { status: "active", last_activated_at: new Date().toISOString() }
                  : null,
              );
            }
            if (sql.includes("user_scores")) {
              return Promise.resolve(opts.usernameTaken ? { "1": 1 } : null);
            }
            return Promise.resolve(null);
          }),
          run: vi.fn().mockResolvedValue({ success: true }),
        })),
        all: vi.fn().mockResolvedValue({ results: [] }),
        run: vi.fn().mockResolvedValue({ success: true }),
      };
    }),
    batch: vi.fn((stmts: unknown[]) => Promise.resolve(stmts.map(() => ({ success: true })))),
  };
}

export function postScore(db: unknown, body: Record<string, unknown>, headers?: Record<string, string>) {
  return app.request(
    "/api/score",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
    },
    { ALLOWED_ORIGINS: "http://localhost:5173", DB: db, QUOTA_KV: mockKV(body.username as string | undefined) }
  );
}

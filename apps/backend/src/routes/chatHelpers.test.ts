import { describe, expect, it } from "vitest";
import { FREE_TIER_RANK_CAP } from "../gameConstants";
import { recordUsage } from "./chatHelpers";

describe("recordUsage", () => {
  it("uses a targetless upsert so case-only username conflicts hit the update path", async () => {
    const statements: { sql: string; bindings: unknown[] }[] = [];
    const db = {
      prepare: (sql: string) => ({
        bind: (...bindings: unknown[]) => {
          statements.push({ sql, bindings });
          return {
            run: () => Promise.resolve({ meta: { changes: 1 } }),
          };
        },
      }),
    } as unknown as D1Database;

    let flushed: Promise<unknown> | null = null;
    recordUsage(db, {
      waitUntil: (promise) => {
        flushed = promise;
      },
    }, {
      username: "alice",
      model: "gpt-5.4",
      data: { usage: { prompt_tokens: 10, completion_tokens: 20 } } as never,
      tdAwarded: 25,
      rank: "CTO",
      country: "US",
      hour: "2026-05-04 09",
      proKeyHash: "pro-hash",
      ownsUsername: true,
      profileLicenseHash: "pro-hash",
      revokedProfileLicenseHash: null,
      deferredKvWrites: null,
    });

    await flushed!;

    const upsert = statements.find((statement) => statement.sql.includes("INSERT INTO user_scores"));
    expect(upsert?.sql).toContain("ON CONFLICT DO UPDATE");
    expect(upsert?.sql).not.toContain("ON CONFLICT(username)");
  });

  it("rewrites persisted free-user rank to the free-tier cap on conflict updates", async () => {
    const statements: { sql: string; bindings: unknown[] }[] = [];
    const db = {
      prepare: (sql: string) => ({
        bind: (...bindings: unknown[]) => {
          statements.push({ sql, bindings });
          return {
            run: () => Promise.resolve({ meta: { changes: 1 } }),
          };
        },
      }),
    } as unknown as D1Database;

    let flushed: Promise<unknown> | null = null;
    recordUsage(db, {
      waitUntil: (promise) => {
        flushed = promise;
      },
    }, {
      username: "alice",
      model: "gpt-5.4",
      data: { usage: { prompt_tokens: 10, completion_tokens: 20 } } as never,
      tdAwarded: 25,
      rank: "CTO",
      country: "US",
      hour: "2026-05-04 09",
      ownsUsername: true,
      profileLicenseHash: null,
      revokedProfileLicenseHash: null,
      deferredKvWrites: null,
    });

    await flushed!;

    const upsert = statements.find((statement) => statement.sql.includes("INSERT INTO user_scores"));
    expect(upsert?.sql).toContain("ON CONFLICT DO UPDATE");
    expect(upsert?.sql).toContain("corporate_rank = ?");
    expect(upsert?.bindings).toEqual(expect.arrayContaining([FREE_TIER_RANK_CAP, FREE_TIER_RANK_CAP]));
    expect(upsert?.bindings?.[3]).toBe(FREE_TIER_RANK_CAP);
  });
});

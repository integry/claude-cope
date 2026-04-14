import { describe, it, expect, vi } from "vitest";
import app from "../app";

function createGetMockDB(results: unknown[] = []) {
  let capturedSQL = "";
  const capturedBindings: unknown[] = [];
  return {
    db: {
      prepare: vi.fn((sql: string) => {
        capturedSQL = sql;
        return {
          bind: vi.fn((...args: unknown[]) => {
            capturedBindings.push(...args);
            return {
              all: vi.fn().mockResolvedValue({ results }),
            };
          }),
          all: vi.fn().mockResolvedValue({ results }),
        };
      }),
    },
    getSQL: () => capturedSQL,
    getBindings: () => capturedBindings,
  };
}

describe("GET /api/leaderboard", () => {
  it("returns leaderboard entries from the database", async () => {
    const mockResults = [
      { id: "1", username: "alice", corporate_rank: "CTO", country: "US", technical_debt: 999, created_at: "2026-01-01" },
    ];
    const { db } = createGetMockDB(mockResults);

    const res = await app.request("/api/leaderboard", undefined, {
      ALLOWED_ORIGINS: "http://localhost:5173",
      DB: db,
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(mockResults);
    expect(res.headers.get("Cache-Control")).toBe("public, max-age=60");
  });

  it("filters by daily timeframe", async () => {
    const { db, getSQL } = createGetMockDB();

    await app.request("/api/leaderboard?timeframe=daily", undefined, {
      ALLOWED_ORIGINS: "http://localhost:5173",
      DB: db,
    });

    expect(getSQL()).toContain("updated_at >= datetime('now', '-1 day')");
  });

  it("filters by weekly timeframe", async () => {
    const { db, getSQL } = createGetMockDB();

    await app.request("/api/leaderboard?timeframe=weekly", undefined, {
      ALLOWED_ORIGINS: "http://localhost:5173",
      DB: db,
    });

    expect(getSQL()).toContain("updated_at >= datetime('now', '-7 days')");
  });

  it("filters by country", async () => {
    const { db, getSQL, getBindings } = createGetMockDB();

    await app.request("/api/leaderboard?country=PK", undefined, {
      ALLOWED_ORIGINS: "http://localhost:5173",
      DB: db,
    });

    expect(getSQL()).toContain("country = ?");
    expect(getBindings()).toContain("PK");
  });

  it("combines timeframe and country filters", async () => {
    const { db, getSQL, getBindings } = createGetMockDB();

    await app.request("/api/leaderboard?timeframe=daily&country=US", undefined, {
      ALLOWED_ORIGINS: "http://localhost:5173",
      DB: db,
    });

    const sql = getSQL();
    expect(sql).toContain("updated_at >= datetime('now', '-1 day')");
    expect(sql).toContain("country = ?");
    expect(getBindings()).toContain("US");
  });

  it("defaults invalid timeframe to all (no time filter)", async () => {
    const { db, getSQL } = createGetMockDB();

    await app.request("/api/leaderboard?timeframe=invalid", undefined, {
      ALLOWED_ORIGINS: "http://localhost:5173",
      DB: db,
    });

    expect(getSQL()).not.toContain("WHERE");
  });

  it("treats country=all as no country filter", async () => {
    const { db, getSQL } = createGetMockDB();

    await app.request("/api/leaderboard?country=all", undefined, {
      ALLOWED_ORIGINS: "http://localhost:5173",
      DB: db,
    });

    expect(getSQL()).not.toContain("country = ?");
  });
});

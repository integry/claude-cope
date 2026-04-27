import { describe, it, expect, vi } from "vitest";
import app from "../app";

function createGetMockDB(results: unknown[] = []) {
  let capturedSQL = "";
  const capturedBindings: unknown[] = [];
  return {
    db: {
      prepare: vi.fn((sql: string) => {
        // Ignore migration bookkeeping SQL so getSQL() reflects the route's query.
        if (!sql.includes("schema_migrations")) capturedSQL = sql;
        const isMigrationSelect = sql.includes("SELECT name FROM schema_migrations");
        return {
          bind: vi.fn((...args: unknown[]) => {
            if (!sql.includes("schema_migrations")) capturedBindings.push(...args);
            return {
              all: vi.fn().mockResolvedValue({ results: isMigrationSelect ? [] : results }),
              run: vi.fn().mockResolvedValue({ success: true }),
            };
          }),
          all: vi.fn().mockResolvedValue({ results: isMigrationSelect ? [] : results }),
        };
      }),
      exec: vi.fn().mockResolvedValue({ results: [] }),
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

  it("rejects invalid timeframe with 400", async () => {
    const { db } = createGetMockDB();

    const res = await app.request("/api/leaderboard?timeframe=invalid", undefined, {
      ALLOWED_ORIGINS: "http://localhost:5173",
      DB: db,
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid timeframe parameter" });
  });

  it("rejects malformed country code with 400", async () => {
    const { db } = createGetMockDB();

    const res = await app.request("/api/leaderboard?country=XYZ", undefined, {
      ALLOWED_ORIGINS: "http://localhost:5173",
      DB: db,
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid country parameter" });
  });

  it("rejects lowercase country code with 400", async () => {
    const { db } = createGetMockDB();

    const res = await app.request("/api/leaderboard?country=us", undefined, {
      ALLOWED_ORIGINS: "http://localhost:5173",
      DB: db,
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid country parameter" });
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

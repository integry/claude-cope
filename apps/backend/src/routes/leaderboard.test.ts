import { describe, it, expect, vi } from "vitest";
import app from "../app";

function createMockDB(options?: { success?: boolean }) {
  const bound: unknown[] = [];
  return {
    db: {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn((...args: unknown[]) => {
          bound.push(...args);
          return {
            run: vi.fn().mockResolvedValue({
              success: options?.success ?? true,
            }),
          };
        }),
        all: vi.fn().mockResolvedValue({ results: [] }),
      }),
    },
    bound,
  };
}

describe("POST /api/leaderboard", () => {
  it("inserts a normal submission with the original rank", async () => {
    const { db, bound } = createMockDB();
    const res = await app.request(
      "/api/leaderboard",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "alice",
          rank: "Senior Debt Architect",
          debt: 1_000_000,
        }),
      },
      { ALLOWED_ORIGINS: "http://localhost:5173", DB: db }
    );

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ success: true });
    // rank should be passed through unchanged
    expect(bound).toContain("alice");
    expect(bound).toContain("Senior Debt Architect");
    expect(bound).toContain("Unknown");
    expect(bound).toContain(1_000_000);
  });

  it("saves country from cf-ipcountry header", async () => {
    const { db, bound } = createMockDB();
    const res = await app.request(
      "/api/leaderboard",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "cf-ipcountry": "PK",
        },
        body: JSON.stringify({
          username: "ali",
          rank: "Tech Lead",
          debt: 500_000,
        }),
      },
      { ALLOWED_ORIGINS: "http://localhost:5173", DB: db }
    );

    expect(res.status).toBe(201);
    expect(bound).toContain("PK");
    expect(bound).not.toContain("Unknown");
  });

  it("overrides rank to 'DevTools Hacker' when debt exceeds 50 billion", async () => {
    const { db, bound } = createMockDB();
    const res = await app.request(
      "/api/leaderboard",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "cheater",
          rank: "CEO of Everything",
          debt: 50_000_000_001,
        }),
      },
      { ALLOWED_ORIGINS: "http://localhost:5173", DB: db }
    );

    expect(res.status).toBe(201);
    // rank must be overridden
    expect(bound).toContain("\u{1F921} DevTools Hacker");
    expect(bound).not.toContain("CEO of Everything");
  });

  it("does NOT override rank when debt is exactly 50 billion", async () => {
    const { db, bound } = createMockDB();
    await app.request(
      "/api/leaderboard",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "edge",
          rank: "Legitimate Rank",
          debt: 50_000_000_000,
        }),
      },
      { ALLOWED_ORIGINS: "http://localhost:5173", DB: db }
    );

    expect(bound).toContain("Legitimate Rank");
    expect(bound).not.toContain("\u{1F921} DevTools Hacker");
  });

  it("returns 400 when required fields are missing", async () => {
    const { db } = createMockDB();
    const res = await app.request(
      "/api/leaderboard",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "bob" }),
      },
      { ALLOWED_ORIGINS: "http://localhost:5173", DB: db }
    );

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toHaveProperty("error");
  });

  it("returns 500 when DB is not configured", async () => {
    const res = await app.request(
      "/api/leaderboard",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "alice",
          rank: "rank",
          debt: 100,
        }),
      },
      { ALLOWED_ORIGINS: "http://localhost:5173" }
    );

    expect(res.status).toBe(500);
    const json = (await res.json()) as { error: string };
    expect(json.error).toBe("Database is not configured");
  });

  it("returns 500 when DB insert fails", async () => {
    const { db } = createMockDB({ success: false });
    const res = await app.request(
      "/api/leaderboard",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "alice",
          rank: "rank",
          debt: 100,
        }),
      },
      { ALLOWED_ORIGINS: "http://localhost:5173", DB: db }
    );

    expect(res.status).toBe(500);
    const json = (await res.json()) as { error: string };
    expect(json.error).toBe("Failed to insert record");
  });
});

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

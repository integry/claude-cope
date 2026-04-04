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
    expect(bound).toContain(1_000_000);
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
    const json = await res.json();
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
    const json = await res.json();
    expect(json.error).toBe("Failed to insert record");
  });
});

describe("GET /api/leaderboard", () => {
  it("returns leaderboard entries from the database", async () => {
    const mockResults = [
      { id: "1", username: "alice", corporate_rank: "CTO", technical_debt: 999, created_at: "2026-01-01" },
    ];
    const db = {
      prepare: vi.fn().mockReturnValue({
        all: vi.fn().mockResolvedValue({ results: mockResults }),
      }),
    };

    const res = await app.request("/api/leaderboard", undefined, {
      ALLOWED_ORIGINS: "http://localhost:5173",
      DB: db,
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(mockResults);
    expect(res.headers.get("Cache-Control")).toBe("public, max-age=60");
  });
});

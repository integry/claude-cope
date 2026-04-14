import { describe, it, expect, vi } from "vitest";
import app from "../app";

function makeDB(existing?: { total_td: number; current_td: number }) {
  const bound: unknown[] = [];
  let lastSQL = "";
  return {
    db: {
      prepare: vi.fn((sql: string) => {
        lastSQL = sql;
        const isSelect = sql.trim().toUpperCase().startsWith("SELECT");
        return {
          bind: vi.fn((...args: unknown[]) => {
            bound.push(...args);
            return {
              first: vi.fn().mockResolvedValue(isSelect ? (existing ?? null) : null),
              run: vi.fn().mockResolvedValue({ success: true }),
            };
          }),
        };
      }),
    },
    bound,
    getSQL: () => lastSQL,
  };
}

function postScore(db: unknown, body: Record<string, unknown>, headers?: Record<string, string>) {
  return app.request(
    "/api/score",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
    },
    { ALLOWED_ORIGINS: "http://localhost:5173", DB: db }
  );
}

describe("GET /api/score", () => {
  it("returns 400 when username is missing", async () => {
    const { db } = makeDB();
    const res = await app.request("/api/score", undefined, {
      ALLOWED_ORIGINS: "http://localhost:5173",
      DB: db,
    });
    expect(res.status).toBe(400);
  });

  it("returns 500 when DB is not configured", async () => {
    const res = await app.request("/api/score?username=alice", undefined, {
      ALLOWED_ORIGINS: "http://localhost:5173",
    });
    expect(res.status).toBe(500);
  });

  it("returns defaults for unknown user", async () => {
    const { db } = makeDB(undefined);
    const res = await app.request("/api/score?username=newbie", undefined, {
      ALLOWED_ORIGINS: "http://localhost:5173",
      DB: db,
    });
    expect(res.status).toBe(200);
    const json = await res.json() as { total_td: number; current_td: number; corporate_rank: string };
    expect(json.total_td).toBe(0);
    expect(json.current_td).toBe(0);
    expect(json.corporate_rank).toBe("Junior Code Monkey");
  });

  it("returns existing row for known user", async () => {
    const { db } = makeDB({ total_td: 5000, current_td: 3000 });
    const res = await app.request("/api/score?username=alice", undefined, {
      ALLOWED_ORIGINS: "http://localhost:5173",
      DB: db,
    });
    expect(res.status).toBe(200);
    const json = await res.json() as { total_td: number; current_td: number };
    expect(json.total_td).toBe(5000);
    expect(json.current_td).toBe(3000);
  });
});

describe("POST /api/score", () => {
  it("returns 400 when username is missing", async () => {
    const { db } = makeDB();
    const res = await postScore(db, { currentTD: 100, totalTDEarned: 100 });
    expect(res.status).toBe(400);
  });

  it("returns 500 when DB is not configured", async () => {
    const res = await app.request(
      "/api/score",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "alice", currentTD: 100, totalTDEarned: 100 }),
      },
      { ALLOWED_ORIGINS: "http://localhost:5173" }
    );
    expect(res.status).toBe(500);
  });

  it("inserts new user with server-validated score (capped to 0 for new users)", async () => {
    const { db } = makeDB(undefined);
    const res = await postScore(db, {
      username: "newbie",
      currentTD: 500,
      totalTDEarned: 500,
      inventory: {},
      upgrades: [],
    });
    expect(res.status).toBe(200);
    const json = await res.json() as { total_td: number; current_td: number; corporate_rank: string };
    // New user has no server-side total, so validatedTotal = min(500, round(0 * 1.1)) = 0
    expect(json.total_td).toBe(0);
    expect(json.current_td).toBe(0);
    expect(json.corporate_rank).toBe("Junior Code Monkey");
  });

  it("caps totalTDEarned to 110% of server total for existing user", async () => {
    const { db } = makeDB({ total_td: 1000, current_td: 800 });
    const res = await postScore(db, {
      username: "alice",
      currentTD: 5000,
      totalTDEarned: 5000,
      inventory: {},
      upgrades: [],
    });
    expect(res.status).toBe(200);
    const json = await res.json() as { total_td: number };
    // Server total is 1000, so validated max is 1100 (110%)
    expect(json.total_td).toBeLessThanOrEqual(1100);
  });

  it("flags suspicious scores as DevTools Hacker", async () => {
    const { db } = makeDB({ total_td: 2000, current_td: 1500 });
    const res = await postScore(db, {
      username: "cheater",
      currentTD: 10000,
      totalTDEarned: 10000,
      inventory: {},
      upgrades: [],
    });
    expect(res.status).toBe(200);
    const json = await res.json() as { corporate_rank: string };
    expect(json.corporate_rank).toBe("🤡 DevTools Hacker");
  });

  it("resolves rank from CORPORATE_RANKS thresholds for existing user", async () => {
    // Existing user with 100k server total, claiming 100k
    const { db } = makeDB({ total_td: 100000, current_td: 90000 });
    const res = await postScore(db, {
      username: "pro",
      currentTD: 100000,
      totalTDEarned: 100000,
      inventory: {},
      upgrades: [],
    });
    expect(res.status).toBe(200);
    const json = await res.json() as { corporate_rank: string };
    // 100k >= 89k threshold = "Mid-Level Googler"
    expect(json.corporate_rank).toBe("Mid-Level Googler");
  });

  it("uses cf-ipcountry header for country detection", async () => {
    const { db, bound } = makeDB(undefined);
    await postScore(
      db,
      { username: "ali", currentTD: 100, totalTDEarned: 100, inventory: {}, upgrades: [] },
      { "cf-ipcountry": "PK" }
    );
    expect(bound).toContain("PK");
  });

  it("returns multiplier based on inventory and upgrades", async () => {
    const { db } = makeDB(undefined);
    const res = await postScore(db, {
      username: "player",
      currentTD: 100,
      totalTDEarned: 100,
      inventory: { "stackoverflow-copy-paster": 10 },
      upgrades: [],
    });
    const json = await res.json() as { multiplier: number };
    // 10 copy-pasters * 5 baseOutput = 50% bonus => multiplier = 1.5
    expect(json.multiplier).toBe(1.5);
  });
});

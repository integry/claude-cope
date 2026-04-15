import { describe, it, expect, vi } from "vitest";
import app from "../app";

function makeDB(existing?: { total_td: number; current_td: number; last_sync_time?: string }) {
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

function makeDBWithTasks(
  existing: { total_td: number; current_td: number; last_sync_time?: string } | undefined,
  tickets: Record<string, { technical_debt: number }>,
  claimedTickets: string[] = [],
) {
  const bound: unknown[] = [];
  let lastSQL = "";
  return {
    db: {
      prepare: vi.fn((sql: string) => {
        lastSQL = sql;
        return {
          bind: vi.fn((...args: unknown[]) => {
            bound.push(...args);
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

  it("clamps score to time-based generation cap", async () => {
    // Last sync was 10 seconds ago, multiplier = 1 (no generators)
    // maxTDPerSecond = max(1, ((1 - 1) * 100 + 20 * 1) * 1.5) = max(1, 30) = 30
    // maxTDGain = 30 * 10 = 300
    // timeClampedTotal = 1000 + 300 = 1300
    const tenSecondsAgo = new Date(Date.now() - 10_000).toISOString().replace("Z", "").replace("T", " ");
    const { db } = makeDB({ total_td: 1000, current_td: 800, last_sync_time: tenSecondsAgo });
    const res = await postScore(db, {
      username: "cheater",
      currentTD: 50000,
      totalTDEarned: 50000,
      inventory: {},
      upgrades: [],
    });
    expect(res.status).toBe(200);
    const json = await res.json() as { total_td: number };
    // Should be clamped: min(50000, round(1000*1.1)=1100, round(1300)=1300) = 1100
    expect(json.total_td).toBeLessThanOrEqual(1300);
  });

  it("allows legitimate score within time-based cap", async () => {
    // Last sync was 60 seconds ago, multiplier = 1.5 (10 copy-pasters)
    // maxTDPerSecond = max(1, ((1.5 - 1) * 100 + 20 * 1.5) * 1.5) = max(1, (50+30)*1.5) = 120
    // maxTDGain = 120 * 60 = 7200
    // timeClampedTotal = 5000 + 7200 = 12200
    const sixtySecondsAgo = new Date(Date.now() - 60_000).toISOString().replace("Z", "").replace("T", " ");
    const { db } = makeDB({ total_td: 5000, current_td: 4000, last_sync_time: sixtySecondsAgo });
    const res = await postScore(db, {
      username: "legit",
      currentTD: 5400,
      totalTDEarned: 5400,
      inventory: { "stackoverflow-copy-paster": 10 },
      upgrades: [],
    });
    expect(res.status).toBe(200);
    const json = await res.json() as { total_td: number };
    // 5400 <= min(round(5000*1.1)=5500, round(12200)=12200) = 5500, so allowed
    expect(json.total_td).toBe(5400);
  });

  it("updates last_sync_time in UPDATE query", async () => {
    const tenSecondsAgo = new Date(Date.now() - 10_000).toISOString().replace("Z", "").replace("T", " ");
    const { db, getSQL } = makeDB({ total_td: 1000, current_td: 800, last_sync_time: tenSecondsAgo });
    await postScore(db, {
      username: "alice",
      currentTD: 1000,
      totalTDEarned: 1000,
      inventory: {},
      upgrades: [],
    });
    expect(getSQL()).toContain("last_sync_time");
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

  it("allows large one-off earnings from completed task bonus", async () => {
    // Server total is 1000, 10% tolerance would cap at 1100
    // But player completed a task with technical_debt=500, bonus = 500*10 = 5000
    // So allowed total = round(1000*1.1) + 5000 = 6100
    const tenSecondsAgo = new Date(Date.now() - 10_000).toISOString().replace("Z", "").replace("T", " ");
    const { db } = makeDBWithTasks(
      { total_td: 1000, current_td: 800, last_sync_time: tenSecondsAgo },
      { "ticket-abc": { technical_debt: 500 } },
    );
    const res = await postScore(db, {
      username: "worker",
      currentTD: 5800,
      totalTDEarned: 5800,
      inventory: {},
      upgrades: [],
      completedTaskIds: ["ticket-abc"],
    });
    expect(res.status).toBe(200);
    const json = await res.json() as { total_td: number; corporate_rank: string };
    // Without task bonus: capped to 1100. With task bonus: 6100 allowed.
    expect(json.total_td).toBe(5800);
    expect(json.corporate_rank).not.toBe("🤡 DevTools Hacker");
  });

  it("rejects replayed task bonus (already claimed)", async () => {
    const tenSecondsAgo = new Date(Date.now() - 10_000).toISOString().replace("Z", "").replace("T", " ");
    const { db } = makeDBWithTasks(
      { total_td: 1000, current_td: 800, last_sync_time: tenSecondsAgo },
      { "ticket-abc": { technical_debt: 500 } },
      ["ticket-abc"], // already claimed
    );
    const res = await postScore(db, {
      username: "replayer",
      currentTD: 5800,
      totalTDEarned: 5800,
      inventory: {},
      upgrades: [],
      completedTaskIds: ["ticket-abc"],
    });
    expect(res.status).toBe(200);
    const json = await res.json() as { total_td: number };
    // No bonus — already claimed. Falls back to normal 10% cap = 1100
    expect(json.total_td).toBeLessThanOrEqual(1100);
  });

  it("deduplicates and caps task claims to 1 per sync", async () => {
    const tenSecondsAgo = new Date(Date.now() - 10_000).toISOString().replace("Z", "").replace("T", " ");
    const { db } = makeDBWithTasks(
      { total_td: 1000, current_td: 800, last_sync_time: tenSecondsAgo },
      {
        "ticket-a": { technical_debt: 100 },
        "ticket-b": { technical_debt: 200 },
      },
    );
    const res = await postScore(db, {
      username: "greedy",
      currentTD: 4000,
      totalTDEarned: 4000,
      inventory: {},
      upgrades: [],
      // Sends duplicates and multiple IDs — only first unique should be processed
      completedTaskIds: ["ticket-a", "ticket-a", "ticket-b"],
    });
    expect(res.status).toBe(200);
    const json = await res.json() as { total_td: number };
    // Only ticket-a should be processed (cap=1), bonus = 100*10 = 1000
    // Allowed total = round(1000*1.1) + 1000 = 2100
    expect(json.total_td).toBeLessThanOrEqual(2100);
  });

  it("ignores invalid task IDs in completedTaskIds", async () => {
    const tenSecondsAgo = new Date(Date.now() - 10_000).toISOString().replace("Z", "").replace("T", " ");
    const { db } = makeDBWithTasks(
      { total_td: 1000, current_td: 800, last_sync_time: tenSecondsAgo },
      {}, // no tickets in backlog
    );
    const res = await postScore(db, {
      username: "faker",
      currentTD: 5800,
      totalTDEarned: 5800,
      inventory: {},
      upgrades: [],
      completedTaskIds: ["nonexistent-ticket"],
    });
    expect(res.status).toBe(200);
    const json = await res.json() as { total_td: number };
    // No valid task bonus, normal cap applies
    expect(json.total_td).toBeLessThanOrEqual(1100);
  });
});

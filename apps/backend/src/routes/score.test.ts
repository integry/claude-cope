import { describe, it, expect } from "vitest";
import app from "../app";
import { makeDB, makeDBWithTasks, makeCheckAliasDB, postScore } from "./score.test-helpers";

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

  it("caps rank to Junior Code Monkey for free users in GET response", async () => {
    const { db } = makeDB({ total_td: 200000, current_td: 150000, corporate_rank: "Mid-Level Googler" } as never);
    const res = await app.request("/api/score?username=freeuser", undefined, {
      ALLOWED_ORIGINS: "http://localhost:5173",
      DB: db,
    });
    expect(res.status).toBe(200);
    const json = await res.json() as { corporate_rank: string };
    expect(json.corporate_rank).toBe("Junior Code Monkey");
  });

  it("returns uncapped rank for paid users with active license", async () => {
    const { db } = makeDB({ total_td: 200000, current_td: 150000, corporate_rank: "Mid-Level Googler", license_hash: "pro-hash" } as never, { licenseActive: true });
    const res = await app.request("/api/score?username=prouser", undefined, {
      ALLOWED_ORIGINS: "http://localhost:5173",
      DB: db,
    });
    expect(res.status).toBe(200);
    const json = await res.json() as { total_td: number; current_td: number; corporate_rank: string };
    expect(json.total_td).toBe(200000);
    expect(json.current_td).toBe(150000);
    expect(json.corporate_rank).toBe("Mid-Level Googler");
  });

  it("caps rank for users with revoked license", async () => {
    const { db } = makeDB({ total_td: 200000, current_td: 150000, corporate_rank: "Mid-Level Googler", license_hash: "revoked-hash" } as never, { licenseActive: false });
    const res = await app.request("/api/score?username=revokeduser", undefined, {
      ALLOWED_ORIGINS: "http://localhost:5173",
      DB: db,
    });
    expect(res.status).toBe(200);
    const json = await res.json() as { corporate_rank: string };
    expect(json.corporate_rank).toBe("Junior Code Monkey");
  });
});

describe("GET /api/score/check-alias", () => {
  it("returns 403 when proKeyHash is missing", async () => {
    const db = makeCheckAliasDB({ licenseActive: false, usernameTaken: false });
    const res = await app.request("/api/score/check-alias?username=newname", undefined, {
      ALLOWED_ORIGINS: "http://localhost:5173",
      DB: db,
    });
    expect(res.status).toBe(403);
  });

  it("returns 403 when proKeyHash is invalid", async () => {
    const db = makeCheckAliasDB({ licenseActive: false, usernameTaken: false });
    const res = await app.request("/api/score/check-alias?username=newname&proKeyHash=bad-hash", undefined, {
      ALLOWED_ORIGINS: "http://localhost:5173",
      DB: db,
    });
    expect(res.status).toBe(403);
  });

  it("returns taken=false for available username with valid pro key", async () => {
    const db = makeCheckAliasDB({ licenseActive: true, usernameTaken: false });
    const res = await app.request("/api/score/check-alias?username=available&proKeyHash=valid-hash", undefined, {
      ALLOWED_ORIGINS: "http://localhost:5173",
      DB: db,
    });
    expect(res.status).toBe(200);
    const json = await res.json() as { taken: boolean };
    expect(json.taken).toBe(false);
  });

  it("returns taken=true for existing username with valid pro key", async () => {
    const db = makeCheckAliasDB({ licenseActive: true, usernameTaken: true });
    const res = await app.request("/api/score/check-alias?username=existing&proKeyHash=valid-hash", undefined, {
      ALLOWED_ORIGINS: "http://localhost:5173",
      DB: db,
    });
    expect(res.status).toBe(200);
    const json = await res.json() as { taken: boolean };
    expect(json.taken).toBe(true);
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

  it("caps rank to Junior Code Monkey for free users regardless of TD", async () => {
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
    expect(json.corporate_rank).toBe("Junior Code Monkey");
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
    expect(json.total_td).toBeLessThanOrEqual(1300);
  });

  it("allows legitimate score within time-based cap", async () => {
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
    expect(json.multiplier).toBe(1.5);
  });

  it("allows large one-off earnings from completed task bonus", async () => {
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
    expect(json.total_td).toBe(5800);
    expect(json.corporate_rank).not.toBe("🤡 DevTools Hacker");
  });

  it("rejects replayed task bonus (already claimed)", async () => {
    const tenSecondsAgo = new Date(Date.now() - 10_000).toISOString().replace("Z", "").replace("T", " ");
    const { db } = makeDBWithTasks(
      { total_td: 1000, current_td: 800, last_sync_time: tenSecondsAgo },
      { "ticket-abc": { technical_debt: 500 } },
      ["ticket-abc"],
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
    expect(json.total_td).toBeLessThanOrEqual(1100);
  });

  it("deduplicates task IDs but processes all unique completions per sync", async () => {
    const tenSecondsAgo = new Date(Date.now() - 10_000).toISOString().replace("Z", "").replace("T", " ");
    const { db } = makeDBWithTasks(
      { total_td: 1000, current_td: 800, last_sync_time: tenSecondsAgo },
      {
        "ticket-a": { technical_debt: 100 },
        "ticket-b": { technical_debt: 200 },
      },
    );
    const res = await postScore(db, {
      username: "worker",
      currentTD: 4000,
      totalTDEarned: 4000,
      inventory: {},
      upgrades: [],
      completedTaskIds: ["ticket-a", "ticket-a", "ticket-b"],
    });
    expect(res.status).toBe(200);
    const json = await res.json() as { total_td: number };
    expect(json.total_td).toBe(4000);
  });

  it("uses db.batch() for transactional score update and task completion", async () => {
    const tenSecondsAgo = new Date(Date.now() - 10_000).toISOString().replace("Z", "").replace("T", " ");
    const { db, batchedStatements } = makeDBWithTasks(
      { total_td: 1000, current_td: 800, last_sync_time: tenSecondsAgo },
      { "ticket-abc": { technical_debt: 500 } },
    );
    await postScore(db, {
      username: "worker",
      currentTD: 5800,
      totalTDEarned: 5800,
      inventory: {},
      upgrades: [],
      completedTaskIds: ["ticket-abc"],
    });
    expect(db.batch).toHaveBeenCalledTimes(1);
    expect(batchedStatements.length).toBe(2);
  });

  it("returns 500 when batch transaction fails (no partial writes)", async () => {
    const tenSecondsAgo = new Date(Date.now() - 10_000).toISOString().replace("Z", "").replace("T", " ");
    const { db } = makeDBWithTasks(
      { total_td: 1000, current_td: 800, last_sync_time: tenSecondsAgo },
      { "ticket-abc": { technical_debt: 500 } },
      [],
      true,
    );
    const res = await postScore(db, {
      username: "worker",
      currentTD: 5800,
      totalTDEarned: 5800,
      inventory: {},
      upgrades: [],
      completedTaskIds: ["ticket-abc"],
    });
    expect(res.status).toBe(500);
  });

  it("ignores invalid task IDs in completedTaskIds", async () => {
    const tenSecondsAgo = new Date(Date.now() - 10_000).toISOString().replace("Z", "").replace("T", " ");
    const { db } = makeDBWithTasks(
      { total_td: 1000, current_td: 800, last_sync_time: tenSecondsAgo },
      {},
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
    expect(json.total_td).toBeLessThanOrEqual(1100);
  });
});

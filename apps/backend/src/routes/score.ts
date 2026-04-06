import { Hono } from "hono";
import { CORPORATE_RANKS } from "./rankConstants";

type Env = {
  Bindings: {
    DB: D1Database;
  };
};

const score = new Hono<Env>();

/** GET /api/score?username=X — fetch server-authoritative score for syncing */
score.get("/", async (c) => {
  const username = c.req.query("username");
  if (!username) return c.json({ error: "username required" }, 400);

  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const row = await db
    .prepare("SELECT total_td, current_td, corporate_rank FROM user_scores WHERE username = ?")
    .bind(username)
    .first<{ total_td: number; current_td: number; corporate_rank: string }>();

  if (!row) return c.json({ total_td: 0, current_td: 0, corporate_rank: "Junior Code Monkey" });
  return c.json(row);
});

/** POST /api/score — award TD server-side (called by backend after chat, not by client directly) */
score.post("/", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const body = await c.req.json<{
    username: string;
    td_awarded: number;
    td_spent?: number;
  }>();

  if (!body.username) return c.json({ error: "username required" }, 400);

  const country = c.req.header("cf-ipcountry") || "Unknown";

  // Upsert the user's score
  const existing = await db
    .prepare("SELECT total_td, current_td FROM user_scores WHERE username = ?")
    .bind(body.username)
    .first<{ total_td: number; current_td: number }>();

  let newTotal: number;
  let newCurrent: number;

  if (existing) {
    newTotal = existing.total_td + (body.td_awarded ?? 0);
    newCurrent = Math.max(0, existing.current_td + (body.td_awarded ?? 0) - (body.td_spent ?? 0));
  } else {
    newTotal = body.td_awarded ?? 0;
    newCurrent = Math.max(0, (body.td_awarded ?? 0) - (body.td_spent ?? 0));
  }

  // Resolve rank from total TD
  let rank = "Junior Code Monkey";
  for (const r of CORPORATE_RANKS) {
    if (newTotal >= r.threshold) rank = r.title;
  }

  if (existing) {
    await db
      .prepare("UPDATE user_scores SET total_td = ?, current_td = ?, corporate_rank = ?, country = ?, updated_at = datetime('now') WHERE username = ?")
      .bind(newTotal, newCurrent, rank, country, body.username)
      .run();
  } else {
    await db
      .prepare("INSERT INTO user_scores (username, total_td, current_td, corporate_rank, country) VALUES (?, ?, ?, ?, ?)")
      .bind(body.username, newTotal, newCurrent, rank, country)
      .run();
  }

  return c.json({ total_td: newTotal, current_td: newCurrent, corporate_rank: rank });
});

export default score;

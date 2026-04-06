import { Hono } from "hono";

type Env = {
  Bindings: {
    DB: D1Database;
  };
};

const leaderboard = new Hono<Env>();

leaderboard.get("/", async (c) => {
  const db = c.env?.DB;

  if (!db) {
    return c.json({ error: "Database is not configured" }, 500);
  }

  // Read from server-authoritative user_scores table
  const { results } = await db
    .prepare(
      "SELECT username, corporate_rank, country, total_td as technical_debt, updated_at as created_at FROM user_scores ORDER BY total_td DESC LIMIT 50"
    )
    .all();

  c.header("Cache-Control", "public, max-age=60");
  return c.json(results);
});

export default leaderboard;

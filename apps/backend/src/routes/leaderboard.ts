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

  const { results } = await db
    .prepare(
      "SELECT id, username, corporate_rank, technical_debt, created_at FROM hall_of_blame ORDER BY technical_debt DESC LIMIT 50"
    )
    .all();

  c.header("Cache-Control", "public, max-age=60");
  return c.json(results);
});

export default leaderboard;

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

  const timeframe = c.req.query("timeframe") ?? "all";
  const country = c.req.query("country") ?? "all";

  let sql =
    "SELECT username, corporate_rank, country, total_td as technical_debt, updated_at as created_at FROM user_scores";
  const conditions: string[] = [];
  const bindings: string[] = [];

  if (timeframe === "daily") {
    conditions.push("updated_at >= datetime('now', '-1 day')");
  } else if (timeframe === "weekly") {
    conditions.push("updated_at >= datetime('now', '-7 days')");
  }

  if (country && country !== "all") {
    conditions.push("country = ?");
    bindings.push(country);
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  sql += " ORDER BY total_td DESC LIMIT 50";

  const { results } = await db.prepare(sql).bind(...bindings).all();

  c.header("Cache-Control", "public, max-age=60");
  return c.json(results);
});

export default leaderboard;

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

  const VALID_TIMEFRAMES = ["all", "daily", "weekly"] as const;
  if (!VALID_TIMEFRAMES.includes(timeframe as (typeof VALID_TIMEFRAMES)[number])) {
    return c.json({ error: "Invalid timeframe parameter" }, 400);
  }

  if (country !== "all" && !/^[A-Z]{2}$/.test(country)) {
    return c.json({ error: "Invalid country parameter" }, 400);
  }

  let sql =
    `SELECT us.username,
            us.is_executive_supporter,
            CASE
              WHEN us.is_executive_supporter = 1 AND active_licenses.key_hash IS NOT NULL
                THEN COALESCE(us.display_rank, us.corporate_rank)
              ELSE us.corporate_rank
            END AS corporate_rank,
            us.country,
            us.total_td as technical_debt,
            us.updated_at as created_at
     FROM user_scores us
     LEFT JOIN licenses active_licenses
       ON active_licenses.key_hash = us.license_hash
      AND active_licenses.status = 'active'
      AND datetime(active_licenses.last_activated_at) >= datetime('now', '-90 days')`;
  const conditions: string[] = [];
  const bindings: string[] = [];

  if (timeframe === "daily") {
    conditions.push("us.updated_at >= datetime('now', '-1 day')");
  } else if (timeframe === "weekly") {
    conditions.push("us.updated_at >= datetime('now', '-7 days')");
  }

  if (country && country !== "all") {
    conditions.push("us.country = ?");
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

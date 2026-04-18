import { Hono } from "hono";

type Env = {
  Bindings: {
    DB: D1Database;
  };
};

const stats = new Hono<Env>();

stats.get("/", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const [scoreAgg, eventCount] = await Promise.all([
    db
      .prepare("SELECT COUNT(*) AS total_users, COALESCE(SUM(total_td), 0) AS total_td FROM user_scores")
      .first<{ total_users: number; total_td: number }>(),
    db
      .prepare("SELECT COUNT(*) AS count FROM recent_events")
      .first<{ count: number }>(),
  ]);

  return c.json({
    total_users: scoreAgg?.total_users ?? 0,
    total_td: scoreAgg?.total_td ?? 0,
    recent_events: eventCount?.count ?? 0,
  });
});

export default stats;

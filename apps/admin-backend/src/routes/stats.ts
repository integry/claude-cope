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

  const [scoreAgg, eventCount, licenseCount, maxUsers] = await Promise.all([
    db
      .prepare("SELECT COUNT(*) AS total_users, COALESCE(SUM(total_td), 0) AS total_td FROM user_scores")
      .first<{ total_users: number; total_td: number }>(),
    db
      .prepare("SELECT COUNT(*) AS count FROM recent_events")
      .first<{ count: number }>(),
    db
      .prepare("SELECT COUNT(*) AS count FROM licenses WHERE status = 'active'")
      .first<{ count: number }>()
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        if (!msg.includes("no such table") && !msg.includes("no such column")) throw err;
        return { count: 0 };
      }),
    db
      .prepare("SELECT COUNT(*) AS count FROM user_scores WHERE pro_key_hash IS NOT NULL AND pro_key_hash != ''")
      .first<{ count: number }>()
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        if (!msg.includes("no such table") && !msg.includes("no such column")) throw err;
        return { count: 0 };
      }),
  ]);

  const totalUsers = scoreAgg?.total_users ?? 0;
  const maxUserCount = maxUsers?.count ?? 0;
  const freeUserCount = totalUsers - maxUserCount;

  return c.json({
    total_users: totalUsers,
    total_td: scoreAgg?.total_td ?? 0,
    recent_events: eventCount?.count ?? 0,
    total_licenses: licenseCount?.count ?? 0,
    max_users: maxUserCount,
    free_users: freeUserCount,
  });
});

export default stats;

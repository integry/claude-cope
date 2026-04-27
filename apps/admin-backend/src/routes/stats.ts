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
      .prepare("SELECT COUNT(DISTINCT key_hash) AS count FROM licenses WHERE status = 'active'")
      .first<{ count: number }>()
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        if (!msg.includes("no such table") && !msg.includes("no such column")) throw err;
        return { count: 0 };
      }),
    // Count Max users by joining with active licenses, not just checking license_hash presence.
    // This ensures revoked licenses are not counted as Max users.
    db
      .prepare(
        `SELECT COUNT(DISTINCT u.username) AS count FROM user_scores u
         INNER JOIN licenses l ON u.license_hash = l.key_hash AND l.status = 'active'
         WHERE u.license_hash IS NOT NULL`
      )
      .first<{ count: number }>()
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        if (!msg.includes("no such table") && !msg.includes("no such column")) throw err;
        return { count: 0 };
      }),
  ]);

  // Count users with a license_hash that does NOT have an active license (revoked).
  const revokedUsers = await db
    .prepare(
      `SELECT COUNT(DISTINCT u.username) AS count FROM user_scores u
       LEFT JOIN licenses l ON u.license_hash = l.key_hash AND l.status = 'active'
       WHERE u.license_hash IS NOT NULL AND l.key_hash IS NULL`
    )
    .first<{ count: number }>()
    .catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("no such table") && !msg.includes("no such column")) throw err;
      return { count: 0 };
    });

  const totalUsers = scoreAgg?.total_users ?? 0;
  const maxUserCount = maxUsers?.count ?? 0;
  const revokedUserCount = revokedUsers?.count ?? 0;
  const freeUserCount = Math.max(0, totalUsers - maxUserCount - revokedUserCount);

  return c.json({
    total_users: totalUsers,
    total_td: scoreAgg?.total_td ?? 0,
    recent_events: eventCount?.count ?? 0,
    total_licenses: licenseCount?.count ?? 0,
    max_users: maxUserCount,
    revoked_users: revokedUserCount,
    free_users: freeUserCount,
  });
});

export default stats;

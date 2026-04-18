import { Hono } from "hono";

type Env = {
  Bindings: {
    DB: D1Database;
  };
};

const licenses = new Hono<Env>();

licenses.get("/", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  try {
    const { results } = await db
      .prepare(
        `SELECT l.id, l.key_hash, l.status, l.activated_at,
                u.username
         FROM licenses l
         LEFT JOIN user_scores u ON u.pro_key_hash = l.key_hash
         ORDER BY l.activated_at DESC
         LIMIT 200`
      )
      .all();

    return c.json(results ?? []);
  } catch {
    // licenses table or pro_key_hash column may not exist yet
    return c.json([]);
  }
});

export default licenses;

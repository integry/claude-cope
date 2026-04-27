import { Hono } from "hono";
import { maskHash } from "../utils/maskHash";

type Env = {
  Bindings: {
    DB: D1Database;
  };
};

const licenses = new Hono<Env>();

licenses.get("/", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  const { results } = await db
    .prepare(
      `SELECT l.id, l.key_hash, l.status, l.created_at, l.last_activated_at,
              u.username
       FROM licenses l
       LEFT JOIN user_scores u ON u.license_hash = l.key_hash
       ORDER BY l.created_at DESC
       LIMIT 200`
    )
    .all();

  // Mask credential-equivalent hashes before sending to the browser.
  const masked = (results ?? []).map((row: Record<string, unknown>) => ({
    ...row,
    key_hash: maskHash(row.key_hash as string | null),
  }));
  return c.json(masked);
});

export default licenses;

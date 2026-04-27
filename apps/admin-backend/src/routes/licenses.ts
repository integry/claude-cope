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

  const limit = Math.min(Math.max(parseInt(c.req.query("limit") || "50", 10) || 50, 1), 200);
  const offset = Math.max(parseInt(c.req.query("offset") || "0", 10) || 0, 0);

  const countRow = await db
    .prepare("SELECT COUNT(*) as total FROM licenses")
    .first<{ total: number }>();
  const total = countRow?.total ?? 0;

  const { results } = await db
    .prepare(
      `SELECT l.id, l.key_hash, l.status, l.created_at, l.last_activated_at,
              u.username
       FROM licenses l
       LEFT JOIN user_scores u ON u.license_hash = l.key_hash
       ORDER BY COALESCE(l.last_activated_at, l.created_at) DESC
       LIMIT ? OFFSET ?`
    )
    .bind(limit, offset)
    .all();

  // Mask credential-equivalent hashes before sending to the browser.
  const masked = (results ?? []).map((row: Record<string, unknown>) => ({
    ...row,
    key_hash: maskHash(row.key_hash as string | null),
  }));
  return c.json({ items: masked, total, limit, offset });
});

export default licenses;

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

  try {
    const { results } = await db
      .prepare(
        `SELECT l.id, l.key_hash, l.status, l.activated_at,
                u.username
         FROM licenses l
         LEFT JOIN user_scores u ON u.license_hash = l.key_hash
         ORDER BY l.activated_at DESC
         LIMIT 200`
      )
      .all();

    // Mask credential-equivalent hashes before sending to the browser.
    const masked = (results ?? []).map((row: Record<string, unknown>) => ({
      ...row,
      key_hash: maskHash(row.key_hash as string | null),
    }));
    return c.json(masked);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!msg.includes("no such column") && !msg.includes("no such table")) {
      throw err;
    }
    // licenses table or license_hash column may not exist yet.
    // Log so a broken migration doesn't masquerade as "no licenses yet".
    console.warn(`[admin/licenses] schema fallback (returning []): ${msg.slice(0, 200)}`);
    return c.json([]);
  }
});

export default licenses;

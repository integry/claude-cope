import { Hono } from "hono";
import { validatePolarKey } from "../utils/polar";
import { getQuotaLimits } from "../utils/quota";

type Env = {
  Bindings: {
    DB?: D1Database;
    QUOTA_KV?: KVNamespace;
    USAGE_KV?: KVNamespace;
    POLAR_ACCESS_TOKEN?: string;
    FREE_QUOTA_LIMIT?: string;
    PRO_INITIAL_QUOTA?: string;
  };
  Variables: {
    sessionId: string;
  };
};
const SHILL_CREDIT = 5;

async function hashKey(licenseKey: string): Promise<string> {
  const encoded = new TextEncoder().encode(licenseKey);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const account = new Hono<Env>();

account.post("/sync", async (c) => {
  const body = await c.req.json<{ licenseKey?: string; username?: string }>();

  if (!body.licenseKey) {
    return c.json({ error: "licenseKey is required" }, 400);
  }

  const accessToken = c.env?.POLAR_ACCESS_TOKEN;
  if (!accessToken) {
    return c.json({ error: "Polar integration is not configured" }, 500);
  }

  const validation = await validatePolarKey(body.licenseKey, accessToken);
  if (!validation.valid) {
    return c.json({ error: "Invalid or inactive license key", status: validation.status }, 403);
  }

  const kv = c.env?.QUOTA_KV ?? c.env?.USAGE_KV;
  if (!kv) {
    return c.json({ error: "KV storage is not configured" }, 500);
  }

  const hash = await hashKey(body.licenseKey);
  const kvKey = `polar:${hash}`;

  const limits = getQuotaLimits(c.env);
  await kv.put(kvKey, String(limits.proInitialQuota));

  // Record license activation in DB for admin purchase stats
  const db = c.env?.DB;
  if (db) {
    await db
      .prepare(
        "INSERT INTO licenses (key_hash, status) VALUES (?, 'active') ON CONFLICT(key_hash) DO UPDATE SET status = 'active', activated_at = datetime('now')"
      )
      .bind(hash)
      .run();

    // Link the license to the user so they appear as Max in the admin users list
    // immediately, rather than waiting for their first chat message
    if (body.username) {
      await db
        .prepare(
          "INSERT INTO user_scores (username, total_td, current_td, pro_key_hash) VALUES (?, 0, 0, ?) ON CONFLICT(username) DO UPDATE SET pro_key_hash = ?, updated_at = datetime('now')"
        )
        .bind(body.username, hash, hash)
        .run();
    }
  }

  return c.json({ success: true, hash });
});

account.post("/shill", async (c) => {
  const kv = c.env?.QUOTA_KV ?? c.env?.USAGE_KV;
  if (!kv) {
    return c.json({ error: "KV storage is not configured" }, 500);
  }

  const sessionId = c.get("sessionId");
  const shillKey = `shill:${sessionId}`;

  const alreadyShilled = await kv.get(shillKey);
  if (alreadyShilled) {
    return c.json({ error: "Shill credit already claimed" }, 409);
  }

  const usageKey = `free:${sessionId}`;
  const raw = await kv.get(usageKey);
  const current = raw !== null ? parseInt(raw, 10) : 0;
  const updated = Math.max(0, current - SHILL_CREDIT);

  await kv.put(usageKey, String(updated));
  await kv.put(shillKey, "1");

  return c.json({ success: true, creditsGranted: SHILL_CREDIT });
});

export default account;

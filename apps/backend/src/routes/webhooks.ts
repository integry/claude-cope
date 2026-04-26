import { Hono } from "hono";
import { verifyWebhookSignature } from "../utils/webhook";
import { hashKey } from "../utils/quota";
import { getQuotaLimits } from "../utils/quota";

type Env = {
  Bindings: {
    DB?: D1Database;
    QUOTA_KV?: KVNamespace;
    USAGE_KV?: KVNamespace;
    POLAR_WEBHOOK_SECRET?: string;
    FREE_QUOTA_LIMIT?: string;
    PRO_INITIAL_QUOTA?: string;
  };
};

const webhooks = new Hono<Env>();

async function handleBenefitGrantCreated(
  licenseKey: string,
  kv: KVNamespace,
  env: Env["Bindings"],
) {
  const hash = await hashKey(licenseKey);
  const kvKey = `polar:${hash}`;

  // Only initialize quota when the key is missing — a replay or re-grant must
  // not reset the user's remaining quota back to full. This mirrors the
  // guard in /sync.  If the license was previously revoked, restore the
  // saved remaining quota instead of granting a fresh allocation.
  const existingQuota = await kv.get(kvKey);
  if (existingQuota === null) {
    const revokedKey = `polar_revoked:${hash}`;
    const savedQuota = await kv.get(revokedKey);
    if (savedQuota !== null) {
      await kv.put(kvKey, savedQuota);
      await kv.delete(revokedKey);
    } else {
      const limits = getQuotaLimits(env);
      await kv.put(kvKey, String(limits.proInitialQuota));
    }
  }
  // Record the license in DB so admin views see all purchases, not just
  // those that were activated via /sync.
  const db = env?.DB;
  if (db) {
    await db
      .prepare(
        "INSERT INTO licenses (key_hash, status) VALUES (?, 'active') ON CONFLICT(key_hash) DO UPDATE SET status = 'active'",
      )
      .bind(hash)
      .run();
  }
}

async function handleBenefitGrantRevoked(
  licenseKey: string,
  kv: KVNamespace,
  env: Env["Bindings"],
) {
  const hash = await hashKey(licenseKey);
  const kvKey = `polar:${hash}`;
  // Preserve the remaining quota so a future reactivation restores it
  // instead of granting a fresh PRO_INITIAL_QUOTA.
  const remaining = await kv.get(kvKey);
  if (remaining !== null) {
    await kv.put(`polar_revoked:${hash}`, remaining);
  }
  await kv.delete(kvKey);
  // Mark the license as revoked but keep user_scores.license_hash intact
  // so a future reactivation can still find and restore the profile.
  const db = env?.DB;
  if (db) {
    await db
      .prepare("UPDATE licenses SET status = 'revoked' WHERE key_hash = ?")
      .bind(hash)
      .run();
  }
}

type WebhookEvent = {
  type: string;
  data?: { properties?: { license_key?: string } };
};

/**
 * DB-backed idempotency: the unique constraint on webhook_id prevents two
 * concurrent deliveries from both executing side effects.
 * Returns "duplicate" if already processed, "inserted" if claimed, or
 * "no_db" if the table/db is unavailable.
 */
async function claimWebhookIdempotency(
  db: D1Database | undefined,
  webhookId: string,
  eventType: string,
): Promise<"duplicate" | "inserted" | "no_db"> {
  if (!db) return "no_db";
  try {
    await db
      .prepare(
        "INSERT INTO processed_webhooks (webhook_id, event_type, processed_at) VALUES (?, ?, datetime('now'))",
      )
      .bind(webhookId, eventType)
      .run();
    return "inserted";
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("UNIQUE constraint failed") || msg.includes("already exists")) {
      return "duplicate";
    }
    if (msg.includes("no such table")) return "no_db";
    throw err;
  }
}

async function dispatchWebhookEvent(
  event: WebhookEvent,
  kv: KVNamespace,
  env: Env["Bindings"],
): Promise<void> {
  const licenseKey = event.data?.properties?.license_key;
  if (!licenseKey) return;
  if (event.type === "benefit_grant.created") {
    await handleBenefitGrantCreated(licenseKey, kv, env);
  } else if (event.type === "benefit_grant.revoked") {
    await handleBenefitGrantRevoked(licenseKey, kv, env);
  }
}

webhooks.post("/polar", async (c) => {
  const secret = c.env?.POLAR_WEBHOOK_SECRET;
  if (!secret) {
    return c.json({ error: "Webhook secret is not configured" }, 500);
  }

  const rawBody = await c.req.text();

  const webhookId = c.req.header("webhook-id");
  const webhookTimestamp = c.req.header("webhook-timestamp");
  const webhookSignature = c.req.header("webhook-signature");

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    return c.json({ error: "Missing webhook headers" }, 401);
  }

  try {
    await verifyWebhookSignature(
      rawBody,
      {
        "webhook-id": webhookId,
        "webhook-timestamp": webhookTimestamp,
        "webhook-signature": webhookSignature,
      },
      secret,
    );
  } catch {
    return c.json({ error: "Invalid signature" }, 401);
  }

  const kv = c.env?.QUOTA_KV ?? c.env?.USAGE_KV;
  if (!kv) {
    return c.json({ error: "KV storage is not configured" }, 500);
  }

  const event = JSON.parse(rawBody) as WebhookEvent;
  const db = c.env?.DB;

  const idempotencyResult = await claimWebhookIdempotency(db, webhookId, event.type);
  if (idempotencyResult === "duplicate") {
    return c.json({ received: true }, 200);
  }

  // Fallback KV-based idempotency for environments without the DB table.
  const idempotencyKey = `webhook:${webhookId}`;
  if (idempotencyResult === "no_db") {
    const existing = await kv.get(idempotencyKey);
    if (existing !== null) {
      return c.json({ received: true }, 200);
    }
  }

  try {
    await dispatchWebhookEvent(event, kv, c.env);
  } catch (err) {
    // Allow Polar to retry: remove the DB row so retries aren't blocked.
    if (db) {
      try {
        await db.prepare("DELETE FROM processed_webhooks WHERE webhook_id = ?").bind(webhookId).run();
      } catch { /* best-effort cleanup */ }
    }
    console.error(`[WEBHOOK] Failed to handle ${event.type}:`, err);
    return c.json({ error: "Processing failed" }, 500);
  }

  // Mark as processed in KV as well (24h TTL) for fast duplicate rejection.
  await kv.put(idempotencyKey, "1", { expirationTtl: 86400 });

  return c.json({ received: true }, 200);
});

export default webhooks;

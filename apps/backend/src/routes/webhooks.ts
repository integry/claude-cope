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

  const db = env?.DB;
  if (db) {
    await db
      .prepare(
        "INSERT INTO licenses (key_hash, status) VALUES (?, 'active') ON CONFLICT(key_hash) DO UPDATE SET status = 'active', last_activated_at = datetime('now')",
      )
      .bind(hash)
      .run();
  }

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
 * DB-backed idempotency: the UNIQUE constraint on webhook_id is the only
 * atomic primitive we have — it prevents two concurrent deliveries from
 * both executing side effects.  Returns "duplicate" if already processed,
 * "inserted" if the claim succeeded, or "no_db" if the table/db is
 * unavailable.  Callers MUST fail closed on "no_db" (return 500) so the
 * webhook provider retries once the database is reachable again.
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

async function verifyPolarHeaders(
  rawBody: string,
  headers: { id?: string; timestamp?: string; signature?: string },
  secret: string,
): Promise<string | null> {
  const { id, timestamp, signature } = headers;
  if (!id || !timestamp || !signature) return "Missing webhook headers";
  try {
    await verifyWebhookSignature(
      rawBody,
      {
        "webhook-id": id,
        "webhook-timestamp": timestamp,
        "webhook-signature": signature,
      },
      secret,
    );
    return null;
  } catch {
    return "Invalid signature";
  }
}

async function rollbackIdempotency(
  db: D1Database,
  webhookId: string,
): Promise<void> {
  try {
    await db.prepare("DELETE FROM processed_webhooks WHERE webhook_id = ?").bind(webhookId).run();
  } catch { /* best-effort cleanup */ }
}

webhooks.post("/polar", async (c) => {
  const secret = c.env?.POLAR_WEBHOOK_SECRET;
  if (!secret) {
    return c.json({ error: "Webhook secret is not configured" }, 500);
  }

  const rawBody = await c.req.text();

  const verifyError = await verifyPolarHeaders(
    rawBody,
    {
      id: c.req.header("webhook-id"),
      timestamp: c.req.header("webhook-timestamp"),
      signature: c.req.header("webhook-signature"),
    },
    secret,
  );
  if (verifyError) {
    return c.json({ error: verifyError }, 401);
  }

  const kv = c.env?.QUOTA_KV ?? c.env?.USAGE_KV;
  if (!kv) {
    return c.json({ error: "KV storage is not configured" }, 500);
  }

  const event = JSON.parse(rawBody) as WebhookEvent;
  const db = c.env?.DB;
  const webhookId = c.req.header("webhook-id")!;

  // Fast duplicate rejection via KV before hitting the DB.
  const idempotencyKey = `webhook:${webhookId}`;
  const alreadyProcessed = await kv.get(idempotencyKey);
  if (alreadyProcessed) {
    return c.json({ received: true }, 200);
  }

  const idempotencyResult = await claimWebhookIdempotency(db, webhookId, event.type);
  if (idempotencyResult === "duplicate") {
    return c.json({ received: true }, 200);
  }

  // Fail closed: without DB-backed idempotency we cannot guarantee
  // exactly-once processing. Return 500 so the webhook provider retries
  // once the database becomes available.
  if (idempotencyResult === "no_db") {
    console.error("[WEBHOOK] DB unavailable — rejecting to prevent non-atomic duplicate processing");
    return c.json({ error: "Idempotency store unavailable" }, 500);
  }

  try {
    await dispatchWebhookEvent(event, kv, c.env);
  } catch (err) {
    await rollbackIdempotency(db!, webhookId);
    console.error(`[WEBHOOK] Failed to handle ${event.type}:`, err);
    return c.json({ error: "Processing failed" }, 500);
  }

  // Mark as processed in KV (24h TTL) so the fast-path check above can
  // reject replays before the DB is even consulted.
  await kv.put(idempotencyKey, "1", { expirationTtl: 86400 });

  return c.json({ received: true }, 200);
});

export default webhooks;

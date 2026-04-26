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
  // guard in /sync.
  const existingQuota = await kv.get(kvKey);
  if (existingQuota === null) {
    const limits = getQuotaLimits(env);
    await kv.put(kvKey, String(limits.proInitialQuota));
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

webhooks.post("/polar", async (c) => {
  const secret = c.env?.POLAR_WEBHOOK_SECRET;
  if (!secret) {
    return c.json({ error: "Webhook secret is not configured" }, 500);
  }

  // Read raw body for signature verification
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

  // Best-effort idempotency check. The get-then-put is NOT atomic, so two
  // concurrent retries can both pass the read before either write lands.
  // For grant/revoke events this is acceptable: quota writes and DB upserts
  // are themselves idempotent. If stronger guarantees are needed, use a
  // DB-backed unique constraint on webhook_id instead.
  const idempotencyKey = `webhook:${webhookId}`;
  const existing = await kv.get(idempotencyKey);
  if (existing !== null) {
    return c.json({ received: true }, 200);
  }
  // Claim this webhook ID with a short TTL; extended to 24h after processing
  await kv.put(idempotencyKey, "processing", { expirationTtl: 300 });

  const event = JSON.parse(rawBody) as {
    type: string;
    data?: { properties?: { license_key?: string } };
  };

  const licenseKey = event.data?.properties?.license_key;

  if (event.type === "benefit_grant.created" && licenseKey) {
    await handleBenefitGrantCreated(licenseKey, kv, c.env);
  } else if (event.type === "benefit_grant.revoked" && licenseKey) {
    await handleBenefitGrantRevoked(licenseKey, kv, c.env);
  }

  // Store idempotency key with 24h TTL
  await kv.put(idempotencyKey, "1", { expirationTtl: 86400 });

  return c.json({ received: true }, 200);
});

export default webhooks;

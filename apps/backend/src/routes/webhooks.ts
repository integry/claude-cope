import { Hono } from "hono";
import { verifyWebhookSignature } from "../utils/webhook";
import { hashKey } from "../utils/quota";
import { getQuotaLimits } from "../utils/quota";

type Env = {
  Bindings: {
    QUOTA_KV?: KVNamespace;
    USAGE_KV?: KVNamespace;
    POLAR_WEBHOOK_SECRET?: string;
    FREE_QUOTA_LIMIT?: string;
    PRO_INITIAL_QUOTA?: string;
  };
};

const webhooks = new Hono<Env>();

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

  // Idempotency check
  const idempotencyKey = `webhook:${webhookId}`;
  const existing = await kv.get(idempotencyKey);
  if (existing !== null) {
    return c.json({ received: true }, 200);
  }

  const event = JSON.parse(rawBody) as {
    type: string;
    data?: { properties?: { license_key?: string } };
  };

  const licenseKey = event.data?.properties?.license_key;

  if (event.type === "benefit_grant.created" && licenseKey) {
    const hash = await hashKey(licenseKey);
    const kvKey = `polar:${hash}`;
    const limits = getQuotaLimits(c.env);
    await kv.put(kvKey, String(limits.proInitialQuota));
  } else if (event.type === "benefit_grant.revoked" && licenseKey) {
    const hash = await hashKey(licenseKey);
    const kvKey = `polar:${hash}`;
    await kv.delete(kvKey);
  }

  // Store idempotency key with 24h TTL
  await kv.put(idempotencyKey, "1", { expirationTtl: 86400 });

  return c.json({ received: true }, 200);
});

export default webhooks;

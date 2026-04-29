import type { MiddlewareHandler } from "hono";

export const botProtection: MiddlewareHandler = async (c, next) => {
  const secret = (c.env as { TURNSTILE_SECRET_KEY?: string } | undefined)?.TURNSTILE_SECRET_KEY;
  if (!secret) {
    await next();
    return;
  }

  const kv = (c.env as { USAGE_KV?: KVNamespace } | undefined);
  const usageKv = kv?.USAGE_KV;
  const sessionId = c.get("sessionId") as string | undefined;

  if (!sessionId) {
    return c.json({ error: "Session unavailable" }, 503);
  }

  if (!usageKv) {
    return c.json({ error: "Bot protection storage is not available" }, 503);
  }

  const isHuman = await usageKv.get(`human:${sessionId}`);
  if (!isHuman) {
    return c.json({ error: "Human verification required" }, 403);
  }

  await next();
};

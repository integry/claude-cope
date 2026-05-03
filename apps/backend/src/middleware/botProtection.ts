import type { MiddlewareHandler } from "hono";
import { BOT_PROTECTION_REASON, humanFlagKey } from "@claude-cope/shared/turnstile";

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
    return c.json({ error: "Session unavailable", reason: BOT_PROTECTION_REASON.SESSION_UNAVAILABLE }, 503);
  }

  if (!usageKv) {
    return c.json({ error: "Bot protection storage is not available", reason: BOT_PROTECTION_REASON.STORAGE_UNAVAILABLE }, 503);
  }

  let isHuman: string | null;
  try {
    isHuman = await usageKv.get(humanFlagKey(sessionId));
  } catch (e) {
    console.error("KV read error in bot protection", e);
    return c.json({ error: "Verification check failed", reason: BOT_PROTECTION_REASON.VERIFICATION_CHECK_FAILED }, 503);
  }
  if (!isHuman) {
    return c.json({ error: "Human verification required", reason: BOT_PROTECTION_REASON.HUMAN_VERIFICATION_REQUIRED }, 403);
  }

  await next();
};

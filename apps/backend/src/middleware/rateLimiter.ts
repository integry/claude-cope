import type { MiddlewareHandler } from "hono";
import { getClientIp } from "../utils/clientIp";
import { resolveRequestIdentity, hashIp, hashIpDaily } from "../utils/identity";
import { capturePostHogEvent } from "../utils/posthog";
import { checkRateLimits, checkSimpleRateLimit } from "../utils/rateLimitBuckets";

export { getClientIp } from "../utils/clientIp";

export const createKvRateLimiter = (
  keyPrefix: string,
  limit = 100,
  windowSeconds = 60,
  opts?: { keyStrategy?: "ip" | "session" },
): MiddlewareHandler => async (c, next) => {
  const env = c.env as Record<string, unknown>;
  const kv = env.RATE_LIMIT_KV as KVNamespace | undefined;
  if (!kv) return next();

  const pepper = env.IP_HASH_PEPPER as string | undefined;

  let check;
  try {
    let suffix: string;
    if (opts?.keyStrategy === "ip") {
      if (!pepper) {
        console.error(`MISCONFIGURATION: RATE_LIMIT_KV is bound but IP_HASH_PEPPER is missing. ${keyPrefix} rate limiting is disabled (fail-closed 503). Set IP_HASH_PEPPER via \`wrangler secret put IP_HASH_PEPPER\`.`);
        return c.json(
          { error: "Service temporarily unavailable. Please try again later." },
          503,
        );
      }
      suffix = await hashIp(getClientIp(c.req), pepper);
    } else {
      const sessionId = c.get("sessionId") as string | undefined;
      if (sessionId) {
        suffix = sessionId;
      } else if (pepper) {
        suffix = await hashIpDaily(getClientIp(c.req), pepper);
      } else {
        return next();
      }
    }

    check = await checkSimpleRateLimit(kv, `rl:${keyPrefix}${suffix}`, { limit, windowSeconds });
  } catch (err) {
    console.error(`Rate-limit check failed for ${keyPrefix} (fail-closed 503).`, err);
    return c.json(
      { error: "Service temporarily unavailable. Please try again later." },
      503,
    );
  }

  if (!check.allowed) {
    const retryAfterSeconds = check.retryAfterSeconds ?? windowSeconds;
    c.header("Retry-After", String(retryAfterSeconds));
    return c.json(
      { error: "Too many requests. Please try again later.", retryAfterSeconds },
      429,
    );
  }

  return next();
};

let kvWarningLogged = false;
let pepperWarningLogged = false;

export const rateLimiter: MiddlewareHandler = async (c, next) => {
  const env = c.env as Record<string, unknown>;
  const kv = env.RATE_LIMIT_KV as KVNamespace | undefined;

  if (!kv) {
    if (!kvWarningLogged) {
      console.warn("RATE_LIMIT_KV not configured – /api/chat rate limiting disabled (fail-open). WAF rules are the only backstop.");
      kvWarningLogged = true;
    }
    return next();
  }

  const pepper = env.IP_HASH_PEPPER as string | undefined;
  if (!pepper) {
    if (!pepperWarningLogged) {
      console.error("MISCONFIGURATION: RATE_LIMIT_KV is bound but IP_HASH_PEPPER is missing. Chat rate limiting is disabled (fail-closed 503). Set IP_HASH_PEPPER via `wrangler secret put IP_HASH_PEPPER`.");
      pepperWarningLogged = true;
    }
    return c.json(
      { error: "Service temporarily unavailable. Please try again later." },
      503,
    );
  }

  let identity;
  let result;

  try {
    const rawSessionId = c.get("sessionId") as string | undefined;
    const ip = getClientIp(c.req);
    const ipHash = await hashIpDaily(ip, pepper);
    const sessionId = rawSessionId || `ip:${ipHash}`;
    identity = await resolveRequestIdentity(sessionId, c.req, pepper, ipHash);

    result = await checkRateLimits(kv, {
      ip: identity.ip_hash,
      identity: identity.cope_id,
    });
  } catch (err) {
    console.error("Rate-limit evaluation failed (fail-closed 503).", err);
    return c.json(
      { error: "Service temporarily unavailable. Please try again later." },
      503,
    );
  }

  if (result.blocked) {
    if (result.shouldTrack) {
      const telemetry = capturePostHogEvent(
        env as { POSTHOG_API_KEY?: string; POSTHOG_HOST?: string },
        {
          event: "Rate_Limit_Triggered",
          distinct_id: identity.cope_id,
          properties: {
            limit_type: result.bucket,
            asn: identity.asn,
            country: identity.country,
          },
        },
      ).catch((err) => {
        console.warn("PostHog telemetry capture failed:", err);
      });

      try {
        c.executionCtx.waitUntil(telemetry);
      } catch {
        // No execution context (e.g. test environment) — fire and forget
      }
    }

    const retryAfterSeconds = Math.ceil(result.retryAfterMs / 1000);
    c.header("Retry-After", String(retryAfterSeconds));
    return c.json(
      {
        limitType: result.bucket,
        message: result.lore,
        retryAfterSeconds,
      },
      429,
    );
  }

  return next();
};

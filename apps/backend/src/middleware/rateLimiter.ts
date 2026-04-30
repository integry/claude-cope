import type { MiddlewareHandler } from "hono";
import { getClientIp } from "../utils/clientIp";
import { resolveRequestIdentity } from "../utils/identity";
import { capturePostHogEvent } from "../utils/posthog";
import { checkRateLimits } from "../utils/rateLimitBuckets";
import { isLicenseActive } from "../utils/profile";

export { getClientIp } from "../utils/clientIp";

type RateLimitContext = {
  req: { header: (name: string) => string | undefined };
  env: Record<string, unknown>;
  json: (body: unknown, status?: number) => Response;
};

export async function enforceRateLimit(
  c: RateLimitContext,
  keyPrefix = "",
): Promise<Response | null> {
  const ip = getClientIp(c.req);
  const limiter = c.env.RATE_LIMITER as
    | { limit: (opts: { key: string }) => Promise<{ success: boolean }> }
    | undefined;

  if (!limiter) return null;

  const { success } = await limiter.limit({ key: `${keyPrefix}${ip}` });
  if (!success) {
    return c.json(
      { error: "Too many requests. Please try again later." },
      429,
    );
  }

  return null;
}

export const createRateLimiter = (keyPrefix = ""): MiddlewareHandler => async (c, next) => {
  const blocked = await enforceRateLimit(c as unknown as RateLimitContext, keyPrefix);
  if (blocked) return blocked;

  await next();
};

let kvWarningLogged = false;

export const rateLimiter: MiddlewareHandler = async (c, next) => {
  const env = c.env as Record<string, unknown>;
  const kv = env.RATE_LIMIT_KV as KVNamespace | undefined;

  if (!kv) {
    if (!kvWarningLogged) {
      console.warn("RATE_LIMIT_KV not configured – rate limiting disabled");
      kvWarningLogged = true;
    }
    return next();
  }

  try {
    const body = await c.req.raw.clone().json() as Record<string, unknown>;
    if (body?.proKeyHash && typeof body.proKeyHash === "string") {
      const db = env.DB as D1Database | undefined;
      if (db && await isLicenseActive(db, body.proKeyHash)) {
        return next();
      }
    }
  } catch {
    // Body parsing failed – continue with rate limiting
  }

  const sessionId = (c.get("sessionId") as string) || "anonymous";
  const pepper = (env.IP_HASH_PEPPER as string) || undefined;
  const identity = await resolveRequestIdentity(sessionId, c.req, pepper);

  const result = await checkRateLimits(kv, {
    ip: identity.ip_hash,
    identity: identity.cope_id,
  });

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
      ).catch(() => {});

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

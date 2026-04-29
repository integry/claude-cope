import type { MiddlewareHandler } from "hono";
import { resolveRequestIdentity } from "../utils/identity";
import { checkRateLimits } from "../utils/rateLimitBuckets";

type RateLimitContext = {
  req: { header: (name: string) => string | undefined };
  env: Record<string, unknown>;
  json: (body: unknown, status?: number) => Response;
};

export function getClientIp(headers: { header: (name: string) => string | undefined }): string {
  const cfIp = headers.header("cf-connecting-ip");
  if (cfIp) return cfIp;

  return (
    headers.header("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.header("x-real-ip") ??
    "unknown"
  );
}

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

export const rateLimiter: MiddlewareHandler = async (c, next) => {
  const env = c.env as Record<string, unknown>;
  const kv = env.RATE_LIMIT_KV as KVNamespace | undefined;

  if (!kv) {
    console.warn("RATE_LIMIT_KV not configured – rate limiting disabled");
    return next();
  }

  try {
    const body = await c.req.raw.clone().json() as Record<string, unknown>;
    if (body?.proKeyHash) {
      return next();
    }
  } catch {
    // Body parsing failed – continue with rate limiting
  }

  const sessionId = (c.get("sessionId") as string) || "anonymous";
  const identity = await resolveRequestIdentity(sessionId, c.req);

  const result = await checkRateLimits(kv, {
    ip: identity.ip_hash,
    identity: identity.cope_id,
  });

  if (result.blocked) {
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

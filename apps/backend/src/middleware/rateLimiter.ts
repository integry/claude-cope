import type { MiddlewareHandler } from "hono";
import { checkRateLimits } from "../utils/rateLimitBuckets";
import { hashIpDaily } from "../utils/identity";

type RateLimitContext = {
  req: { header: (name: string) => string | undefined };
  env: Record<string, unknown>;
  json: (body: unknown, status?: number) => Response;
};

// cf-connecting-ip is set by Cloudflare and cannot be spoofed by clients.
// x-forwarded-for / x-real-ip are only used as fallback for local dev
// where no Cloudflare proxy is present. In production Workers deployments,
// cf-connecting-ip is always present so the fallback never triggers.
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

export const rateLimiter = createRateLimiter();

export const kvRateLimiter: MiddlewareHandler = async (c, next) => {
  const env = c.env as Record<string, unknown>;
  const kv = env.RATE_LIMIT_KV as KVNamespace | undefined;
  if (!kv) return next();

  const ip = getClientIp(c.req);
  const sessionId = c.get("sessionId") as string | undefined;
  const ipHash = await hashIpDaily(ip);
  const identity = sessionId || ipHash;

  const result = await checkRateLimits(kv, { ip: ipHash, identity });

  if (result.blocked) {
    const retryAfterSeconds = Math.ceil(result.retryAfterMs / 1000);
    c.header("Retry-After", String(retryAfterSeconds));

    if (result.shouldTrack) {
      console.log(
        `[RATE_LIMIT] bucket=${result.bucket} retryAfterMs=${result.retryAfterMs}`,
      );
    }

    return c.json(
      {
        error: result.lore,
        bucket: result.bucket,
        retryAfterMs: result.retryAfterMs,
      },
      429,
    );
  }

  await next();
};

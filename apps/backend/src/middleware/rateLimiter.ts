import type { MiddlewareHandler } from "hono";

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

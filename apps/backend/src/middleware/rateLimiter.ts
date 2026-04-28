import type { MiddlewareHandler } from "hono";

export function getClientIp(headers: { header: (name: string) => string | undefined }): string {
  return (
    headers.header("cf-connecting-ip") ??
    headers.header("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.header("x-real-ip") ??
    "unknown"
  );
}

export async function enforceRateLimit(
  c: {
    req: { header: (name: string) => string | undefined };
    env: Record<string, unknown>;
    json: (body: unknown, status?: number) => Response;
  },
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

export const rateLimiter: MiddlewareHandler = async (c, next) => {
  const blocked = await enforceRateLimit(c as unknown as {
    req: { header: (name: string) => string | undefined };
    env: Record<string, unknown>;
    json: (body: unknown, status?: number) => Response;
  });
  if (blocked) return blocked;

  await next();
};

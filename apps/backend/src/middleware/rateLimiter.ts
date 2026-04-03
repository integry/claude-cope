import type { MiddlewareHandler } from "hono";

export const rateLimiter: MiddlewareHandler = async (c, next) => {
  const ip =
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
    c.req.header("x-real-ip") ??
    "unknown";

  const limiter = (c.env as Record<string, unknown>).RATE_LIMITER as
    | { limit: (opts: { key: string }) => Promise<{ success: boolean }> }
    | undefined;

  if (limiter) {
    const { success } = await limiter.limit({ key: ip });
    if (!success) {
      return c.json(
        { error: "Too many requests. Please try again later." },
        429,
      );
    }
  }

  await next();
};

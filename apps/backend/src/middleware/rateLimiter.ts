import type { MiddlewareHandler } from "hono";

const MAX_REQUESTS = 10;
const WINDOW_MS = 60_000; // 1 minute

interface RequestRecord {
  count: number;
  resetTime: number;
}

const clients = new Map<string, RequestRecord>();

export const rateLimiter: MiddlewareHandler = async (c, next) => {
  const ip =
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
    c.req.header("x-real-ip") ??
    "unknown";

  const now = Date.now();
  const record = clients.get(ip);

  if (!record || now >= record.resetTime) {
    clients.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    await next();
    return;
  }

  if (record.count >= MAX_REQUESTS) {
    return c.json({ error: "Too many requests. Please try again later." }, 429);
  }

  record.count++;
  await next();
};

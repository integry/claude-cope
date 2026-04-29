import { describe, it, expect, vi } from "vitest";
import app from "../app";
import { BUCKETS, LORE } from "../utils/rateLimitBuckets";
import { hashIpDaily } from "../utils/identity";

function createMockLimiter(success: boolean) {
  return {
    limit: vi.fn().mockResolvedValue({ success }),
  };
}

function mockRateLimitKV(store: Record<string, string> = {}) {
  return {
    get: vi.fn(async (key: string) => store[key] ?? null),
    put: vi.fn(async (key: string, value: string) => {
      store[key] = value;
    }),
  };
}

function chatRequest(
  env: Record<string, unknown>,
  headers: Record<string, string> = {},
) {
  return app.request(
    "/api/chat",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({ message: "hello" }),
    },
    env,
  );
}

describe("rateLimiter middleware", () => {
  it("returns 200 when rate limit is not exceeded", async () => {
    const limiter = createMockLimiter(true);
    const res = await chatRequest(
      { ALLOWED_ORIGINS: "http://localhost:5173", RATE_LIMITER: limiter },
      { "x-forwarded-for": "1.2.3.4" },
    );

    expect(res.status).not.toBe(429);
    expect(limiter.limit).toHaveBeenCalledWith({ key: "1.2.3.4" });
  });

  it("returns 429 when rate limit is exceeded", async () => {
    const limiter = createMockLimiter(false);
    const res = await chatRequest(
      { ALLOWED_ORIGINS: "http://localhost:5173", RATE_LIMITER: limiter },
      { "x-forwarded-for": "1.2.3.4" },
    );

    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body).toEqual({ error: "Too many requests. Please try again later." });
    expect(limiter.limit).toHaveBeenCalledWith({ key: "1.2.3.4" });
  });

  it("prioritizes cf-connecting-ip over x-forwarded-for", async () => {
    const limiter = createMockLimiter(true);
    await chatRequest(
      { ALLOWED_ORIGINS: "http://localhost:5173", RATE_LIMITER: limiter },
      {
        "cf-connecting-ip": "9.9.9.9",
        "x-forwarded-for": "1.2.3.4",
        "x-real-ip": "5.6.7.8",
      },
    );

    expect(limiter.limit).toHaveBeenCalledWith({ key: "9.9.9.9" });
  });

  it("uses x-real-ip when x-forwarded-for is absent", async () => {
    const limiter = createMockLimiter(true);
    await chatRequest(
      { ALLOWED_ORIGINS: "http://localhost:5173", RATE_LIMITER: limiter },
      { "x-real-ip": "5.6.7.8" },
    );

    expect(limiter.limit).toHaveBeenCalledWith({ key: "5.6.7.8" });
  });

  it("uses first IP from x-forwarded-for when multiple are present", async () => {
    const limiter = createMockLimiter(true);
    await chatRequest(
      { ALLOWED_ORIGINS: "http://localhost:5173", RATE_LIMITER: limiter },
      { "x-forwarded-for": "10.0.0.1, 10.0.0.2, 10.0.0.3" },
    );

    expect(limiter.limit).toHaveBeenCalledWith({ key: "10.0.0.1" });
  });

  it("falls back to 'unknown' when no IP headers are present", async () => {
    const limiter = createMockLimiter(true);
    await chatRequest({
      ALLOWED_ORIGINS: "http://localhost:5173",
      RATE_LIMITER: limiter,
    });

    expect(limiter.limit).toHaveBeenCalledWith({ key: "unknown" });
  });

  it("allows requests through when RATE_LIMITER binding is not configured", async () => {
    const res = await chatRequest({
      ALLOWED_ORIGINS: "http://localhost:5173",
    });

    expect(res.status).not.toBe(429);
  });
});

describe("kvRateLimiter middleware", () => {
  it("allows requests when RATE_LIMIT_KV is not configured", async () => {
    const res = await chatRequest({
      ALLOWED_ORIGINS: "http://localhost:5173",
    });

    expect(res.status).not.toBe(429);
  });

  it("allows requests when all buckets are under their limits", async () => {
    const kv = mockRateLimitKV();
    const res = await chatRequest({
      ALLOWED_ORIGINS: "http://localhost:5173",
      RATE_LIMIT_KV: kv,
    });

    expect(res.status).not.toBe(429);
  });

  it("returns 429 with Retry-After header when an IP bucket is exceeded", async () => {
    const testIp = "1.2.3.4";
    const ipHash = await hashIpDaily(testIp);
    const ipBurst = BUCKETS.find((b) => b.name === "ip_burst")!;
    const now = Date.now();

    const store: Record<string, string> = {};
    store[`${ipBurst.keyPrefix}${ipHash}`] = JSON.stringify({
      count: ipBurst.limit,
      expiresAt: now + 60_000,
    });

    const kv = mockRateLimitKV(store);
    const res = await chatRequest(
      { ALLOWED_ORIGINS: "http://localhost:5173", RATE_LIMIT_KV: kv },
      { "x-forwarded-for": testIp },
    );

    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBeTruthy();
    const retryAfter = parseInt(res.headers.get("Retry-After")!, 10);
    expect(retryAfter).toBeGreaterThan(0);

    const body = (await res.json()) as { error: string; bucket: string; retryAfterMs: number };
    expect(body.bucket).toBe("ip_burst");
    expect(body.retryAfterMs).toBeGreaterThan(0);
    expect(body.error).toBe(LORE.ip_burst);
  });

  it("returns bucket name and lore in the 429 response body", async () => {
    const testIp = "5.6.7.8";
    const ipHash = await hashIpDaily(testIp);
    const swarm = BUCKETS.find((b) => b.name === "swarm")!;
    const now = Date.now();

    const store: Record<string, string> = {};
    store[`${swarm.keyPrefix}${ipHash}`] = JSON.stringify({
      count: swarm.limit,
      expiresAt: now + 120_000,
    });

    const kv = mockRateLimitKV(store);
    const res = await chatRequest(
      { ALLOWED_ORIGINS: "http://localhost:5173", RATE_LIMIT_KV: kv },
      { "x-forwarded-for": testIp },
    );

    expect(res.status).toBe(429);
    const body = (await res.json()) as { error: string; bucket: string };
    expect(body.bucket).toBe("swarm");
    expect(body.error).toBe(LORE.swarm);
  });

  it("Cloudflare rate limiter blocks before KV rate limiter runs", async () => {
    const limiter = createMockLimiter(false);
    const kv = mockRateLimitKV();

    const res = await chatRequest({
      ALLOWED_ORIGINS: "http://localhost:5173",
      RATE_LIMITER: limiter,
      RATE_LIMIT_KV: kv,
    });

    expect(res.status).toBe(429);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("Too many requests. Please try again later.");
    expect(kv.get).not.toHaveBeenCalled();
  });
});

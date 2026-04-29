import { describe, it, expect, vi, beforeEach } from "vitest";
import app from "../app";

function createMockKV(counters: Map<string, string> = new Map()) {
  return {
    get: vi.fn(async (key: string) => counters.get(key) ?? null),
    put: vi.fn(async (key: string, value: string) => {
      counters.set(key, value);
    }),
  };
}

function makeEnv(overrides: Record<string, unknown> = {}) {
  return { ALLOWED_ORIGINS: "http://localhost:5173", ...overrides };
}

describe("rateLimiter middleware (hybrid KV)", () => {
  let kv: ReturnType<typeof createMockKV>;

  beforeEach(() => {
    kv = createMockKV();
  });

  it("allows requests through when RATE_LIMIT_KV is not configured (fail open)", async () => {
    const res = await app.request(
      "/api/chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "hello" }),
      },
      makeEnv(),
    );

    expect(res.status).not.toBe(429);
  });

  it("allows requests when under rate limit", async () => {
    const res = await app.request(
      "/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "1.2.3.4",
        },
        body: JSON.stringify({ message: "hello" }),
      },
      makeEnv({ RATE_LIMIT_KV: kv }),
    );

    expect(res.status).not.toBe(429);
    expect(kv.put).toHaveBeenCalled();
  });

  it("bypasses rate limiter when proKeyHash is present", async () => {
    const res = await app.request(
      "/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "1.2.3.4",
        },
        body: JSON.stringify({ message: "hello", proKeyHash: "abc123" }),
      },
      makeEnv({ RATE_LIMIT_KV: kv }),
    );

    expect(res.status).not.toBe(429);
    expect(kv.get).not.toHaveBeenCalled();
  });

  it("returns structured 429 when rate limit is exceeded", async () => {
    const counters = new Map<string, string>();
    const hotKv = createMockKV(counters);

    const headers = {
      "Content-Type": "application/json",
      "x-forwarded-for": "1.2.3.4",
      Cookie: "cope_session_id=fixed-session",
    };

    // burst bucket: 10 requests in 60s window (identity-based)
    for (let i = 0; i < 10; i++) {
      await app.request(
        "/api/chat",
        {
          method: "POST",
          headers,
          body: JSON.stringify({ message: "hello" }),
        },
        makeEnv({ RATE_LIMIT_KV: hotKv }),
      );
    }

    // 11th request should be blocked
    const res = await app.request(
      "/api/chat",
      {
        method: "POST",
        headers,
        body: JSON.stringify({ message: "hello" }),
      },
      makeEnv({ RATE_LIMIT_KV: hotKv }),
    );

    expect(res.status).toBe(429);
    const body = (await res.json()) as { limitType: string; message: string; retryAfterSeconds: number };
    expect(body.limitType).toBeDefined();
    expect(body.message).toBeDefined();
    expect(body.retryAfterSeconds).toBeGreaterThan(0);
    expect(res.headers.get("Retry-After")).toBeDefined();
  });

  it("does not bypass rate limiter when proKeyHash is falsy", async () => {
    const res = await app.request(
      "/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "1.2.3.4",
        },
        body: JSON.stringify({ message: "hello", proKeyHash: "" }),
      },
      makeEnv({ RATE_LIMIT_KV: kv }),
    );

    expect(res.status).not.toBe(429);
    // KV should have been consulted (not bypassed)
    expect(kv.get).toHaveBeenCalled();
  });
});

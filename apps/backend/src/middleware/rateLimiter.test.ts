import { describe, it, expect, vi, beforeEach } from "vitest";
import { BUCKETS, LORE, type BucketName } from "../utils/rateLimitBuckets";
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

  it("bypasses rate limiter with proKeyHash even when limit would be exceeded", async () => {
    const counters = new Map<string, string>();
    const hotKv = createMockKV(counters);

    const headers = {
      "Content-Type": "application/json",
      "x-forwarded-for": "1.2.3.4",
      Cookie: "cope_session_id=fixed-session",
    };

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

    const res = await app.request(
      "/api/chat",
      {
        method: "POST",
        headers,
        body: JSON.stringify({ message: "hello", proKeyHash: "pro-user-key" }),
      },
      makeEnv({ RATE_LIMIT_KV: hotKv }),
    );

    expect(res.status).not.toBe(429);
  });

  describe("lore 429 response shape", () => {
    async function exhaust(
      hotKv: ReturnType<typeof createMockKV>,
      count: number,
    ) {
      const headers = {
        "Content-Type": "application/json",
        "x-forwarded-for": "1.2.3.4",
        Cookie: "cope_session_id=fixed-session",
      };
      for (let i = 0; i < count; i++) {
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
      return app.request(
        "/api/chat",
        {
          method: "POST",
          headers,
          body: JSON.stringify({ message: "hello" }),
        },
        makeEnv({ RATE_LIMIT_KV: hotKv }),
      );
    }

    it("returns limitType matching a valid bucket name", async () => {
      const counters = new Map<string, string>();
      const hotKv = createMockKV(counters);
      const burst = BUCKETS.find((b) => b.name === "burst")!;

      const res = await exhaust(hotKv, burst.limit);
      expect(res.status).toBe(429);

      const body = (await res.json()) as { limitType: string };
      const validBucketNames = BUCKETS.map((b) => b.name);
      expect(validBucketNames).toContain(body.limitType);
    });

    it("returns message matching the LORE entry for the triggered bucket", async () => {
      const counters = new Map<string, string>();
      const hotKv = createMockKV(counters);
      const burst = BUCKETS.find((b) => b.name === "burst")!;

      const res = await exhaust(hotKv, burst.limit);
      expect(res.status).toBe(429);

      const body = (await res.json()) as { limitType: BucketName; message: string };
      expect(body.message).toBe(LORE[body.limitType]);
    });

    it("sets Retry-After header matching retryAfterSeconds in body", async () => {
      const counters = new Map<string, string>();
      const hotKv = createMockKV(counters);
      const burst = BUCKETS.find((b) => b.name === "burst")!;

      const res = await exhaust(hotKv, burst.limit);
      expect(res.status).toBe(429);

      const body = (await res.json()) as { retryAfterSeconds: number };
      const headerVal = res.headers.get("Retry-After");
      expect(headerVal).toBe(String(body.retryAfterSeconds));
    });

    it("does not include the old generic error field", async () => {
      const counters = new Map<string, string>();
      const hotKv = createMockKV(counters);
      const burst = BUCKETS.find((b) => b.name === "burst")!;

      const res = await exhaust(hotKv, burst.limit);
      expect(res.status).toBe(429);

      const body = (await res.json()) as Record<string, unknown>;
      expect(body.error).toBeUndefined();
      expect(body).toHaveProperty("limitType");
      expect(body).toHaveProperty("message");
      expect(body).toHaveProperty("retryAfterSeconds");
    });
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
    expect(kv.get).toHaveBeenCalled();
  });
});

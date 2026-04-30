import { describe, it, expect, vi } from "vitest";
import { checkRateLimits, BUCKETS, LORE } from "./rateLimitBuckets";

function mockKV(store: Record<string, string> = {}) {
  const ttls: Record<string, number> = {};
  return {
    get: vi.fn(async (key: string) => store[key] ?? null),
    put: vi.fn(async (key: string, value: string, opts?: { expirationTtl?: number }) => {
      store[key] = value;
      if (opts?.expirationTtl) ttls[key] = opts.expirationTtl;
    }),
    _ttls: ttls,
  } as unknown as KVNamespace & { _ttls: Record<string, number> };
}

const KEYS = { ip: "10.0.0.1", identity: "sess-abc" };

describe("checkRateLimits", () => {
  it("returns blocked: false when all buckets are under their limits", async () => {
    const kv = mockKV();
    const result = await checkRateLimits(kv, KEYS, 1000);
    expect(result.blocked).toBe(false);
  });

  it("increments counters for every bucket on a single call", async () => {
    const store: Record<string, string> = {};
    const kv = mockKV(store);
    await checkRateLimits(kv, KEYS, 1000);

    for (const bucket of BUCKETS) {
      const id = bucket.keyType === "ip" ? KEYS.ip : KEYS.identity;
      const key = `${bucket.keyPrefix}${id}`;
      const state = JSON.parse(store[key]);
      expect(state.count).toBe(1);
    }
  });

  it("preserves the original expiresAt on subsequent increments", async () => {
    const store: Record<string, string> = {};
    const kv = mockKV(store);
    const firstTs = 1000;
    await checkRateLimits(kv, KEYS, firstTs);

    const burstKey = `rl:burst:${KEYS.identity}`;
    const first = JSON.parse(store[burstKey]);
    const originalExpiry = first.expiresAt;

    await checkRateLimits(kv, KEYS, firstTs + 5000);
    const second = JSON.parse(store[burstKey]);
    expect(second.expiresAt).toBe(originalExpiry);
    expect(second.count).toBe(2);
  });

  it("starts a new window after the previous one expires", async () => {
    const store: Record<string, string> = {};
    const kv = mockKV(store);

    const burstBucket = BUCKETS.find((b) => b.name === "burst")!;
    await checkRateLimits(kv, KEYS, 1000);

    const burstKey = `rl:burst:${KEYS.identity}`;
    const first = JSON.parse(store[burstKey]);

    const afterExpiry = first.expiresAt + 1;
    await checkRateLimits(kv, KEYS, afterExpiry);
    const renewed = JSON.parse(store[burstKey]);
    expect(renewed.count).toBe(1);
    expect(renewed.expiresAt).toBe(afterExpiry + burstBucket.windowSeconds * 1000);
  });

  describe("blocking behavior", () => {
    async function fillBucket(
      store: Record<string, string>,
      bucketName: string,
      count: number,
      expiresAt: number,
    ) {
      const bucket = BUCKETS.find((b) => b.name === bucketName)!;
      const id = bucket.keyType === "ip" ? KEYS.ip : KEYS.identity;
      const key = `${bucket.keyPrefix}${id}`;
      store[key] = JSON.stringify({ count, expiresAt });
    }

    it("blocks and returns shouldTrack: true on the threshold-crossing request", async () => {
      const store: Record<string, string> = {};
      const now = 100_000;
      const burstBucket = BUCKETS.find((b) => b.name === "burst")!;
      fillBucket(store, "burst", burstBucket.limit, now + 30_000);

      const kv = mockKV(store);
      const result = await checkRateLimits(kv, KEYS, now);

      expect(result.blocked).toBe(true);
      if (result.blocked) {
        expect(result.bucket).toBe("burst");
        expect(result.shouldTrack).toBe(true);
        expect(result.retryAfterMs).toBe(30_000);
        expect(result.lore).toBe(LORE.burst);
      }
    });

    it("returns shouldTrack: false on subsequent blocked requests", async () => {
      const store: Record<string, string> = {};
      const now = 100_000;
      const burstBucket = BUCKETS.find((b) => b.name === "burst")!;
      fillBucket(store, "burst", burstBucket.limit + 1, now + 30_000);

      const kv = mockKV(store);
      const result = await checkRateLimits(kv, KEYS, now);

      expect(result.blocked).toBe(true);
      if (result.blocked) {
        expect(result.shouldTrack).toBe(false);
      }
    });

    it("second blocked request in the same window does not set shouldTrack", async () => {
      const store: Record<string, string> = {};
      const now = 100_000;
      const burstBucket = BUCKETS.find((b) => b.name === "burst")!;
      fillBucket(store, "burst", burstBucket.limit, now + 30_000);

      const kv = mockKV(store);

      const first = await checkRateLimits(kv, KEYS, now);
      expect(first.blocked).toBe(true);
      if (first.blocked) expect(first.shouldTrack).toBe(true);

      const second = await checkRateLimits(kv, KEYS, now + 1000);
      expect(second.blocked).toBe(true);
      if (second.blocked) expect(second.shouldTrack).toBe(false);
    });

    it("returns the first triggered bucket when multiple are exceeded", async () => {
      const store: Record<string, string> = {};
      const now = 100_000;

      const swarmBucket = BUCKETS.find((b) => b.name === "swarm")!;
      const burstBucket = BUCKETS.find((b) => b.name === "burst")!;
      fillBucket(store, "swarm", swarmBucket.limit, now + 60_000);
      fillBucket(store, "burst", burstBucket.limit, now + 30_000);

      const kv = mockKV(store);
      const result = await checkRateLimits(kv, KEYS, now);

      expect(result.blocked).toBe(true);
      if (result.blocked) {
        expect(result.bucket).toBe("swarm");
      }
    });
  });

  describe("bucket evaluation order", () => {
    it("checks swarm before ip_burst", async () => {
      const store: Record<string, string> = {};
      const now = 100_000;
      const swarm = BUCKETS.find((b) => b.name === "swarm")!;
      const ipBurst = BUCKETS.find((b) => b.name === "ip_burst")!;

      fillBucket(store, "swarm", swarm.limit, now + 60_000);
      fillBucket(store, "ip_burst", ipBurst.limit, now + 60_000);

      const kv = mockKV(store);
      const result = await checkRateLimits(kv, KEYS, now);

      expect(result.blocked).toBe(true);
      if (result.blocked) expect(result.bucket).toBe("swarm");

      function fillBucket(
        s: Record<string, string>,
        name: string,
        count: number,
        expiresAt: number,
      ) {
        const b = BUCKETS.find((x) => x.name === name)!;
        const id = b.keyType === "ip" ? KEYS.ip : KEYS.identity;
        s[`${b.keyPrefix}${id}`] = JSON.stringify({ count, expiresAt });
      }
    });

    it("checks ip_burst before burst", async () => {
      const store: Record<string, string> = {};
      const now = 100_000;

      const ipBurst = BUCKETS.find((b) => b.name === "ip_burst")!;
      store[`${ipBurst.keyPrefix}${KEYS.ip}`] = JSON.stringify({
        count: ipBurst.limit,
        expiresAt: now + 60_000,
      });

      const burst = BUCKETS.find((b) => b.name === "burst")!;
      store[`${burst.keyPrefix}${KEYS.identity}`] = JSON.stringify({
        count: burst.limit,
        expiresAt: now + 60_000,
      });

      const kv = mockKV(store);
      const result = await checkRateLimits(kv, KEYS, now);

      expect(result.blocked).toBe(true);
      if (result.blocked) expect(result.bucket).toBe("ip_burst");
    });
  });

  describe("retryAfterMs", () => {
    it("equals the remaining window time", async () => {
      const now = 100_000;
      const expiresAt = now + 42_000;
      const store: Record<string, string> = {};
      const burst = BUCKETS.find((b) => b.name === "burst")!;
      store[`${burst.keyPrefix}${KEYS.identity}`] = JSON.stringify({
        count: burst.limit,
        expiresAt,
      });

      const kv = mockKV(store);
      const result = await checkRateLimits(kv, KEYS, now);

      expect(result.blocked).toBe(true);
      if (result.blocked) expect(result.retryAfterMs).toBe(42_000);
    });

    it("is zero when the window has just expired but counter was stale", async () => {
      const now = 100_000;
      const expiresAt = now;
      const store: Record<string, string> = {};
      const burst = BUCKETS.find((b) => b.name === "burst")!;
      store[`${burst.keyPrefix}${KEYS.identity}`] = JSON.stringify({
        count: burst.limit + 5,
        expiresAt,
      });

      const kv = mockKV(store);
      const result = await checkRateLimits(kv, KEYS, now);

      expect(result.blocked).toBe(false);
    });
  });

  describe("lore strings", () => {
    it("has a lore entry for every bucket", () => {
      for (const bucket of BUCKETS) {
        expect(LORE[bucket.name]).toBeDefined();
        expect(typeof LORE[bucket.name]).toBe("string");
        expect(LORE[bucket.name].length).toBeGreaterThan(0);
      }
    });
  });

  describe("edge cases", () => {
    it("handles corrupted KV values gracefully", async () => {
      const store: Record<string, string> = {};
      const burst = BUCKETS.find((b) => b.name === "burst")!;
      store[`${burst.keyPrefix}${KEYS.identity}`] = "not-json";

      const kv = mockKV(store);
      const result = await checkRateLimits(kv, KEYS, 1000);

      expect(result.blocked).toBe(false);
    });

    it("handles missing fields in stored JSON", async () => {
      const store: Record<string, string> = {};
      const burst = BUCKETS.find((b) => b.name === "burst")!;
      store[`${burst.keyPrefix}${KEYS.identity}`] = JSON.stringify({ count: 5 });

      const kv = mockKV(store);
      const result = await checkRateLimits(kv, KEYS, 1000);

      expect(result.blocked).toBe(false);
    });

    it("uses Date.now() when no timestamp is provided", async () => {
      const kv = mockKV();
      const before = Date.now();
      const result = await checkRateLimits(kv, KEYS);
      const after = Date.now();

      expect(result.blocked).toBe(false);

      const dailyKey = `rl:daily:${KEYS.identity}`;
      const stored = JSON.parse(
        (kv.put as ReturnType<typeof vi.fn>).mock.calls.find(
          (c: string[]) => c[0] === dailyKey,
        )![1],
      );
      expect(stored.expiresAt).toBeGreaterThanOrEqual(before + 86400 * 1000);
      expect(stored.expiresAt).toBeLessThanOrEqual(after + 86400 * 1000);
    });

    it("does not increment later buckets after a block", async () => {
      const store: Record<string, string> = {};
      const now = 100_000;
      const swarm = BUCKETS.find((b) => b.name === "swarm")!;
      store[`${swarm.keyPrefix}${KEYS.ip}`] = JSON.stringify({
        count: swarm.limit,
        expiresAt: now + 60_000,
      });

      const kv = mockKV(store);
      await checkRateLimits(kv, KEYS, now);

      const burstKey = `rl:burst:${KEYS.identity}`;
      expect(store[burstKey]).toBeUndefined();
    });
  });

  describe("KV TTL handling", () => {
    it("sets expirationTtl equal to windowSeconds for new counters", async () => {
      const store: Record<string, string> = {};
      const kv = mockKV(store);
      await checkRateLimits(kv, KEYS, 1000);

      const putCalls = (kv.put as ReturnType<typeof vi.fn>).mock.calls;
      for (const bucket of BUCKETS) {
        const id = bucket.keyType === "ip" ? KEYS.ip : KEYS.identity;
        const key = `${bucket.keyPrefix}${id}`;
        const call = putCalls.find((c: unknown[]) => c[0] === key);
        expect(call).toBeDefined();
        expect(call![2]).toEqual({ expirationTtl: bucket.windowSeconds });
      }
    });

    it("uses remaining seconds as TTL on subsequent increments, clamped to minimum 60", async () => {
      const store: Record<string, string> = {};
      const now = 100_000;
      const burst = BUCKETS.find((b) => b.name === "burst")!;
      const expiresAt = now + 30_000;
      store[`${burst.keyPrefix}${KEYS.identity}`] = JSON.stringify({
        count: 1,
        expiresAt,
      });

      const kv = mockKV(store);
      await checkRateLimits(kv, KEYS, now);

      const putCalls = (kv.put as ReturnType<typeof vi.fn>).mock.calls;
      const burstCall = putCalls.find(
        (c: unknown[]) => c[0] === `${burst.keyPrefix}${KEYS.identity}`,
      );
      expect(burstCall).toBeDefined();
      const ttl = (burstCall![2] as { expirationTtl: number }).expirationTtl;
      expect(ttl).toBe(60);
    });
  });

  describe("key construction", () => {
    it("uses ip_hash for ip-type buckets and cope_id for identity-type buckets", async () => {
      const store: Record<string, string> = {};
      const kv = mockKV(store);
      await checkRateLimits(kv, KEYS, 1000);

      for (const bucket of BUCKETS) {
        const expectedId = bucket.keyType === "ip" ? KEYS.ip : KEYS.identity;
        const key = `${bucket.keyPrefix}${expectedId}`;
        expect(store[key]).toBeDefined();
      }
    });
  });
});

import { describe, it, expect, vi } from "vitest";
import {
  getQuotaPercent,
  consumeQuota,
  getQuotaLimits,
  QuotaExhaustedError,
  DEFAULT_FREE_QUOTA_LIMIT,
  DEFAULT_PRO_INITIAL_QUOTA,
} from "./quota";

function mockKV(store: Record<string, string> = {}) {
  return {
    get: vi.fn(async (key: string) => store[key] ?? null),
    put: vi.fn(async (key: string, value: string) => {
      store[key] = value;
    }),
  } as unknown as KVNamespace;
}

describe("getQuotaLimits", () => {
  it("returns defaults when env is empty", () => {
    expect(getQuotaLimits({})).toEqual({
      freeLimit: DEFAULT_FREE_QUOTA_LIMIT,
      proInitialQuota: DEFAULT_PRO_INITIAL_QUOTA,
    });
  });

  it("returns defaults when env is undefined", () => {
    expect(getQuotaLimits(undefined)).toEqual({
      freeLimit: DEFAULT_FREE_QUOTA_LIMIT,
      proInitialQuota: DEFAULT_PRO_INITIAL_QUOTA,
    });
  });

  it("honors overrides from env vars", () => {
    expect(
      getQuotaLimits({ FREE_QUOTA_LIMIT: "50", PRO_INITIAL_QUOTA: "500" }),
    ).toEqual({ freeLimit: 50, proInitialQuota: 500 });
  });

  it("falls back to defaults for invalid values", () => {
    expect(
      getQuotaLimits({ FREE_QUOTA_LIMIT: "abc", PRO_INITIAL_QUOTA: "-5" }),
    ).toEqual({
      freeLimit: DEFAULT_FREE_QUOTA_LIMIT,
      proInitialQuota: DEFAULT_PRO_INITIAL_QUOTA,
    });
  });
});

describe("getQuotaPercent", () => {
  it("returns 0 for pro tier with no license hash", async () => {
    const kv = mockKV();
    const result = await getQuotaPercent(kv, { tier: "pro", sessionId: "s1" });
    expect(result).toBe(0);
  });

  it("returns 0 for pro tier when KV key not found", async () => {
    const kv = mockKV();
    const result = await getQuotaPercent(kv, {
      tier: "pro",
      sessionId: "s1",
      licenseKeyHash: "abc123",
    });
    expect(result).toBe(0);
  });

  it("returns correct percentage for pro tier against default limit", async () => {
    const kv = mockKV({ "polar:abc123": "50" });
    const result = await getQuotaPercent(kv, {
      tier: "pro",
      sessionId: "s1",
      licenseKeyHash: "abc123",
    });
    expect(result).toBe((50 / DEFAULT_PRO_INITIAL_QUOTA) * 100);
  });

  it("returns 100% for free tier with no usage", async () => {
    const kv = mockKV();
    const result = await getQuotaPercent(kv, { tier: "free", sessionId: "s1" });
    expect(result).toBe(100);
  });

  it("returns reduced percentage for free tier with usage", async () => {
    const kv = mockKV({ "free:s1": "10" });
    const result = await getQuotaPercent(kv, { tier: "free", sessionId: "s1" });
    // (20-10)/20 * 100 = 50%
    expect(result).toBe(50);
  });

  it("uses custom free-tier limit when provided", async () => {
    const kv = mockKV({ "free:s1": "10" });
    const result = await getQuotaPercent(kv, {
      tier: "free",
      sessionId: "s1",
      limits: { freeLimit: 50, proInitialQuota: DEFAULT_PRO_INITIAL_QUOTA },
    });
    // (50-10)/50 * 100 = 80%
    expect(result).toBe(80);
  });

  it("uses custom pro-tier limit when provided", async () => {
    const kv = mockKV({ "polar:abc123": "250" });
    const result = await getQuotaPercent(kv, {
      tier: "pro",
      sessionId: "s1",
      licenseKeyHash: "abc123",
      limits: { freeLimit: DEFAULT_FREE_QUOTA_LIMIT, proInitialQuota: 500 },
    });
    // 250 / 500 * 100 = 50%
    expect(result).toBe(50);
  });
});

describe("consumeQuota", () => {
  it("decrements pro quota and returns new percentage", async () => {
    const store: Record<string, string> = { "polar:hash1": "50" };
    const kv = mockKV(store);
    const result = await consumeQuota(kv, {
      tier: "pro",
      sessionId: "s1",
      licenseKeyHash: "hash1",
    });
    expect(result.quotaPercent).toBe((49 / DEFAULT_PRO_INITIAL_QUOTA) * 100);
    expect(store["polar:hash1"]).toBe("49");
  });

  it("throws QuotaExhaustedError when pro quota is 0", async () => {
    const kv = mockKV({ "polar:hash1": "0" });
    await expect(
      consumeQuota(kv, { tier: "pro", sessionId: "s1", licenseKeyHash: "hash1" })
    ).rejects.toThrow(QuotaExhaustedError);
  });

  it("throws QuotaExhaustedError when pro KV key is missing", async () => {
    const kv = mockKV();
    await expect(
      consumeQuota(kv, { tier: "pro", sessionId: "s1", licenseKeyHash: "hash1" })
    ).rejects.toThrow(QuotaExhaustedError);
  });

  it("throws when pro tier has no license key or hash", async () => {
    const kv = mockKV();
    await expect(
      consumeQuota(kv, { tier: "pro", sessionId: "s1" })
    ).rejects.toThrow("License key or hash is required");
  });

  it("increments free tier usage and returns new percentage", async () => {
    const store: Record<string, string> = {};
    const kv = mockKV(store);
    const result = await consumeQuota(kv, { tier: "free", sessionId: "s1" });
    // (20-1)/20 * 100 = 95%
    expect(result.quotaPercent).toBe(95);
    expect(store["free:s1"]).toBe("1");
  });

  it("throws QuotaExhaustedError when free quota is full", async () => {
    const kv = mockKV({ "free:s1": "20" });
    await expect(
      consumeQuota(kv, { tier: "free", sessionId: "s1" })
    ).rejects.toThrow(QuotaExhaustedError);
  });

  it("supports custom cost", async () => {
    const store: Record<string, string> = { "polar:hash1": "10" };
    const kv = mockKV(store);
    const result = await consumeQuota(kv, {
      tier: "pro",
      sessionId: "s1",
      licenseKeyHash: "hash1",
      cost: 5,
    });
    expect(store["polar:hash1"]).toBe("5");
    expect(result.quotaPercent).toBe((5 / DEFAULT_PRO_INITIAL_QUOTA) * 100);
  });

  it("honors a custom free-tier limit from env", async () => {
    const store: Record<string, string> = { "free:s1": "40" };
    const kv = mockKV(store);
    const limits = getQuotaLimits({ FREE_QUOTA_LIMIT: "50" });
    const result = await consumeQuota(kv, {
      tier: "free",
      sessionId: "s1",
      limits,
    });
    // (50-41)/50 * 100 = 18%
    expect(result.quotaPercent).toBe(18);
    expect(store["free:s1"]).toBe("41");
  });

  it("enforces a higher free-tier limit before exhausting", async () => {
    const store: Record<string, string> = { "free:s1": "20" };
    const kv = mockKV(store);
    const limits = getQuotaLimits({ FREE_QUOTA_LIMIT: "50" });
    // Default would have thrown, but custom limit allows another request.
    const result = await consumeQuota(kv, {
      tier: "free",
      sessionId: "s1",
      limits,
    });
    expect(store["free:s1"]).toBe("21");
    expect(result.quotaPercent).toBeCloseTo(58);
  });

  it("exhausts free tier at the configured custom limit", async () => {
    const kv = mockKV({ "free:s1": "50" });
    const limits = getQuotaLimits({ FREE_QUOTA_LIMIT: "50" });
    await expect(
      consumeQuota(kv, { tier: "free", sessionId: "s1", limits }),
    ).rejects.toThrow(QuotaExhaustedError);
  });

  it("honors a custom pro initial quota from env", async () => {
    const store: Record<string, string> = { "polar:hash1": "500" };
    const kv = mockKV(store);
    const limits = getQuotaLimits({ PRO_INITIAL_QUOTA: "500" });
    const result = await consumeQuota(kv, {
      tier: "pro",
      sessionId: "s1",
      licenseKeyHash: "hash1",
      limits,
    });
    // After decrement: 499/500 * 100 = 99.8
    expect(result.quotaPercent).toBeCloseTo(99.8);
    expect(store["polar:hash1"]).toBe("499");
  });
});

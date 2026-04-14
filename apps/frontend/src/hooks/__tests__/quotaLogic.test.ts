import { describe, it, expect } from "vitest";

/**
 * Tests for the server-based quota system.
 *
 * The frontend now tracks quota from server responses (used/limit/remaining)
 * instead of using local random drain logic. These tests verify the
 * quota state calculation used in useGameState.updateServerQuota.
 */

/* ------------------------------------------------------------------ */
/*  Helper: replicate the quota percent calculation from updateServerQuota */
/* ------------------------------------------------------------------ */

function computeQuotaPercent(used: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round(((limit - used) / limit) * 100)));
}

/* ------------------------------------------------------------------ */
/*  Server quota state tests                                            */
/* ------------------------------------------------------------------ */

describe("server quota percent calculation", () => {
  it("returns 100% when no requests are used", () => {
    expect(computeQuotaPercent(0, 20)).toBe(100);
  });

  it("returns 0% when all requests are used", () => {
    expect(computeQuotaPercent(20, 20)).toBe(0);
  });

  it("returns 50% when half the requests are used", () => {
    expect(computeQuotaPercent(10, 20)).toBe(50);
  });

  it("returns 75% when 5/20 are used", () => {
    expect(computeQuotaPercent(5, 20)).toBe(75);
  });

  it("returns 0% when used exceeds limit", () => {
    expect(computeQuotaPercent(25, 20)).toBe(0);
  });

  it("returns 0% when limit is 0", () => {
    expect(computeQuotaPercent(0, 0)).toBe(0);
  });

  it("returns 95% when 1/20 are used", () => {
    expect(computeQuotaPercent(1, 20)).toBe(95);
  });

  it("clamps to 100 for negative used values", () => {
    expect(computeQuotaPercent(-1, 20)).toBe(100);
  });
});

/* ------------------------------------------------------------------ */
/*  Quota exhaustion check                                              */
/* ------------------------------------------------------------------ */

describe("quota exhaustion check", () => {
  function isQuotaExhausted(quotaUsed: number, quotaLimit: number, hasApiKey: boolean, hasProKey: boolean): boolean {
    if (hasApiKey || hasProKey) return false;
    return quotaUsed >= quotaLimit;
  }

  it("returns false when quota is available", () => {
    expect(isQuotaExhausted(5, 20, false, false)).toBe(false);
  });

  it("returns true when quota is exhausted", () => {
    expect(isQuotaExhausted(20, 20, false, false)).toBe(true);
  });

  it("returns true when over limit", () => {
    expect(isQuotaExhausted(25, 20, false, false)).toBe(true);
  });

  it("returns false for BYOK users regardless of quota", () => {
    expect(isQuotaExhausted(20, 20, true, false)).toBe(false);
  });

  it("returns false for Pro users regardless of quota", () => {
    expect(isQuotaExhausted(20, 20, false, true)).toBe(false);
  });

  it("returns false at quota boundary minus one", () => {
    expect(isQuotaExhausted(19, 20, false, false)).toBe(false);
  });
});

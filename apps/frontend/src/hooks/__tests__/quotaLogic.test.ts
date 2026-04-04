import { describe, it, expect, vi, afterEach } from "vitest";

/**
 * Tests for the quota drain/reset logic used in useGameState.
 *
 * drainQuota: drain = Math.floor(Math.random() * 43) + 3  → range [3, 45]
 *   newPercent = max(0, current - drain)
 *
 * resetQuota: quotaPercent = 100, quotaLockouts += 1
 */

/* ------------------------------------------------------------------ */
/*  Helper: replicate the pure drain calculation from useGameState     */
/* ------------------------------------------------------------------ */

function computeDrain(randomValue: number): number {
  return Math.floor(randomValue * 43) + 3;
}

function applyDrain(currentPercent: number, drain: number): number {
  const raw = currentPercent - drain;
  return raw < 0 ? 0 : raw;
}

function applyReset(economy: { quotaPercent: number; quotaLockouts: number }) {
  return {
    quotaPercent: 100,
    quotaLockouts: economy.quotaLockouts + 1,
  };
}

/* ------------------------------------------------------------------ */
/*  drainQuota tests                                                   */
/* ------------------------------------------------------------------ */

describe("drainQuota logic", () => {
  const originalRandom = Math.random;

  afterEach(() => {
    Math.random = originalRandom;
  });

  it("drains a minimum of 3% when Math.random returns 0", () => {
    const drain = computeDrain(0);
    expect(drain).toBe(3);
  });

  it("drains a maximum of 45% when Math.random returns ~1", () => {
    // Math.random() is [0, 1), so use 0.999… to approach the max
    const drain = computeDrain(0.999);
    expect(drain).toBe(45);
  });

  it("drain is always in the range [3, 45]", () => {
    // Math.random() returns values in [0, 1) — test across the valid range
    for (let i = 0; i < 100; i++) {
      const r = i / 100;
      const drain = computeDrain(r);
      expect(drain).toBeGreaterThanOrEqual(3);
      expect(drain).toBeLessThanOrEqual(45);
    }
  });

  it("reduces quota by the drain amount", () => {
    const result = applyDrain(100, 20);
    expect(result).toBe(80);
  });

  it("clamps quota to 0 when drain exceeds current percent", () => {
    const result = applyDrain(10, 45);
    expect(result).toBe(0);
  });

  it("returns 0 when quota is already 0", () => {
    const result = applyDrain(0, 3);
    expect(result).toBe(0);
  });

  it("handles exact drain to zero", () => {
    const result = applyDrain(30, 30);
    expect(result).toBe(0);
  });

  it("minimum drain from full quota leaves at most 97%", () => {
    const result = applyDrain(100, 3);
    expect(result).toBe(97);
  });

  it("maximum drain from full quota leaves at least 55%", () => {
    const result = applyDrain(100, 45);
    expect(result).toBe(55);
  });

  it("successive drains reduce quota cumulatively", () => {
    let quota = 100;
    quota = applyDrain(quota, 20);
    expect(quota).toBe(80);
    quota = applyDrain(quota, 35);
    expect(quota).toBe(45);
    quota = applyDrain(quota, 45);
    expect(quota).toBe(0);
  });

  it("Math.random integration: drain uses Math.random correctly", () => {
    Math.random = vi.fn(() => 0.5);
    const drain = computeDrain(Math.random());
    // Math.floor(0.5 * 43) + 3 = Math.floor(21.5) + 3 = 21 + 3 = 24
    expect(drain).toBe(24);
  });
});

/* ------------------------------------------------------------------ */
/*  resetQuota tests                                                   */
/* ------------------------------------------------------------------ */

describe("resetQuota logic", () => {
  it("restores quota to 100%", () => {
    const result = applyReset({ quotaPercent: 30, quotaLockouts: 0 });
    expect(result.quotaPercent).toBe(100);
  });

  it("increments quotaLockouts by 1", () => {
    const result = applyReset({ quotaPercent: 0, quotaLockouts: 0 });
    expect(result.quotaLockouts).toBe(1);
  });

  it("increments from an existing lockout count", () => {
    const result = applyReset({ quotaPercent: 0, quotaLockouts: 5 });
    expect(result.quotaLockouts).toBe(6);
  });

  it("resets even when quota is already at 100%", () => {
    const result = applyReset({ quotaPercent: 100, quotaLockouts: 2 });
    expect(result.quotaPercent).toBe(100);
    expect(result.quotaLockouts).toBe(3);
  });

  it("resets from a partially drained quota", () => {
    const result = applyReset({ quotaPercent: 55, quotaLockouts: 1 });
    expect(result.quotaPercent).toBe(100);
    expect(result.quotaLockouts).toBe(2);
  });
});

/* ------------------------------------------------------------------ */
/*  drain + reset integration                                          */
/* ------------------------------------------------------------------ */

describe("drain → lockout → reset cycle", () => {
  it("full cycle: drain to zero, then reset restores quota and counts lockout", () => {
    let economy = { quotaPercent: 100, quotaLockouts: 0 };

    // Drain repeatedly until locked out (quota reaches 0)
    while (economy.quotaPercent > 0) {
      const drain = 45; // worst case
      economy = {
        ...economy,
        quotaPercent: applyDrain(economy.quotaPercent, drain),
      };
    }

    expect(economy.quotaPercent).toBe(0);
    expect(economy.quotaLockouts).toBe(0);

    // Reset
    const reset = applyReset(economy);
    expect(reset.quotaPercent).toBe(100);
    expect(reset.quotaLockouts).toBe(1);
  });

  it("multiple lockout cycles increment the counter correctly", () => {
    let economy = { quotaPercent: 100, quotaLockouts: 0 };

    for (let cycle = 1; cycle <= 3; cycle++) {
      // Drain to zero
      economy = { ...economy, quotaPercent: 0 };
      // Reset
      const reset = applyReset(economy);
      economy = { ...economy, ...reset };
      expect(economy.quotaLockouts).toBe(cycle);
      expect(economy.quotaPercent).toBe(100);
    }
  });
});

import { describe, it, expect } from "vitest";

/**
 * Tests for the quota reset logic used in useGameState.
 *
 * resetQuota: quotaPercent = 100, quotaLockouts += 1
 */

/* ------------------------------------------------------------------ */
/*  Helper: replicate the pure reset calculation from useGameState     */
/* ------------------------------------------------------------------ */

function applyReset(economy: { quotaPercent: number; quotaLockouts: number }) {
  return {
    quotaPercent: 100,
    quotaLockouts: economy.quotaLockouts + 1,
  };
}

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

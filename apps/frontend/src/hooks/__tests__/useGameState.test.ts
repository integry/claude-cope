import { describe, it, expect } from "vitest";
import { calcBulkCost } from "../useGameState";
import { GROWTH_RATE, GENERATORS } from "../../game/constants";

describe("calcBulkCost", () => {
  const r = GROWTH_RATE; // 1.15

  it("returns the base cost when buying 1 with 0 owned", () => {
    // Sum = baseCost * r^0 * (r^1 - 1) / (r - 1) = baseCost * 1 * 0.15 / 0.15 = baseCost
    const cost = calcBulkCost(100, 0, 1);
    expect(cost).toBe(Math.floor(100 * 1 * (r - 1) / (r - 1)));
    expect(cost).toBe(100);
  });

  it("scales cost with number owned (price increases)", () => {
    const cost0 = calcBulkCost(100, 0, 1);
    const cost5 = calcBulkCost(100, 5, 1);
    const cost10 = calcBulkCost(100, 10, 1);
    expect(cost5).toBeGreaterThan(cost0);
    expect(cost10).toBeGreaterThan(cost5);
  });

  it("computes correct cost for buying 1 unit with some owned", () => {
    // Buying 1 with 5 owned: baseCost * r^5 * (r^1 - 1) / (r - 1) = baseCost * r^5
    const expected = Math.floor(100 * Math.pow(r, 5));
    expect(calcBulkCost(100, 5, 1)).toBe(expected);
  });

  it("computes correct bulk cost for multiple units", () => {
    const baseCost = 15;
    const owned = 3;
    const amount = 5;
    const rOwned = Math.pow(r, owned);
    const rAmount = Math.pow(r, amount);
    const expected = Math.floor(baseCost * rOwned * (rAmount - 1) / (r - 1));
    expect(calcBulkCost(baseCost, owned, amount)).toBe(expected);
  });

  it("bulk cost of N equals sum of individual costs", () => {
    const baseCost = 100;
    const owned = 2;
    const amount = 4;

    // Sum individual costs: buy 1 at owned=2, then 1 at owned=3, etc.
    let sumIndividual = 0;
    for (let i = 0; i < amount; i++) {
      sumIndividual += calcBulkCost(baseCost, owned + i, 1);
    }

    const bulkCost = calcBulkCost(baseCost, owned, amount);
    // Floor rounding may cause a small difference, so check within tolerance
    expect(Math.abs(bulkCost - sumIndividual)).toBeLessThanOrEqual(amount);
  });

  it("handles large owned counts without errors", () => {
    const cost = calcBulkCost(15, 100, 1);
    expect(cost).toBeGreaterThan(0);
    expect(Number.isFinite(cost)).toBe(true);
  });

  it("works with actual generator base costs", () => {
    for (const gen of GENERATORS) {
      const cost = calcBulkCost(gen.baseCost, 0, 1);
      expect(cost).toBe(gen.baseCost);
    }
  });

  it("returns 0 when buying 0 amount", () => {
    // r^0 - 1 = 0 so the whole expression is 0
    expect(calcBulkCost(100, 0, 0)).toBe(0);
  });

  it("cost increases exponentially with GROWTH_RATE", () => {
    const cost0 = calcBulkCost(100, 0, 1);
    const cost1 = calcBulkCost(100, 1, 1);
    // Each additional owned unit multiplies cost by GROWTH_RATE
    expect(Math.abs(cost1 / cost0 - r)).toBeLessThan(0.01);
  });
});

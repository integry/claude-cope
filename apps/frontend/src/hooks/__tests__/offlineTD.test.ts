import { describe, it, expect } from "vitest";
import { calculateActiveMultiplier } from "../gameStateUtils";
import { GENERATORS } from "../../game/constants";

/**
 * Tests for the active TD multiplier calculation.
 *
 * Team members add a percentage bonus per unit owned.
 * The multiplier is: 1 + SUM(count * baseOutput * synergy) / 100
 */

describe("calculateActiveMultiplier", () => {
  it("returns 1.0 with no team members", () => {
    expect(calculateActiveMultiplier({})).toBe(1);
  });

  it("returns correct multiplier for a single team member", () => {
    const intern = GENERATORS.find((g) => g.id === "intern")!;
    // 1 intern at 10% = 1.10x
    expect(calculateActiveMultiplier({ intern: 1 })).toBeCloseTo(1 + intern.baseOutput / 100);
  });

  it("scales linearly with count", () => {
    const intern = GENERATORS.find((g) => g.id === "intern")!;
    // 5 interns at 10% each = 1.50x
    expect(calculateActiveMultiplier({ intern: 5 })).toBeCloseTo(1 + (5 * intern.baseOutput) / 100);
  });

  it("sums multipliers from different team member types", () => {
    const intern = GENERATORS.find((g) => g.id === "intern")!;
    const npm = GENERATORS.find((g) => g.id === "npm")!;
    // 2 interns (20%) + 1 npm (30%) = 1.50x
    const expected = 1 + (2 * intern.baseOutput + 1 * npm.baseOutput) / 100;
    expect(calculateActiveMultiplier({ intern: 2, npm: 1 })).toBeCloseTo(expected);
  });

  it("returns 1.0 for zero-count inventory entries", () => {
    expect(calculateActiveMultiplier({ intern: 0, npm: 0 })).toBe(1);
  });

  it("applies synergy upgrade multipliers", () => {
    const intern = GENERATORS.find((g) => g.id === "intern")!;
    const hotfix = GENERATORS.find((g) => g.id === "hotfix")!;
    // "hotfix-boost-intern" is a 2x multiplier on intern output
    // 3 interns at 10% × 2 synergy = 60% from interns
    // 1 hotfix at 18% = 18% from hotfix
    // Total = 78% bonus = 1.78x
    const result = calculateActiveMultiplier({ intern: 3, hotfix: 1 }, ["hotfix-boost-intern"]);
    expect(result).toBeCloseTo(1 + (3 * intern.baseOutput * 2 + 1 * hotfix.baseOutput) / 100);
  });

  it("ignores upgrades the player doesn't own", () => {
    const intern = GENERATORS.find((g) => g.id === "intern")!;
    // No upgrades owned — just base multiplier
    expect(calculateActiveMultiplier({ intern: 3 }, [])).toBeCloseTo(1 + (3 * intern.baseOutput) / 100);
  });

  it("handles all generator types together", () => {
    const inventory: Record<string, number> = {};
    let totalPercent = 0;
    for (const gen of GENERATORS) {
      inventory[gen.id] = 1;
      totalPercent += gen.baseOutput;
    }
    expect(calculateActiveMultiplier(inventory)).toBeCloseTo(1 + totalPercent / 100);
  });
});

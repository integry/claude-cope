import { describe, it, expect } from "vitest";
import { computeMultiplier } from "./gameConstants";

describe("computeMultiplier", () => {
  it("returns 1 with empty inventory", () => {
    expect(computeMultiplier({}, [])).toBe(1);
  });

  it("calculates bonus from a single generator type", () => {
    // 10 copy-pasters * 5 baseOutput = 50% bonus => 1.5
    expect(computeMultiplier({ "stackoverflow-copy-paster": 10 }, [])).toBe(1.5);
  });

  it("sums bonuses across multiple generator types", () => {
    // 10 * 5 = 50 (copy-paster) + 5 * 10 = 50 (intern) => 100% bonus => 2.0
    const inv = { "stackoverflow-copy-paster": 10, intern: 5 };
    expect(computeMultiplier(inv, [])).toBe(2);
  });

  it("applies upgrade multiplier to target generator", () => {
    // intern-boost-copypaster: 2x multiplier on copy-paster
    // 10 copy-pasters * 5 * 2 = 100 + 1 intern * 10 = 10 => 110% bonus => 2.1
    const inv = { "stackoverflow-copy-paster": 10, intern: 1 };
    expect(computeMultiplier(inv, ["intern-boost-copypaster"])).toBe(2.1);
  });

  it("applies synergy upgrade based on required generator count", () => {
    // agile-boost-llm has synergyPercent=1, targets llm-code-wrapper, requires agile
    // synergy = 1 + (agileCount * 1 / 100) = 1 + 0.1 = 1.1
    // 1 llm-code-wrapper * 120 * 1.1 = 132 => +132% bonus
    const inv = { "llm-code-wrapper": 1, agile: 10 };
    const result = computeMultiplier(inv, ["agile-boost-llm"]);
    expect(result).toBeCloseTo(1 + (1 * 120 * 1.1 + 10 * 200) / 100);
  });

  it("ignores unknown upgrade IDs", () => {
    const inv = { intern: 5 };
    expect(computeMultiplier(inv, ["nonexistent-upgrade"])).toBe(
      computeMultiplier(inv, [])
    );
  });

  it("ignores generators not in inventory", () => {
    expect(computeMultiplier({ "unknown-gen": 100 }, [])).toBe(1);
  });
});

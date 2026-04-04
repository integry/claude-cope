import { describe, it, expect } from "vitest";
import { calcBulkCost } from "../gameStateUtils";
import { GENERATORS } from "../../game/constants";
import type { GameState } from "../gameStateUtils";

/* ------------------------------------------------------------------ */
/*  Helper: replicate the pure buyGenerator logic from useGameState    */
/* ------------------------------------------------------------------ */

/**
 * Mirrors the validation + state update performed by buyGenerator.
 * Returns { success, nextState } so tests can inspect both the boolean
 * result and the resulting game state.
 */
function buyGenerator(
  state: GameState,
  generatorId: string,
  amount: number = 1,
): { success: boolean; nextState: GameState } {
  const generator = GENERATORS.find((g) => g.id === generatorId);
  if (!generator || amount < 1) {
    return { success: false, nextState: state };
  }

  const owned = state.inventory[generatorId] ?? 0;
  const cost = calcBulkCost(generator.baseCost, owned, amount);

  if (state.economy.currentTD < cost) {
    return { success: false, nextState: state };
  }

  // Apply the setState updater logic
  const ownedNow = state.inventory[generatorId] ?? 0;
  const dynamicCost = calcBulkCost(generator.baseCost, ownedNow, amount);
  if (state.economy.currentTD < dynamicCost) {
    return { success: false, nextState: state };
  }

  const nextState: GameState = {
    ...state,
    economy: {
      ...state.economy,
      currentTD: state.economy.currentTD - dynamicCost,
    },
    inventory: {
      ...state.inventory,
      [generatorId]: ownedNow + amount,
    },
  };

  return { success: true, nextState };
}

/* ------------------------------------------------------------------ */
/*  Test fixtures                                                      */
/* ------------------------------------------------------------------ */

function makeDefaultState(overrides?: Partial<GameState>): GameState {
  return {
    version: "1.0",
    lastLogin: Date.now(),
    economy: {
      currentTD: 10_000,
      totalTDEarned: 10_000,
      currentRank: "Intern",
      quotaPercent: 100,
      quotaLockouts: 0,
      tdMultiplier: 1,
    },
    inventory: {},
    upgrades: [],
    achievements: [],
    buddy: { type: null, isShiny: false, promptsSinceLastInterjection: 0 },
    chatHistory: [],
    commandUsage: {},
    modes: { fast: false, voice: false },
    ...overrides,
  };
}

/* ------------------------------------------------------------------ */
/*  buyGenerator tests                                                 */
/* ------------------------------------------------------------------ */

describe("buyGenerator logic", () => {
  const copypaster = GENERATORS.find((g) => g.id === "stackoverflow-copy-paster")!;
  const intern = GENERATORS.find((g) => g.id === "intern")!;

  // ---- Successful purchases ----

  it("returns true and deducts base cost when buying first generator", () => {
    const state = makeDefaultState({ economy: { ...makeDefaultState().economy, currentTD: 100 } });
    const { success, nextState } = buyGenerator(state, "intern", 1);

    expect(success).toBe(true);
    expect(nextState.economy.currentTD).toBe(0); // 100 - baseCost(100)
    expect(nextState.inventory["intern"]).toBe(1);
  });

  it("deducts correct scaled cost when generator is already owned", () => {
    const state = makeDefaultState({
      economy: { ...makeDefaultState().economy, currentTD: 50_000 },
      inventory: { "intern": 5 },
    });
    const expectedCost = calcBulkCost(intern.baseCost, 5, 1);
    const { success, nextState } = buyGenerator(state, "intern", 1);

    expect(success).toBe(true);
    expect(nextState.economy.currentTD).toBe(50_000 - expectedCost);
    expect(nextState.inventory["intern"]).toBe(6);
  });

  it("handles bulk purchase of multiple generators", () => {
    const amount = 5;
    const state = makeDefaultState({
      economy: { ...makeDefaultState().economy, currentTD: 1_000_000 },
      inventory: { "stackoverflow-copy-paster": 3 },
    });
    const expectedCost = calcBulkCost(copypaster.baseCost, 3, amount);
    const { success, nextState } = buyGenerator(state, "stackoverflow-copy-paster", amount);

    expect(success).toBe(true);
    expect(nextState.economy.currentTD).toBe(1_000_000 - expectedCost);
    expect(nextState.inventory["stackoverflow-copy-paster"]).toBe(3 + amount);
  });

  it("increments inventory from 0 when buying a new generator type", () => {
    const state = makeDefaultState({
      economy: { ...makeDefaultState().economy, currentTD: 50 },
    });
    const { success, nextState } = buyGenerator(state, "stackoverflow-copy-paster", 1);

    expect(success).toBe(true);
    expect(nextState.inventory["stackoverflow-copy-paster"]).toBe(1);
  });

  it("preserves other inventory entries when purchasing", () => {
    const state = makeDefaultState({
      economy: { ...makeDefaultState().economy, currentTD: 500 },
      inventory: { "stackoverflow-copy-paster": 10, "hotfix": 2 },
    });
    const { success, nextState } = buyGenerator(state, "intern", 1);

    expect(success).toBe(true);
    expect(nextState.inventory["stackoverflow-copy-paster"]).toBe(10);
    expect(nextState.inventory["hotfix"]).toBe(2);
  });

  it("allows spending exact balance (currentTD equals cost)", () => {
    const cost = calcBulkCost(copypaster.baseCost, 0, 1);
    const state = makeDefaultState({
      economy: { ...makeDefaultState().economy, currentTD: cost },
    });
    const { success, nextState } = buyGenerator(state, "stackoverflow-copy-paster", 1);

    expect(success).toBe(true);
    expect(nextState.economy.currentTD).toBe(0);
    expect(nextState.inventory["stackoverflow-copy-paster"]).toBe(1);
  });

  // ---- Failed purchases ----

  it("returns false when currentTD is insufficient", () => {
    const state = makeDefaultState({
      economy: { ...makeDefaultState().economy, currentTD: 1 },
    });
    const { success, nextState } = buyGenerator(state, "intern", 1);

    expect(success).toBe(false);
    expect(nextState.economy.currentTD).toBe(1); // unchanged
    expect(nextState.inventory["intern"]).toBeUndefined();
  });

  it("returns false for an invalid generator id", () => {
    const state = makeDefaultState();
    const { success, nextState } = buyGenerator(state, "nonexistent-generator", 1);

    expect(success).toBe(false);
    expect(nextState).toBe(state); // state reference unchanged
  });

  it("returns false when amount is less than 1", () => {
    const state = makeDefaultState();
    const { success: zeroResult } = buyGenerator(state, "intern", 0);
    const { success: negResult } = buyGenerator(state, "intern", -5);

    expect(zeroResult).toBe(false);
    expect(negResult).toBe(false);
  });

  it("does not mutate the original state on failure", () => {
    const state = makeDefaultState({ economy: { ...makeDefaultState().economy, currentTD: 1 } });
    const originalTD = state.economy.currentTD;
    const originalInventory = { ...state.inventory };

    buyGenerator(state, "intern", 1);

    expect(state.economy.currentTD).toBe(originalTD);
    expect(state.inventory).toEqual(originalInventory);
  });

  it("does not mutate the original state on success", () => {
    const state = makeDefaultState({ economy: { ...makeDefaultState().economy, currentTD: 500 } });
    const originalTD = state.economy.currentTD;

    buyGenerator(state, "stackoverflow-copy-paster", 1);

    expect(state.economy.currentTD).toBe(originalTD);
  });

  // ---- Cost scaling ----

  it("cost increases with each subsequent purchase", () => {
    let state = makeDefaultState({
      economy: { ...makeDefaultState().economy, currentTD: 1_000_000 },
    });

    const cost1 = calcBulkCost(intern.baseCost, 0, 1);
    const result1 = buyGenerator(state, "intern", 1);
    state = result1.nextState;

    const cost2 = calcBulkCost(intern.baseCost, 1, 1);
    const result2 = buyGenerator(state, "intern", 1);

    expect(cost2).toBeGreaterThan(cost1);
    expect(result2.nextState.inventory["intern"]).toBe(2);
  });

  it("bulk cost matches expected geometric series formula", () => {
    const owned = 4;
    const amount = 3;
    const state = makeDefaultState({
      economy: { ...makeDefaultState().economy, currentTD: 1_000_000 },
      inventory: { "intern": owned },
    });

    const expectedCost = calcBulkCost(intern.baseCost, owned, amount);
    const { nextState } = buyGenerator(state, "intern", amount);

    expect(nextState.economy.currentTD).toBe(1_000_000 - expectedCost);
    expect(nextState.inventory["intern"]).toBe(owned + amount);
  });

  // ---- All generators purchasable ----

  it("can purchase each generator type with sufficient funds", () => {
    for (const gen of GENERATORS) {
      const state = makeDefaultState({
        economy: { ...makeDefaultState().economy, currentTD: 1e15 },
      });
      const { success, nextState } = buyGenerator(state, gen.id, 1);

      expect(success).toBe(true);
      expect(nextState.inventory[gen.id]).toBe(1);
      expect(nextState.economy.currentTD).toBe(1e15 - gen.baseCost);
    }
  });

  // ---- Economy state consistency ----

  it("only changes currentTD in economy, other fields stay intact", () => {
    const state = makeDefaultState({
      economy: {
        currentTD: 500,
        totalTDEarned: 5000,
        currentRank: "Senior Dev",
        quotaPercent: 75,
        quotaLockouts: 2,
        tdMultiplier: 1.5,
      },
    });
    const { nextState } = buyGenerator(state, "stackoverflow-copy-paster", 1);

    expect(nextState.economy.totalTDEarned).toBe(5000);
    expect(nextState.economy.currentRank).toBe("Senior Dev");
    expect(nextState.economy.quotaPercent).toBe(75);
    expect(nextState.economy.quotaLockouts).toBe(2);
    expect(nextState.economy.tdMultiplier).toBe(1.5);
  });
});

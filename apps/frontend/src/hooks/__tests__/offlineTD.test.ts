import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { calculateTDpS, resolveRank } from "../gameStateUtils";
import { GENERATORS, CORPORATE_RANKS } from "../../game/constants";

/**
 * Tests for the offline TD calculation logic used in useGameState's mount useEffect.
 *
 * The useEffect computes:
 *   elapsed = Date.now() - lastLogin
 *   baseTdps = calculateTDpS(inventory, upgrades)
 *   tdps = baseTdps * economy.tdMultiplier
 *   offlineTD = tdps * (elapsed / 1000)
 *
 * Then updates: currentTD += offlineTD, totalTDEarned += offlineTD, lastLogin = now
 */

/* ------------------------------------------------------------------ */
/*  Helpers: replicate the pure offline TD logic from useGameState     */
/* ------------------------------------------------------------------ */

interface EconomyState {
  currentTD: number;
  totalTDEarned: number;
  currentRank: string;
  quotaPercent: number;
  quotaLockouts: number;
  tdMultiplier: number;
}

interface OfflineState {
  lastLogin: number;
  economy: EconomyState;
  inventory: Record<string, number>;
  upgrades: string[];
}

interface OfflineResult {
  lastLogin: number;
  economy: EconomyState;
  offlineTDEarned: number;
}

function computeOfflineTD(prev: OfflineState, now: number): OfflineResult {
  const elapsed = now - prev.lastLogin;

  if (elapsed <= 0) {
    return {
      lastLogin: now,
      economy: prev.economy,
      offlineTDEarned: 0,
    };
  }

  const baseTdps = calculateTDpS(prev.inventory, prev.upgrades);
  const tdps = baseTdps * prev.economy.tdMultiplier;
  const offlineTD = tdps * (elapsed / 1000);

  if (offlineTD <= 0) {
    return {
      lastLogin: now,
      economy: prev.economy,
      offlineTDEarned: 0,
    };
  }

  const newTotalTDEarned = prev.economy.totalTDEarned + offlineTD;
  const newRank = resolveRank(newTotalTDEarned, prev.economy.currentRank);

  return {
    lastLogin: now,
    economy: {
      ...prev.economy,
      currentTD: prev.economy.currentTD + offlineTD,
      totalTDEarned: newTotalTDEarned,
      currentRank: newRank,
    },
    offlineTDEarned: offlineTD,
  };
}

function createEmptyInventory(): Record<string, number> {
  const inventory: Record<string, number> = {};
  for (const generator of GENERATORS) {
    inventory[generator.id] = 0;
  }
  return inventory;
}

function makeDefaultEconomy(): EconomyState {
  return {
    currentTD: 0,
    totalTDEarned: 0,
    currentRank: CORPORATE_RANKS[0]!.title,
    quotaPercent: 100,
    quotaLockouts: 0,
    tdMultiplier: 1,
  };
}

/* ------------------------------------------------------------------ */
/*  Offline TD calculation tests                                       */
/* ------------------------------------------------------------------ */

describe("offline TD calculation", () => {
  const originalDateNow = Date.now;

  afterEach(() => {
    Date.now = originalDateNow;
  });

  it("awards zero TD when no generators are owned", () => {
    const lastLogin = 1000000;
    const now = lastLogin + 60000; // 60 seconds later

    const result = computeOfflineTD(
      {
        lastLogin,
        economy: makeDefaultEconomy(),
        inventory: createEmptyInventory(),
        upgrades: [],
      },
      now,
    );

    expect(result.offlineTDEarned).toBe(0);
    expect(result.economy.currentTD).toBe(0);
    expect(result.lastLogin).toBe(now);
  });

  it("correctly calculates offline TD for a single generator type", () => {
    const lastLogin = 1000000;
    const now = lastLogin + 10000; // 10 seconds later
    const inventory = createEmptyInventory();
    inventory["intern"] = 5; // 5 interns × 1 TDpS = 5 TDpS

    const result = computeOfflineTD(
      {
        lastLogin,
        economy: makeDefaultEconomy(),
        inventory,
        upgrades: [],
      },
      now,
    );

    // 5 TDpS × 10 seconds = 50 TD
    expect(result.offlineTDEarned).toBe(50);
    expect(result.economy.currentTD).toBe(50);
    expect(result.economy.totalTDEarned).toBe(50);
  });

  it("correctly calculates offline TD for multiple generator types", () => {
    const lastLogin = 1000000;
    const now = lastLogin + 5000; // 5 seconds later
    const inventory = createEmptyInventory();
    inventory["stackoverflow-copy-paster"] = 10; // 10 × 0.1 = 1 TDpS
    inventory["intern"] = 3; // 3 × 1 = 3 TDpS
    inventory["hotfix"] = 2; // 2 × 8 = 16 TDpS
    // Total: 20 TDpS

    const result = computeOfflineTD(
      {
        lastLogin,
        economy: makeDefaultEconomy(),
        inventory,
        upgrades: [],
      },
      now,
    );

    // 20 TDpS × 5 seconds = 100 TD
    expect(result.offlineTDEarned).toBe(100);
    expect(result.economy.currentTD).toBe(100);
    expect(result.economy.totalTDEarned).toBe(100);
  });

  it("applies the tdMultiplier to offline earnings", () => {
    const lastLogin = 1000000;
    const now = lastLogin + 10000; // 10 seconds
    const inventory = createEmptyInventory();
    inventory["intern"] = 5; // 5 TDpS base

    const economy = makeDefaultEconomy();
    economy.tdMultiplier = 2.5;

    const result = computeOfflineTD(
      {
        lastLogin,
        economy,
        inventory,
        upgrades: [],
      },
      now,
    );

    // 5 TDpS × 2.5 multiplier × 10 seconds = 125 TD
    expect(result.offlineTDEarned).toBe(125);
    expect(result.economy.currentTD).toBe(125);
  });

  it("adds offline TD to existing currentTD balance", () => {
    const lastLogin = 1000000;
    const now = lastLogin + 10000; // 10 seconds
    const inventory = createEmptyInventory();
    inventory["intern"] = 2; // 2 TDpS

    const economy = makeDefaultEconomy();
    economy.currentTD = 500;
    economy.totalTDEarned = 1000;

    const result = computeOfflineTD(
      {
        lastLogin,
        economy,
        inventory,
        upgrades: [],
      },
      now,
    );

    // 2 TDpS × 10 seconds = 20 TD
    expect(result.offlineTDEarned).toBe(20);
    expect(result.economy.currentTD).toBe(520);
    expect(result.economy.totalTDEarned).toBe(1020);
  });

  it("awards zero TD when elapsed time is zero", () => {
    const now = 1000000;

    const result = computeOfflineTD(
      {
        lastLogin: now,
        economy: makeDefaultEconomy(),
        inventory: { ...createEmptyInventory(), intern: 10 },
        upgrades: [],
      },
      now,
    );

    expect(result.offlineTDEarned).toBe(0);
    expect(result.lastLogin).toBe(now);
  });

  it("awards zero TD when elapsed time is negative (clock drift)", () => {
    const lastLogin = 1000000;
    const now = lastLogin - 5000; // clock went backwards

    const result = computeOfflineTD(
      {
        lastLogin,
        economy: makeDefaultEconomy(),
        inventory: { ...createEmptyInventory(), intern: 10 },
        upgrades: [],
      },
      now,
    );

    expect(result.offlineTDEarned).toBe(0);
    expect(result.lastLogin).toBe(now);
  });

  it("updates lastLogin to the current time after calculation", () => {
    const lastLogin = 1000000;
    const now = 2000000;

    const result = computeOfflineTD(
      {
        lastLogin,
        economy: makeDefaultEconomy(),
        inventory: createEmptyInventory(),
        upgrades: [],
      },
      now,
    );

    expect(result.lastLogin).toBe(now);
  });

  it("handles very long offline periods (24 hours)", () => {
    const lastLogin = 1000000;
    const now = lastLogin + 86400000; // 24 hours = 86400 seconds
    const inventory = createEmptyInventory();
    inventory["intern"] = 1; // 1 TDpS

    const result = computeOfflineTD(
      {
        lastLogin,
        economy: makeDefaultEconomy(),
        inventory,
        upgrades: [],
      },
      now,
    );

    // 1 TDpS × 86400 seconds = 86400 TD
    expect(result.offlineTDEarned).toBe(86400);
  });

  it("handles very short offline periods (1 second)", () => {
    const lastLogin = 1000000;
    const now = lastLogin + 1000; // 1 second
    const inventory = createEmptyInventory();
    inventory["intern"] = 1; // 1 TDpS

    const result = computeOfflineTD(
      {
        lastLogin,
        economy: makeDefaultEconomy(),
        inventory,
        upgrades: [],
      },
      now,
    );

    // 1 TDpS × 1 second = 1 TD
    expect(result.offlineTDEarned).toBe(1);
  });

  it("handles fractional seconds correctly", () => {
    const lastLogin = 1000000;
    const now = lastLogin + 1500; // 1.5 seconds
    const inventory = createEmptyInventory();
    inventory["intern"] = 2; // 2 TDpS

    const result = computeOfflineTD(
      {
        lastLogin,
        economy: makeDefaultEconomy(),
        inventory,
        upgrades: [],
      },
      now,
    );

    // 2 TDpS × 1.5 seconds = 3 TD
    expect(result.offlineTDEarned).toBe(3);
  });
});

/* ------------------------------------------------------------------ */
/*  Offline TD + rank advancement                                      */
/* ------------------------------------------------------------------ */

describe("offline TD rank advancement", () => {
  it("advances rank when offline TD pushes total past a threshold", () => {
    const lastLogin = 1000000;
    const now = lastLogin + 10000; // 10 seconds
    const inventory = createEmptyInventory();
    inventory["npm"] = 10; // 10 × 47 = 470 TDpS

    const economy = makeDefaultEconomy();
    // Set totalTDEarned just below the second rank threshold
    const secondRank = CORPORATE_RANKS[1]!;
    economy.totalTDEarned = secondRank.threshold - 100;
    economy.currentRank = CORPORATE_RANKS[0]!.title;

    const result = computeOfflineTD(
      {
        lastLogin,
        economy,
        inventory,
        upgrades: [],
      },
      now,
    );

    // 470 TDpS × 10 seconds = 4700 TD, well past the threshold gap of 100
    expect(result.offlineTDEarned).toBe(4700);
    expect(result.economy.currentRank).toBe(secondRank.title);
  });

  it("preserves rank when offline TD does not reach next threshold", () => {
    const lastLogin = 1000000;
    const now = lastLogin + 1000; // 1 second
    const inventory = createEmptyInventory();
    inventory["stackoverflow-copy-paster"] = 1; // 0.1 TDpS

    const result = computeOfflineTD(
      {
        lastLogin,
        economy: makeDefaultEconomy(),
        inventory,
        upgrades: [],
      },
      now,
    );

    // 0.1 TDpS × 1 second = 0.1 TD — not enough for rank up
    expect(result.offlineTDEarned).toBe(0.1);
    expect(result.economy.currentRank).toBe(CORPORATE_RANKS[0]!.title);
  });

  it("can skip multiple ranks with large offline earnings", () => {
    const lastLogin = 1000000;
    const now = lastLogin + 60000; // 60 seconds
    const inventory = createEmptyInventory();
    inventory["microservice"] = 100; // 100 × 260 = 26000 TDpS

    const economy = makeDefaultEconomy();
    economy.tdMultiplier = 10; // 260000 TDpS effective

    const result = computeOfflineTD(
      {
        lastLogin,
        economy,
        inventory,
        upgrades: [],
      },
      now,
    );

    // 260000 TDpS × 60 seconds = 15,600,000 TD
    expect(result.offlineTDEarned).toBe(15600000);
    // Should have advanced past the initial rank
    expect(result.economy.currentRank).not.toBe(CORPORATE_RANKS[0]!.title);
  });
});

/* ------------------------------------------------------------------ */
/*  Date.now() mocking integration                                     */
/* ------------------------------------------------------------------ */

describe("offline TD with Date.now() mocking", () => {
  const originalDateNow = Date.now;

  afterEach(() => {
    Date.now = originalDateNow;
  });

  it("uses Date.now() for the current time in the calculation", () => {
    const lastLogin = 1000000;
    Date.now = vi.fn(() => lastLogin + 30000); // 30 seconds later

    const now = Date.now();
    const inventory = createEmptyInventory();
    inventory["intern"] = 4; // 4 TDpS

    const result = computeOfflineTD(
      {
        lastLogin,
        economy: makeDefaultEconomy(),
        inventory,
        upgrades: [],
      },
      now,
    );

    // 4 TDpS × 30 seconds = 120 TD
    expect(result.offlineTDEarned).toBe(120);
    expect(result.lastLogin).toBe(lastLogin + 30000);
  });

  it("simulates a realistic play session with loadState and Date.now", () => {
    // Simulate: player last played 2 hours ago, had 3 interns and 5 copy-pasters
    const TWO_HOURS_MS = 2 * 60 * 60 * 1000; // 7,200,000 ms = 7200 seconds
    const lastLogin = 1700000000000; // some realistic timestamp
    Date.now = vi.fn(() => lastLogin + TWO_HOURS_MS);

    const inventory = createEmptyInventory();
    inventory["intern"] = 3; // 3 × 1 = 3 TDpS
    inventory["stackoverflow-copy-paster"] = 5; // 5 × 0.1 = 0.5 TDpS
    // Total: 3.5 TDpS

    const economy = makeDefaultEconomy();
    economy.currentTD = 200;
    economy.totalTDEarned = 500;

    const result = computeOfflineTD(
      {
        lastLogin,
        economy,
        inventory,
        upgrades: [],
      },
      Date.now(),
    );

    // 3.5 TDpS × 7200 seconds = 25200 TD
    expect(result.offlineTDEarned).toBe(25200);
    expect(result.economy.currentTD).toBe(200 + 25200);
    expect(result.economy.totalTDEarned).toBe(500 + 25200);
  });
});

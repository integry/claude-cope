import { describe, expect, it } from "vitest";
import type { GameState } from "../gameStateUtils";
import { shouldBackgroundSyncScore } from "../useGameEffects";

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    version: "1.0",
    username: "TestUser0",
    lastLogin: Date.now(),
    economy: {
      currentTD: 500,
      totalTDEarned: 500,
      currentRank: "Junior Code Monkey",
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
    activeTicket: null,
    hasSeenTicketPrompt: false,
    activeTheme: "default",
    unlockedThemes: ["default"],
    soundEnabled: true,
    pendingCompletedTaskIds: [],
    ...overrides,
  };
}

describe("shouldBackgroundSyncScore", () => {
  it("skips background score sync for restored paid users even without proKeyHash", () => {
    const state = makeState({ isPro: true });
    expect(shouldBackgroundSyncScore(state, 0)).toBe(false);
  });

  it("skips background score sync when a proKeyHash is present", () => {
    const state = makeState({ proKeyHash: "pro-hash" });
    expect(shouldBackgroundSyncScore(state, 0)).toBe(false);
  });

  it("allows background score sync for paid users with pending completed tickets and a license hash", () => {
    const state = makeState({ proKeyHash: "pro-hash", pendingCompletedTaskIds: ["COPE-115"] });
    expect(shouldBackgroundSyncScore(state, 500)).toBe(true);
  });

  it("allows background score sync for free users whose TD changed", () => {
    const state = makeState();
    expect(shouldBackgroundSyncScore(state, 0)).toBe(true);
  });

  it("skips background score sync when total TD did not change", () => {
    const state = makeState();
    expect(shouldBackgroundSyncScore(state, 500)).toBe(false);
  });
});

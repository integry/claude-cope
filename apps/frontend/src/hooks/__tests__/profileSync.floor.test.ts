import { describe, expect, it } from "vitest";
import type { GameState } from "../useGameState";
import { applyServerProfile } from "../profileSync";
import { createServerProfile } from "../../test/createServerProfile";

function createGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    version: "1.0",
    username: "alice",
    lastLogin: 0,
    economy: {
      currentTD: 0,
      totalTDEarned: 0,
      currentRank: "Junior Code Monkey",
      quotaPercent: 100,
      quotaLockouts: 0,
      tdMultiplier: 1,
    },
    inventory: {},
    upgrades: [],
    achievements: [],
    buddy: {
      type: null,
      isShiny: false,
      promptsSinceLastInterjection: 0,
    },
    chatHistory: [],
    commandUsage: {},
    modes: { fast: false, voice: false },
    activeTicket: null,
    hasSeenTicketPrompt: false,
    activeTheme: "default",
    unlockedThemes: ["default"],
    soundEnabled: true,
    pendingCompletedTaskIds: [],
    pendingCompletedTaskRewards: {},
    authoritativeProfileFloor: null,
    ...overrides,
  };
}

describe("applyServerProfile floor handling", () => {
  it("rejects stale server profiles through the shared merge path once an authoritative floor exists", () => {
    const prev = createGameState({
      authoritativeProfileFloor: { totalTD: 1500, currentTD: 1300 },
      economy: {
        currentTD: 1300,
        totalTDEarned: 1500,
        currentRank: "Junior Code Monkey",
        quotaPercent: 100,
        quotaLockouts: 0,
        tdMultiplier: 1,
      },
      inventory: { ci_cd: 1 },
    });

    const merged = applyServerProfile(prev, createServerProfile({
      current_td: 1500,
      total_td: 1500,
      inventory: { ci_cd: 2 },
    }));

    expect(merged).toBe(prev);
  });

  it("advances the stored authoritative floor on later non-stale merges", () => {
    const prev = createGameState({
      authoritativeProfileFloor: { totalTD: 1500, currentTD: 1300 },
    });

    const merged = applyServerProfile(prev, createServerProfile({
      current_td: 1400,
      total_td: 1600,
    }));

    expect(merged.authoritativeProfileFloor).toEqual({ currentTD: 1400, totalTD: 1600 });
  });
});

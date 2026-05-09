import { describe, expect, it } from "vitest";
import type { GameState } from "../../hooks/useGameState";
import { applyServerProfile } from "../../hooks/profileSync";
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
    ...overrides,
  };
}

describe("completed-ticket reward merge safety", () => {
  it("preserves local balances while multiple completed rewards are still pending", () => {
    const localState = createGameState({
      economy: {
        currentTD: 1500,
        totalTDEarned: 1500,
        currentRank: "Junior Code Monkey",
        quotaPercent: 100,
        quotaLockouts: 0,
        tdMultiplier: 1,
      },
      pendingCompletedTaskIds: ["COPE-059", "COPE-060"],
      pendingCompletedTaskRewards: {
        "COPE-059": { rewardTD: 500 },
        "COPE-060": { rewardTD: 1000 },
      },
    });
    const staleProfile = createServerProfile({ current_td: 1000, total_td: 1000 });

    const merged = applyServerProfile(localState, staleProfile, {
      preservePendingCompletedRewardTaskIds: ["COPE-059", "COPE-060"],
    });

    expect(merged.economy.currentTD).toBe(1500);
    expect(merged.economy.totalTDEarned).toBe(1500);
  });

  it("preserves multiple legacy pending rewards without per-ticket metadata", () => {
    const localState = createGameState({
      economy: {
        currentTD: 1500,
        totalTDEarned: 1500,
        currentRank: "Junior Code Monkey",
        quotaPercent: 100,
        quotaLockouts: 0,
        tdMultiplier: 1,
      },
      pendingCompletedTaskIds: ["COPE-059", "COPE-060"],
      pendingCompletedTaskRewards: {},
    });
    const staleProfile = createServerProfile({ current_td: 200, total_td: 200 });

    const merged = applyServerProfile(localState, staleProfile, {
      preservePendingCompletedRewardTaskIds: ["COPE-059", "COPE-060"],
    });

    expect(merged.economy.currentTD).toBe(1500);
    expect(merged.economy.totalTDEarned).toBe(1500);
  });

  it("does not resurrect TD the user already spent while a completed reward is pending", () => {
    const localState = createGameState({
      economy: {
        currentTD: 200,
        totalTDEarned: 1100,
        currentRank: "Junior Code Monkey",
        quotaPercent: 100,
        quotaLockouts: 0,
        tdMultiplier: 1,
      },
      pendingCompletedTaskIds: ["COPE-059"],
      pendingCompletedTaskRewards: { "COPE-059": { rewardTD: 1000 } },
    });
    const staleProfile = createServerProfile({ current_td: 100, total_td: 100 });

    const merged = applyServerProfile(localState, staleProfile, {
      preservePendingCompletedRewardTaskIds: ["COPE-059"],
    });

    expect(merged.economy.currentTD).toBe(200);
    expect(merged.economy.totalTDEarned).toBe(1100);
  });

  it("applies unrelated server-side current TD reductions while preserving the optimistic total", () => {
    const localState = createGameState({
      economy: {
        currentTD: 1500,
        totalTDEarned: 1500,
        currentRank: "Junior Code Monkey",
        quotaPercent: 100,
        quotaLockouts: 0,
        tdMultiplier: 1,
      },
      pendingCompletedTaskIds: ["COPE-059"],
      pendingCompletedTaskRewards: { "COPE-059": { rewardTD: 500 } },
    });
    const updatedProfile = createServerProfile({ current_td: 900, total_td: 1000 });

    const merged = applyServerProfile(localState, updatedProfile, {
      preservePendingCompletedRewardTaskIds: ["COPE-059"],
    });

    expect(merged.economy.currentTD).toBe(1400);
    expect(merged.economy.totalTDEarned).toBe(1500);
  });
});

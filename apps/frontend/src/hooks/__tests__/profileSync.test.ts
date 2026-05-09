import { describe, expect, it } from "vitest";
import type { GameState } from "../useGameState";
import { applyAuthoritativeProfile, applyServerProfile, getSettledPendingCompletedTaskIds } from "../profileSync";
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

describe("applyServerProfile", () => {
  it("preserves an unresolved completed-ticket reward against a stale server profile", () => {
    const prev = createGameState({
      economy: {
        currentTD: 1000,
        totalTDEarned: 1000,
        currentRank: "Junior Code Monkey",
        quotaPercent: 100,
        quotaLockouts: 0,
        tdMultiplier: 1,
      },
      pendingCompletedTaskIds: ["COPE-059"],
      pendingCompletedTaskRewards: { "COPE-059": { rewardTD: 1000 } },
    });

    const merged = applyServerProfile(prev, createServerProfile(), {
      preservePendingCompletedRewardTaskIds: ["COPE-059"],
    });

    expect(merged.economy.currentTD).toBe(1000);
    expect(merged.economy.totalTDEarned).toBe(1000);
  });

  it("preserves a legacy pending completed-ticket reward when the reward metadata is missing", () => {
    const prev = createGameState({
      economy: {
        currentTD: 1100,
        totalTDEarned: 1100,
        currentRank: "Junior Code Monkey",
        quotaPercent: 100,
        quotaLockouts: 0,
        tdMultiplier: 1,
      },
      pendingCompletedTaskIds: ["COPE-059"],
      pendingCompletedTaskRewards: {},
    });

    const merged = applyServerProfile(prev, createServerProfile({
      current_td: 100,
      total_td: 100,
    }), {
      preservePendingCompletedRewardTaskIds: ["COPE-059"],
    });

    expect(merged.economy.currentTD).toBe(1100);
    expect(merged.economy.totalTDEarned).toBe(1100);
  });

  it("preserves multiple legacy pending completed-ticket rewards when reward metadata is missing", () => {
    const prev = createGameState({
      economy: {
        currentTD: 1400,
        totalTDEarned: 1400,
        currentRank: "Junior Code Monkey",
        quotaPercent: 100,
        quotaLockouts: 0,
        tdMultiplier: 1,
      },
      pendingCompletedTaskIds: ["COPE-059", "COPE-060"],
      pendingCompletedTaskRewards: {},
    });

    const merged = applyServerProfile(prev, createServerProfile({
      current_td: 200,
      total_td: 200,
    }), {
      preservePendingCompletedRewardTaskIds: ["COPE-059", "COPE-060"],
    });

    expect(merged.economy.currentTD).toBe(1400);
    expect(merged.economy.totalTDEarned).toBe(1400);
  });

  it("preserves only the unresolved reward amount when the server also changed current TD", () => {
    const prev = createGameState({
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

    const merged = applyServerProfile(prev, createServerProfile({
      current_td: 900,
      total_td: 1000,
    }), {
      preservePendingCompletedRewardTaskIds: ["COPE-059"],
    });

    expect(merged.economy.currentTD).toBe(1400);
    expect(merged.economy.totalTDEarned).toBe(1500);
  });

  it("keeps newer server-earned current TD gains while a completed-ticket reward is still pending", () => {
    const prev = createGameState({
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

    const merged = applyServerProfile(prev, createServerProfile({
      current_td: 1250,
      total_td: 1250,
    }), {
      preservePendingCompletedRewardTaskIds: ["COPE-059"],
    });

    expect(merged.economy.currentTD).toBe(1750);
    expect(merged.economy.totalTDEarned).toBe(1750);
  });

  it("does not preserve a completed-ticket reward once the ticket is no longer pending", () => {
    const prev = createGameState({
      economy: {
        currentTD: 1000,
        totalTDEarned: 1000,
        currentRank: "Junior Code Monkey",
        quotaPercent: 100,
        quotaLockouts: 0,
        tdMultiplier: 1,
      },
      pendingCompletedTaskIds: [],
      pendingCompletedTaskRewards: {},
    });

    const merged = applyServerProfile(prev, createServerProfile({
      current_td: 900,
      total_td: 900,
    }), {
      preservePendingCompletedRewardTaskIds: ["COPE-059"],
    });

    expect(merged.economy.currentTD).toBe(900);
    expect(merged.economy.totalTDEarned).toBe(900);
  });

  it("does not mark a pending reward as settled when the authoritative profile is still stale", () => {
    const prev = createGameState({
      economy: {
        currentTD: 1000,
        totalTDEarned: 1500,
        currentRank: "Junior Code Monkey",
        quotaPercent: 100,
        quotaLockouts: 0,
        tdMultiplier: 1,
      },
      pendingCompletedTaskIds: ["COPE-059"],
      pendingCompletedTaskRewards: { "COPE-059": { rewardTD: 500 } },
    });

    const settledTaskIds = getSettledPendingCompletedTaskIds(prev, createServerProfile({
      current_td: 1000,
      total_td: 1000,
    }));

    expect(settledTaskIds).toEqual([]);
  });

  it("does not infer settled ticket IDs from aggregate authoritative totals", () => {
    const prev = createGameState({
      economy: {
        currentTD: 1800,
        totalTDEarned: 1800,
        currentRank: "Junior Code Monkey",
        quotaPercent: 100,
        quotaLockouts: 0,
        tdMultiplier: 1,
      },
      pendingCompletedTaskIds: ["COPE-059", "COPE-060"],
      pendingCompletedTaskRewards: {
        "COPE-059": { rewardTD: 500 },
        "COPE-060": { rewardTD: 300 },
      },
    });

    const settledTaskIds = getSettledPendingCompletedTaskIds(prev, createServerProfile({
      current_td: 1500,
      total_td: 1500,
    }));

    expect(settledTaskIds).toEqual([]);
  });

  it("does not infer settled ticket IDs even when one subset would match exactly", () => {
    const prev = createGameState({
      economy: {
        currentTD: 1400,
        totalTDEarned: 1400,
        currentRank: "Junior Code Monkey",
        quotaPercent: 100,
        quotaLockouts: 0,
        tdMultiplier: 1,
      },
      pendingCompletedTaskIds: ["COPE-059", "COPE-060", "COPE-061"],
      pendingCompletedTaskRewards: {
        "COPE-059": { rewardTD: 400 },
        "COPE-060": { rewardTD: 250 },
        "COPE-061": { rewardTD: 250 },
      },
    });

    const settledTaskIds = getSettledPendingCompletedTaskIds(prev, createServerProfile({
      current_td: 1250,
      total_td: 1250,
    }));

    expect(settledTaskIds).toEqual([]);
  });

  it("does not infer settled ticket IDs when an intersection exists across matching subsets", () => {
    const prev = createGameState({
      economy: {
        currentTD: 1400,
        totalTDEarned: 1400,
        currentRank: "Junior Code Monkey",
        quotaPercent: 100,
        quotaLockouts: 0,
        tdMultiplier: 1,
      },
      pendingCompletedTaskIds: ["COPE-059", "COPE-060", "COPE-061"],
      pendingCompletedTaskRewards: {
        "COPE-059": { rewardTD: 500 },
        "COPE-060": { rewardTD: 300 },
        "COPE-061": { rewardTD: 300 },
      },
    });

    const settledTaskIds = getSettledPendingCompletedTaskIds(prev, createServerProfile({
      current_td: 1100,
      total_td: 1100,
    }));

    expect(settledTaskIds).toEqual([]);
  });

  it("applies the authoritative profile before clearing settled pending reward metadata", () => {
    const prev = createGameState({
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
      inventory: { legacy: 1 },
    });

    const merged = applyAuthoritativeProfile(prev, createServerProfile({
      current_td: 1300,
      total_td: 1500,
      inventory: { legacy: 2, ci_cd: 1 },
    }), {
      preservePendingCompletedRewardTaskIds: ["COPE-059"],
      settledPendingCompletedRewardTaskIds: ["COPE-059"],
    });

    expect(merged.economy.currentTD).toBe(1300);
    expect(merged.economy.totalTDEarned).toBe(1500);
    expect(merged.inventory).toEqual({ legacy: 2, ci_cd: 1 });
    expect(merged.pendingCompletedTaskIds).toEqual([]);
    expect(merged.pendingCompletedTaskRewards).toEqual({});
  });

  it("does not clear pending reward metadata on an authoritative merge without explicit settlement IDs", () => {
    const prev = createGameState({
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

    const merged = applyAuthoritativeProfile(prev, createServerProfile({
      current_td: 1300,
      total_td: 1500,
    }), {
      preservePendingCompletedRewardTaskIds: ["COPE-059"],
      settledPendingCompletedRewardTaskIds: [],
    });

    expect(merged.economy.currentTD).toBe(1800);
    expect(merged.economy.totalTDEarned).toBe(2000);
    expect(merged.pendingCompletedTaskIds).toEqual(["COPE-059"]);
    expect(merged.pendingCompletedTaskRewards).toEqual({ "COPE-059": { rewardTD: 500 } });
  });

  it("does not attempt exponential subset search once the pending set exceeds the safety cap", () => {
    const pendingCompletedTaskIds = Array.from({ length: 13 }, (_, index) => `COPE-${index + 100}`);
    const pendingCompletedTaskRewards = Object.fromEntries(
      pendingCompletedTaskIds.map((ticketId) => [ticketId, { rewardTD: 100 }]),
    );
    const prev = createGameState({
      economy: {
        currentTD: 1300,
        totalTDEarned: 1300,
        currentRank: "Junior Code Monkey",
        quotaPercent: 100,
        quotaLockouts: 0,
        tdMultiplier: 1,
      },
      pendingCompletedTaskIds,
      pendingCompletedTaskRewards,
    });

    const settledTaskIds = getSettledPendingCompletedTaskIds(prev, createServerProfile({
      current_td: 600,
      total_td: 600,
    }));

    expect(settledTaskIds).toEqual([]);
  });
});

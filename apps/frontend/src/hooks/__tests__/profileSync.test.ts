import { describe, expect, it } from "vitest";
import type { GameState } from "../useGameState";
import {
  applyAuthoritativeProfile,
  applyServerProfile,
  createAuthoritativeProfileFloor,
  isServerProfileStaleAgainstFloor,
  mergeAuthoritativeProfileFloor,
  settlePendingCompletedRewards,
} from "../profileSync";
import { createServerProfile } from "../../test/createServerProfile";

const defaultEconomy = {
  currentTD: 0,
  totalTDEarned: 0,
  currentRank: "Junior Code Monkey",
  quotaPercent: 100,
  quotaLockouts: 0,
  tdMultiplier: 1,
};

function createGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    version: "1.0",
    username: "alice",
    lastLogin: 0,
    economy: { ...defaultEconomy },
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
    isExecutiveSupporter: false,
    ...overrides,
  };
}

function createEconomy(currentTD: number, totalTDEarned = currentTD) {
  return { ...defaultEconomy, currentTD, totalTDEarned };
}

function createPendingRewardState(
  currentTD: number,
  pendingCompletedTaskIds: string[],
  pendingCompletedTaskRewards: GameState["pendingCompletedTaskRewards"],
  overrides: Partial<GameState> = {},
) {
  return createGameState({
    economy: createEconomy(currentTD),
    pendingCompletedTaskIds,
    pendingCompletedTaskRewards,
    ...overrides,
  });
}

describe("applyServerProfile", () => {
  it("preserves an unresolved completed-ticket reward against a stale server profile", () => {
    const prev = createPendingRewardState(1000, ["COPE-059"], { "COPE-059": { rewardTD: 1000 } });

    const merged = applyServerProfile(prev, createServerProfile(), {
      preservePendingCompletedRewardTaskIds: ["COPE-059"],
    });

    expect(merged.economy.currentTD).toBe(1000);
    expect(merged.economy.totalTDEarned).toBe(1000);
  });

  it("hydrates executive supporter entitlement from the server profile", () => {
    const merged = applyServerProfile(createGameState(), createServerProfile({
      is_executive_supporter: true,
    }));

    expect(merged.isExecutiveSupporter).toBe(true);
  });

  it("hydrates displayRank from the server profile", () => {
    const merged = applyServerProfile(createGameState(), createServerProfile({
      display_rank: "Mid-Level Googler",
    }));

    expect(merged.displayRank).toBe("Mid-Level Googler");
    expect(merged.economy.currentRank).toBe("Junior Code Monkey");
  });

  it("preserves a legacy pending completed-ticket reward when the reward metadata is missing", () => {
    const prev = createPendingRewardState(1100, ["COPE-059"], {});

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
    const prev = createPendingRewardState(1400, ["COPE-059", "COPE-060"], {});

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
    const prev = createPendingRewardState(1500, ["COPE-059"], { "COPE-059": { rewardTD: 500 } });

    const merged = applyServerProfile(prev, createServerProfile({
      current_td: 900,
      total_td: 1000,
    }), {
      preservePendingCompletedRewardTaskIds: ["COPE-059"],
    });

    expect(merged.economy.currentTD).toBe(1400);
    expect(merged.economy.totalTDEarned).toBe(1500);
  });

  it("applies positive server-side current TD gains on top of an unresolved reward", () => {
    const prev = createPendingRewardState(1500, ["COPE-059"], { "COPE-059": { rewardTD: 500 } });

    const merged = applyServerProfile(prev, createServerProfile({
      current_td: 1200,
      total_td: 1200,
    }), {
      preservePendingCompletedRewardTaskIds: ["COPE-059"],
    });

    expect(merged.economy.currentTD).toBe(1700);
    expect(merged.economy.totalTDEarned).toBe(1500);
  });

  it("preserves local balances when multiple pending rewards exceed the reliable local baseline", () => {
    const prev = createPendingRewardState(1500, ["COPE-059", "COPE-060"], {
      "COPE-059": { rewardTD: 500 },
      "COPE-060": { rewardTD: 1000 },
    });

    const merged = applyServerProfile(prev, createServerProfile({
      current_td: 1000,
      total_td: 1000,
    }), {
      preservePendingCompletedRewardTaskIds: ["COPE-059", "COPE-060"],
    });

    expect(merged.economy.currentTD).toBe(1500);
    expect(merged.economy.totalTDEarned).toBe(1500);
  });

  it("does not double-count a pending reward when the authoritative total already includes it", () => {
    const prev = createPendingRewardState(1500, ["COPE-059"], { "COPE-059": { rewardTD: 500 } });

    const merged = applyServerProfile(prev, createServerProfile({
      current_td: 1500,
      total_td: 1500,
    }), {
      preservePendingCompletedRewardTaskIds: ["COPE-059"],
    });

    expect(merged.economy.currentTD).toBe(1500);
    expect(merged.economy.totalTDEarned).toBe(1500);
  });

  it("only preserves pending reward TD backed by explicit metadata", () => {
    const prev = createPendingRewardState(2000, ["COPE-059", "COPE-060"], { "COPE-059": { rewardTD: 500 } });

    const merged = applyServerProfile(prev, createServerProfile({
      current_td: 1000,
      total_td: 1000,
    }), {
      preservePendingCompletedRewardTaskIds: ["COPE-059", "COPE-060"],
    });

    expect(merged.economy.currentTD).toBe(1500);
    expect(merged.economy.totalTDEarned).toBe(2000);
  });

  it("keeps the optimistic local total while a completed-ticket reward is still pending", () => {
    const prev = createPendingRewardState(1500, ["COPE-059"], { "COPE-059": { rewardTD: 500 } });

    const merged = applyServerProfile(prev, createServerProfile({
      current_td: 1250,
      total_td: 1250,
    }), {
      preservePendingCompletedRewardTaskIds: ["COPE-059"],
    });

    expect(merged.economy.currentTD).toBe(1500);
    expect(merged.economy.totalTDEarned).toBe(1500);
  });

  it("does not preserve a completed-ticket reward once the ticket is no longer pending", () => {
    const prev = createPendingRewardState(1000, [], {});

    const merged = applyServerProfile(prev, createServerProfile({
      current_td: 900,
      total_td: 900,
    }), {
      preservePendingCompletedRewardTaskIds: ["COPE-059"],
    });

    expect(merged.economy.currentTD).toBe(900);
    expect(merged.economy.totalTDEarned).toBe(900);
  });

  it("converges to server truth after a successful score sync settles the pending reward", () => {
    const prev = createPendingRewardState(1500, ["COPE-059"], { "COPE-059": { rewardTD: 500 } });

    const settled = settlePendingCompletedRewards(prev, ["COPE-059"]);
    const merged = applyServerProfile(settled, createServerProfile({
      current_td: 1300,
      total_td: 1500,
    }), {
      preservePendingCompletedRewardTaskIds: ["COPE-059"],
    });

    expect(merged.economy.currentTD).toBe(1300);
    expect(merged.economy.totalTDEarned).toBe(1500);
  });

  it("applies the authoritative profile before clearing settled pending reward metadata", () => {
    const prev = createPendingRewardState(1500, ["COPE-059"], { "COPE-059": { rewardTD: 500 } }, {
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
    expect(merged.authoritativeProfileFloor).toEqual({ currentTD: 1300, totalTD: 1500 });
  });

  it("does not clear pending reward metadata on an authoritative merge without explicit settlement IDs", () => {
    const prev = createPendingRewardState(1500, ["COPE-059"], { "COPE-059": { rewardTD: 500 } });

    const merged = applyAuthoritativeProfile(prev, createServerProfile({
      current_td: 1300,
      total_td: 1500,
    }), {
      preservePendingCompletedRewardTaskIds: ["COPE-059"],
    });

    expect(merged.economy.currentTD).toBe(1500);
    expect(merged.economy.totalTDEarned).toBe(1500);
    expect(merged.pendingCompletedTaskIds).toEqual(["COPE-059"]);
    expect(merged.pendingCompletedTaskRewards).toEqual({ "COPE-059": { rewardTD: 500 } });
  });

  it("accepts newer authoritative totals without treating them as explicit pending-reward settlement", () => {
    const prev = createPendingRewardState(1500, ["COPE-059"], { "COPE-059": { rewardTD: 500 } });

    const merged = applyAuthoritativeProfile(prev, createServerProfile({
      current_td: 1600,
      total_td: 1800,
    }), {
      preservePendingCompletedRewardTaskIds: ["COPE-059"],
    });

    expect(merged.economy.currentTD).toBe(1600);
    expect(merged.economy.totalTDEarned).toBe(1800);
    expect(merged.pendingCompletedTaskIds).toEqual(["COPE-059"]);
    expect(merged.pendingCompletedTaskRewards).toEqual({ "COPE-059": { rewardTD: 500 } });
  });
});

describe("isServerProfileStaleAgainstFloor", () => {
  it("treats lower aggregate totals as stale after an authoritative settlement", () => {
    const floor = createAuthoritativeProfileFloor(createServerProfile({ total_td: 1500, current_td: 1300 }));

    expect(isServerProfileStaleAgainstFloor(createServerProfile({ total_td: 1400, current_td: 1200 }), floor)).toBe(true);
    expect(isServerProfileStaleAgainstFloor(createServerProfile({ total_td: 1500, current_td: 1100 }), floor)).toBe(false);
    expect(isServerProfileStaleAgainstFloor(createServerProfile({ total_td: 1600, current_td: 1400 }), floor)).toBe(false);
  });

  it("treats a same-total profile with a stale higher current TD as stale", () => {
    const floor = createAuthoritativeProfileFloor(createServerProfile({ total_td: 1500, current_td: 1300 }));

    expect(isServerProfileStaleAgainstFloor(createServerProfile({ total_td: 1500, current_td: 1500 }), floor)).toBe(true);
    expect(isServerProfileStaleAgainstFloor(createServerProfile({ total_td: 1500, current_td: 1250 }), floor)).toBe(false);
  });

  it("continues rejecting older profiles after a non-stale profile advances the floor", () => {
    const settledFloor = createAuthoritativeProfileFloor(createServerProfile({ total_td: 1500, current_td: 1300 }));
    const advancedFloor = mergeAuthoritativeProfileFloor(
      settledFloor,
      createAuthoritativeProfileFloor(createServerProfile({ total_td: 1600, current_td: 1400 })),
    );

    expect(isServerProfileStaleAgainstFloor(createServerProfile({ total_td: 1500, current_td: 1200 }), advancedFloor)).toBe(true);
    expect(isServerProfileStaleAgainstFloor(createServerProfile({ total_td: 1600, current_td: 1400 }), advancedFloor)).toBe(false);
  });
});

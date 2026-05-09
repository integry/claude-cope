/* eslint-disable max-lines */
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { buildSprintCallbacks } from "../buildChatSubmitArgs";
import type { GameState } from "../../hooks/useGameState";
import { applyServerProfile } from "../../hooks/profileSync";
import { createServerProfile } from "../../test/createServerProfile";

const DEFAULT_TICKET = {
  id: "COPE-059",
  title: "Do Crimes To YAML",
  sprintProgress: 90,
  sprintGoal: 100,
};

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

function createSprintCallbacks(
  overrides: Partial<GameState> = {},
  callbacks: Partial<Parameters<typeof buildSprintCallbacks>[0]> = {},
) {
  return buildSprintCallbacks({
    getState: () => createGameState({
      proKeyHash: "fresh-pro-hash",
      activeTicket: DEFAULT_TICKET,
      ...overrides,
    }),
    updateTicketProgress: vi.fn(),
    addActiveTD: vi.fn(),
    playChime: vi.fn(),
    setState: vi.fn(),
    ...callbacks,
  });
}

async function waitForAssertion(assertion: () => void, timeoutMs = 200) {
  const deadline = Date.now() + timeoutMs;

  while (true) {
    try {
      assertion();
      return;
    } catch (error) {
      if (Date.now() >= deadline) throw error;
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
  }
}

describe("buildSprintCallbacks", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("only sends the completed ticket identifier when syncing a completed paid ticket", async () => {
    const playChime = vi.fn();
    const addActiveTD = vi.fn();
    const setState = vi.fn((updater: (prev: GameState) => GameState) => updater(createGameState({
      proKeyHash: "fresh-pro-hash",
      inventory: { legacy: 7 },
      upgrades: ["dark_mode"],
      activeTicket: DEFAULT_TICKET,
    })));

    const { onSprintProgress } = buildSprintCallbacks({
      getState: () => createGameState({
        proKeyHash: "fresh-pro-hash",
        inventory: { legacy: 7 },
        upgrades: ["dark_mode"],
        activeTicket: DEFAULT_TICKET,
      }),
      updateTicketProgress: vi.fn(),
      addActiveTD,
      playChime,
      setState,
    });

    await onSprintProgress(10);

    const scoreCall = fetchMock.mock.calls.find(([url]) => url === "/api/score");
    expect(scoreCall).toBeTruthy();
    expect(JSON.parse(scoreCall![1]?.body as string)).toEqual({
      username: "alice",
      completedTaskIds: ["COPE-059"],
      proKeyHash: "fresh-pro-hash",
    });
  });

  it("preserves the completed-ticket bonus against a stale server profile while reward sync is pending", async () => {
    const scoreProfile = createServerProfile();
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ profile: scoreProfile }), { status: 200 }));

    const { onSprintProgress } = createSprintCallbacks({
      economy: {
        currentTD: 0,
        totalTDEarned: 0,
        currentRank: "Junior Code Monkey",
        quotaPercent: 100,
        quotaLockouts: 0,
        tdMultiplier: 1,
      },
    }, { onCompletedRewardSettled: vi.fn() });

    onSprintProgress(10);
    await waitForAssertion(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/score", expect.any(Object));
    });

    const localState = createGameState({
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
    const staleProfile = createServerProfile({ current_td: 0, total_td: 0 });

    const merged = applyServerProfile(localState, staleProfile, {
      preservePendingCompletedRewardTaskIds: ["COPE-059"],
    });

    expect(merged.economy.currentTD).toBe(1000);
    expect(merged.economy.totalTDEarned).toBe(1000);
  });

  it("keeps the pending reward until a server profile confirms the completed reward", async () => {
    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/score") {
        return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
      }
      if (url === "/api/account/me") {
        return Promise.resolve(new Response(JSON.stringify({ found: false }), { status: 200 }));
      }
      return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    });
    const onCompletedRewardSettled = vi.fn();

    const { onSprintProgress } = createSprintCallbacks({}, { onCompletedRewardSettled });

    onSprintProgress(10);
    await waitForAssertion(() => {
      expect(fetchMock.mock.calls.some(([url]) => url === "/api/account/me")).toBe(true);
    });

    expect(onCompletedRewardSettled).not.toHaveBeenCalled();
  });

  it("does not replay completion side effects when sprint completion fires twice for the same ticket", async () => {
    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/score") {
        return Promise.resolve(new Response(JSON.stringify({ ok: true, profile: createServerProfile() }), { status: 200 }));
      }
      return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    });
    const addActiveTD = vi.fn();
    const playChime = vi.fn();

    const { onSprintProgress } = buildSprintCallbacks({
      getState: () => createGameState({
        proKeyHash: "fresh-pro-hash",
        activeTicket: DEFAULT_TICKET,
      }),
      updateTicketProgress: vi.fn(),
      addActiveTD,
      playChime,
      setState: vi.fn(),
    });

    onSprintProgress(10);
    onSprintProgress(10);
    await waitForAssertion(() => {
      expect(fetchMock.mock.calls.filter(([url]) => url === "/api/score")).toHaveLength(1);
    });

    expect(addActiveTD).toHaveBeenCalledTimes(1);
    expect(playChime).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls.filter(([url]) => url === "/api/score")).toHaveLength(1);
    expect(fetchMock.mock.calls.filter(([url]) => url === "/api/recent-events")).toHaveLength(1);
  });

  it("settles the pending reward after /api/score returns an updated profile", async () => {
    const settledProfile = createServerProfile();
    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/score") {
        return Promise.resolve(new Response(JSON.stringify({ ok: true, profile: settledProfile }), { status: 200 }));
      }
      return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    });
    const onCompletedRewardSettled = vi.fn();

    const { onSprintProgress } = createSprintCallbacks({}, { onCompletedRewardSettled });

    onSprintProgress(10);
    await waitForAssertion(() => {
      expect(onCompletedRewardSettled).toHaveBeenCalledWith("COPE-059", settledProfile);
    });
  });

  it("keeps the pending reward unsettled when completed reward sync fails", async () => {
    fetchMock.mockRejectedValue(new Error("network"));
    const onCompletedRewardSettled = vi.fn();

    const { onSprintProgress } = createSprintCallbacks({}, { onCompletedRewardSettled });

    onSprintProgress(10);
    await waitForAssertion(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/score", expect.any(Object));
    });

    expect(onCompletedRewardSettled).not.toHaveBeenCalled();
  });

  it("preserves only the unresolved completed-ticket bonus after a failed sync and later accepts newer server balances", () => {
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
    const staleProfile = createServerProfile({ current_td: 1000, total_td: 1000 });
    const newerProfile = createServerProfile({ current_td: 1250, total_td: 1250 });

    const mergedAfterStaleChat = applyServerProfile(localState, staleProfile, {
      preservePendingCompletedRewardTaskIds: ["COPE-059"],
    });
    const mergedAfterRetry = applyServerProfile(localState, newerProfile, {
      preservePendingCompletedRewardTaskIds: ["COPE-059"],
    });

    expect(mergedAfterStaleChat.economy.currentTD).toBe(1500);
    expect(mergedAfterStaleChat.economy.totalTDEarned).toBe(1500);
    expect(mergedAfterRetry.economy.currentTD).toBe(1500);
    expect(mergedAfterRetry.economy.totalTDEarned).toBe(1750);
  });

  it("tracks pending completed task rewards for paid users even before a pro key hash is available", () => {
    const setState = vi.fn((updater: (prev: GameState) => GameState) => updater(createGameState({
      proKey: "MAX-LICENSE-KEY-123",
      proKeyHash: undefined,
      activeTicket: DEFAULT_TICKET,
    })));

    const { onSprintProgress } = createSprintCallbacks({
      proKey: "MAX-LICENSE-KEY-123",
      proKeyHash: undefined,
    }, { setState });

    onSprintProgress(10);

    const nextState = setState.mock.results[0]?.value as GameState;
    expect(nextState.pendingCompletedTaskIds).toEqual(["COPE-059"]);
    expect(nextState.pendingCompletedTaskRewards).toEqual({ "COPE-059": { rewardTD: 1000 } });

    const scoreCall = fetchMock.mock.calls.find(([url]) => url === "/api/score");
    expect(scoreCall).toBeTruthy();
    expect(JSON.parse(scoreCall![1]?.body as string)).toEqual({
      username: "alice",
      completedTaskIds: ["COPE-059"],
    });
  });

  it("does not track pending completed task IDs when the user is unpaid", () => {
    const setState = vi.fn((updater: (prev: GameState) => GameState) => updater(createGameState({
      proKey: undefined,
      activeTicket: DEFAULT_TICKET,
    })));

    const { onSprintProgress } = createSprintCallbacks({
      proKey: undefined,
      proKeyHash: undefined,
      isPro: undefined,
    }, { setState });

    onSprintProgress(10);

    const nextState = setState.mock.results[0]?.value as GameState;
    expect(nextState.pendingCompletedTaskIds).toEqual([]);
    expect(nextState.pendingCompletedTaskRewards).toEqual({});
  });

  it("does not append duplicate pending completed task IDs for the same ticket", () => {
    const setState = vi.fn((updater: (prev: GameState) => GameState) => updater(createGameState({
      proKeyHash: "fresh-pro-hash",
      activeTicket: DEFAULT_TICKET,
      pendingCompletedTaskIds: ["COPE-059"],
      pendingCompletedTaskRewards: { "COPE-059": { rewardTD: 1000 } },
    })));

    const { onSprintProgress } = createSprintCallbacks({ pendingCompletedTaskIds: ["COPE-059"] }, { setState });

    onSprintProgress(10);

    const nextState = setState.mock.results[0]?.value as GameState;
    expect(nextState.pendingCompletedTaskIds).toEqual(["COPE-059"]);
    expect(nextState.pendingCompletedTaskRewards).toEqual({ "COPE-059": { rewardTD: 1000 } });
  });

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

  it("applies unrelated server-side current TD changes while preserving only the unresolved reward amount", () => {
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

  it("keeps newer server-earned current TD gains while the completed-ticket reward is still pending", () => {
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
    const newerProfile = createServerProfile({ current_td: 1250, total_td: 1250 });

    const merged = applyServerProfile(localState, newerProfile, {
      preservePendingCompletedRewardTaskIds: ["COPE-059"],
    });

    expect(merged.economy.currentTD).toBe(1750);
    expect(merged.economy.totalTDEarned).toBe(1750);
  });
});

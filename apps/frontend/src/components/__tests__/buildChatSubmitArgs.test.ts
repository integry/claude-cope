import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { buildSprintCallbacks, syncCompletedTicketReward } from "../buildChatSubmitArgs";
import type { GameState } from "../../hooks/useGameState";
import { applyServerProfile } from "../../hooks/profileSync";
import type { ServerProfile } from "@claude-cope/shared/profile";

const DEFAULT_TICKET = {
  id: "COPE-059",
  title: "Do Crimes To YAML",
  sprintProgress: 90,
  sprintGoal: 100,
};

function createServerProfile(overrides: Partial<ServerProfile> = {}): ServerProfile {
  return {
    username: "alice",
    current_td: 1000,
    total_td: 1000,
    corporate_rank: "Junior Code Monkey",
    inventory: {},
    upgrades: [],
    achievements: [],
    buddy_type: null,
    buddy_is_shiny: false,
    unlocked_themes: ["default"],
    active_theme: "default",
    active_ticket: null,
    td_multiplier: 1,
    multiplier: 1,
    quota_percent: 100,
    ...overrides,
  };
}

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

describe("syncCompletedTicketReward", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts completed task IDs to /api/score for pro users without relying on local totals", async () => {
    await syncCompletedTicketReward({
      username: "alice",
      ticketId: "COPE-115",
      proKeyHash: "pro-hash",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/score");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(init?.body as string)).toEqual({
      username: "alice",
      completedTaskIds: ["COPE-115"],
      proKeyHash: "pro-hash",
    });
  });

  it("falls back to fetching the session profile when /api/score succeeds without returning one", async () => {
    const sessionProfile = createServerProfile();
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ found: true, profile: sessionProfile }), { status: 200 }));

    const result = await syncCompletedTicketReward({
      username: "alice",
      ticketId: "COPE-115",
      proKeyHash: "pro-hash",
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1]?.[0]).toBe("/api/account/me");
    expect(result).toEqual({ ok: true, profile: sessionProfile });
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
    await Promise.resolve();
    await Promise.resolve();

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
    await Promise.resolve();
    await Promise.resolve();

    expect(onCompletedRewardSettled).not.toHaveBeenCalled();
  });

  it("settles the pending reward after a successful /api/score response fetches the current session profile", async () => {
    const settledProfile = createServerProfile();
    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/score") {
        return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
      }
      if (url === "/api/account/me") {
        return Promise.resolve(new Response(JSON.stringify({ found: true, profile: settledProfile }), { status: 200 }));
      }
      return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    });
    const onCompletedRewardSettled = vi.fn();

    const { onSprintProgress } = createSprintCallbacks({}, { onCompletedRewardSettled });

    onSprintProgress(10);
    await Promise.resolve();
    await Promise.resolve();

    expect(onCompletedRewardSettled).toHaveBeenCalledWith("COPE-059", settledProfile);
  });

  it("keeps the pending reward unsettled when completed reward sync fails", async () => {
    fetchMock.mockRejectedValue(new Error("network"));
    const onCompletedRewardSettled = vi.fn();

    const { onSprintProgress } = createSprintCallbacks({}, { onCompletedRewardSettled });

    onSprintProgress(10);
    await Promise.resolve();
    await Promise.resolve();

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
    });
    const staleProfile = createServerProfile();
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
    expect(mergedAfterRetry.economy.totalTDEarned).toBe(1500);
  });

  it("does not track pending completed task IDs when the reward cannot be synced", () => {
    const setState = vi.fn((updater: (prev: GameState) => GameState) => updater(createGameState({
      activeTicket: DEFAULT_TICKET,
    })));

    const { onSprintProgress } = createSprintCallbacks({ proKeyHash: undefined }, { setState });

    onSprintProgress(10);

    const nextState = setState.mock.results[0]?.value as GameState;
    expect(nextState.pendingCompletedTaskIds).toEqual([]);
  });

  it("does not append duplicate pending completed task IDs for the same ticket", () => {
    const setState = vi.fn((updater: (prev: GameState) => GameState) => updater(createGameState({
      proKeyHash: "fresh-pro-hash",
      activeTicket: DEFAULT_TICKET,
      pendingCompletedTaskIds: ["COPE-059"],
    })));

    const { onSprintProgress } = createSprintCallbacks({ pendingCompletedTaskIds: ["COPE-059"] }, { setState });

    onSprintProgress(10);

    const nextState = setState.mock.results[0]?.value as GameState;
    expect(nextState.pendingCompletedTaskIds).toEqual(["COPE-059"]);
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
    });
    const staleProfile = createServerProfile();

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
    });
    const updatedProfile = createServerProfile({ current_td: 900 });

    const merged = applyServerProfile(localState, updatedProfile, {
      preservePendingCompletedRewardTaskIds: ["COPE-059"],
    });

    expect(merged.economy.currentTD).toBe(1400);
    expect(merged.economy.totalTDEarned).toBe(1500);
  });
});

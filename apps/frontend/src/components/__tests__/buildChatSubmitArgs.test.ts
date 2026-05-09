import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { buildSprintCallbacks } from "../buildChatSubmitArgs";
import type { GameState } from "../../hooks/useGameState";
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

  it("keeps the pending reward unsettled when /api/score succeeds without returning a profile", async () => {
    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/score") {
        return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
      }
      return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    });
    const onCompletedRewardSettled = vi.fn();

    const { onSprintProgress } = createSprintCallbacks({}, { onCompletedRewardSettled });

    onSprintProgress(10);
    await waitForAssertion(() => {
      expect(fetchMock.mock.calls.some(([url]) => url === "/api/score")).toBe(true);
    });
    expect(fetchMock.mock.calls.some(([url]) => url === "/api/account/me")).toBe(false);
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

  it("leaves settlement pending when /api/score succeeds without an embedded profile", async () => {
    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/score") {
        return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
      }
      return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    });
    const onCompletedRewardSettled = vi.fn();

    const { onSprintProgress } = createSprintCallbacks({}, { onCompletedRewardSettled });

    onSprintProgress(10);
    await waitForAssertion(() => {
      expect(fetchMock.mock.calls.some(([url]) => url === "/api/score")).toBe(true);
    });
    expect(fetchMock.mock.calls.some(([url]) => url === "/api/account/me")).toBe(false);
    expect(onCompletedRewardSettled).not.toHaveBeenCalled();
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

  it("tracks pending completed task rewards before a pro key hash is available", () => {
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
    expect(fetchMock.mock.calls.some(([url]) => url === "/api/score")).toBe(false);
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
});

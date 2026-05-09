// @vitest-environment jsdom
import { act, createElement, type Dispatch, type SetStateAction } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { GameState } from "../gameStateUtils";
import { fetchSessionProfile } from "../../api/profileApi";
import { shouldBackgroundSyncScore, useScoreSync } from "../useGameEffects";
import { createServerProfile } from "../../test/createServerProfile";

vi.mock("../../api/profileApi", () => ({
  fetchSessionProfile: vi.fn(),
  unlockAchievementServer: vi.fn(),
}));

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

function ScoreSyncHarness(props: {
  stateRef: { current: GameState };
  setState: Dispatch<SetStateAction<GameState>>;
  initialTotalTD: number;
}) {
  useScoreSync(props.stateRef, props.setState, props.initialTotalTD);
  return null;
}

describe("useScoreSync", () => {
  const fetchMock = vi.fn();
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("navigator", { language: "en-US" });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root.unmount();
      });
    }
    container?.remove();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("keeps pending completed rewards pending when /api/score falls back to a stale session profile", async () => {
    const staleProfile = createServerProfile({ current_td: 1000, total_td: 1000 });
    vi.mocked(fetchSessionProfile).mockResolvedValue({
      found: true,
      username: "alice",
      profile: staleProfile,
    });
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    let state = makeState({
      proKeyHash: "pro-hash",
      economy: {
        currentTD: 1500,
        totalTDEarned: 1500,
        currentRank: "Junior Code Monkey",
        quotaPercent: 100,
        quotaLockouts: 0,
        tdMultiplier: 1,
      },
      pendingCompletedTaskIds: ["COPE-115"],
      pendingCompletedTaskRewards: { "COPE-115": { rewardTD: 500 } },
    });
    const stateRef = { current: state };
    const setState: Dispatch<SetStateAction<GameState>> = vi.fn((updater: SetStateAction<GameState>) => {
      state = typeof updater === "function" ? updater(state) : updater;
      stateRef.current = state;
    });

    act(() => {
      root.render(createElement(ScoreSyncHarness, { stateRef, setState, initialTotalTD: 1000 }));
    });

    await act(async () => {
      vi.advanceTimersByTime(300000);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/score", expect.objectContaining({ method: "POST" }));
    expect(fetchSessionProfile).toHaveBeenCalledTimes(1);
    expect(setState).toHaveBeenCalledTimes(1);
    expect(state.pendingCompletedTaskIds).toEqual(["COPE-115"]);
    expect(state.pendingCompletedTaskRewards).toEqual({ "COPE-115": { rewardTD: 500 } });
    expect(state.economy.currentTD).toBe(1500);
    expect(state.economy.totalTDEarned).toBe(1500);
  });

  it("does not merge profiles after an application-level /api/score failure", async () => {
    vi.mocked(fetchSessionProfile).mockResolvedValue({
      found: true,
      username: "alice",
      profile: createServerProfile({ current_td: 1000, total_td: 1000 }),
    });
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: false, error: "retry" }), { status: 200 }));

    let state = makeState({
      proKeyHash: "pro-hash",
      economy: {
        currentTD: 1500,
        totalTDEarned: 1500,
        currentRank: "Junior Code Monkey",
        quotaPercent: 100,
        quotaLockouts: 0,
        tdMultiplier: 1,
      },
      pendingCompletedTaskIds: ["COPE-115"],
      pendingCompletedTaskRewards: { "COPE-115": { rewardTD: 500 } },
    });
    const stateRef = { current: state };
    const setState: Dispatch<SetStateAction<GameState>> = vi.fn((updater: SetStateAction<GameState>) => {
      state = typeof updater === "function" ? updater(state) : updater;
      stateRef.current = state;
    });

    act(() => {
      root.render(createElement(ScoreSyncHarness, { stateRef, setState, initialTotalTD: 1000 }));
    });

    await act(async () => {
      vi.advanceTimersByTime(300000);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(fetchSessionProfile).not.toHaveBeenCalled();
    expect(setState).not.toHaveBeenCalled();
    expect(state.pendingCompletedTaskIds).toEqual(["COPE-115"]);
    expect(state.pendingCompletedTaskRewards).toEqual({ "COPE-115": { rewardTD: 500 } });
  });
});

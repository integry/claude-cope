import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { buildSprintCallbacks, syncCompletedTicketReward } from "../buildChatSubmitArgs";
import type { GameState } from "../../hooks/useGameState";
import { applyServerProfile, type PendingCompletedRewardMerge } from "../../hooks/profileSync";
import type { ServerProfile } from "@claude-cope/shared/profile";

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
      currentTD: 0,
      totalTDEarned: 0,
      inventory: {},
      upgrades: [],
      completedTaskIds: ["COPE-115"],
      proKeyHash: "pro-hash",
    });
  });

  it("uses the latest state when syncing a completed paid ticket", async () => {
    const playChime = vi.fn();
    const addActiveTD = vi.fn();
    const setState = vi.fn((updater: (prev: GameState) => GameState) => updater(createGameState({
      proKeyHash: "fresh-pro-hash",
      activeTicket: { id: "COPE-059", title: "Do Crimes To YAML", sprintProgress: 90, sprintGoal: 100 },
    })));

    const { onSprintProgress } = buildSprintCallbacks({
      getState: () => createGameState({
        proKeyHash: "fresh-pro-hash",
        activeTicket: { id: "COPE-059", title: "Do Crimes To YAML", sprintProgress: 90, sprintGoal: 100 },
      }),
      updateTicketProgress: vi.fn(),
      addActiveTD,
      playChime,
      setState,
    });

    await onSprintProgress(10);

    const scoreCall = fetchMock.mock.calls.find(([url]) => url === "/api/score");
    expect(scoreCall).toBeTruthy();
    expect(JSON.parse(scoreCall![1]?.body as string)).toMatchObject({
      username: "alice",
      currentTD: 1000,
      totalTDEarned: 1000,
      inventory: {},
      upgrades: [],
      completedTaskIds: ["COPE-059"],
      proKeyHash: "fresh-pro-hash",
    });
  });

  it("preserves the completed-ticket bonus against a stale server profile while reward sync is pending", async () => {
    let pendingReward: PendingCompletedRewardMerge | null = null;
    const scoreProfile: ServerProfile = {
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
    };
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ profile: scoreProfile }), { status: 200 }));

    const { onSprintProgress } = buildSprintCallbacks({
      getState: () => createGameState({
        proKeyHash: "fresh-pro-hash",
        economy: {
          currentTD: 0,
          totalTDEarned: 0,
          currentRank: "Junior Code Monkey",
          quotaPercent: 100,
          quotaLockouts: 0,
          tdMultiplier: 1,
        },
        activeTicket: { id: "COPE-059", title: "Do Crimes To YAML", sprintProgress: 90, sprintGoal: 100 },
      }),
      updateTicketProgress: vi.fn(),
      addActiveTD: vi.fn(),
      playChime: vi.fn(),
      setState: vi.fn(),
      onCompletedRewardPending: (pending) => {
        pendingReward = pending;
      },
      onCompletedRewardProfile: vi.fn(),
    });

    onSprintProgress(10);
    await Promise.resolve();
    await Promise.resolve();

    expect(pendingReward).toEqual({
      minimumCurrentTD: 1000,
      minimumTotalTDEarned: 1000,
      pendingTaskIds: ["COPE-059"],
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
    });
    const staleProfile: ServerProfile = {
      ...scoreProfile,
      current_td: 0,
      total_td: 0,
    };

    const merged = applyServerProfile(localState, staleProfile, {
      preservePendingCompletedReward: pendingReward,
    });

    expect(merged.economy.currentTD).toBe(1000);
    expect(merged.economy.totalTDEarned).toBe(1000);
  });
});

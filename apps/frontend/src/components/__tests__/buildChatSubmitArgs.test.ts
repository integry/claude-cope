import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { buildSprintCallbacks, syncCompletedTicketReward } from "../buildChatSubmitArgs";
import type { GameState } from "../../hooks/useGameState";

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
      completedTaskIds: ["COPE-059"],
      proKeyHash: "fresh-pro-hash",
    });
  });
});

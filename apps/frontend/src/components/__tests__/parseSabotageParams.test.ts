// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../../supabaseClient", () => ({
  supabase: {},
}));

import { parseSabotageParams } from "../slashCommandExecutor";
import type { GameState } from "../../hooks/useGameState";
import type { Message } from "../Terminal";

function makeGameState(overrides: Partial<GameState["economy"]> = {}): GameState {
  return {
    version: "1",
    username: "TestUser0",
    lastLogin: Date.now(),
    economy: {
      currentTD: 0,
      totalTDEarned: 0,
      currentRank: "Junior Code Monkey",
      quotaPercent: 0,
      quotaUsed: 0,
      quotaLimit: 20,
      quotaLockouts: 0,
      tdMultiplier: 1,
      ...overrides,
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
  };
}

describe("parseSabotageParams", () => {
  let setState: ReturnType<typeof vi.fn>;
  let setHistory: ReturnType<typeof vi.fn>;
  const originalLocation = window.location;
  const replaceStateSpy = vi.fn();

  beforeEach(() => {
    setState = vi.fn();
    setHistory = vi.fn();
    vi.spyOn(window.history, "replaceState").mockImplementation(replaceStateSpy);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Restore location
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  function setSearchParams(search: string) {
    Object.defineProperty(window, "location", {
      value: { ...originalLocation, search, pathname: "/test" },
      writable: true,
      configurable: true,
    });
  }

  it("does nothing when sabotage param is absent", () => {
    setSearchParams("");
    parseSabotageParams(setState, setHistory);
    expect(setState).not.toHaveBeenCalled();
    expect(setHistory).not.toHaveBeenCalled();
  });

  it("does nothing when sabotage is not 'true'", () => {
    setSearchParams("?sabotage=false");
    parseSabotageParams(setState, setHistory);
    expect(setState).not.toHaveBeenCalled();
    expect(setHistory).not.toHaveBeenCalled();
  });

  it("does nothing when target is 0", () => {
    setSearchParams("?sabotage=true&target=0&rank=Junior+Code+Monkey");
    parseSabotageParams(setState, setHistory);
    expect(setState).not.toHaveBeenCalled();
    expect(setHistory).not.toHaveBeenCalled();
  });

  it("calls setState with overridden TD and rank when sabotage=true with valid params", () => {
    setSearchParams("?sabotage=true&target=5000&rank=Mid-Level+Googler");
    parseSabotageParams(setState, setHistory);

    expect(setState).toHaveBeenCalledOnce();

    // Execute the state updater function to verify the result
    const updater = setState.mock.calls[0]![0] as (prev: GameState) => GameState;
    const prev = makeGameState();
    const next = updater(prev);

    expect(next.economy.currentTD).toBe(5000);
    expect(next.economy.totalTDEarned).toBe(5000);
    expect(next.economy.currentRank).toBe("Mid-Level Googler");
  });

  it("keeps the higher rank when player already has a higher rank", () => {
    setSearchParams("?sabotage=true&target=1000&rank=Junior+Code+Monkey");
    parseSabotageParams(setState, setHistory);

    const updater = setState.mock.calls[0]![0] as (prev: GameState) => GameState;
    const prev = makeGameState({ currentRank: "CSS JadooGaar" });
    const next = updater(prev);

    // CSS JadooGaar (index 3) > Junior Code Monkey (index 0), so rank stays
    expect(next.economy.currentRank).toBe("CSS JadooGaar");
  });

  it("adds a warning message to history", () => {
    setSearchParams("?sabotage=true&target=5000&rank=Mid-Level+Googler");
    parseSabotageParams(setState, setHistory);

    expect(setHistory).toHaveBeenCalledOnce();

    const updater = setHistory.mock.calls[0]![0] as (prev: Message[]) => Message[];
    const result = updater([]);

    expect(result).toHaveLength(1);
    expect(result[0]!.role).toBe("warning");
    expect(result[0]!.content).toContain("SABOTAGE");
    expect(result[0]!.content).toContain("5,000");
    expect(result[0]!.content).toContain("Mid-Level Googler");
  });

  it("cleans the URL after processing", () => {
    setSearchParams("?sabotage=true&target=100&rank=Junior+Code+Monkey");
    parseSabotageParams(setState, setHistory);

    expect(replaceStateSpy).toHaveBeenCalledWith({}, "", "/test");
  });

  it("defaults rank to empty string when not provided", () => {
    setSearchParams("?sabotage=true&target=500");
    parseSabotageParams(setState, setHistory);

    const historyUpdater = setHistory.mock.calls[0]![0] as (prev: Message[]) => Message[];
    const result = historyUpdater([]);
    expect(result[0]!.content).toContain("Unknown");
  });
});

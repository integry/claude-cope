// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Regression tests for the `/upgrade` slash command.
 *
 * These verify:
 *  - `/upgrade` opens the upgrade overlay via `setShowUpgrade(true)`.
 *  - `/upgrade` does NOT mutate game inventory (no old joke side effect).
 *  - `/upgrade` works for both free AND already-upgraded (Max) users.
 *  - `/upgrade` calls `closeAllOverlays` before opening the upgrade overlay.
 */

vi.mock("../../supabaseClient", () => ({ supabase: {} }));
vi.mock("../ticketPrompt", () => ({
  getPendingOffer: vi.fn(() => null),
  clearPendingOffer: vi.fn(),
  fetchRandomTicketPrompt: vi.fn(),
  buildTicketMessage: vi.fn(),
}));

import { handleUpgradeCommand, type SlashCommandContext } from "../slashCommandExecutor";
import type { GameState } from "../../hooks/useGameState";

function makeGameState(overrides: Partial<GameState> = {}): GameState {
  const base: GameState = {
    version: "1",
    username: "TestUser0",
    lastLogin: Date.now(),
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
  };
  return { ...base, ...overrides };
}

function makeCtx(overrides: Partial<SlashCommandContext> = {}): SlashCommandContext {
  const state = overrides.state ?? makeGameState();
  return {
    state,
    setState: vi.fn(),
    setHistory: vi.fn(),
    setIsProcessing: vi.fn(),
    closeAllOverlays: vi.fn(),
    setShowStore: vi.fn(),
    setShowLeaderboard: vi.fn(),
    setShowAchievements: vi.fn(),
    setShowSynergize: vi.fn(),
    setShowHelp: vi.fn(),
    setShowAbout: vi.fn(),
    setShowPrivacy: vi.fn(),
    setShowTerms: vi.fn(),
    setShowContact: vi.fn(),
    setShowProfile: vi.fn(),
    setShowParty: vi.fn(),
    setShowUpgrade: vi.fn(),
    setBragPending: vi.fn(),
    setBuddyPendingConfirm: vi.fn(),
    unlockAchievement: vi.fn(),
    clearCount: 0,
    setClearCount: vi.fn(),
    setInputValue: vi.fn(),
    onSuggestedReply: vi.fn(),
    setSlashQuery: vi.fn(),
    setSlashIndex: vi.fn(),
    addActiveTD: vi.fn(),
    onlineCount: 1,
    onlineUsers: [],
    sendPing: vi.fn(),
    pendingReviewPing: null,
    acceptReviewPing: vi.fn(),
    brrrrrrIntervalRef: { current: null },
    triggerCompactEffect: vi.fn(),
    playChime: vi.fn(),
    playError: vi.fn(),
    setActiveTheme: vi.fn(),
    ...overrides,
  } as SlashCommandContext;
}

describe("/upgrade command", () => {
  beforeEach(() => {
    // Stub window.history.pushState so it doesn't throw in jsdom
    vi.spyOn(window.history, "pushState").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens the upgrade overlay for a free user", () => {
    const ctx = makeCtx({ state: makeGameState() });

    handleUpgradeCommand(ctx);

    expect(ctx.closeAllOverlays).toHaveBeenCalledOnce();
    expect(ctx.setShowUpgrade).toHaveBeenCalledWith(true);
  });

  it("opens the upgrade overlay for an already-upgraded (Max) user", () => {
    const ctx = makeCtx({
      state: makeGameState({ proKey: "MAX-LICENSE-KEY-123" }),
    });

    handleUpgradeCommand(ctx);

    expect(ctx.closeAllOverlays).toHaveBeenCalledOnce();
    expect(ctx.setShowUpgrade).toHaveBeenCalledWith(true);
  });

  it("does NOT mutate inventory (no old joke side effect)", () => {
    const ctx = makeCtx({
      state: makeGameState({ inventory: { jokes: 5 } }),
    });

    handleUpgradeCommand(ctx);

    expect(ctx.setState).toHaveBeenCalledOnce();
    const update = (ctx.setState as ReturnType<typeof vi.fn>).mock.calls[0]![0] as (prev: GameState) => GameState;
    const nextState = update(ctx.state);
    expect(nextState.inventory).toEqual({ jokes: 5 });
    expect(nextState.commandUsage).toEqual({ "/upgrade": 1 });
    // The inventory object itself should be untouched
    expect(ctx.state.inventory).toEqual({ jokes: 5 });
  });

  it("pushes /upgrade to browser history", () => {
    const ctx = makeCtx();

    handleUpgradeCommand(ctx);

    expect(window.history.pushState).toHaveBeenCalledWith(null, "", "/upgrade");
  });

  it("still opens the overlay when window history is unavailable", () => {
    const ctx = makeCtx();
    vi.unstubAllGlobals();
    vi.stubGlobal("window", {});
    try {
      expect(() => handleUpgradeCommand(ctx)).not.toThrow();
      expect(ctx.closeAllOverlays).toHaveBeenCalledOnce();
      expect(ctx.setShowUpgrade).toHaveBeenCalledWith(true);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("clears loading messages from history before opening the overlay", () => {
    const ctx = makeCtx();

    handleUpgradeCommand(ctx);

    // setHistory is called with a filter function (clearLoading)
    expect(ctx.setHistory).toHaveBeenCalledOnce();
    expect(typeof (ctx.setHistory as ReturnType<typeof vi.fn>).mock.calls[0]![0]).toBe("function");
  });
});

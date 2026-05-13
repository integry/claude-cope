// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SetStateAction } from "react";
import type { GameState } from "../../hooks/useGameState";

vi.mock("../../analytics", () => ({
  track: vi.fn(),
  identify: vi.fn(),
}));

vi.mock("../../supabaseClient", () => ({ supabase: {} }));
vi.mock("../ticketPrompt", () => ({
  getPendingOffer: vi.fn(() => null),
  clearPendingOffer: vi.fn(),
  buildTicketMessage: vi.fn(),
}));

import { executeSlashCommand, type SlashCommandContext } from "../slashCommandExecutor";

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
    proKey: "MAX-LICENSE-KEY-123",
    proKeyHash: "hash-123",
  };
  return { ...base, ...overrides };
}

function makeCtx(state: GameState): SlashCommandContext {
  const ctx = {
    state,
    setState: vi.fn((update: SetStateAction<GameState>) => {
      ctx.state = typeof update === "function" ? update(ctx.state) : update;
    }),
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
    onValidSlashCommand: vi.fn(),
  } satisfies SlashCommandContext;

  return ctx;
}

describe("/alias command", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("increments command usage when alias validation passes", async () => {
    const ctx = makeCtx(makeGameState());
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ success: true, profile: null }),
    }));

    executeSlashCommand("/alias NewName", ctx);
    vi.advanceTimersByTime(1500);
    await vi.runAllTimersAsync();

    expect(ctx.state.username).toBe("NewName");
    expect(ctx.state.commandUsage).toEqual({ "/alias": 1 });
    expect(ctx.onValidSlashCommand).toHaveBeenCalledWith("/alias");
  });

  it("does not increment command usage when alias validation fails", async () => {
    const ctx = makeCtx(makeGameState());
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    executeSlashCommand("/alias no", ctx);
    vi.advanceTimersByTime(1500);
    await vi.runAllTimersAsync();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(ctx.state.commandUsage).toEqual({});
    expect(ctx.onValidSlashCommand).not.toHaveBeenCalled();
  });

  it("still increments command usage when the alias update request fails", async () => {
    const ctx = makeCtx(makeGameState());
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    executeSlashCommand("/alias NewName", ctx);
    vi.advanceTimersByTime(1500);
    await vi.runAllTimersAsync();

    expect(ctx.state.commandUsage).toEqual({ "/alias": 1 });
    expect(ctx.onValidSlashCommand).toHaveBeenCalledWith("/alias");
  });
});

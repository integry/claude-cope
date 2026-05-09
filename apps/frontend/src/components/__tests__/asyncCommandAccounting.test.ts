// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SetStateAction } from "react";
import type { GameState } from "../../hooks/useGameState";
import { ALL_SLASH_COMMANDS } from "../slashCommands";

vi.mock("../../analytics", () => ({
  track: vi.fn(),
  identify: vi.fn(),
}));

vi.mock("../../supabaseClient", () => ({ supabase: {} }));
vi.mock("../ticketPrompt", () => ({
  getPendingOffer: vi.fn(() => null),
  clearPendingOffer: vi.fn(),
  fetchRandomTicketPrompt: vi.fn(),
}));

import { SLASH_COMMAND_ACCOUNTING_POLICY, executeSlashCommand, type SlashCommandContext } from "../slashCommandExecutor";

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

describe("async slash-command accounting", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("counts /sync once the command passes client-side validation, even if the request fails", async () => {
    const ctx = makeCtx(makeGameState());
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    executeSlashCommand("/sync COPE-123", ctx);
    vi.advanceTimersByTime(1500);
    await vi.runAllTimersAsync();

    expect(ctx.state.commandUsage).toEqual({ "/sync": 1 });
    expect(ctx.onValidSlashCommand).toHaveBeenCalledWith("/sync");
  });

  it("counts /backlog even when fetching the backlog fails", async () => {
    const ctx = makeCtx(makeGameState());
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    executeSlashCommand("/backlog", ctx);
    vi.advanceTimersByTime(1500);
    await vi.runAllTimersAsync();

    expect(ctx.state.commandUsage).toEqual({ "/backlog": 1 });
    expect(ctx.onValidSlashCommand).toHaveBeenCalledWith("/backlog");
  });

  it("does not append an extra random tip when /clear finishes", async () => {
    const ctx = makeCtx(makeGameState());

    executeSlashCommand("/clear", ctx);
    vi.advanceTimersByTime(2000);
    await vi.runAllTimersAsync();

    expect(ctx.setHistory).toHaveBeenLastCalledWith([]);
    expect(ctx.onValidSlashCommand).toHaveBeenCalledWith("/clear");
  });

  it("documents an explicit accounting policy for every supported slash command", () => {
    expect(Object.keys(SLASH_COMMAND_ACCOUNTING_POLICY).sort()).toEqual([...ALL_SLASH_COMMANDS].sort());
    expect(new Set(Object.values(SLASH_COMMAND_ACCOUNTING_POLICY))).toEqual(new Set(["tracked", "conditional"]));
  });
});

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

describe("/model command", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("lists the renamed cope models and shows regret as the default", async () => {
    const ctx = makeCtx(makeGameState());

    executeSlashCommand("/model", ctx);
    vi.advanceTimersByTime(1500);
    await vi.runAllTimersAsync();

    const setHistoryMock = ctx.setHistory as ReturnType<typeof vi.fn>;
    const replyCall = setHistoryMock.mock.calls[setHistoryMock.mock.calls.length - 1]?.[0] as
      | ((prev: unknown[]) => unknown[])
      | undefined;
    expect(replyCall).toBeTypeOf("function");
    if (!replyCall) {
      throw new Error("Expected /model to enqueue a history update");
    }
    const history = replyCall([]) as Array<{ role: string; content: string }>;
    const reply = history[0]?.content ?? "";

    expect(reply).toContain("Current model: **regret**");
    expect(reply).toContain("`regret`");
    expect(reply).toContain("`copus`");
    expect(reply).toContain("`psychos`");
    expect(reply).toContain("reset to **regret**");
  });

  it("resets the selected model back to regret semantics", async () => {
    const ctx = makeCtx(makeGameState({ selectedModel: "psychos" }));

    executeSlashCommand("/model clear", ctx);
    vi.advanceTimersByTime(1500);
    await vi.runAllTimersAsync();

    expect(ctx.state.selectedModel).toBeUndefined();

    const setHistoryMock = ctx.setHistory as ReturnType<typeof vi.fn>;
    const replyCall = setHistoryMock.mock.calls[setHistoryMock.mock.calls.length - 1]?.[0] as
      | ((prev: unknown[]) => unknown[])
      | undefined;
    expect(replyCall).toBeTypeOf("function");
    if (!replyCall) {
      throw new Error("Expected /model clear to enqueue a history update");
    }
    const history = replyCall([]) as Array<{ role: string; content: string }>;
    expect(history[0]?.content).toContain("Model reset to **regret**");
  });
});

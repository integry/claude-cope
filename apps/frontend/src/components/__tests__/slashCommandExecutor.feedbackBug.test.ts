// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SetStateAction } from "react";

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

import { GITHUB_ISSUES_URL } from "../../config";
import type { GameState } from "../../hooks/useGameState";
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
    proKey: null,
    proKeyHash: null,
  };
  return { ...base, ...overrides };
}

function makeCtx(state: GameState) {
  const history: Array<{ role: string; content: string }> = [];

  const ctx = {
    state,
    setState: vi.fn((update: SetStateAction<GameState>) => {
      ctx.state = typeof update === "function" ? update(ctx.state) : update;
    }),
    setHistory: vi.fn((update: SetStateAction<Array<{ role: string; content: string }>>) => {
      const next = typeof update === "function" ? update(history) : update;
      history.splice(0, history.length, ...next);
    }),
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

  return { ctx, history };
}

describe("/feedback and /bug", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it.each(["/feedback", "/bug"])("appends a GitHub Issues markdown link for %s", (command) => {
    const { ctx, history } = makeCtx(makeGameState());

    executeSlashCommand(command, ctx);
    vi.advanceTimersByTime(1500);

    expect(history.at(-1)).toEqual({
      role: "system",
      content: `[✓] Thank you for your feedback. After careful analysis: works on my machine. Closing ticket as **WONTFIX**. Have a synergistic day.

[INFO] Real issue? Escalate to [ GITHUB ISSUES ](${GITHUB_ISSUES_URL}).`,
    });
    expect(ctx.state.commandUsage).toEqual({ [command]: 1 });
    expect(ctx.onValidSlashCommand).toHaveBeenCalledWith(command);
  });
});

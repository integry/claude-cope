// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

vi.mock("../../supabaseClient", () => ({ supabase: {} }));
const { clearPendingOffer } = vi.hoisted(() => ({
  clearPendingOffer: vi.fn(),
}));
vi.mock("../ticketPrompt", () => ({
  getPendingOffer: vi.fn(() => ({
    id: "locked-9999",
    title: "Reverse engineer the COBOL moonbeam",
    description: "Locked premium ticket",
    technical_debt: 99,
    kickoff_prompt: "never used",
    is_locked: true,
    tier: "premium",
    upgrade_teaser: "Unlock niche chaos quests with Max.",
  })),
  clearPendingOffer,
  fetchRandomTicketPrompt: vi.fn(),
}));

import { handleAcceptCommand, type SlashCommandContext } from "../slashCommandExecutor";
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
  return {
    state: makeGameState(),
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

describe("locked pending offers", () => {
  beforeEach(() => {
    vi.spyOn(window.history, "pushState").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    clearPendingOffer.mockClear();
  });

  it("shows the upgrade flow instead of accepting a locked ticket offer", () => {
    const ctx = makeCtx();
    const reply = vi.fn();

    handleAcceptCommand(ctx, reply);

    expect(clearPendingOffer).toHaveBeenCalledOnce();
    expect(ctx.setState).not.toHaveBeenCalled();
    expect(reply).toHaveBeenCalledOnce();
    expect(reply.mock.calls[0]?.[0].content).toContain("[PREMIUM]");
    expect(ctx.closeAllOverlays).toHaveBeenCalledOnce();
    expect(ctx.setShowUpgrade).toHaveBeenCalledWith(true);
    expect(window.history.pushState).toHaveBeenCalledWith(null, "", "/upgrade");
  });
});

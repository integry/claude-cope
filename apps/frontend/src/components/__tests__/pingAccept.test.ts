// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Regression coverage for the paid-review `/ping` flow and the `/accept`
 * precedence rules. These handlers are the most failure-prone corners of the
 * new ping economy (issue #681): client-side validation gates whether TD is
 * ever committed, and `/accept` must claim the 60-second review bounty before
 * falling through to a ticket offer.
 */

// Stub supabase so importing slashCommandExecutor doesn't require a real client.
vi.mock("../../supabaseClient", () => ({ supabase: {} }));

// Mock the ticket-offer module so each test controls whether a ticket is
// currently on the table without touching the real backend fetcher.
vi.mock("../ticketPrompt", () => ({
  getPendingOffer: vi.fn<() => null | {
    id: string;
    title: string;
    description: string;
    technical_debt: number;
    kickoff_prompt: string;
  }>(() => null),
  clearPendingOffer: vi.fn(),
  fetchRandomTicketPrompt: vi.fn(),
}));

import { handleAcceptCommand, handlePingCommand, type SlashCommandContext } from "../slashCommandExecutor";
import { getPendingOffer, clearPendingOffer } from "../ticketPrompt";
import { PING_COST } from "../../game/constants";
import type { GameState } from "../../hooks/useGameState";
import type { Message } from "../Terminal";

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

describe("/ping command validation", () => {
  let reply: ReturnType<typeof vi.fn<(msg: Message) => void>>;

  beforeEach(() => {
    reply = vi.fn();
    vi.mocked(getPendingOffer).mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("rejects /ping when there is no active ticket and never calls sendPing", () => {
    const ctx = makeCtx({
      state: makeGameState({
        activeTicket: null,
        economy: { ...makeGameState().economy, currentTD: 10_000 },
      }),
    });

    const handled = handlePingCommand("/ping", ctx, reply);

    expect(handled).toBe(true);
    expect(ctx.sendPing).not.toHaveBeenCalled();
    expect(reply).toHaveBeenCalledOnce();
    const msg = reply.mock.calls[0]![0];
    expect(msg.role).toBe("error");
    expect(msg.content).toMatch(/active ticket|backlog/i);
  });

  it("rejects /ping when currentTD is below PING_COST and never calls sendPing", () => {
    const ctx = makeCtx({
      state: makeGameState({
        activeTicket: { id: "T-1", title: "Fix bug", sprintProgress: 0, sprintGoal: 100 },
        economy: { ...makeGameState().economy, currentTD: PING_COST - 1 },
      }),
    });

    const handled = handlePingCommand("/ping", ctx, reply);

    expect(handled).toBe(true);
    expect(ctx.sendPing).not.toHaveBeenCalled();
    expect(reply).toHaveBeenCalledOnce();
    const msg = reply.mock.calls[0]![0];
    expect(msg.role).toBe("error");
    // The broke message quotes both cost and current balance, so it should
    // reference the fixed PING_COST.
    expect(msg.content).toContain(String(PING_COST));
  });

  it("sends a random-target ping when /ping has no argument", () => {
    const ticket = { id: "T-42", title: "Ship it", sprintProgress: 5, sprintGoal: 50 };
    const ctx = makeCtx({
      state: makeGameState({
        activeTicket: ticket,
        economy: { ...makeGameState().economy, currentTD: PING_COST * 3 },
      }),
    });

    const handled = handlePingCommand("/ping", ctx, reply);

    expect(handled).toBe(true);
    expect(ctx.sendPing).toHaveBeenCalledOnce();
    const [payload, amount, target] = vi.mocked(ctx.sendPing).mock.calls[0]!;
    expect(payload).toEqual(ticket);
    expect(amount).toBe(PING_COST);
    expect(target).toBeUndefined();
  });

  it("sends a targeted ping when /ping <name> is provided", () => {
    const ticket = { id: "T-42", title: "Ship it", sprintProgress: 5, sprintGoal: 50 };
    const ctx = makeCtx({
      state: makeGameState({
        activeTicket: ticket,
        economy: { ...makeGameState().economy, currentTD: PING_COST * 3 },
      }),
    });

    const handled = handlePingCommand("/ping Alice", ctx, reply);

    expect(handled).toBe(true);
    expect(ctx.sendPing).toHaveBeenCalledOnce();
    const [, , target] = vi.mocked(ctx.sendPing).mock.calls[0]!;
    expect(target).toBe("Alice");
  });
});

describe("/accept prefers review-pings over ticket offers", () => {
  let reply: ReturnType<typeof vi.fn<(msg: Message) => void>>;

  beforeEach(() => {
    reply = vi.fn();
    vi.mocked(getPendingOffer).mockReturnValue(null);
    vi.mocked(clearPendingOffer).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("calls acceptReviewPing when a pending review-ping exists, even with a ticket offer on the table", () => {
    vi.mocked(getPendingOffer).mockReturnValue({
      id: "BACKLOG-99",
      title: "Rewrite the monolith",
      description: "lol",
      technical_debt: 500,
      kickoff_prompt: "start here",
    });

    const ctx = makeCtx({
      pendingReviewPing: { sender: "Bob", amount: 50 },
    });

    handleAcceptCommand(ctx, reply);

    expect(ctx.acceptReviewPing).toHaveBeenCalledOnce();
    // The backlog offer must NOT be consumed when a review-ping wins.
    expect(clearPendingOffer).not.toHaveBeenCalled();
    expect(reply).toHaveBeenCalledOnce();
    const msg = reply.mock.calls[0]![0];
    expect(msg.role).toBe("system");
    expect(msg.content).toContain("Bob");
    expect(msg.content).toContain("50 TD");
  });

  it("falls back to the ticket offer when no review-ping is pending", () => {
    vi.mocked(getPendingOffer).mockReturnValue({
      id: "BACKLOG-99",
      title: "Rewrite the monolith",
      description: "lol",
      technical_debt: 500,
      kickoff_prompt: "start here",
    });

    const ctx = makeCtx({ pendingReviewPing: null });

    handleAcceptCommand(ctx, reply);

    expect(ctx.acceptReviewPing).not.toHaveBeenCalled();
    expect(clearPendingOffer).toHaveBeenCalledOnce();
    expect(ctx.setState).toHaveBeenCalledOnce();
    expect(ctx.playChime).toHaveBeenCalledOnce();
    const msg = reply.mock.calls[0]![0];
    expect(msg.role).toBe("system");
    expect(msg.content).toContain("TICKET ACCEPTED");
    expect(msg.content).toContain("BACKLOG-99");
  });

  it("emits an error when nothing is pending", () => {
    const ctx = makeCtx({ pendingReviewPing: null });

    handleAcceptCommand(ctx, reply);

    expect(ctx.acceptReviewPing).not.toHaveBeenCalled();
    expect(ctx.setState).not.toHaveBeenCalled();
    expect(reply).toHaveBeenCalledOnce();
    expect(reply.mock.calls[0]![0].role).toBe("error");
  });

  it("blocks ticket acceptance when the player already has an active ticket (and no review-ping)", () => {
    vi.mocked(getPendingOffer).mockReturnValue({
      id: "BACKLOG-99",
      title: "Rewrite the monolith",
      description: "lol",
      technical_debt: 500,
      kickoff_prompt: "start here",
    });

    const ctx = makeCtx({
      pendingReviewPing: null,
      state: makeGameState({
        activeTicket: { id: "T-current", title: "Already busy", sprintProgress: 0, sprintGoal: 100 },
      }),
    });

    handleAcceptCommand(ctx, reply);

    expect(ctx.acceptReviewPing).not.toHaveBeenCalled();
    expect(clearPendingOffer).not.toHaveBeenCalled();
    expect(ctx.setState).not.toHaveBeenCalled();
    const msg = reply.mock.calls[0]![0];
    expect(msg.role).toBe("error");
    expect(msg.content).toContain("Already busy");
  });
});

describe("refund-on-failure: client-side /ping validation", () => {
  // Server-driven refunds (`review_ping_refunded`) can only arrive AFTER the
  // client has called sendPing. If client validation fails, sendPing must
  // never run — otherwise the sender could be charged before the server even
  // sees the request. These tests lock in that invariant.
  let reply: ReturnType<typeof vi.fn<(msg: Message) => void>>;

  beforeEach(() => {
    reply = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("does not debit TD when a ping is rejected for lacking a ticket", () => {
    const ctx = makeCtx({
      state: makeGameState({
        activeTicket: null,
        economy: { ...makeGameState().economy, currentTD: 10_000 },
      }),
    });

    handlePingCommand("/ping", ctx, reply);

    // setState is the only way TD would be mutated from the handler — the
    // review economy debits via useMultiplayer's `review_ping_sent` handler,
    // which can't fire if sendPing is never called.
    expect(ctx.setState).not.toHaveBeenCalled();
    expect(ctx.sendPing).not.toHaveBeenCalled();
  });

  it("does not debit TD when a ping is rejected for insufficient funds", () => {
    const ctx = makeCtx({
      state: makeGameState({
        activeTicket: { id: "T-1", title: "Fix bug", sprintProgress: 0, sprintGoal: 100 },
        economy: { ...makeGameState().economy, currentTD: PING_COST - 1 },
      }),
    });

    handlePingCommand("/ping", ctx, reply);

    expect(ctx.setState).not.toHaveBeenCalled();
    expect(ctx.sendPing).not.toHaveBeenCalled();
  });
});

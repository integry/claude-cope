import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../analytics", () => ({ track: vi.fn() }));
vi.mock("../../api/profileApi", () => ({ updateTicketServer: vi.fn() }));
vi.mock("../toolSequences", () => ({ prefetchSequences: vi.fn() }));

import type { GameState } from "../../hooks/useGameState";
import { handleBacklogCommand, handleTakeCommand } from "../ticketCommands";

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

describe("premium backlog handling", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders locked backlog rows with a premium marker and teaser footer", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ([
        {
          id: "BLORT-18",
          title: "BLORT Turn the Backlog into an Agent Swarm",
          description: "Regular ticket",
          technical_debt: 34,
          kickoff_prompt: "fix the lint config",
          category_prefix: "BLORT",
          tier: "free",
        },
        {
          id: "PIXEL-77",
          title: "PIXEL Force View Events into Ad Creative Pipelines",
          description: "Locked premium ticket",
          technical_debt: 99,
          kickoff_prompt: "never used",
          category_prefix: "PIXEL",
          category_label: "Ad Creative Pipelines",
          is_locked: true,
          tier: "premium",
          upgrade_teaser: "Unlock niche chaos quests with Max.",
        },
      ]),
    });
    vi.stubGlobal("fetch", fetchMock);
    const reply = vi.fn();

    await handleBacklogCommand(reply);

    expect(reply).toHaveBeenCalledOnce();
    const message = reply.mock.calls[0]?.[0];
    expect(message.content).toContain("BLORT-18");
    expect(message.content).toContain("Turn the Backlog into an Agent Swarm");
    expect(message.content).not.toContain("BLORT Turn the Backlog into an Agent Swarm");
    expect(message.content).toContain("🔒 [PREMIUM] Force View Events into Ad Creative Pipelines");
    expect(message.content).toContain("| OPEN     |      340 |");
    expect(message.content).toContain("| PREMIUM  |       -- |");
    expect(message.content).toContain("[INFO] Showing all tickets. Want specific trauma? Try: `/backlog MELT`");
    expect(message.content).toContain("[UPGRADE REQUIRED] The following categories are locked behind Wallet Extraction:");
    expect(message.content).toContain("🔒 PIXEL (Ad Creative Pipelines)");
    expect(message.content).toContain("Run `/upgrade` to unlock 50+ specialized categories and premium suffering.");
  });

  it("blocks locked ticket selection, replies with an upgrade prompt, and leaves free picks unchanged", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ([
        {
          id: "free-12345",
          title: "Fix lint config",
          description: "Regular ticket",
          technical_debt: 4,
          kickoff_prompt: "fix the lint config",
        },
        {
          id: "locked-9999",
          title: "Reverse engineer the COBOL moonbeam",
          description: "Locked premium ticket",
          technical_debt: 99,
          kickoff_prompt: "never used",
          is_locked: true,
          tier: "premium",
          upgrade_teaser: "Unlock niche chaos quests with Max.",
        },
      ]),
    }));

    await handleBacklogCommand(vi.fn());

    const reply = vi.fn();
    const lockedSetState = vi.fn();
    const onLocked = vi.fn();
    const onAccept = vi.fn();
    const onSuggestedReply = vi.fn();

    handleTakeCommand("/take 2", makeGameState(), lockedSetState, reply, {
      setInputValue: vi.fn(),
      onAccept,
      onSuggestedReply,
      onLocked,
    });

    expect(lockedSetState).not.toHaveBeenCalled();
    expect(onAccept).not.toHaveBeenCalled();
    expect(onSuggestedReply).not.toHaveBeenCalled();
    expect(onLocked).toHaveBeenCalledOnce();
    expect(reply.mock.calls[0]?.[0].content).toContain("[PREMIUM]");
    expect(reply.mock.calls[0]?.[0].content).toContain("Unlock niche chaos quests with Max.");

    const freeSetState = vi.fn();
    const freeReply = vi.fn();
    const freeAccept = vi.fn();
    const freeSuggestedReply = vi.fn();

    handleTakeCommand("/take 1", makeGameState(), freeSetState, freeReply, {
      setInputValue: vi.fn(),
      onAccept: freeAccept,
      onSuggestedReply: freeSuggestedReply,
      onLocked: vi.fn(),
    });

    expect(freeSetState).toHaveBeenCalledOnce();
    expect(freeAccept).toHaveBeenCalledOnce();
    expect(freeSuggestedReply).toHaveBeenCalledWith("fix the lint config");
    expect(freeReply.mock.calls[0]?.[0].content).toContain("[🎫 **TICKET CLAIMED**]");
  });

  it("clears cached backlog rows when a later backlog request returns empty", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          {
            id: "free-12345",
            title: "Fix lint config",
            description: "Regular ticket",
            technical_debt: 4,
            kickoff_prompt: "fix the lint config",
          },
        ]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      }));

    await handleBacklogCommand(vi.fn());
    await handleBacklogCommand(vi.fn());

    const reply = vi.fn();
    handleTakeCommand("/take 1", makeGameState(), vi.fn(), reply, {
      setInputValue: vi.fn(),
    });

    expect(reply.mock.calls[0]?.[0].content).toContain("not found");
  });

  it("rejects ambiguous ticket ID prefixes instead of claiming the first match", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ([
        {
          id: "ABCDEF12-1111",
          title: "First ticket",
          description: "Regular ticket",
          technical_debt: 4,
          kickoff_prompt: "first prompt",
        },
        {
          id: "ABCDEF12-2222",
          title: "Second ticket",
          description: "Regular ticket",
          technical_debt: 8,
          kickoff_prompt: "second prompt",
        },
      ]),
    }));

    await handleBacklogCommand(vi.fn());

    const setState = vi.fn();
    const reply = vi.fn();
    handleTakeCommand("/take ABCDEF12", makeGameState(), setState, reply, {
      setInputValue: vi.fn(),
    });

    expect(setState).not.toHaveBeenCalled();
    expect(reply.mock.calls[0]?.[0].content).toContain("ambiguous");
  });

  it("allows unique ticket ID prefixes for manual /take commands", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ([
        {
          id: "ABCDEF12-1111",
          title: "First ticket",
          description: "Regular ticket",
          technical_debt: 4,
          kickoff_prompt: "first prompt",
        },
        {
          id: "ABCDE999-2222",
          title: "Second ticket",
          description: "Regular ticket",
          technical_debt: 8,
          kickoff_prompt: "second prompt",
        },
      ]),
    }));

    await handleBacklogCommand(vi.fn());

    const setState = vi.fn();
    const reply = vi.fn();
    const onSuggestedReply = vi.fn();
    handleTakeCommand("/take ABCDEF12", makeGameState(), setState, reply, {
      setInputValue: vi.fn(),
      onSuggestedReply,
    });

    expect(setState).toHaveBeenCalledOnce();
    expect(reply.mock.calls[0]?.[0].content).toContain("ABCDEF12-1111");
    expect(onSuggestedReply).toHaveBeenCalledWith("first prompt");
  });

  it("renders a filtered backlog header for valid category filters", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ([
        {
          id: "MELT-02",
          title: "MELT Unpick the Mainframe Ritual",
          description: "Regular ticket",
          technical_debt: 55,
          kickoff_prompt: "touch the cobol",
          category_prefix: "MELT",
          category_label: "Mainframes / Legacy",
          is_locked: false,
          tier: "premium",
        },
      ]),
    });
    vi.stubGlobal("fetch", fetchMock);
    const reply = vi.fn();

    await handleBacklogCommand(reply, { category: "MELT", paidUser: true, proKeyHash: "pro-hash" });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/tickets/community?category=MELT"),
      expect.objectContaining({ headers: { "x-pro-key-hash": "pro-hash" } }),
    );
    expect(reply.mock.calls[0]?.[0].content).toContain("[ FILTER ACTIVE: MELT (Mainframes / Legacy) ]");
    expect(reply.mock.calls[0]?.[0].content).not.toContain("Want specific trauma?");
  });

  it("blocks premium category filters for free users before any request is made", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const reply = vi.fn();

    await handleBacklogCommand(reply, { category: "MELT", paidUser: false });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(reply.mock.calls[0]?.[0].content).toContain("CATEGORY LOCKED");
    expect(reply.mock.calls[0]?.[0].content).toContain("MELT");
  });

  it("rejects invalid backlog categories with a readable error", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const reply = vi.fn();

    await handleBacklogCommand(reply, { category: "NOPE", paidUser: true });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(reply.mock.calls[0]?.[0].content).toContain("Unknown backlog category");
    expect(reply.mock.calls[0]?.[0].content).toContain("NOPE");
  });
});

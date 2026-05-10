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
});

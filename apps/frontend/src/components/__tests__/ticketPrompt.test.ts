import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LockedBacklogTeaserTicket, PlayableBacklogTicket } from "@claude-cope/shared/backlogTickets";
import type { Message } from "../../hooks/useGameState";

vi.mock("../../config", () => ({
  API_BASE: "https://example.test",
}));

import { clearPendingOffer, fetchRandomTicketPrompt, getPendingOffer } from "../ticketPrompt";

function makeTicket(overrides: Partial<PlayableBacklogTicket> = {}): PlayableBacklogTicket {
  return {
    id: "BLAME-421",
    reporter: "Brenda (Platform Governance)",
    reporter_name: "Brenda",
    reporter_title: "Platform Governance",
    reporter_description: "Treats naming as policy and spontaneity as a security flaw.",
    title: "Rewrite the RCA template",
    description: "Brenda from Platform Governance here, we need the login flow refactored by EOD.",
    technical_debt: 144,
    kickoff_prompt: "rewrite the template",
    created_at: "2026-01-01T00:00:00.000Z",
    category_prefix: "BLAME",
    category_label: "Root Cause Theater",
    is_locked: false,
    tier: "free",
    ...overrides,
  };
}

function makeLockedTicket(overrides: Partial<LockedBacklogTeaserTicket> = {}): LockedBacklogTeaserTicket {
  return {
    id: "LOCKED-1",
    title: "Premium-only chaos",
    category_prefix: "VIP",
    category_label: "Executive Escalation",
    is_locked: true,
    tier: "premium",
    upgrade_teaser: "Upgrade to unlock this ticket.",
    ...overrides,
  };
}

describe("fetchRandomTicketPrompt", () => {
  let history: Message[];
  let setHistory: React.Dispatch<React.SetStateAction<Message[]>>;

  beforeEach(() => {
    history = [];
    setHistory = vi.fn((updater: React.SetStateAction<Message[]>) => {
      history = typeof updater === "function" ? updater(history) : updater;
    });
    clearPendingOffer();
    vi.restoreAllMocks();
  });

  it("returns offered after appending a structured incoming ticket message", async () => {
    const ticket = makeTicket();
    vi.spyOn(Math, "random").mockReturnValue(0);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [ticket],
    }));

    const result = await fetchRandomTicketPrompt(setHistory, "pro-hash");

    expect(result).toBe("offered");
    expect(fetch).toHaveBeenCalledWith("https://example.test/api/tickets/community", {
      headers: { "x-pro-key-hash": "pro-hash" },
    });
    expect(getPendingOffer()).toEqual(ticket);
    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({
      role: "system",
      ticketDisplay: {
        status: "offered",
        ticketId: "BLAME-421",
        title: "Rewrite the RCA template",
        footer: ["Type /accept to start working on it, or /backlog to browse other tickets."],
      },
    });
  });

  it("returns empty when the backend responds without a playable ticket", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [makeLockedTicket()],
    }));

    const result = await fetchRandomTicketPrompt(setHistory);

    expect(result).toBe("empty");
    expect(history).toEqual([]);
    expect(getPendingOffer()).toBeNull();
  });

  it("returns error on transient fetch failure without mutating prompt state", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const result = await fetchRandomTicketPrompt(setHistory);

    expect(result).toBe("error");
    expect(history).toEqual([]);
    expect(getPendingOffer()).toBeNull();
  });
});

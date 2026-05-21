import { describe, it, expect } from "vitest";
import { filterChatHistory } from "../filterChatHistory";
import type { Message } from "../../hooks/useGameState";

function msg(role: Message["role"], content: string): Message {
  return { role, content };
}

describe("filterChatHistory", () => {
  it("returns empty array for empty history", () => {
    expect(filterChatHistory([])).toEqual([]);
  });

  it("keeps regular user messages", () => {
    const history = [msg("user", "hello")];
    const result = filterChatHistory(history);
    expect(result).toEqual([{ role: "user", content: "hello" }]);
  });

  it("converts system role to assistant", () => {
    const history = [msg("user", "hello"), msg("system", "hi there")];
    const result = filterChatHistory(history);
    expect(result).toHaveLength(2);
    expect(result[1]).toEqual({ role: "assistant", content: "hi there" });
  });

  it("filters out slash commands and their system responses", () => {
    const history = [
      msg("user", "/buy intern"),
      msg("system", "Purchased intern"),
      msg("user", "regular message"),
      msg("system", "response"),
    ];
    const result = filterChatHistory(history);
    expect(result).toEqual([
      { role: "user", content: "regular message" },
      { role: "assistant", content: "response" },
    ]);
  });

  it("keeps system messages not preceded by slash commands", () => {
    const history = [
      msg("system", "Welcome!"),
      msg("user", "hi"),
    ];
    const result = filterChatHistory(history);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ role: "assistant", content: "Welcome!" });
  });

  it("filters ticket offer and backlog scaffolding from model context", () => {
    const history = [
      msg("system", "[📋 INCOMING TICKET] Your PM has assigned you a ticket:\n\nhaunted backlog"),
      msg("system", "[📋 **COMMUNITY BACKLOG**]\n\n```table```"),
      msg("user", "what is this mess"),
      msg("system", "Regular assistant reply"),
    ];
    const result = filterChatHistory(history);
    expect(result).toEqual([
      { role: "user", content: "what is this mess" },
      { role: "assistant", content: "Regular assistant reply" },
    ]);
  });

  it("filters structured dossier and backlog payloads from model context", () => {
    const history: Message[] = [
      {
        role: "system",
        content: "[ INCOMING TICKET ]\n\nID: BLAME-421",
        ticketDisplay: {
          kind: "corporate-dossier",
          status: "offered",
          heading: "[ INCOMING TICKET ]",
          ticketId: "BLAME-421",
          title: "Rewrite the RCA template",
          reporter: "Brenda [Platform Governance]",
          body: "Please fix it.",
          reward: "1440 TD",
          footer: ["Type /accept to start working on it, or /backlog to browse other tickets."],
        },
      },
      {
        role: "system",
        content: "[ COMMUNITY BACKLOG ]",
        backlogDisplay: {
          kind: "community-backlog",
          title: "[ COMMUNITY BACKLOG ]",
          footer: [],
          tickets: [],
        },
      },
      msg("user", "what is this mess"),
      msg("system", "Regular assistant reply"),
    ];

    const result = filterChatHistory(history);

    expect(result).toEqual([
      { role: "user", content: "what is this mess" },
      { role: "assistant", content: "Regular assistant reply" },
    ]);
  });

  it("resets context after the most recent structured claimed ticket and keeps post-claim filtering", () => {
    const history: Message[] = [
      msg("user", "old task context"),
      msg("system", "old task reply"),
      {
        role: "system",
        content: "[ JIRA PAYLOAD IMPORTED ]\n\nID: NEW-123",
        ticketDisplay: {
          kind: "corporate-dossier",
          status: "claimed",
          heading: "[ JIRA PAYLOAD IMPORTED ]",
          ticketId: "NEW-123",
          title: "Fix the incident bot",
          reporter: "Pat [SRE]",
          body: "The bot is lying again.",
          reward: "500 TD",
          footer: ["Start prompting to make progress."],
        },
      },
      msg("user", "/backlog"),
      msg("system", "[📋 **COMMUNITY BACKLOG**]\n\n```table```"),
      msg("user", "start with the failing path"),
      msg("system", "Focus on the serializer first."),
    ];

    expect(filterChatHistory(history)).toEqual([
      { role: "user", content: "start with the failing path" },
      { role: "assistant", content: "Focus on the serializer first." },
    ]);
  });

  it("resets context after a claimed ticket fallback text even without structured ticketDisplay", () => {
    const history: Message[] = [
      msg("user", "previous ticket notes"),
      msg("system", "previous answer"),
      msg(
        "system",
        "[ JIRA PAYLOAD IMPORTED ]\n\nID: OPS-77\nTITLE: Repair the pager bridge\nREPORTER: Morgan [Operations]\n\nDESCRIPTION: The handoff keeps dropping alerts.\n\nREWARD: 750 TD\nStart prompting to make progress.",
      ),
      msg("user", "what should I inspect first?"),
      msg("system", "Inspect the reconnect loop and retry backoff."),
    ];

    expect(filterChatHistory(history)).toEqual([
      { role: "user", content: "what should I inspect first?" },
      { role: "assistant", content: "Inspect the reconnect loop and retry backoff." },
    ]);
  });

  it("filters out non-user non-system roles (e.g. warning)", () => {
    const history = [
      msg("user", "hello"),
      msg("warning" as Message["role"], "some warning"),
      msg("system", "response"),
    ];
    const result = filterChatHistory(history);
    expect(result).toEqual([
      { role: "user", content: "hello" },
      { role: "assistant", content: "response" },
    ]);
  });
});

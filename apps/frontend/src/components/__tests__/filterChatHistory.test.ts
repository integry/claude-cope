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

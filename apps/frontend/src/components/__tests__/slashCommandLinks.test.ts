import { describe, it, expect } from "vitest";
import { detectSlashCommands, PREFILL_COMMANDS } from "../slashCommandDetect";

describe("detectSlashCommands", () => {
  it("detects a single command in plain text", () => {
    const results = detectSlashCommands("Try /help for more info.");
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      command: "/help",
      action: "execute",
    });
  });

  it("detects multiple commands in one string", () => {
    const results = detectSlashCommands("Use /help or /store to get started.");
    expect(results).toHaveLength(2);
    expect(results[0]!.command).toBe("/help");
    expect(results[1]!.command).toBe("/store");
  });

  it("detects a command at the start of a string", () => {
    const results = detectSlashCommands("/clear resets the terminal.");
    expect(results).toHaveLength(1);
    expect(results[0]!.command).toBe("/clear");
    expect(results[0]!.action).toBe("execute");
  });

  it("detects a command at the end of a string", () => {
    const results = detectSlashCommands("Try /help");
    expect(results).toHaveLength(1);
    expect(results[0]!.command).toBe("/help");
  });

  it("returns prefill action for argument-requiring commands", () => {
    for (const cmd of PREFILL_COMMANDS) {
      const results = detectSlashCommands(`Use ${cmd} to do things.`);
      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        command: cmd,
        action: "prefill",
      });
    }
  });

  it("returns execute action for non-argument commands", () => {
    const executeCmds = ["/help", "/clear", "/store", "/leaderboard", "/achievements", "/profile", "/buddy", "/brrrrrr", "/compact"];
    for (const cmd of executeCmds) {
      const results = detectSlashCommands(`${cmd}`);
      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        command: cmd,
        action: "execute",
      });
    }
  });

  // False positive avoidance
  it("does NOT match API paths like /api/chat", () => {
    const results = detectSlashCommands("The endpoint is /api/chat for messaging.");
    expect(results).toHaveLength(0);
  });

  it("does NOT match unknown slash-prefixed words", () => {
    const results = detectSlashCommands("Visit /dashboard or /settings.");
    expect(results).toHaveLength(0);
  });

  it("does NOT match partial path components", () => {
    const results = detectSlashCommands("See /api/store/items for the catalog.");
    // /store appears as part of a path — should NOT match
    expect(results).toHaveLength(0);
  });

  it("handles commands in parentheses", () => {
    const results = detectSlashCommands("(use /help for details)");
    expect(results).toHaveLength(1);
    expect(results[0]!.command).toBe("/help");
  });

  it("handles commands followed by punctuation", () => {
    const results = detectSlashCommands("Run /clear, then /help.");
    expect(results).toHaveLength(2);
    expect(results[0]!.command).toBe("/clear");
    expect(results[1]!.command).toBe("/help");
  });

  it("handles commands in backtick-style text", () => {
    const results = detectSlashCommands("Type `/help` in the terminal.");
    expect(results).toHaveLength(1);
    expect(results[0]!.command).toBe("/help");
  });

  it("returns empty array for text with no commands", () => {
    const results = detectSlashCommands("Just some regular text.");
    expect(results).toHaveLength(0);
  });

  it("returns empty array for empty string", () => {
    const results = detectSlashCommands("");
    expect(results).toHaveLength(0);
  });

  it("correctly reports start and end positions", () => {
    const text = "Try /help now.";
    const results = detectSlashCommands(text);
    expect(results).toHaveLength(1);
    expect(results[0]!.start).toBe(4);
    expect(results[0]!.end).toBe(9);
    expect(text.slice(results[0]!.start, results[0]!.end)).toBe("/help");
  });

  it("handles commands in quoted strings", () => {
    const results = detectSlashCommands('Type "/help" to see commands.');
    expect(results).toHaveLength(1);
    expect(results[0]!.command).toBe("/help");
  });
});

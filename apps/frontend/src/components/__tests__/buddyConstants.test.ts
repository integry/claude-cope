import { describe, expect, it } from "vitest";

import {
  BUDDY_ICONS,
  extractBuddyInterjectionBlock,
  formatBuddyInterjection,
} from "../buddyConstants";

describe("buddy interjection formatting", () => {
  it("round-trips a formatted interjection through extraction", () => {
    const formatted = formatBuddyInterjection(
      "Agile Snail",
      "Remember, junior monkey, the backlog wants you to add a lint rule before the next sprint.",
    );

    expect(extractBuddyInterjectionBlock(formatted)).toEqual({
      block: formatted,
      body: "",
    });
    expect(formatted.split("\n")[0]).toContain("[Agile Snail]");
  });

  it("extracts a buddy block and leaves the following system reply in the body", () => {
    const block = formatBuddyInterjection("Sarcastic Clippy", "Remember the migration.");
    const content = `${block}\n\nThe deploy is still blocked on the failed migration.`;

    expect(extractBuddyInterjectionBlock(content)).toEqual({
      block,
      body: "The deploy is still blocked on the failed migration.",
    });
  });

  it("keeps parsing buddy blocks when the buddy body contains blank paragraphs", () => {
    const block = [
      "   @..@      [Agile Snail]",
      "  (----)     First paragraph.",
      " ( >__< ) ",
      ' ^^ "" ^^    Second paragraph.',
      "             ",
      "             Third paragraph.",
    ].join("\n");
    const content = `[[BUDDY:Agile Snail]]\n${block}\n\nFollow-up system reply.`;

    expect(extractBuddyInterjectionBlock(content)).toEqual({
      block,
      body: "Follow-up system reply.",
    });
  });

  it("parses the pre-upgrade stacked buddy format from persisted chat history", () => {
    const block = `${BUDDY_ICONS["Agile Snail"]}\n[Agile Snail] Remember the backlog.`;
    const content = `${block}\n\nFollow-up system reply.`;

    expect(extractBuddyInterjectionBlock(content)).toEqual({
      block,
      body: "Follow-up system reply.",
    });
  });

  it("does not treat unrelated warnings as buddy blocks", () => {
    const content = [
      "RATE LIMIT   [Warning]",
      "Try again in 30 seconds.",
    ].join("\n");

    expect(extractBuddyInterjectionBlock(content)).toBeNull();
  });
});

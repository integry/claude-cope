import { describe, expect, it } from "vitest";

import {
  extractBuddyInterjectionBlock,
  formatBuddyInterjection,
} from "../buddyConstants";

describe("buddy interjection formatting", () => {
  it("round-trips a formatted interjection through extraction", () => {
    const formatted = formatBuddyInterjection(
      "Agile Snail",
      "Remember, junior monkey, the backlog wants you to add a lint rule before the next sprint.",
    );
    const [, ...blockLines] = formatted.split("\n");

    expect(extractBuddyInterjectionBlock(formatted)).toEqual({
      block: blockLines.join("\n"),
      body: "",
    });
  });

  it("extracts a buddy block and leaves the following system reply in the body", () => {
    const block = formatBuddyInterjection("Sarcastic Clippy", "Remember the migration.");
    const content = `${block}\n\nThe deploy is still blocked on the failed migration.`;
    const [, ...blockLines] = block.split("\n");

    expect(extractBuddyInterjectionBlock(content)).toEqual({
      block: blockLines.join("\n"),
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

  it("does not treat unrelated warnings as buddy blocks", () => {
    const content = [
      "RATE LIMIT   [Warning]",
      "Try again in 30 seconds.",
    ].join("\n");

    expect(extractBuddyInterjectionBlock(content)).toBeNull();
  });
});

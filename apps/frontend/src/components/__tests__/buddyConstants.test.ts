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

    expect(extractBuddyInterjectionBlock(formatted)).toEqual({
      block: formatted,
      body: "",
    });
  });

  it("extracts a buddy block and leaves the following system reply in the body", () => {
    const block = formatBuddyInterjection("Sarcastic Clippy", "Remember the migration.");
    const content = `${block}\n\nThe deploy is still blocked on the failed migration.`;

    expect(extractBuddyInterjectionBlock(content)).toEqual({
      block,
      body: "The deploy is still blocked on the failed migration.",
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

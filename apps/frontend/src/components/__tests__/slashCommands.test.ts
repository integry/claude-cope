import { describe, expect, it } from "vitest";

import { ALL_SLASH_COMMANDS, SLASH_COMMAND_GROUPS } from "../slashCommands";

describe("SLASH_COMMAND_GROUPS", () => {
  it("remains the canonical source for the flat command list", () => {
    expect(ALL_SLASH_COMMANDS).toEqual(SLASH_COMMAND_GROUPS.flatMap((group) => group.commands));
  });

  it("does not duplicate commands across groups", () => {
    const allCommands = SLASH_COMMAND_GROUPS.flatMap((group) => group.commands);
    expect(new Set(allCommands).size).toBe(allCommands.length);
  });
});

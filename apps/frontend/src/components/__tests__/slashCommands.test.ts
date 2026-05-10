import { describe, expect, it } from "vitest";

import { ALL_SLASH_COMMANDS, SLASH_COMMAND_GROUPS, getSlashMenuItems, resolveSlashMenuSelection } from "../slashCommands";

describe("SLASH_COMMAND_GROUPS", () => {
  it("remains the canonical source for the flat command list", () => {
    expect(ALL_SLASH_COMMANDS).toEqual(SLASH_COMMAND_GROUPS.flatMap((group) => group.commands));
  });

  it("does not duplicate commands across groups", () => {
    const allCommands = SLASH_COMMAND_GROUPS.flatMap((group) => group.commands);
    expect(new Set(allCommands).size).toBe(allCommands.length);
  });

  it("keeps /leaderboard available for Hall of Blame entry points", () => {
    expect(ALL_SLASH_COMMANDS).toContain("/leaderboard");
  });

  it("advertises backlog category arguments in the command menu", () => {
    const backlogItem = getSlashMenuItems("/b", 0, false).find((item) => item.type === "command" && item.value === "/backlog");
    expect(backlogItem).toMatchObject({ argumentHint: "[category]" });
  });
});

describe("resolveSlashMenuSelection", () => {
  it("auto-expands backlog into category mode for click and enter selections", () => {
    expect(resolveSlashMenuSelection("/backlog", "click")).toEqual({
      mode: "prefill",
      value: "/backlog ",
      nextQuery: "/backlog ",
    });
    expect(resolveSlashMenuSelection("/backlog", "enter")).toEqual({
      mode: "prefill",
      value: "/backlog ",
      nextQuery: "/backlog ",
    });
  });

  it("keeps tab as prefill for other items and execute for click/enter", () => {
    expect(resolveSlashMenuSelection("/backlog MELT", "tab")).toEqual({
      mode: "prefill",
      value: "/backlog MELT",
      nextQuery: "/backlog MELT",
    });
    expect(resolveSlashMenuSelection("/backlog MELT", "enter")).toEqual({
      mode: "execute",
      value: "/backlog MELT",
      nextQuery: "",
    });
  });
});

import { describe, expect, it } from "vitest";

import { getSlashCommandClickSelection } from "../terminalUtils";

describe("getSlashCommandClickSelection", () => {
  it("reuses slash menu backlog prefill behavior for clickable slash links", () => {
    expect(getSlashCommandClickSelection("/backlog", "prefill")).toEqual({
      mode: "prefill",
      value: "/backlog ",
      nextQuery: "/backlog ",
    });
  });

  it("keeps execute-mode slash links executable", () => {
    expect(getSlashCommandClickSelection("/who", "execute")).toEqual({
      mode: "execute",
      value: "/who",
      nextQuery: "",
    });
  });
});

import { describe, expect, it } from "vitest";

import { stripTransientMessageFields, type Message } from "../gameStateUtils";

describe("stripTransientMessageFields", () => {
  it("omits backlogDisplay instead of retaining an undefined key", () => {
    const message: Message = {
      id: 7,
      role: "system",
      content: "fallback backlog copy",
      backlogDisplay: {
        kind: "community-backlog",
        title: "[ COMMUNITY BACKLOG ]",
        footer: [],
        tickets: [],
      },
    };

    const stripped = stripTransientMessageFields(message);

    expect(stripped).toEqual({
      id: 7,
      role: "system",
      content: "fallback backlog copy",
    });
    expect("backlogDisplay" in stripped).toBe(false);
  });
});

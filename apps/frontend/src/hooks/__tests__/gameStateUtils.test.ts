// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";

import { loadState, STORAGE_KEY, stripTransientMessageFields, type Message } from "../gameStateUtils";

describe("stripTransientMessageFields", () => {
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

  beforeEach(() => {
    localStorage.clear();
  });

  it("preserves backlogDisplay so responsive backlog messages survive persistence", () => {
    const stripped = stripTransientMessageFields(message);

    expect(stripped).toEqual(message);
  });

  it("loads persisted backlogDisplay chat history intact", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: "1.0",
      username: "tester",
      lastLogin: 0,
      economy: {
        currentTD: 0,
        totalTDEarned: 0,
        currentRank: "Junior Code Monkey",
        quotaPercent: 100,
        quotaLockouts: 0,
        tdMultiplier: 1,
      },
      inventory: {},
      upgrades: [],
      achievements: [],
      buddy: { type: null, isShiny: false, promptsSinceLastInterjection: 0 },
      chatHistory: [message],
      commandUsage: {},
      modes: { fast: false, voice: false },
      activeTicket: null,
      hasSeenTicketPrompt: false,
      activeTheme: "default",
      unlockedThemes: ["default"],
      soundEnabled: true,
      pendingCompletedTaskIds: [],
      pendingCompletedTaskRewards: {},
      authoritativeProfileFloor: null,
    }));

    const loaded = loadState();

    expect(loaded.chatHistory[0]).toEqual(message);
  });
});

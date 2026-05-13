// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";

import { loadState, normalizePersistedMessage, STORAGE_KEY, type Message } from "../gameStateUtils";

describe("normalizePersistedMessage", () => {
  const message: Message = {
    id: 7,
    role: "system",
    content: "fallback structured copy",
    backlogDisplay: {
      kind: "community-backlog",
      title: "[ COMMUNITY BACKLOG ]",
      footer: [],
      tickets: [],
    },
    ticketDisplay: {
      kind: "corporate-dossier",
      status: "claimed",
      heading: "[ JIRA PAYLOAD IMPORTED ]",
      ticketId: "BLAME-421",
      title: "Rewrite the template",
      reporter: "Brenda [Platform Governance]",
      profile: "Treats naming as policy.",
      body: "The RCA template is unusable.",
      reward: "1440 TD",
      footer: ["Start prompting to make progress."],
    },
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it("preserves structured display payloads so responsive messages survive persistence", () => {
    const stripped = normalizePersistedMessage(message);

    expect(stripped).toEqual(message);
  });

  it("loads persisted structured chat history intact", () => {
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

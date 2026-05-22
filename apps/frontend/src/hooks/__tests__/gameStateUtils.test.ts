// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";

import { filterChatHistory } from "../../components/filterChatHistory";
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

    expect(stripped).toEqual({
      ...message,
      contextBoundary: "ticket-claim",
    });
  });

  it("preserves plain prefixed system replies instead of upgrading them into semantic tips", () => {
    const stripped = normalizePersistedMessage({
      id: 9,
      role: "system",
      content: "Tip: Use /help to inspect the command surface.",
    });

    expect(stripped).toEqual({
      id: 9,
      role: "system",
      content: "Tip: Use /help to inspect the command surface.",
    });
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
      suggestedReply: "show me the logs",
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

    expect(loaded.chatHistory[0]).toEqual({
      ...message,
      contextBoundary: "ticket-claim",
    });
    expect(loaded.suggestedReply).toBe("show me the logs");
  });

  it("reloads persisted claimed tickets from before the boundary marker and resets prompt context", () => {
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
      chatHistory: [
        { role: "user", content: "old ticket notes" },
        { role: "system", content: "old ticket reply" },
        message,
        { role: "user", content: "continue from the reconnect path" },
        { role: "system", content: "Check whether the same worker owns the websocket." },
      ],
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

    expect(loaded.chatHistory[2]).toMatchObject({
      contextBoundary: "ticket-claim",
      ticketDisplay: {
        status: "claimed",
      },
    });
    expect(filterChatHistory(loaded.chatHistory)).toEqual([
      { role: "user", content: "continue from the reconnect path" },
      { role: "assistant", content: "Check whether the same worker owns the websocket." },
    ]);
  });

  it("collapses duplicate consecutive persisted tip messages on reload", () => {
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
      chatHistory: [
        { role: "system", content: "Tip: Use /help to inspect the command surface.", displayType: "tip" },
        { role: "system", content: "Tip: Use /help to inspect the command surface.", displayType: "tip" },
        { role: "user", content: "hello" },
      ],
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

    expect(loaded.chatHistory).toHaveLength(2);
    expect(loaded.chatHistory[0]).toMatchObject({
      role: "system",
      content: "Tip: Use /help to inspect the command surface.",
      displayType: "tip",
    });
    expect(loaded.chatHistory[1]).toMatchObject({ role: "user", content: "hello" });
  });
});

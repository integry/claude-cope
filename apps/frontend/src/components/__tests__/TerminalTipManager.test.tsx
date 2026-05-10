// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type React from "react";

const {
  executeSlashCommandMock,
  recordEnterMock,
  recordValidCommandMock,
  recordMessageWithoutTicketMock,
} = vi.hoisted(() => ({
  executeSlashCommandMock: vi.fn(),
  recordEnterMock: vi.fn(),
  recordValidCommandMock: vi.fn(),
  recordMessageWithoutTicketMock: vi.fn(),
}));

vi.mock("../../config", () => ({
  BYOK_ENABLED: false,
  TICKET_REFINE_ENABLED: false,
}));
vi.mock("../../hooks/gameStateUtils", () => ({ isFreeUser: () => false }));
vi.mock("../chatApi", () => ({
  computeBuddyInterjection: () => null,
  mergeSuggestedReply: (_prev: string | null, next: string) => next,
  submitChatMessage: vi.fn(),
}));
vi.mock("../slashCommandExecutor", () => ({
  executeSlashCommand: executeSlashCommandMock,
}));
vi.mock("../../hooks/profileSync", () => ({
  applyAuthoritativeProfile: (prev: unknown) => prev,
  applyServerProfile: (prev: unknown) => prev,
  settlePendingCompletedRewards: (prev: unknown) => prev,
}));
vi.mock("../keyCommandHandler", () => ({ handleKeyCommand: vi.fn() }));
vi.mock("../ticketPrompt", () => ({ fetchRandomTicketPrompt: vi.fn() }));
vi.mock("../filterChatHistory", () => ({ filterChatHistory: (history: unknown[]) => history }));
vi.mock("../../hooks/useMultiplayer", () => ({
  useMultiplayer: () => ({
    onlineCount: 0,
    onlineUsers: [],
    sendPing: vi.fn(),
    pendingReviewPing: null,
    acceptReviewPing: vi.fn(),
    outageHp: null,
    sendDamage: vi.fn(),
  }),
}));
vi.mock("../../hooks/useTerminalEffects", () => ({
  useTerminalEffects: () => ({ isBooting: false, regressionGlitch: null, activeRegression: null }),
}));
vi.mock("../../hooks/useSoundEffects", () => ({
  useSoundEffects: () => ({ playError: vi.fn(), playChime: vi.fn() }),
}));
vi.mock("../../hooks/usePingAcknowledged", () => ({ usePingAcknowledged: () => false }));
vi.mock("../../hooks/useOverlays", () => ({
  useOverlays: () => ({
    showStore: false,
    showLeaderboard: false,
    showAchievements: false,
    showSynergize: false,
    showHelp: false,
    showAbout: false,
    showPrivacy: false,
    showTerms: false,
    showContact: false,
    showProfile: false,
    showParty: false,
    showUpgrade: false,
    setShowStore: vi.fn(),
    setShowLeaderboard: vi.fn(),
    setShowAchievements: vi.fn(),
    setShowSynergize: vi.fn(),
    setShowHelp: vi.fn(),
    setShowAbout: vi.fn(),
    setShowPrivacy: vi.fn(),
    setShowTerms: vi.fn(),
    setShowContact: vi.fn(),
    setShowProfile: vi.fn(),
    setShowParty: vi.fn(),
    setShowUpgrade: vi.fn(),
    closeAllOverlays: vi.fn(),
  }),
}));
vi.mock("../../hooks/useTipManager", () => ({
  useTipManager: () => ({
    recordEnter: recordEnterMock,
    recordValidCommand: recordValidCommandMock,
    recordMessageWithoutTicket: recordMessageWithoutTicketMock,
  }),
}));
vi.mock("../loadingPhrases", () => ({ getRandomLoadingPhrase: () => "Loading..." }));
vi.mock("../freeTierDelay", () => ({ runFreeTierDelay: vi.fn() }));
vi.mock("../buildChatSubmitArgs", () => ({
  buildSprintCallbacks: () => ({
    onSprintProgress: vi.fn(),
    getSprintCompleteMessage: vi.fn(),
  }),
}));
vi.mock("../terminalHandlers", () => ({
  triggerQuotaLockout: vi.fn(),
  triggerInstantBan: vi.fn(),
}));
vi.mock("../../hooks/useTerminalKeyboard", () => ({
  useTerminalKeyboard: ({ handleEnterSubmit }: { handleEnterSubmit: () => void }) => ({
    handleKeyDown: (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        void handleEnterSubmit();
      }
    },
  }),
}));
vi.mock("../terminalInputHandlers", () => ({
  handleBragSubmit: vi.fn(),
  handleBuddyConfirm: vi.fn(),
  tryOutageDamage: () => false,
}));
vi.mock("../TerminalView", () => ({
  TerminalView: ({
    inputRef,
    inputValue,
    handleChange,
    handleKeyDown,
  }: {
    inputRef: { current: HTMLInputElement | null };
    inputValue: string;
    handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  }) => createElement("input", {
    ref: inputRef,
    "aria-label": "terminal-input",
    value: inputValue,
    onChange: handleChange,
    onInput: (event: React.FormEvent<HTMLInputElement>) => {
      handleChange(event as React.ChangeEvent<HTMLInputElement>);
    },
    onKeyDown: handleKeyDown,
  }),
}));
vi.mock("../terminalViewUtils", () => ({
  getPromptString: () => ">",
  isAnyOverlayOpen: () => false,
}));
vi.mock("../useCheckoutLicenseSync", () => ({ useCheckoutLicenseSync: vi.fn() }));
vi.mock("../../hooks/useGameState", async () => {
  const React = await import("react");

  return {
    useGameState: () => {
      const [state, setState] = React.useState({
        version: "1",
        username: "TestUser0",
        lastLogin: Date.now(),
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
        chatHistory: [],
        commandUsage: {},
        modes: { fast: false, voice: false },
        activeTicket: null,
        hasSeenTicketPrompt: true,
        activeTheme: "default",
        unlockedThemes: ["default"],
        soundEnabled: true,
        pendingCompletedTaskIds: [],
      });

      const setChatHistory = (updater: React.SetStateAction<typeof state.chatHistory>) => {
        setState((prev) => ({
          ...prev,
          chatHistory: typeof updater === "function" ? updater(prev.chatHistory) : updater,
        }));
      };

      return {
        state,
        setState,
        getCurrentState: () => state,
        addActiveTD: vi.fn(),
        buyGenerator: vi.fn(),
        buyUpgrade: vi.fn(),
        resetQuota: vi.fn(),
        unlockAchievement: vi.fn(),
        applyOutageReward: vi.fn(),
        applyOutagePenalty: vi.fn(),
        setChatHistory,
        setActiveTheme: vi.fn(),
        buyTheme: vi.fn(),
        offlineTDEarned: 0,
        clearOfflineTDEarned: vi.fn(),
        updateTicketProgress: vi.fn(),
      };
    },
  };
});

import Terminal from "../Terminal";

let container: HTMLDivElement;
let root: Root;

async function renderTerminal() {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);

  await act(async () => {
    root.render(createElement(Terminal));
  });
}

async function submitCommand(command: string) {
  const input = container.querySelector("input[aria-label='terminal-input']") as HTMLInputElement | null;
  expect(input).not.toBeNull();

  await act(async () => {
    input!.value = command;
    input!.dispatchEvent(new Event("input", { bubbles: true }));
  });

  await act(async () => {
    input!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  });
}

describe("Terminal tip-manager wiring", () => {
  beforeEach(() => {
    executeSlashCommandMock.mockImplementation((command: string, ctx: { onValidSlashCommand?: (baseCommand: string) => void }) => {
      ctx.onValidSlashCommand?.(command.trim());
    });
  });

  afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
    vi.clearAllMocks();
  });

  it("does not let /clear repopulate the terminal through tip-manager callbacks", async () => {
    await renderTerminal();
    await submitCommand("/clear");

    expect(recordEnterMock).toHaveBeenCalledTimes(1);
    expect(recordValidCommandMock).toHaveBeenCalledWith("/clear", { suppressTip: true });
    expect(recordMessageWithoutTicketMock).not.toHaveBeenCalled();
  });

  it("does not count slash commands toward backlog reminders", async () => {
    await renderTerminal();
    await submitCommand("/help");

    expect(recordValidCommandMock).toHaveBeenCalledWith("/help");
    expect(recordMessageWithoutTicketMock).not.toHaveBeenCalled();
  });

  it("counts prompt submissions toward backlog reminders before the reply succeeds", async () => {
    await renderTerminal();
    await submitCommand("ship it");

    expect(recordMessageWithoutTicketMock).toHaveBeenCalledTimes(1);
  });
});

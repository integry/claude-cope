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
  rollbackMessageWithoutTicketMock,
  submitChatMessageMock,
  setShowUpgradeMock,
  shouldShowNagMock,
} = vi.hoisted(() => ({
  executeSlashCommandMock: vi.fn(),
  recordEnterMock: vi.fn(),
  recordValidCommandMock: vi.fn(),
  recordMessageWithoutTicketMock: vi.fn(),
  rollbackMessageWithoutTicketMock: vi.fn(),
  submitChatMessageMock: vi.fn(),
  setShowUpgradeMock: vi.fn(),
  shouldShowNagMock: vi.fn(() => false),
}));

vi.mock("../../config", () => ({
  BYOK_ENABLED: false,
  TICKET_REFINE_ENABLED: false,
}));
vi.mock("../../hooks/gameStateUtils", () => ({ isFreeUser: () => false }));
vi.mock("../chatApi", () => ({
  computeBuddyInterjection: () => null,
  mergeSuggestedReply: (_prev: string | null, next: string) => next,
  submitChatMessage: submitChatMessageMock,
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
vi.mock("../../hooks/useOverlays", async () => {
  const React = await import("react");
  return {
    useOverlays: () => {
      const [showUpgrade, setShowUpgradeState] = React.useState(false);
      const setShowUpgrade = (value: boolean) => {
        setShowUpgradeMock(value);
        setShowUpgradeState(value);
      };
      return {
        showStore: false, showLeaderboard: false, showAchievements: false, showSynergize: false,
        showHelp: false, showAbout: false, showPrivacy: false, showTerms: false,
        showContact: false, showProfile: false, showParty: false, showUpgrade,
        setShowStore: vi.fn(), setShowLeaderboard: vi.fn(), setShowAchievements: vi.fn(), setShowSynergize: vi.fn(),
        setShowHelp: vi.fn(), setShowAbout: vi.fn(), setShowPrivacy: vi.fn(), setShowTerms: vi.fn(),
        setShowContact: vi.fn(), setShowProfile: vi.fn(), setShowParty: vi.fn(), setShowUpgrade,
        closeAllOverlays: vi.fn(() => setShowUpgradeState(false)),
      };
    },
  };
});
vi.mock("../../hooks/useTipManager", () => ({
  useTipManager: () => ({
    recordEnter: recordEnterMock,
    recordValidCommand: recordValidCommandMock,
    recordMessageWithoutTicket: (...args: unknown[]) => recordMessageWithoutTicketMock(...args),
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
  useTerminalKeyboard: ({
    handleEnterSubmit,
    handleUpgradeNagClose,
    abortControllerRef,
    isProcessing,
    showUpgrade,
  }: {
    handleEnterSubmit: () => void;
    handleUpgradeNagClose: () => void;
    abortControllerRef: { current: AbortController | null };
    isProcessing: boolean;
    showUpgrade: boolean;
  }) => ({
    handleKeyDown: (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        void handleEnterSubmit();
      }
      if (event.key === "Escape") {
        event.preventDefault();
        if (showUpgrade) handleUpgradeNagClose();
        else if (isProcessing && abortControllerRef.current) abortControllerRef.current.abort();
      }
    },
  }),
}));
vi.mock("../terminalInputHandlers", () => ({
  handleBragSubmit: vi.fn(),
  handleBuddyConfirm: vi.fn(),
  tryOutageDamage: () => false,
}));
vi.mock("../winrarNag", () => ({
  shouldShowNag: shouldShowNagMock,
}));
vi.mock("../TerminalView", () => ({
  TerminalView: ({
    inputRef,
    inputValue,
    handleChange,
    handleKeyDown,
    handleUpgradeNagClose,
    handleManualUpgradeDismiss,
  }: {
    inputRef: { current: HTMLInputElement | null };
    inputValue: string;
    handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    handleUpgradeNagClose: () => void;
    handleManualUpgradeDismiss: () => void;
  }) => createElement("div", null,
    createElement("input", {
      ref: inputRef,
      "aria-label": "terminal-input",
      value: inputValue,
      onChange: handleChange,
      onInput: (event: React.FormEvent<HTMLInputElement>) => {
        handleChange(event as React.ChangeEvent<HTMLInputElement>);
      },
      onKeyDown: handleKeyDown,
    }),
    createElement("button", {
      type: "button",
      "aria-label": "dismiss-upgrade",
      onClick: handleUpgradeNagClose,
    }),
    createElement("button", {
      type: "button",
      "aria-label": "manual-dismiss-upgrade",
      onClick: handleManualUpgradeDismiss,
    }),
  ),
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
        economy: { currentTD: 0, totalTDEarned: 0, currentRank: "Junior Code Monkey", quotaPercent: 100, quotaLockouts: 0, tdMultiplier: 1 },
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
        addActiveTD: vi.fn(), buyGenerator: vi.fn(), buyUpgrade: vi.fn(), resetQuota: vi.fn(),
        unlockAchievement: vi.fn(), applyOutageReward: vi.fn(), applyOutagePenalty: vi.fn(),
        setChatHistory,
        setActiveTheme: vi.fn(), buyTheme: vi.fn(),
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

function getInput() {
  const input = container.querySelector("input[aria-label='terminal-input']") as HTMLInputElement | null;
  expect(input).not.toBeNull();
  return input!;
}

function getButton(label: string) {
  const button = container.querySelector(`button[aria-label='${label}']`) as HTMLButtonElement | null;
  expect(button).not.toBeNull();
  return button!;
}

async function renderTerminal() {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root.render(createElement(Terminal));
  });
}

async function submitCommand(command: string) {
  const input = getInput();
  await act(async () => {
    input.value = command;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await act(async () => {
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  });
}

async function triggerNaggedPrompt() {
  await renderTerminal();
  await submitCommand("first prompt");
  shouldShowNagMock.mockReturnValueOnce(true);
  await submitCommand("retry me");
}

async function replayNaggedPrompt(action: "button" | "escape") {
  const input = getInput();
  if (action === "button") {
    await act(async () => { getButton("dismiss-upgrade").click(); });
  } else {
    await act(async () => { input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); });
  }
  expect(recordMessageWithoutTicketMock).toHaveBeenCalledTimes(1);
  expect(submitChatMessageMock).toHaveBeenCalledTimes(1);
  await act(async () => {
    vi.advanceTimersByTime(3000);
    await Promise.resolve();
  });
  expect(recordMessageWithoutTicketMock).toHaveBeenCalledTimes(2);
  expect(submitChatMessageMock).toHaveBeenCalledTimes(2);
  return input;
}

describe("Terminal tip-manager nag replay wiring", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-10T00:00:00.000Z"));
    recordMessageWithoutTicketMock.mockImplementation(() => rollbackMessageWithoutTicketMock);
    executeSlashCommandMock.mockImplementation((command: string, ctx: { onValidSlashCommand?: (baseCommand: string) => void }) => {
      ctx.onValidSlashCommand?.(command.trim());
    });
    submitChatMessageMock.mockReset();
    setShowUpgradeMock.mockReset();
    shouldShowNagMock.mockReset();
    shouldShowNagMock.mockReturnValue(false);
  });

  afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("replays nagged prompts with normal backlog accounting and cleared input", async () => {
    await triggerNaggedPrompt();
    expect(setShowUpgradeMock).toHaveBeenCalledWith(true);
    expect(recordMessageWithoutTicketMock).toHaveBeenCalledTimes(1);
    const input = await replayNaggedPrompt("button");
    expect(input.value).toBe("");
  });

  it("replays a nagged prompt through the same path when dismissed by keyboard", async () => {
    await triggerNaggedPrompt();
    const input = await replayNaggedPrompt("escape");
    expect(input.value).toBe("");
  });

  it("fully disarms a nagged prompt when the overlay is manually dismissed", async () => {
    await triggerNaggedPrompt();
    await act(async () => { getButton("manual-dismiss-upgrade").click(); });
    await act(async () => {
      window.dispatchEvent(new PopStateEvent("popstate"));
      vi.advanceTimersByTime(3000);
    });
    expect(submitChatMessageMock).toHaveBeenCalledTimes(1);
    expect(setShowUpgradeMock.mock.calls.filter(([value]) => value === true)).toHaveLength(1);
  });

  it("replays a nagged prompt after the forced dismiss cycle completes", async () => {
    await renderTerminal();
    await submitCommand("first prompt");
    shouldShowNagMock.mockReturnValue(true);
    await submitCommand("retry me");
    await replayNaggedPrompt("button");
    expect(setShowUpgradeMock).toHaveBeenCalledTimes(2);
    expect(setShowUpgradeMock).toHaveBeenNthCalledWith(1, true);
    expect(setShowUpgradeMock).toHaveBeenNthCalledWith(2, false);
  });

  it("disarms the quota nag after a replayed prompt is accepted", async () => {
    submitChatMessageMock.mockImplementation(({ onAccepted }: { onAccepted?: () => void }) => {
      onAccepted?.();
    });
    await triggerNaggedPrompt();
    await replayNaggedPrompt("button");
    await submitCommand("third prompt");
    expect(submitChatMessageMock).toHaveBeenCalledTimes(3);
    expect(setShowUpgradeMock).toHaveBeenCalledTimes(2);
    expect(setShowUpgradeMock).toHaveBeenNthCalledWith(1, true);
    expect(setShowUpgradeMock).toHaveBeenNthCalledWith(2, false);
  });
});

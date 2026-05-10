import { act } from "react";
import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import type React from "react";
import { vi } from "vitest";

export function createTerminalViewModule() {
  return {
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
  };
}

export function createUseGameStateModule() {
  return async () => {
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
  };
}

export function createUseOverlaysModule(onSetShowUpgrade?: (value: boolean) => void) {
  return async () => {
    const React = await import("react");
    return {
      useOverlays: () => {
        const [showUpgrade, setShowUpgradeState] = React.useState(false);
        const setShowUpgrade = (value: boolean) => {
          onSetShowUpgrade?.(value);
          setShowUpgradeState(value);
        };
        return {
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
          showUpgrade,
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
          setShowUpgrade,
          closeAllOverlays: vi.fn(() => setShowUpgradeState(false)),
        };
      },
    };
  };
}

export function createUseTerminalKeyboardModule() {
  return {
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
  };
}

export type RenderedTerminal = {
  container: HTMLDivElement;
  root: Root;
};

export async function renderTerminal(Terminal: React.ComponentType): Promise<RenderedTerminal> {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(createElement(Terminal));
  });
  return { container, root };
}

export function cleanupRenderedTerminal(rendered: RenderedTerminal | null) {
  act(() => rendered?.root.unmount());
  rendered?.container.remove();
}

export function getInput(container: HTMLDivElement) {
  const input = container.querySelector("input[aria-label='terminal-input']") as HTMLInputElement | null;
  if (!input) {
    throw new Error("terminal input not found");
  }
  return input;
}

export function getButton(container: HTMLDivElement, label: string) {
  const button = container.querySelector(`button[aria-label='${label}']`) as HTMLButtonElement | null;
  if (!button) {
    throw new Error(`button not found: ${label}`);
  }
  return button;
}

export async function submitCommand(container: HTMLDivElement, command: string) {
  const input = getInput(container);
  await act(async () => {
    input.value = command;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await act(async () => {
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  });
}

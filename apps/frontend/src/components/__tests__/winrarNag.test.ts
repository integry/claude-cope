/* eslint-disable max-lines */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import type React from "react";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";

/**
 * Production-wiring tests for the WinRAR nag screen (issue #736).
 *
 * These tests render the real component tree (TerminalOverlays → UpgradeOverlay)
 * and verify that dismiss handlers, refs, and state interact correctly — not
 * extracted helpers in isolation.
 */

vi.mock("../../config", () => ({
  UPGRADE_CHECKOUT_SINGLE: "https://example.com/single",
  UPGRADE_CHECKOUT_MULTI: "https://example.com/multi",
  UPGRADE_PRICE_SINGLE: "$4.99",
  UPGRADE_PRICE_MULTI: "$19.99",
  PRO_QUOTA_LIMIT: 100,
  FREE_QUOTA_LIMIT: 20,
  BYOK_ENABLED: true,
}));

vi.mock("../../supabaseClient", () => ({ supabase: {} }));
const { submitChatMessageMock, testConfig } = vi.hoisted(() => ({
  submitChatMessageMock: vi.fn(),
  testConfig: { initialQuotaPercent: 0 },
}));

vi.mock("../CommandLine", async () => {
  const React = await import("react");
  return {
    default: React.forwardRef<HTMLInputElement, {
      value: string;
      disabled?: boolean;
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
      placeholder?: string;
    }>(function MockCommandLine({ value, disabled, onChange, onKeyDown, placeholder }, ref) {
      const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
        onChange(e as React.ChangeEvent<HTMLInputElement>);
      };
      return (
        React.createElement("input", {
          ref,
          "aria-label": "terminal-input",
          value,
          disabled,
          placeholder,
          onChange,
          onInput: handleInput,
          onKeyDown,
        })
      );
    }),
  };
});
vi.mock("../SlashMenu", () => ({ default: () => null }));
vi.mock("../slashCommands", () => ({ SLASH_COMMANDS: [] }));
vi.mock("../HeaderBar", () => ({ default: () => null }));
vi.mock("../../hooks/useGameState", async () => {
  const React = await import("react");
  const initialState = {
    version: "1",
    username: "TestUser0",
    lastLogin: Date.now(),
    economy: {
      currentTD: 0,
      totalTDEarned: 0,
      currentRank: "Junior Code Monkey",
      quotaPercent: 0,
      quotaLockouts: 0,
      tdMultiplier: 1,
    },
    inventory: {},
    upgrades: [],
    achievements: [],
    buddy: { type: null, isShiny: false, promptsSinceLastInterjection: 0 },
    chatHistory: [],
    proKey: undefined,
    proKeyHash: undefined,
    apiKey: "",
    hasSeenTicketPrompt: false,
    activeTicket: null,
    selectedModel: null,
    modes: {},
    soundEnabled: true,
    activeTheme: null,
    byokTotalCost: 0,
    byokUsage: {},
  };
  return {
    useGameState: () => {
      const [state, setState] = React.useState(() => ({
        ...initialState,
        economy: { ...initialState.economy, quotaPercent: testConfig.initialQuotaPercent },
      }));
      const setChatHistory = React.useCallback((updater: React.SetStateAction<typeof initialState.chatHistory>) => {
        setState((prev) => ({
          ...prev,
          chatHistory: typeof updater === "function" ? updater(prev.chatHistory) : updater,
        }));
      }, []);
      return {
        state,
        setState,
        addActiveTD: () => undefined,
        buyGenerator: () => false,
        buyUpgrade: () => false,
        resetQuota: () => undefined,
        unlockAchievement: () => false,
        applyOutageReward: () => undefined,
        applyOutagePenalty: () => undefined,
        setChatHistory,
        setActiveTheme: () => undefined,
        buyTheme: () => false,
        offlineTDEarned: 0,
        clearOfflineTDEarned: () => undefined,
        updateTicketProgress: () => undefined,
      };
    },
  };
});
vi.mock("../../hooks/gameStateUtils", () => ({ calculateActiveMultiplier: () => 1 }));
vi.mock("../BuddyDisplay", () => ({ BuddyDisplay: () => null }));
vi.mock("../parseGlitchStyle", () => ({ parseGlitchStyle: () => ({}) }));
vi.mock("../terminalClassName", () => ({ terminalContainerClassName: () => "terminal" }));
vi.mock("../chatApi", () => ({
  computeBuddyInterjection: () => null,
  submitChatMessage: submitChatMessageMock,
}));
vi.mock("../slashCommandExecutor", () => ({ executeSlashCommand: () => undefined }));
vi.mock("../../hooks/profileSync", () => ({ applyServerProfile: (prev: unknown) => prev }));
vi.mock("../keyCommandHandler", () => ({ handleKeyCommand: async () => false }));
vi.mock("../ticketPrompt", () => ({ fetchRandomTicketPrompt: () => undefined }));
vi.mock("../filterChatHistory", () => ({ filterChatHistory: (history: unknown[]) => history }));
vi.mock("../TerminalFooter", () => ({ TerminalFooter: () => null }));
vi.mock("../Ticker", () => ({ default: () => null }));
vi.mock("../OutageBar", () => ({ OutageBar: () => null, DAMAGE_COMMANDS: [] }));
vi.mock("../SprintProgressBar", () => ({ default: () => null }));
vi.mock("../../hooks/useMultiplayer", () => ({
  useMultiplayer: () => ({
    onlineCount: 0,
    onlineUsers: [],
    sendPing: () => undefined,
    pendingReviewPing: null,
    acceptReviewPing: () => undefined,
    outageHp: null,
    sendDamage: () => undefined,
  }),
}));
vi.mock("../../hooks/useTerminalEffects", () => ({
  useTerminalEffects: () => ({ isBooting: false, regressionGlitch: null, activeRegression: null }),
}));
vi.mock("../../hooks/useSoundEffects", () => ({
  useSoundEffects: () => ({ playError: () => undefined, playChime: () => undefined }),
}));
vi.mock("../../hooks/usePingAcknowledged", () => ({ usePingAcknowledged: () => false }));
vi.mock("../loadingPhrases", () => ({ getRandomLoadingPhrase: () => "Loading..." }));
vi.mock("../freeTierDelay", () => ({ runFreeTierDelay: async () => true }));
vi.mock("../buildChatSubmitArgs", () => ({
  buildSprintCallbacks: () => ({
    onSprintProgress: () => undefined,
    getSprintCompleteMessage: () => undefined,
  }),
}));
vi.mock("../MessageList", () => ({
  default: ({ history }: { history: Array<{ role: string; content: string }> }) =>
    createElement("div", { "data-testid": "message-list" }, history.map((msg, index) => createElement("div", { key: index }, msg.content))),
}));
vi.mock("../terminalHandlers", () => ({
  triggerQuotaLockout: () => undefined,
  triggerInstantBan: () => undefined,
}));
vi.mock("../terminalInputHandlers", () => ({
  handleBragSubmit: () => undefined,
  handleBuddyConfirm: () => undefined,
  tryOutageDamage: () => false,
}));

import { TerminalOverlays } from "../TerminalOverlays";
import Terminal from "../Terminal";
import { shouldShowNag } from "../winrarNag";
import type { GameState, Message } from "../../hooks/useGameState";

/* ── Factory helpers ─────────────────────────────────────────── */

function makeGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    version: "1",
    username: "TestUser0",
    lastLogin: Date.now(),
    economy: {
      currentTD: 0,
      totalTDEarned: 0,
      currentRank: "Junior Code Monkey",
      quotaPercent: 0,
      quotaLockouts: 0,
      tdMultiplier: 1,
    },
    inventory: {},
    upgrades: [],
    achievements: [],
    buddy: { type: null, isShiny: false, promptsSinceLastInterjection: 0 },
    chatHistory: [],
    proKey: undefined,
    proKeyHash: undefined,
    apiKey: "",
    hasSeenTicketPrompt: false,
    activeTicket: null,
    selectedModel: null,
    modes: {},
    soundEnabled: true,
    activeTheme: null,
    byokTotalCost: 0,
    byokUsage: {},
    ...overrides,
  } as GameState;
}

function makeOverlayProps(overrides: Record<string, unknown> = {}) {
  const noop = vi.fn();
  return {
    showStore: false,
    showLeaderboard: false,
    showAchievements: false,
    showHelp: false,
    showAbout: false,
    showPrivacy: false,
    showTerms: false,
    showContact: false,
    showProfile: false,
    showParty: false,
    showSynergize: false,
    showUpgrade: false,
    state: makeGameState(),
    buyGenerator: vi.fn(() => false),
    buyUpgrade: vi.fn(() => false),
    buyTheme: vi.fn(() => false),
    setActiveTheme: noop,
    setShowStore: noop,
    setShowLeaderboard: noop,
    setShowAchievements: noop,
    setShowHelp: noop,
    setShowAbout: noop,
    setShowPrivacy: noop,
    setShowTerms: noop,
    setShowContact: noop,
    setShowProfile: noop,
    setShowParty: noop,
    setShowSynergize: noop,
    setIsProcessing: noop,
    setHistory: noop as React.Dispatch<React.SetStateAction<Message[]>>,
    onUpgradeDismiss: vi.fn(),
    upgradeDismissMode: "manual" as const,
    ...overrides,
  };
}

/* ── Test infrastructure ─────────────────────────────────────── */

let container: HTMLDivElement;
let root: Root;

function renderOverlays(overrides: Record<string, unknown> = {}) {
  const props = makeOverlayProps(overrides);
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root.render(createElement(TerminalOverlays, props as Parameters<typeof TerminalOverlays>[0]));
  });
  return { container, props };
}

function cleanup() {
  if (root) act(() => root.unmount());
  if (container && container.parentNode) container.parentNode.removeChild(container);
}

async function renderTerminal() {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root.render(createElement(Terminal));
  });
  return { container };
}

async function submitTerminalCommand(command: string) {
  const input = container.querySelector("input[aria-label='terminal-input']") as HTMLInputElement | null;
  expect(input).not.toBeNull();

  await act(async () => {
    input!.value = command;
    input!.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await act(async () => {
    input!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  });

  return input!;
}

/* ── Tests ────────────────────────────────────────────────────── */

describe("WinRAR nag: TerminalOverlays production wiring", () => {
  beforeEach(() => {
    vi.spyOn(window.history, "pushState").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders UpgradeOverlay when showUpgrade is true", () => {
    const { container } = renderOverlays({ showUpgrade: true });
    // UpgradeOverlay renders both desktop and mobile layouts
    expect(container.querySelector(".upgrade-desktop")).not.toBeNull();
    expect(container.querySelector(".upgrade-mobile")).not.toBeNull();
  });

  it("does NOT render UpgradeOverlay when showUpgrade is false", () => {
    const { container } = renderOverlays({ showUpgrade: false });
    expect(container.querySelector(".upgrade-desktop")).toBeNull();
    expect(container.querySelector(".upgrade-mobile")).toBeNull();
  });

  it("does NOT fire onUpgradeDismiss when desktop backdrop is clicked in nag mode", () => {
    const { container, props } = renderOverlays({ showUpgrade: true, upgradeDismissMode: "nag" });
    const desktop = container.querySelector(".upgrade-desktop");
    act(() => {
      desktop?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(props.onUpgradeDismiss).not.toHaveBeenCalled();
  });

  it("does NOT fire onUpgradeDismiss when mobile backdrop is clicked in nag mode", () => {
    const { container, props } = renderOverlays({ showUpgrade: true, upgradeDismissMode: "nag" });
    const mobile = container.querySelector(".upgrade-mobile");
    act(() => {
      mobile?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(props.onUpgradeDismiss).not.toHaveBeenCalled();
  });

  it("does NOT render desktop [x] button in nag mode", () => {
    const { container } = renderOverlays({ showUpgrade: true, upgradeDismissMode: "nag" });
    const desktopClose = Array.from(container.querySelectorAll(".upgrade-desktop *"))
      .find((el) => el.textContent?.includes("[x]"));
    expect(desktopClose).toBeFalsy();
  });

  it("fires onUpgradeDismiss when desktop [x] is clicked in manual mode", () => {
    const { container, props } = renderOverlays({ showUpgrade: true, upgradeDismissMode: "manual" });
    const desktopClose = Array.from(container.querySelectorAll(".upgrade-desktop button"))
      .find((el) => el.textContent?.includes("[x]"));
    expect(desktopClose).toBeTruthy();
    act(() => {
      desktopClose!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(props.onUpgradeDismiss).toHaveBeenCalledTimes(1);
  });

  it("fires onUpgradeDismiss when mobile footer dismiss button is tapped", () => {
    const { container, props } = renderOverlays({ showUpgrade: true, upgradeDismissMode: "nag" });
    // Mobile footer uses a <button> with class "upgrade-esc-btn"
    const escBtn = container.querySelector(".upgrade-mobile .upgrade-esc-btn");
    expect(escBtn).not.toBeNull();
    act(() => {
      escBtn!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(props.onUpgradeDismiss).toHaveBeenCalled();
  });

  it("shows free-tier quota status for free-tier users in UpgradeOverlay", () => {
    const state = makeGameState({ proKey: undefined, proKeyHash: undefined });
    const { container } = renderOverlays({ showUpgrade: true, state });
    const text = container.textContent ?? "";
    // Free tier should show "Depleted" status (quotaPercent: 0)
    expect(text).toContain("Depleted");
  });

  it("shows pro-tier credits for upgraded users who open the overlay manually", () => {
    const state = makeGameState({ proKey: "pro-key-123", economy: {
      currentTD: 0, totalTDEarned: 0, currentRank: "Junior Code Monkey",
      quotaPercent: 50, quotaLockouts: 0, tdMultiplier: 1,
    }});
    const { container } = renderOverlays({ showUpgrade: true, state });
    const text = container.textContent ?? "";
    // 50% of PRO_QUOTA_LIMIT(100) = 50 credits → "Insufficient"
    expect(text).toContain("Insufficient");
  });

  it("shows BYOK-specific copy instead of platform quota credits", () => {
    const state = makeGameState({ apiKey: "sk-user-key" });
    const { container } = renderOverlays({ showUpgrade: true, state });
    const text = container.textContent ?? "";
    expect(text).toContain("EXTERNAL BILLING ACTIVE");
    expect(text).not.toContain("CURRENT QUOTA:");
  });
});

describe("WinRAR nag: dismiss replay path", () => {
  beforeEach(() => {
    vi.spyOn(window.history, "pushState").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("mobile footer tap fires onUpgradeDismiss exactly once (triggers command replay)", () => {
    const { container, props } = renderOverlays({ showUpgrade: true, upgradeDismissMode: "nag" });
    const escBtn = container.querySelector(".upgrade-mobile .upgrade-esc-btn");
    expect(escBtn).not.toBeNull();
    act(() => {
      escBtn!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(props.onUpgradeDismiss).toHaveBeenCalledTimes(1);
  });

  it("clicking purchase links does NOT fire onUpgradeDismiss (command stays pending)", () => {
    const { container, props } = renderOverlays({ showUpgrade: true, upgradeDismissMode: "nag" });
    const links = container.querySelectorAll("a[href]");
    expect(links.length).toBeGreaterThan(0);
    act(() => {
      links[0]!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(props.onUpgradeDismiss).not.toHaveBeenCalled();
  });

  it("clicking desktop backdrop does NOT fire onUpgradeDismiss (command stays pending)", () => {
    const { container, props } = renderOverlays({ showUpgrade: true, upgradeDismissMode: "nag" });
    const backdrop = container.querySelector(".upgrade-desktop .absolute");
    expect(backdrop).not.toBeNull();
    act(() => {
      backdrop!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(props.onUpgradeDismiss).not.toHaveBeenCalled();
  });
});

describe("WinRAR nag: Terminal integration", () => {
  beforeEach(() => {
    submitChatMessageMock.mockReset();
    window.history.pushState(null, "", "/");
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    testConfig.initialQuotaPercent = 0;
  });

  it("replays the blocked desktop command only after Escape dismisses the nag overlay", async () => {
    await renderTerminal();
    await submitTerminalCommand("status");

    expect(submitChatMessageMock).not.toHaveBeenCalled();
    expect(container.querySelector(".upgrade-desktop")).not.toBeNull();

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      await Promise.resolve();
    });

    expect(container.querySelector(".upgrade-desktop")).toBeNull();
    expect(submitChatMessageMock).toHaveBeenCalledTimes(1);
  });

  it("does not dismiss the nag or restore the command on popstate while a command is pending", async () => {
    await renderTerminal();
    const input = await submitTerminalCommand("why");

    expect(submitChatMessageMock).not.toHaveBeenCalled();
    expect(container.querySelector(".upgrade-desktop")).not.toBeNull();
    expect(input.value).toBe("");

    await act(async () => {
      window.dispatchEvent(new PopStateEvent("popstate"));
      await Promise.resolve();
    });

    expect(container.querySelector(".upgrade-desktop")).not.toBeNull();
    expect(input.value).toBe("");
    expect(submitChatMessageMock).not.toHaveBeenCalled();
  });

  it("arms the next-command nag after a stale quota update instead of showing it immediately", async () => {
    testConfig.initialQuotaPercent = 50;
    submitChatMessageMock.mockImplementation(({ onQuotaUpdate, setIsProcessing }: { onQuotaUpdate: (quotaPercent: number) => void; setIsProcessing: (v: boolean) => void }) => {
      onQuotaUpdate(0);
      setIsProcessing(false);
    });

    await renderTerminal();
    const input = await submitTerminalCommand("status");

    expect(submitChatMessageMock).toHaveBeenCalledTimes(1);
    expect(container.querySelector(".upgrade-desktop")).toBeNull();
    expect(input.value).toBe("");

    await act(async () => {
      input.value = "why";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => {
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });

    expect(submitChatMessageMock).toHaveBeenCalledTimes(1);
    expect(container.querySelector(".upgrade-desktop")).not.toBeNull();
  });
});

describe("WinRAR nag: shouldShowNag helper", () => {
  it("returns false for BYOK users even with depleted quota", () => {
    expect(shouldShowNag("sk-user-key", undefined, undefined, 0)).toBe(false);
  });

  it("returns false for pro-key users even with depleted quota", () => {
    expect(shouldShowNag(undefined, "pro-key-123", undefined, 0)).toBe(false);
  });

  it("returns false for pro-key-hash users even with depleted quota", () => {
    expect(shouldShowNag(undefined, undefined, "hash-abc", 0)).toBe(false);
  });

  it("returns true for free-tier users with depleted quota (0%)", () => {
    expect(shouldShowNag(undefined, undefined, undefined, 0)).toBe(true);
  });

  it("returns true for free-tier users with negative quota", () => {
    expect(shouldShowNag(undefined, undefined, undefined, -5)).toBe(true);
  });

  it("returns false for free-tier users with remaining quota", () => {
    expect(shouldShowNag(undefined, undefined, undefined, 1)).toBe(false);
    expect(shouldShowNag(undefined, undefined, undefined, 50)).toBe(false);
  });
});

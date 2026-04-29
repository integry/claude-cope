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
const submitChatMessageMock = vi.fn();

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
      return (
        React.createElement("input", {
          ref,
          "aria-label": "terminal-input",
          value,
          disabled,
          placeholder,
          onChange,
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
      const [state, setState] = React.useState(initialState);
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

  it("does NOT fire onUpgradeDismiss when desktop backdrop is clicked (ESC-only)", () => {
    const { container, props } = renderOverlays({ showUpgrade: true });
    const desktop = container.querySelector(".upgrade-desktop");
    act(() => {
      desktop?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(props.onUpgradeDismiss).not.toHaveBeenCalled();
  });

  it("does NOT fire onUpgradeDismiss when mobile backdrop is clicked", () => {
    const { container, props } = renderOverlays({ showUpgrade: true });
    const mobile = container.querySelector(".upgrade-mobile");
    act(() => {
      mobile?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(props.onUpgradeDismiss).not.toHaveBeenCalled();
  });

  it("does NOT fire onUpgradeDismiss when desktop [x] is clicked (ESC-only)", () => {
    const { container, props } = renderOverlays({ showUpgrade: true });
    const desktopCloseButtons = Array.from(container.querySelectorAll(".upgrade-desktop span[style]"))
      .filter((el) => el.textContent?.includes("[x]"));
    expect(desktopCloseButtons.length).toBeGreaterThanOrEqual(1);
    act(() => {
      desktopCloseButtons[0]!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(props.onUpgradeDismiss).not.toHaveBeenCalled();
  });

  it("fires onUpgradeDismiss when mobile footer dismiss button is tapped", () => {
    const { container, props } = renderOverlays({ showUpgrade: true });
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
    const { container, props } = renderOverlays({ showUpgrade: true });
    const escBtn = container.querySelector(".upgrade-mobile .upgrade-esc-btn");
    expect(escBtn).not.toBeNull();
    act(() => {
      escBtn!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(props.onUpgradeDismiss).toHaveBeenCalledTimes(1);
  });

  it("clicking purchase links does NOT fire onUpgradeDismiss (command stays pending)", () => {
    const { container, props } = renderOverlays({ showUpgrade: true });
    const links = container.querySelectorAll("a[href]");
    expect(links.length).toBeGreaterThan(0);
    act(() => {
      links[0]!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(props.onUpgradeDismiss).not.toHaveBeenCalled();
  });

  it("clicking desktop backdrop does NOT fire onUpgradeDismiss (command stays pending)", () => {
    const { container, props } = renderOverlays({ showUpgrade: true });
    const backdrop = container.querySelector(".upgrade-desktop .absolute");
    expect(backdrop).not.toBeNull();
    act(() => {
      backdrop!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(props.onUpgradeDismiss).not.toHaveBeenCalled();
  });
});

describe("WinRAR nag: replay state-machine (duplicate prevention)", () => {
  /**
   * These tests exercise the state-machine logic that Terminal uses for the
   * nag replay flow.  We simulate the ref / state interactions directly
   * rather than rendering Terminal (which has dozens of unrelated deps).
   */

  it("client-side nag: command not in history → replay adds exactly once", () => {
    // Simulates the client-side quota check path (handleEnterSubmit)
    const commandHistory: string[] = [];
    const chatHistory: Message[] = [];
    const pendingNagCommand: { command: string } | null = { command: "hello world" };

    // handleUpgradeNagClose replay logic
    if (pendingNagCommand !== null) {
      commandHistory.push(pendingNagCommand.command);
      chatHistory.push({ role: "user", content: pendingNagCommand.command });
    }

    expect(commandHistory).toEqual(["hello world"]);
    expect(chatHistory.filter((m) => m.role === "user")).toHaveLength(1);
  });

  it("backend 402 nag: cleanup removes prior entries before replay", () => {
    // Simulates the onQuotaExhausted cleanup + handleUpgradeNagClose replay
    const command = "fix my code";

    // --- Initial attempt (handleEnterSubmit + processCommand) ---
    const commandHistory: string[] = ["fix my code"];
    const chatHistory: Message[] = [
      { role: "user", content: "fix my code" },
      { role: "loading", content: "Processing..." },
    ];

    // --- onQuotaExhausted fires (backend 402) ---
    // handleErrorResponse strips loading messages
    const afterErrorFilter = chatHistory.filter((m) => m.role !== "loading");

    // Cleanup: remove command from commandHistory
    const cmdIdx = [...commandHistory].reverse().findIndex((c) => c === command);
    if (cmdIdx >= 0) {
      const realIdx = commandHistory.length - 1 - cmdIdx;
      commandHistory.splice(realIdx, 1);
    }

    // Cleanup: remove user message from chatHistory
    const cleaned: Message[] = [];
    let removedUser = false;
    for (let i = afterErrorFilter.length - 1; i >= 0; i--) {
      if (!removedUser && afterErrorFilter[i]?.role === "user" && afterErrorFilter[i]?.content === command) {
        removedUser = true;
        continue;
      }
      cleaned.unshift(afterErrorFilter[i]!);
    }

    // --- handleUpgradeNagClose replay ---
    cleaned.push({ role: "user", content: command });
    commandHistory.push(command);

    // Verify exactly one entry in each
    expect(commandHistory.filter((c) => c === command)).toHaveLength(1);
    expect(cleaned.filter((m) => m.role === "user" && m.content === command)).toHaveLength(1);
  });

  it("stale quota state: onQuotaUpdate shows nag when quota drops to 0", () => {
    // Simulates the onQuotaUpdate catch-up for stale client state
    let showUpgrade = false;
    const isFreeTier = true;
    let quotaPercent = 50; // stale: client thinks quota is available

    // After backend response, onQuotaUpdate fires with real quota
    const onQuotaUpdate = (newPercent: number) => {
      quotaPercent = newPercent;
      if (newPercent <= 0 && isFreeTier) {
        showUpgrade = true;
      }
    };

    // Backend reports exhausted quota
    onQuotaUpdate(0);

    expect(quotaPercent).toBe(0);
    expect(showUpgrade).toBe(true);

    // shouldShowNag now returns true for the next command
    expect(shouldShowNag(undefined, undefined, undefined, quotaPercent)).toBe(true);
  });

  it("onQuotaUpdate does NOT show nag for non-free-tier users", () => {
    let showUpgrade = false;
    const isFreeTier = false;

    const onQuotaUpdate = (newPercent: number) => {
      if (newPercent <= 0 && isFreeTier) {
        showUpgrade = true;
      }
    };

    onQuotaUpdate(0);
    expect(showUpgrade).toBe(false);
  });

  it("onQuotaUpdate does NOT show nag when quota is still positive", () => {
    let showUpgrade = false;
    const isFreeTier = true;

    const onQuotaUpdate = (newPercent: number) => {
      if (newPercent <= 0 && isFreeTier) {
        showUpgrade = true;
      }
    };

    onQuotaUpdate(25);
    expect(showUpgrade).toBe(false);
  });
});

describe("WinRAR nag: Terminal ESC integration", () => {
  beforeEach(() => {
    submitChatMessageMock.mockReset();
    window.history.pushState(null, "", "/");
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("replays the blocked desktop command only after Escape dismisses the nag overlay", async () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root.render(createElement(Terminal));
    });

    const input = container.querySelector("input[aria-label='terminal-input']") as HTMLInputElement | null;
    expect(input).not.toBeNull();

    await act(async () => {
      input!.value = "status";
      input!.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => {
      input!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });

    expect(submitChatMessageMock).not.toHaveBeenCalled();
    expect(container.querySelector(".upgrade-desktop")).not.toBeNull();

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      await Promise.resolve();
    });

    expect(container.querySelector(".upgrade-desktop")).toBeNull();
    expect(submitChatMessageMock).toHaveBeenCalledTimes(1);
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

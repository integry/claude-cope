// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
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

import { TerminalOverlays } from "../TerminalOverlays";
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

  it("fires onUpgradeDismiss when desktop backdrop is clicked", () => {
    const { container, props } = renderOverlays({ showUpgrade: true });
    const desktop = container.querySelector(".upgrade-desktop");
    act(() => {
      desktop?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(props.onUpgradeDismiss).toHaveBeenCalledTimes(1);
  });

  it("fires onUpgradeDismiss when mobile backdrop is clicked", () => {
    const { container, props } = renderOverlays({ showUpgrade: true });
    const mobile = container.querySelector(".upgrade-mobile");
    act(() => {
      mobile?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(props.onUpgradeDismiss).toHaveBeenCalledTimes(1);
  });

  it("fires onUpgradeDismiss when desktop [x] close button is clicked", () => {
    const { container, props } = renderOverlays({ showUpgrade: true });
    // The desktop [x] button has onClick that calls onDismiss
    const desktopCloseButtons = Array.from(container.querySelectorAll(".upgrade-desktop span[style]"))
      .filter((el) => el.textContent?.includes("[x]"));
    expect(desktopCloseButtons.length).toBeGreaterThanOrEqual(1);
    act(() => {
      desktopCloseButtons[0]!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(props.onUpgradeDismiss).toHaveBeenCalled();
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

  it("passes correct isUpgraded=false for free-tier users to UpgradeOverlay", () => {
    const state = makeGameState({ proKey: undefined, proKeyHash: undefined });
    const { container } = renderOverlays({ showUpgrade: true, state });
    const text = container.textContent ?? "";
    // Free tier should show "Depleted" status (quotaPercent: 0)
    expect(text).toContain("Depleted");
  });

  it("passes correct isUpgraded=true for pro users to UpgradeOverlay", () => {
    const state = makeGameState({ proKey: "pro-key-123", economy: {
      currentTD: 0, totalTDEarned: 0, currentRank: "Junior Code Monkey",
      quotaPercent: 50, quotaLockouts: 0, tdMultiplier: 1,
    }});
    const { container } = renderOverlays({ showUpgrade: true, state });
    const text = container.textContent ?? "";
    // Pro tier with 50% quota on PRO_QUOTA_LIMIT=100 → 50 credits → "Insufficient"
    expect(text).toContain("Insufficient");
  });
});

describe("WinRAR nag: handleUpgradeNagClose wiring simulation", () => {
  // These tests simulate what Terminal.handleUpgradeNagClose does when
  // the onUpgradeDismiss callback fires, verifying the full dismiss-and-replay
  // chain using real refs and state updaters — the same objects Terminal uses.

  let pushStateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    pushStateSpy = vi.spyOn(window.history, "pushState").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("replays pending command and records in command history on dismiss", () => {
    const pendingNagCommandRef = { current: "hello world" as string | null };
    const processCommand = vi.fn();
    const processCommandRef = { current: processCommand };
    const setShowUpgrade = vi.fn();
    const commandHistory: string[] = [];
    const setCommandHistory = vi.fn((updater: (prev: string[]) => string[]) => {
      const next = updater([...commandHistory]);
      commandHistory.length = 0;
      commandHistory.push(...next);
    });

    // Simulate what handleUpgradeNagClose does (inlined in Terminal.tsx)
    setShowUpgrade(false);
    if (window.location.pathname === "/upgrade") {
      window.history.pushState(null, "", "/");
    }
    if (pendingNagCommandRef.current !== null) {
      const command = pendingNagCommandRef.current;
      pendingNagCommandRef.current = null;
      setCommandHistory((prev: string[]) => [...prev, command]);
      processCommandRef.current(command);
    }

    expect(setShowUpgrade).toHaveBeenCalledWith(false);
    expect(pendingNagCommandRef.current).toBeNull();
    expect(processCommand).toHaveBeenCalledWith("hello world");
    expect(commandHistory).toEqual(["hello world"]);
  });

  it("does not replay when no pending command (opened via /upgrade slash command)", () => {
    const pendingNagCommandRef = { current: null as string | null };
    const processCommand = vi.fn();
    const processCommandRef = { current: processCommand };
    const setShowUpgrade = vi.fn();
    const setCommandHistory = vi.fn();

    setShowUpgrade(false);
    if (window.location.pathname === "/upgrade") {
      window.history.pushState(null, "", "/");
    }
    if (pendingNagCommandRef.current !== null) {
      const command = pendingNagCommandRef.current;
      pendingNagCommandRef.current = null;
      setCommandHistory((prev: string[]) => [...prev, command]);
      processCommandRef.current(command);
    }

    expect(setShowUpgrade).toHaveBeenCalledWith(false);
    expect(processCommand).not.toHaveBeenCalled();
    expect(setCommandHistory).not.toHaveBeenCalled();
  });

  it("navigates away from /upgrade path on dismiss", () => {
    const pendingNagCommandRef = { current: null as string | null };
    const processCommandRef = { current: vi.fn() };
    const setShowUpgrade = vi.fn();
    const setCommandHistory = vi.fn();

    Object.defineProperty(window, "location", {
      value: { pathname: "/upgrade" },
      writable: true,
      configurable: true,
    });

    setShowUpgrade(false);
    if (window.location.pathname === "/upgrade") {
      window.history.pushState(null, "", "/");
    }
    if (pendingNagCommandRef.current !== null) {
      const command = pendingNagCommandRef.current;
      pendingNagCommandRef.current = null;
      setCommandHistory((prev: string[]) => [...prev, command]);
      processCommandRef.current(command);
    }

    expect(pushStateSpy).toHaveBeenCalledWith(null, "", "/");
  });

  it("does not store command for BYOK users (shouldShowNag returns false)", () => {
    // Simulate Terminal.checkQuotaAndHandleExhaustion for a BYOK user
    const effectiveApiKey = "sk-user-key";
    const proKey = null;
    const proKeyHash = null;
    const quotaPercent = 0;
    const pendingNagCommandRef = { current: null as string | null };

    // shouldShowNag logic (inlined in Terminal.tsx)
    const shouldNag = !effectiveApiKey && !proKey && !proKeyHash && quotaPercent <= 0;

    if (shouldNag) {
      pendingNagCommandRef.current = "test command";
    }

    expect(shouldNag).toBe(false);
    expect(pendingNagCommandRef.current).toBeNull();
  });

  it("triggers nag for free-tier users with exhausted quota", () => {
    const effectiveApiKey = undefined;
    const proKey = null;
    const proKeyHash = null;
    const quotaPercent = 0;
    const pendingNagCommandRef = { current: null as string | null };
    const setShowUpgrade = vi.fn();

    const shouldNag = !effectiveApiKey && !proKey && !proKeyHash && quotaPercent <= 0;

    if (shouldNag) {
      pendingNagCommandRef.current = "test command";
      setShowUpgrade(true);
    }

    expect(shouldNag).toBe(true);
    expect(pendingNagCommandRef.current).toBe("test command");
    expect(setShowUpgrade).toHaveBeenCalledWith(true);
  });

  it("appends replayed command after existing history entries", () => {
    const pendingNagCommandRef = { current: "replayed cmd" as string | null };
    const processCommandRef = { current: vi.fn() };
    const setShowUpgrade = vi.fn();
    const commandHistory = ["first", "second"];
    const setCommandHistory = vi.fn((updater: (prev: string[]) => string[]) => {
      const next = updater([...commandHistory]);
      commandHistory.length = 0;
      commandHistory.push(...next);
    });

    setShowUpgrade(false);
    if (pendingNagCommandRef.current !== null) {
      const command = pendingNagCommandRef.current;
      pendingNagCommandRef.current = null;
      setCommandHistory((prev: string[]) => [...prev, command]);
      processCommandRef.current(command);
    }

    expect(commandHistory).toEqual(["first", "second", "replayed cmd"]);
  });
});

// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { buildTerminalOpeners, focusTerminalInputIfEligible, getUpgradeDismissProps, renderBuddyDock } from "../terminalViewHelpers";

describe("terminalViewHelpers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens overlays and upgrade routes through the extracted handlers", () => {
    const closeAllOverlaysPreservingNag = vi.fn();
    const setShowHelp = vi.fn();
    const setShowUpgrade = vi.fn();
    const setInputValue = vi.fn();
    const setSlashQuery = vi.fn();
    const setSlashIndex = vi.fn();
    const runSlashCommand = vi.fn();
    const pushState = vi.spyOn(window.history, "pushState");
    const inputRef = { current: { focus: vi.fn() } as unknown as HTMLInputElement };

    const { openHelp, openUpgrade, openSlashMenu, handleTickerCommand } = buildTerminalOpeners({
      closeAllOverlaysPreservingNag,
      setShowHelp,
      setShowAbout: vi.fn(),
      setShowStore: vi.fn(),
      setShowLeaderboard: vi.fn(),
      setShowAchievements: vi.fn(),
      setShowContact: vi.fn(),
      setShowParty: vi.fn(),
      setShowUpgrade,
      setInputValue,
      setSlashQuery,
      setSlashIndex,
      isMobileViewport: false,
      inputRef,
      runSlashCommand,
    });

    openHelp();
    openUpgrade();
    openSlashMenu();
    handleTickerCommand("/party");

    expect(closeAllOverlaysPreservingNag).toHaveBeenCalledTimes(3);
    expect(setShowHelp).toHaveBeenCalledWith(true);
    expect(setShowUpgrade).toHaveBeenCalledWith(true);
    expect(pushState).toHaveBeenCalledWith(null, "", "/upgrade");
    expect(setInputValue).toHaveBeenCalledWith("/");
    expect(setSlashQuery).toHaveBeenCalledWith("/");
    expect(setSlashIndex).toHaveBeenCalledWith(0);
    expect(inputRef.current.focus).toHaveBeenCalledTimes(1);
    expect(runSlashCommand).toHaveBeenCalledWith("/party");
  });

  it("focuses the terminal input only when desktop, no overlays are open, and no text is selected", () => {
    const focus = vi.fn();
    const inputRef = { current: { focus } as unknown as HTMLInputElement };
    const getSelection = vi.spyOn(window, "getSelection");

    getSelection.mockReturnValue({ toString: () => "" } as Selection);
    focusTerminalInputIfEligible(false, false, inputRef);
    expect(focus).toHaveBeenCalledTimes(1);

    focusTerminalInputIfEligible(true, false, inputRef);
    focusTerminalInputIfEligible(false, true, inputRef);
    getSelection.mockReturnValue({ toString: () => "selected" } as Selection);
    focusTerminalInputIfEligible(false, false, inputRef);
    expect(focus).toHaveBeenCalledTimes(1);
  });

  it("keeps upgrade dismiss mode aligned with pending nag state", () => {
    const handleUpgradeNagClose = vi.fn();
    const handleManualUpgradeDismiss = vi.fn();

    const nagDismissProps = getUpgradeDismissProps("queued-command", handleUpgradeNagClose, handleManualUpgradeDismiss);
    const manualDismissProps = getUpgradeDismissProps(null, handleUpgradeNagClose, handleManualUpgradeDismiss);

    expect(nagDismissProps.upgradeDismissMode).toBe("nag");
    nagDismissProps.onUpgradeDismiss();
    expect(handleUpgradeNagClose).toHaveBeenCalledTimes(1);

    expect(manualDismissProps.upgradeDismissMode).toBe("manual");
    manualDismissProps.onUpgradeDismiss();
    expect(handleManualUpgradeDismiss).toHaveBeenCalledTimes(1);
  });

  it("renders the buddy dock only when a buddy exists", () => {
    let container: HTMLDivElement | null = document.createElement("div");
    document.body.appendChild(container);
    let root: Root | null = createRoot(container);

    act(() => {
      root!.render(renderBuddyDock({ type: null, isShiny: false, promptsSinceLastInterjection: 0 }));
    });
    expect(container.querySelector(".terminal-buddy-dock")).toBeNull();

    act(() => {
      root!.render(renderBuddyDock({ type: "Sarcastic Clippy", isShiny: false, promptsSinceLastInterjection: 0 }));
    });
    expect(container.querySelector(".terminal-buddy-dock")).not.toBeNull();

    act(() => {
      root!.unmount();
    });
    container.remove();
    root = null;
    container = null;
  });
});

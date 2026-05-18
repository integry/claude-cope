// @vitest-environment jsdom
import { act } from "react";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  BACKLOG_CATEGORY_UPGRADE_GROUPS,
  PREMIUM_BACKLOG_CATEGORY_COUNT,
} from "@claude-cope/shared/backlogTiers";

vi.mock("../../config", () => ({
  UPGRADE_CHECKOUT_SINGLE: "https://example.com/single",
  UPGRADE_CHECKOUT_MULTI: "https://example.com/multi",
  UPGRADE_PRICE_SINGLE: "$4.99",
  UPGRADE_PRICE_MULTI: "$19.99",
  PRO_QUOTA_LIMIT: 100,
  FREE_QUOTA_LIMIT: 20,
}));

import UpgradeOverlay from "../UpgradeOverlay";
import { UPGRADE_NAG_CLOSE_EFFECTS } from "../upgradeOverlayEffects";

const defaultProps = {
  quotaPercent: 65,
  totalQuota: 20,
  isBYOK: false,
  onDismiss: vi.fn(),
} satisfies Parameters<typeof UpgradeOverlay>[0];

const executiveSupporterHeading = "OPTION 2: EXECUTIVE SUPPORTER - $19.99";
const executiveSupporterDescription = "5 team keys, plus vanity upgrades: buy a fake promotion and unlock premium terminal themes.";
const executiveSupporterCta = "EXPENSE TO EMPLOYER - $19.99";
const singleLicenseDesktopLine1 = "One seat. Unlocks 100 lifetime credits and advanced Cope";
const singleLicenseDesktopLine2 = "models.";
const executiveSupporterDesktopLine1 = "5 team keys, plus vanity upgrades: buy a fake promotion and";
const executiveSupporterDesktopLine2 = "unlock premium terminal themes.";

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
const originalInnerWidth = window.innerWidth;

const setViewportWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: width });
  window.dispatchEvent(new Event("resize"));
};

const renderOverlay = (props: Partial<typeof defaultProps> & Record<string, unknown> = {}) => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(createElement(UpgradeOverlay, { ...defaultProps, ...props })));
  return container;
};

const cleanup = () => {
  if (root) act(() => root.unmount());
  if (container?.parentNode) container.parentNode.removeChild(container);
};

const text = (element?: ParentNode | null) => (element ?? container).textContent ?? "";
const desktop = () => container.querySelector(".upgrade-desktop") as HTMLDivElement | null;
const mobile = () => container.querySelector(".upgrade-mobile") as HTMLDivElement | null;
const selectedDesktopHref = () =>
  container.querySelector(".upgrade-desktop a[data-selected='true']")?.getAttribute("href");

describe("UpgradeOverlay", () => {
  afterEach(() => {
    cleanup();
    setViewportWidth(originalInnerWidth);
  });

  it("renders both desktop and mobile layout containers in the DOM", () => {
    renderOverlay();
    expect(desktop()).not.toBeNull();
    expect(mobile()).not.toBeNull();
  });

  it("renders the WALLET EXTRACTION UTILITY title in both layouts", () => {
    renderOverlay();
    expect(text()).toContain("W A L L E T   E X T R A C T I O N   U T I L I T Y");
    expect(text()).toContain("WALLET EXTRACTION UTILITY");
  });

  it("renders both purchase options with prices", () => {
    renderOverlay();
    expect(text()).toContain("AUTHORIZE EXTRACTION - $4.99");
    expect(text()).toContain(executiveSupporterCta);
  });

  it("renders the compact appendix and keeps the purchase options above it", () => {
    renderOverlay();
    const appendix = `APPENDIX: ${PREMIUM_BACKLOG_CATEGORY_COUNT} NEW MAX CATEGORIES UNLOCKED`;
    const renderedText = text();

    expect(renderedText).not.toContain("FREE STARTER SET:");
    expect(renderedText).toContain(appendix);
    expect(renderedText.indexOf("AUTHORIZE EXTRACTION - $4.99")).toBeLessThan(renderedText.indexOf(appendix));
    expect(renderedText.indexOf(executiveSupporterCta)).toBeLessThan(renderedText.indexOf(appendix));

    for (const { id, title } of BACKLOG_CATEGORY_UPGRADE_GROUPS) {
      expect(renderedText).toContain(id === "marketing-growth-sludge" ? "GROWTH SLUDGE" : title.toUpperCase());
    }
  });

  it("renders the executive supporter offer copy in both layouts", () => {
    renderOverlay();
    expect(text(desktop())).toContain(singleLicenseDesktopLine1);
    expect(text(desktop())).toContain(singleLicenseDesktopLine2);
    expect(text(desktop())).toContain(executiveSupporterHeading);
    expect(text(desktop())).toContain(executiveSupporterDesktopLine1);
    expect(text(desktop())).toContain(executiveSupporterDesktopLine2);
    expect(text(desktop())).toContain(executiveSupporterCta);
    expect(text(mobile())).toContain(executiveSupporterHeading);
    expect(text(mobile())).toContain(executiveSupporterDescription);
    expect(text(mobile())).toContain(executiveSupporterCta);
  });

  it("renders checkout links for both options", () => {
    renderOverlay();
    const hrefs = Array.from(container.querySelectorAll("a[href]"), (link) => link.getAttribute("href"));
    expect(hrefs).toContain("https://example.com/single");
    expect(hrefs).toContain("https://example.com/multi");
  });

  it("renders the close [x] button in both layouts", () => {
    renderOverlay();
    const matches = text().match(/\[x\]/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThanOrEqual(2);
  });

  it("handles backdrop dismissal based on dismiss mode", () => {
    for (const dismissMode of ["manual", "nag"] as const) {
      const onDismiss = vi.fn();
      cleanup();
      renderOverlay({ onDismiss, dismissMode });
      act(() => desktop()?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
      expect(onDismiss).toHaveBeenCalledTimes(dismissMode === "manual" ? 1 : 0);
    }
  });

  it("does call onDismiss when the nag footer is tapped on mobile", () => {
    const onDismiss = vi.fn();
    renderOverlay({ onDismiss, dismissMode: "nag" });
    const footerButton = Array.from(container.querySelectorAll("button")).find((button) =>
      button.textContent?.includes("Tap to retain your net worth"),
    );
    act(() => footerButton?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("renders the forced-closing class when the nag enters its exit sequence", () => {
    renderOverlay({ dismissMode: "nag", dismissPhase: "closing", dismissEffect: "singularity" });
    expect(desktop()?.classList.contains("upgrade-overlay-closing")).toBe(true);
    expect(mobile()?.classList.contains("upgrade-overlay-closing")).toBe(true);
    expect(container.querySelectorAll(".upgrade-overlay-panel-closing").length).toBeGreaterThanOrEqual(2);
    expect(desktop()?.getAttribute("data-close-effect")).toBe("singularity");
    expect(mobile()?.getAttribute("data-close-effect")).toBe("singularity");
  });

  it("supports multiple distinct close effects", () => {
    expect(UPGRADE_NAG_CLOSE_EFFECTS.length).toBeGreaterThan(6);
    for (const dismissEffect of UPGRADE_NAG_CLOSE_EFFECTS) {
      cleanup();
      renderOverlay({ dismissMode: "nag", dismissPhase: "closing", dismissEffect });
      expect(desktop()?.getAttribute("data-close-effect")).toBe(dismissEffect);
      expect(mobile()?.getAttribute("data-close-effect")).toBe(dismissEffect);
    }
  });

  it("renders the ESC / close footer in both layouts", () => {
    renderOverlay();
    expect(text()).toContain("Press ESC to retain your net worth");
    expect(text()).toContain("Tap to retain your net worth");
  });

  it("renders the desktop retain footer as text with a separate overlay button", () => {
    renderOverlay();
    const footerRow = container.querySelector(".upgrade-desktop .upgrade-esc-row");
    const footerCopy = footerRow?.querySelector("[data-esc]");
    const footerButton = footerRow?.querySelector("button.upgrade-esc-btn");
    const bottomBorderRow = container.querySelector(".upgrade-desktop .upgrade-bottom-border-row");

    expect(footerRow).not.toBeNull();
    expect(footerCopy?.textContent).toContain("Press ESC to retain your net worth");
    expect(footerButton).not.toBeNull();
    expect(footerButton?.textContent).toBe("");
    expect(bottomBorderRow).not.toBeNull();
  });

  it("desktop layout uses overflow-x auto, not hidden", () => {
    renderOverlay();
    expect((container.querySelector(".upgrade-desktop pre") as HTMLElement | null)?.style.overflowX).toBe("auto");
  });

  it("supports desktop keyboard navigation and activation", () => {
    setViewportWidth(1024);
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    renderOverlay({ dismissMode: "nag" });
    const singleLink = container.querySelectorAll(".upgrade-desktop a[href]")[0] as HTMLAnchorElement | undefined;
    const multiLink = container.querySelectorAll(".upgrade-desktop a[href]")[1] as HTMLAnchorElement | undefined;

    expect(selectedDesktopHref()).toBeUndefined();
    expect(document.activeElement).toBe(desktop());

    act(() => desktop()?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
    expect(clickSpy).not.toHaveBeenCalled();

    act(() => desktop()?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })));
    expect(selectedDesktopHref()).toBe("https://example.com/single");
    expect(document.activeElement).toBe(singleLink);

    act(() => desktop()?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
    expect(clickSpy).toHaveBeenCalledTimes(1);

    act(() => desktop()?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true })));
    expect(selectedDesktopHref()).toBe("https://example.com/multi");
    expect(document.activeElement).toBe(multiLink);

    clickSpy.mockRestore();
  });

  it("does not intercept document key events outside the desktop overlay", () => {
    setViewportWidth(1024);
    renderOverlay({ dismissMode: "nag" });
    act(() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })));
    expect(selectedDesktopHref()).toBeUndefined();
  });

  it("does not route Enter key events from the dismiss button to checkout links", () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    setViewportWidth(1024);
    renderOverlay();
    act(() =>
      container
        .querySelector(".upgrade-desktop button")
        ?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })),
    );
    expect(clickSpy).not.toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it("tabs from the desktop overlay into the first checkout link", () => {
    setViewportWidth(1024);
    renderOverlay({ dismissMode: "nag" });
    const singleLink = container.querySelectorAll(".upgrade-desktop a[href]")[0] as HTMLAnchorElement | undefined;
    act(() => desktop()?.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true })));
    expect(document.activeElement).toBe(singleLink);
    expect(selectedDesktopHref()).toBe("https://example.com/single");
  });

  it("shows visible manual focus on the first checkout option without arming keyboard selection", () => {
    setViewportWidth(1024);
    renderOverlay({ dismissMode: "manual" });
    const singleLink = container.querySelector(".upgrade-desktop a[href='https://example.com/single']");
    expect(document.activeElement).toBe(singleLink);
    expect(container.querySelector(".upgrade-desktop a[data-selected='true']")).toBeNull();
    expect(desktop()?.getAttribute("data-keyboard-nav")).toBe("false");
    expect(desktop()?.getAttribute("data-manual-focus")).toBe("true");
  });

  it("prevents Enter on the program-focused manual checkout link before keyboard navigation is armed", () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    setViewportWidth(1024);
    renderOverlay({ dismissMode: "manual" });
    const singleLink = container.querySelector(".upgrade-desktop a[href='https://example.com/single']") as HTMLAnchorElement | null;
    const enterEvent = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    act(() => singleLink?.dispatchEvent(enterEvent));
    expect(document.activeElement).toBe(singleLink);
    expect(desktop()?.getAttribute("data-keyboard-nav")).toBe("false");
    expect(desktop()?.getAttribute("data-manual-focus")).toBe("true");
    expect(enterEvent.defaultPrevented).toBe(true);
    expect(clickSpy).not.toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it("arms manual desktop keyboard navigation on Tab movement", () => {
    setViewportWidth(1024);
    renderOverlay({ dismissMode: "manual" });
    const singleLink = container.querySelector(".upgrade-desktop a[href='https://example.com/single']") as HTMLAnchorElement | null;

    act(() => singleLink?.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true })));
    expect(document.activeElement).toBe(singleLink);
    expect(desktop()?.getAttribute("data-keyboard-nav")).toBe("true");
    expect(desktop()?.getAttribute("data-manual-focus")).toBe("false");
    expect(selectedDesktopHref()).toBe("https://example.com/single");

    cleanup();
    renderOverlay({ dismissMode: "manual" });
    const resetSingleLink = container.querySelector(".upgrade-desktop a[href='https://example.com/single']") as HTMLAnchorElement | null;
    const resetCloseButton = container.querySelector(".upgrade-desktop button") as HTMLButtonElement | null;
    act(() => {
      resetSingleLink?.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true }));
      resetCloseButton?.focus();
    });
    expect(document.activeElement).toBe(resetCloseButton);
    expect(desktop()?.getAttribute("data-keyboard-nav")).toBe("true");
    expect(desktop()?.getAttribute("data-manual-focus")).toBe("false");
  });

  it("resets desktop keyboard state across viewport transitions", () => {
    setViewportWidth(1024);
    renderOverlay({ dismissMode: "nag" });

    act(() => desktop()?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })));
    expect(selectedDesktopHref()).toBe("https://example.com/single");
    expect(desktop()?.getAttribute("data-keyboard-nav")).toBe("true");

    act(() => setViewportWidth(375));
    act(() => desktop()?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })));
    expect(selectedDesktopHref()).toBeUndefined();
    expect(document.activeElement).not.toBe(desktop());
    expect(desktop()?.contains(document.activeElement)).toBe(false);
    expect(desktop()?.getAttribute("data-keyboard-nav")).toBe("false");

    act(() => setViewportWidth(1024));
    expect(document.activeElement).toBe(desktop());
    expect(desktop()?.getAttribute("data-keyboard-nav")).toBe("false");
    expect(container.querySelector(".upgrade-desktop a[data-selected='true']")).toBeNull();
  });

  it("enables desktop keyboard navigation after resizing from mobile to desktop", () => {
    setViewportWidth(375);
    renderOverlay({ dismissMode: "nag" });

    act(() => desktop()?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })));
    expect(selectedDesktopHref()).toBeUndefined();

    act(() => setViewportWidth(1024));
    act(() => desktop()?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })));
    expect(selectedDesktopHref()).toBe("https://example.com/single");
  });

  it("starts unarmed arrow-up navigation on the last checkout option", () => {
    setViewportWidth(1024);
    renderOverlay({ dismissMode: "nag" });
    const multiLink = container.querySelector(".upgrade-desktop a[href='https://example.com/multi']");
    act(() => desktop()?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true })));
    expect(document.activeElement).toBe(multiLink);
    expect(selectedDesktopHref()).toBe("https://example.com/multi");
  });

  it("does not auto-focus a checkout link or show selected styling when the nag opens", () => {
    setViewportWidth(1024);
    renderOverlay({ quotaPercent: 0, dismissMode: "nag" });
    expect(document.activeElement).toBe(desktop());
    expect(container.querySelector(".upgrade-desktop a[data-selected='true']")).toBeNull();
    expect(desktop()?.getAttribute("data-keyboard-nav")).toBe("false");
  });

  it("uses mobile-only CTA copy while preserving desktop CTA copy", () => {
    setViewportWidth(375);
    renderOverlay();
    expect(text(mobile())).toContain("EXTRACT FUNDS - $4.99");
    expect(text(mobile())).not.toContain("AUTHORIZE EXTRACTION - $4.99");
    expect(text(desktop())).toContain("AUTHORIZE EXTRACTION - $4.99");
  });

  it("renders the mobile header as two explicit lines", () => {
    setViewportWidth(375);
    renderOverlay();
    const headerLines = Array.from(container.querySelectorAll(".upgrade-mobile-header-line"), (line) => line.textContent);
    expect(headerLines).toEqual(["INITIALIZING UPGRADE:", "CLAUDE COPE [MAX 429X]"]);
  });

  it("renders mobile benchmark cards as stacked label and outcome lines", () => {
    setViewportWidth(375);
    renderOverlay();
    const cards = Array.from(container.querySelectorAll(".upgrade-mobile-benchmark-card"));

    expect(cards).toHaveLength(2);
    expect(cards[0]?.querySelector(".upgrade-mobile-benchmark-label")?.textContent).toBe("Legacy AI");
    expect(cards[0]?.querySelector(".upgrade-mobile-benchmark-outcome")?.textContent).toBe("Outcome: Manageable pull requests");
    expect(cards[1]?.querySelector(".upgrade-mobile-benchmark-label")?.textContent).toBe("Claude Cope");
    expect(cards[1]?.querySelector(".upgrade-mobile-benchmark-outcome")?.textContent).toBe("Outcome: Unmitigated request storms");
    expect(cards[0]?.textContent).not.toContain("·");
    expect(cards[1]?.textContent).not.toContain("·");
  });

  it("applies mobile CTA nowrap hooks and narrower mobile panel spacing classes", () => {
    setViewportWidth(320);
    renderOverlay();
    expect(container.querySelector(".upgrade-mobile .upgrade-mobile-cta")).not.toBeNull();
    expect(container.querySelector(".upgrade-mobile .upgrade-mobile-cta-label")).not.toBeNull();
    expect(container.querySelector(".upgrade-mobile .upgrade-mobile-panel")).not.toBeNull();
    expect(container.querySelector(".upgrade-mobile .upgrade-mobile-scroll")).not.toBeNull();
    expect(container.querySelectorAll(".upgrade-mobile .upgrade-mobile-section").length).toBeGreaterThan(0);
  });
});

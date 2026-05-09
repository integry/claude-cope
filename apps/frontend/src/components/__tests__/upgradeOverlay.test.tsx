// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";

vi.mock("../../config", () => ({
  UPGRADE_CHECKOUT_SINGLE: "https://example.com/single",
  UPGRADE_CHECKOUT_MULTI: "https://example.com/multi",
  UPGRADE_PRICE_SINGLE: "$4.99",
  UPGRADE_PRICE_MULTI: "$19.99",
  PRO_QUOTA_LIMIT: 100,
  FREE_QUOTA_LIMIT: 20,
}));

import UpgradeOverlay from "../UpgradeOverlay";

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
const originalInnerWidth = window.innerWidth;

function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: width });
  window.dispatchEvent(new Event("resize"));
}

function render(props: { quotaPercent: number; totalQuota: number; isBYOK: boolean; onDismiss: () => void; dismissMode?: "manual" | "nag" }) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root.render(createElement(UpgradeOverlay, props));
  });
  return container;
}

function cleanup() {
  if (root) act(() => root.unmount());
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
}

describe("UpgradeOverlay", () => {
  afterEach(() => {
    cleanup();
    setViewportWidth(originalInnerWidth);
  });

  it("renders both desktop and mobile layout containers in the DOM", () => {
    render({ quotaPercent: 65, totalQuota: 20, isBYOK: false, onDismiss: vi.fn() });
    const desktop = container.querySelector(".upgrade-desktop");
    const mobile = container.querySelector(".upgrade-mobile");
    expect(desktop).not.toBeNull();
    expect(mobile).not.toBeNull();
  });

  it("renders the WALLET EXTRACTION UTILITY title in both layouts", () => {
    render({ quotaPercent: 65, totalQuota: 20, isBYOK: false, onDismiss: vi.fn() });
    const text = container.textContent ?? "";
    // Desktop uses spaced-out title, mobile uses compact title
    expect(text).toContain("W A L L E T   E X T R A C T I O N   U T I L I T Y");
    expect(text).toContain("WALLET EXTRACTION UTILITY");
  });

  it("renders both purchase options with prices", () => {
    render({ quotaPercent: 65, totalQuota: 20, isBYOK: false, onDismiss: vi.fn() });
    const text = container.textContent ?? "";
    expect(text).toContain("AUTHORIZE EXTRACTION - $4.99");
    expect(text).toContain("EXTRACT TEAM FUNDS - $19.99");
  });

  it("renders checkout links for both options", () => {
    render({ quotaPercent: 65, totalQuota: 20, isBYOK: false, onDismiss: vi.fn() });
    const links = container.querySelectorAll("a[href]");
    const hrefs = Array.from(links).map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("https://example.com/single");
    expect(hrefs).toContain("https://example.com/multi");
  });

  it("renders the close [x] button in both layouts", () => {
    render({ quotaPercent: 65, totalQuota: 20, isBYOK: false, onDismiss: vi.fn() });
    const text = container.textContent ?? "";
    // Both layouts render [x]
    const matches = text.match(/\[x\]/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThanOrEqual(2);
  });

  it("does call onDismiss when the manual backdrop is clicked", () => {
    const onDismiss = vi.fn();
    render({ quotaPercent: 65, totalQuota: 20, isBYOK: false, onDismiss });
    const desktop = container.querySelector(".upgrade-desktop");
    act(() => {
      desktop?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onDismiss).toHaveBeenCalled();
  });

  it("does NOT call onDismiss when the nag backdrop is clicked", () => {
    const onDismiss = vi.fn();
    render({ quotaPercent: 65, totalQuota: 20, isBYOK: false, onDismiss, dismissMode: "nag" });
    const desktop = container.querySelector(".upgrade-desktop");
    act(() => {
      desktop?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("renders the ESC / close footer in both layouts", () => {
    render({ quotaPercent: 65, totalQuota: 20, isBYOK: false, onDismiss: vi.fn() });
    const text = container.textContent ?? "";
    expect(text).toContain("Press ESC to retain your net worth");
    expect(text).toContain("Tap to retain your net worth");
  });

  it("desktop layout uses overflow-x auto, not hidden", () => {
    render({ quotaPercent: 65, totalQuota: 20, isBYOK: false, onDismiss: vi.fn() });
    const pre = container.querySelector(".upgrade-desktop pre");
    expect(pre).not.toBeNull();
    expect((pre as HTMLElement).style.overflowX).toBe("auto");
  });

  it("cycles desktop selection with arrow keys", () => {
    setViewportWidth(1024);
    render({ quotaPercent: 65, totalQuota: 20, isBYOK: false, onDismiss: vi.fn() });
    const desktop = container.querySelector(".upgrade-desktop") as HTMLDivElement | null;
    const links = container.querySelectorAll(".upgrade-desktop a[href]");
    const singleLink = links[0] as HTMLAnchorElement | undefined;
    const multiLink = links[1] as HTMLAnchorElement | undefined;

    const getSelectedHref = () => container.querySelector(".upgrade-desktop a[data-selected='true']")?.getAttribute("href");

    expect(getSelectedHref()).toBe("https://example.com/single");
    expect(document.activeElement).toBe(singleLink);

    act(() => {
      desktop?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    });
    expect(getSelectedHref()).toBe("https://example.com/multi");
    expect(document.activeElement).toBe(multiLink);

    act(() => {
      desktop?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
    });
    expect(getSelectedHref()).toBe("https://example.com/single");
    expect(document.activeElement).toBe(singleLink);
  });

  it("activates the selected desktop option on Enter", () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    setViewportWidth(1024);
    render({ quotaPercent: 65, totalQuota: 20, isBYOK: false, onDismiss: vi.fn() });
    const desktop = container.querySelector(".upgrade-desktop") as HTMLDivElement | null;

    act(() => {
      desktop?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });

    expect(clickSpy).toHaveBeenCalledTimes(1);
    clickSpy.mockRestore();
  });

  it("does not intercept document key events outside the desktop overlay", () => {
    setViewportWidth(1024);
    render({ quotaPercent: 65, totalQuota: 20, isBYOK: false, onDismiss: vi.fn() });

    const getSelectedHref = () => container.querySelector(".upgrade-desktop a[data-selected='true']")?.getAttribute("href");

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    });

    expect(getSelectedHref()).toBe("https://example.com/single");
  });

  it("does not route Enter key events from the dismiss button to checkout links", () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    setViewportWidth(1024);
    render({ quotaPercent: 65, totalQuota: 20, isBYOK: false, onDismiss: vi.fn() });
    const closeButton = container.querySelector(".upgrade-desktop button");

    act(() => {
      closeButton?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });

    expect(clickSpy).not.toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it("syncs the selected desktop option when focus moves to a different link", () => {
    setViewportWidth(1024);
    render({ quotaPercent: 65, totalQuota: 20, isBYOK: false, onDismiss: vi.fn() });
    const links = container.querySelectorAll(".upgrade-desktop a[href]");
    const multiLink = links[1] as HTMLAnchorElement | undefined;

    act(() => {
      multiLink?.focus();
    });

    expect(document.activeElement).toBe(multiLink);
    expect(container.querySelector(".upgrade-desktop a[data-selected='true']")?.getAttribute("href")).toBe("https://example.com/multi");
  });

  it("disables desktop keyboard navigation after resizing to mobile", () => {
    setViewportWidth(1024);
    render({ quotaPercent: 65, totalQuota: 20, isBYOK: false, onDismiss: vi.fn() });
    const desktop = container.querySelector(".upgrade-desktop") as HTMLDivElement | null;

    const getSelectedHref = () => container.querySelector(".upgrade-desktop a[data-selected='true']")?.getAttribute("href");

    act(() => {
      setViewportWidth(375);
    });
    act(() => {
      desktop?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    });

    expect(getSelectedHref()).toBe("https://example.com/single");
  });

  it("moves focus off the desktop overlay when resizing to mobile", () => {
    setViewportWidth(1024);
    render({ quotaPercent: 65, totalQuota: 20, isBYOK: false, onDismiss: vi.fn() });
    const singleLink = container.querySelector(".upgrade-desktop a[href]") as HTMLAnchorElement | null;

    expect(document.activeElement).toBe(singleLink);

    act(() => {
      setViewportWidth(375);
    });

    expect(document.activeElement).not.toBe(singleLink);
    expect(container.querySelector(".upgrade-desktop")?.contains(document.activeElement)).toBe(false);
  });

  it("enables desktop keyboard navigation after resizing from mobile to desktop", () => {
    setViewportWidth(375);
    render({ quotaPercent: 65, totalQuota: 20, isBYOK: false, onDismiss: vi.fn() });
    const desktop = container.querySelector(".upgrade-desktop") as HTMLDivElement | null;

    const getSelectedHref = () => container.querySelector(".upgrade-desktop a[data-selected='true']")?.getAttribute("href");

    act(() => {
      desktop?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    });
    expect(getSelectedHref()).toBe("https://example.com/single");

    act(() => {
      setViewportWidth(1024);
    });
    act(() => {
      desktop?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    });

    expect(getSelectedHref()).toBe("https://example.com/multi");
  });
});

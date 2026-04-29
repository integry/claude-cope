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

function render(props: { isUpgraded?: boolean; quotaPercent: number; onDismiss: () => void }) {
  // isUpgraded was removed from UpgradeOverlay props — strip it before passing
  const { isUpgraded: _, ...rest } = props;
  container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(createElement(UpgradeOverlay, rest));
  });
  return container;
}

function cleanup() {
  if (container) {
    document.body.removeChild(container);
  }
}

describe("UpgradeOverlay", () => {
  afterEach(cleanup);

  it("renders both desktop and mobile layout containers in the DOM", () => {
    render({ isUpgraded: false, quotaPercent: 65, onDismiss: vi.fn() });
    const desktop = container.querySelector(".upgrade-desktop");
    const mobile = container.querySelector(".upgrade-mobile");
    expect(desktop).not.toBeNull();
    expect(mobile).not.toBeNull();
  });

  it("renders the WALLET EXTRACTION UTILITY title in both layouts", () => {
    render({ isUpgraded: false, quotaPercent: 65, onDismiss: vi.fn() });
    const text = container.textContent ?? "";
    // Desktop uses spaced-out title, mobile uses compact title
    expect(text).toContain("W A L L E T   E X T R A C T I O N   U T I L I T Y");
    expect(text).toContain("WALLET EXTRACTION UTILITY");
  });

  it("renders both purchase options with prices", () => {
    render({ isUpgraded: false, quotaPercent: 65, onDismiss: vi.fn() });
    const text = container.textContent ?? "";
    expect(text).toContain("AUTHORIZE EXTRACTION - $4.99");
    expect(text).toContain("EXTRACT TEAM FUNDS - $19.99");
  });

  it("renders checkout links for both options", () => {
    render({ isUpgraded: false, quotaPercent: 65, onDismiss: vi.fn() });
    const links = container.querySelectorAll("a[href]");
    const hrefs = Array.from(links).map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("https://example.com/single");
    expect(hrefs).toContain("https://example.com/multi");
  });

  it("renders the close [x] button in both layouts", () => {
    render({ isUpgraded: false, quotaPercent: 65, onDismiss: vi.fn() });
    const text = container.textContent ?? "";
    // Both layouts render [x]
    const matches = text.match(/\[x\]/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThanOrEqual(2);
  });

  it("does NOT call onDismiss when the backdrop is clicked (ESC-only)", () => {
    const onDismiss = vi.fn();
    render({ isUpgraded: false, quotaPercent: 65, onDismiss });
    // Click the desktop backdrop — should NOT dismiss (ESC-only per spec)
    const desktop = container.querySelector(".upgrade-desktop");
    act(() => {
      desktop?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("renders the ESC / close footer in both layouts", () => {
    render({ isUpgraded: false, quotaPercent: 65, onDismiss: vi.fn() });
    const text = container.textContent ?? "";
    expect(text).toContain("Press ESC to retain your net worth");
    expect(text).toContain("Tap to retain your net worth");
  });

  it("desktop layout uses overflow-x auto, not hidden", () => {
    render({ isUpgraded: false, quotaPercent: 65, onDismiss: vi.fn() });
    const pre = container.querySelector(".upgrade-desktop pre");
    expect(pre).not.toBeNull();
    expect((pre as HTMLElement).style.overflowX).toBe("auto");
  });
});

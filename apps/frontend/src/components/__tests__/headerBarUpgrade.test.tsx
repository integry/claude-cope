// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";

/**
 * Regression tests for the Max upgrade entry points in the HeaderBar.
 *
 * These verify:
 *  - Free users see the "Upgrade to Max" CTA button.
 *  - Max (upgraded) users see the "Max" badge and do NOT see the CTA.
 *  - BYOK users do NOT see the upgrade CTA.
 */

// Stub the animated counter hook so it returns the raw value synchronously.
vi.mock("../../hooks/useAnimatedCounter", () => ({
  useAnimatedCounter: (val: number) => val,
}));

import HeaderBar from "../HeaderBar";

const baseProps = {
  rank: "Junior Code Monkey",
  currentTD: 500,
  quotaPercent: 80,
  outageHp: null,
  activeMultiplier: 1,
  username: "TestUser",
  onProfileClick: vi.fn(),
  onHelpClick: vi.fn(),
  onAboutClick: vi.fn(),
  onSlashMenuClick: vi.fn(),
  onUpgradeClick: vi.fn(),
};

let container: HTMLDivElement;

function renderHeaderBar(props: Record<string, unknown>) {
  container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(createElement(HeaderBar, props as any));
  });
  return container;
}

afterEach(() => {
  if (container) {
    document.body.removeChild(container);
  }
});

describe("HeaderBar upgrade CTA visibility", () => {
  it("shows the upgrade button for free users (not Max, not BYOK)", () => {
    renderHeaderBar({ ...baseProps, isBYOK: false, isMax: false });
    expect(container.textContent).toContain("Upgrade to Max");
  });

  it("does NOT show the upgrade button for Max users", () => {
    renderHeaderBar({ ...baseProps, isBYOK: false, isMax: true });
    expect(container.textContent).not.toContain("Upgrade to Max");
  });

  it("does NOT show the upgrade button for BYOK users", () => {
    renderHeaderBar({ ...baseProps, isBYOK: true, isMax: false });
    expect(container.textContent).not.toContain("Upgrade to Max");
  });

  it("does NOT show the upgrade button when onUpgradeClick is not provided", () => {
    const { onUpgradeClick: _, ...propsWithoutUpgrade } = baseProps;
    renderHeaderBar({ ...propsWithoutUpgrade, isBYOK: false, isMax: false });
    expect(container.textContent).not.toContain("Upgrade to Max");
  });
});

describe("HeaderBar Max badge visibility", () => {
  it("shows the Max badge for upgraded users", () => {
    renderHeaderBar({ ...baseProps, isBYOK: false, isMax: true });
    expect(container.textContent).toContain("Max");
  });

  it("does NOT show the Max badge for free users", () => {
    renderHeaderBar({ ...baseProps, isBYOK: false, isMax: false });
    // "Max" appears in the upgrade CTA text "Upgrade to Max 429X" but not as a standalone badge
    const badges = container.querySelectorAll("[class*='purple']");
    expect(badges.length).toBe(0);
  });
});

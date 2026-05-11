// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import React, { createElement } from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";

/**
 * Regression tests for the Max upgrade entry points in the HeaderBar.
 *
 * These verify:
 *  - Free users see the "Upgrade to Max" CTA button.
 *  - Max (upgraded) users see the desktop "Max" badge and do NOT see the CTA.
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
    root.render(createElement(HeaderBar, props as unknown as React.ComponentProps<typeof HeaderBar>));
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

  it("renders the desktop identity and status as stacked lines", () => {
    renderHeaderBar({ ...baseProps, isBYOK: true, isMax: false, byokTotalCost: 1.25 });

    const identityBlock = container.querySelector("[data-testid='desktop-identity-block']");
    const identityLine = identityBlock?.firstElementChild;
    const rankLine = container.querySelector("[data-testid='desktop-rank-line']");
    const statusBlock = container.querySelector("[data-testid='desktop-status-block']");
    const technicalDebtLine = container.querySelector("[data-testid='desktop-technical-debt-line']");
    const detailLine = container.querySelector("[data-testid='desktop-status-detail-line']");
    const mobileIdentityBlock = container.querySelector("[data-testid='mobile-identity-block']");
    const mobileStatusBlock = container.querySelector("[data-testid='mobile-status-block']");

    expect(identityBlock).not.toBeNull();
    expect(identityBlock?.className).toContain("hidden");
    expect(identityBlock?.className).toContain("sm:flex");
    expect(identityLine?.textContent).toContain("TestUser");
    expect(identityLine?.textContent).toContain("BYOK");
    expect(identityLine?.textContent).not.toContain("Junior Code Monkey");

    expect(rankLine?.textContent).toContain("Junior Code Monkey");
    expect(statusBlock).not.toBeNull();
    expect(statusBlock?.className).toContain("hidden");
    expect(statusBlock?.className).toContain("sm:flex");
    expect(technicalDebtLine?.textContent).toContain("Technical Debt:");
    expect(detailLine?.textContent).toContain("External Billing Active:");
    expect(detailLine?.textContent).toContain("$1.25");
    expect(mobileIdentityBlock?.className).toContain("sm:hidden");
    expect(mobileStatusBlock?.className).toContain("sm:hidden");
  });

  it("renders the desktop quota and upgrade CTA on the second status line for free users", () => {
    renderHeaderBar({ ...baseProps, isBYOK: false, isMax: false });

    const quotaLine = container.querySelector("[data-testid='desktop-status-detail-line']");
    expect(quotaLine).not.toBeNull();
    expect(quotaLine?.textContent).toContain("API Quota:");
    expect(quotaLine?.textContent).toContain("Upgrade to Max 429X");
  });
});

describe("HeaderBar Max badge visibility", () => {
  it("shows the Max badge for upgraded users", () => {
    renderHeaderBar({ ...baseProps, isBYOK: false, isMax: true });
    expect(container.querySelector("[data-testid='desktop-max-badge']")?.textContent).toContain("MAX 429X");
  });

  it("does NOT show the Max badge for free users", () => {
    renderHeaderBar({ ...baseProps, isBYOK: false, isMax: false });
    // "Max" appears in the upgrade CTA text but the standalone badge should not render
    const badge = container.querySelector("[data-testid='desktop-max-badge']");
    expect(badge).toBeNull();
  });

  it("keeps the Max badge on the first desktop identity line only for upgraded users", () => {
    renderHeaderBar({ ...baseProps, isBYOK: false, isMax: true });

    const identityBlock = container.querySelector("[data-testid='desktop-identity-block']");
    const rankLine = container.querySelector("[data-testid='desktop-rank-line']");
    const badge = container.querySelector("[data-testid='desktop-max-badge']");
    const mobileBadge = container.querySelector("[data-testid='mobile-max-badge']");

    expect(badge).not.toBeNull();
    expect(identityBlock?.textContent).toContain("MAX 429X");
    expect(rankLine?.textContent).not.toContain("MAX 429X");
    expect(mobileBadge).not.toBeNull();
  });
});

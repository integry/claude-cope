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
  onStoreClick: vi.fn(),
  onLeaderboardClick: vi.fn(),
  onAchievementsClick: vi.fn(),
  onContactClick: vi.fn(),
  onSlashMenuClick: vi.fn(),
  onUpgradeClick: vi.fn(),
  onHomeClick: vi.fn(),
};

let container: HTMLDivElement;
const mobileMenuTexts = [
  "[ ACTIONS ]",
  "[ SYSTEM ]",
  "/store",
  "Buy coping mechanisms",
  "/upgrade",
  "Unlock MAX 429X",
  "/leaderboard",
  "/achievements",
  "/profile",
  "/help",
  "/github",
  "/terms",
  "/privacy",
  "/about",
  "/contact",
  "made with propr.dev",
];
const mobileMenuStatTexts = ["Technical Debt:", "3,880 TD", "API Quota:"];

function renderHeaderBar(props: Record<string, unknown>) {
  container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(createElement(HeaderBar, props as unknown as React.ComponentProps<typeof HeaderBar>));
  });
  return container;
}

function queryByTestId(testId: string) {
  return container.querySelector(`[data-testid='${testId}']`);
}

function clickElement(element: HTMLButtonElement | null | undefined) {
  act(() => {
    element?.click();
  });
}

function mouseDownElement(element: Element | null | undefined) {
  act(() => {
    element?.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
  });
}

function getMobileHomeButton() {
  return (queryByTestId("mobile-header-logo-expanded") ??
    queryByTestId("mobile-header-logo")) as HTMLButtonElement | null;
}

function expectMobileMenuHasText(menuPanel: Element | null, texts: readonly string[]) {
  expect(menuPanel).not.toBeNull();
  for (const text of texts) {
    expect(menuPanel?.textContent).toContain(text);
  }
}

function expectMobileMenuFooter(menuPanel: Element | null) {
  const footerParagraphs = Array.from(menuPanel?.querySelectorAll("p") ?? []);
  expect(footerParagraphs.some((paragraph) => paragraph.textContent === "© 2026 Unchained Development OÜ")).toBe(true);
  expect(footerParagraphs.some((paragraph) => paragraph.textContent === "git blame --author=\"Rinalds Uzkalns\"")).toBe(true);
  expect(menuPanel?.textContent).not.toContain("[BLAME]");
  expect(menuPanel?.textContent).not.toContain("&&");
}

function expectMobileMenuStatBox(statBox: Element | null) {
  expect(statBox?.className).not.toContain("border");
  for (const text of mobileMenuStatTexts) {
    expect(statBox?.textContent).toContain(text);
  }
}

function expectMobileMenuLinkStyles(menuPanel: Element | null) {
  const proprLink = menuPanel?.querySelector("a[href='https://propr.dev']") as HTMLAnchorElement | null;
  expect(proprLink).not.toBeNull();
  expect(proprLink?.textContent).toBe("propr.dev");
  expect(proprLink?.className).toContain("text-gray-400");

  const githubLink = menuPanel?.querySelector("a[href='https://github.com/integry/claude-cope']") as HTMLAnchorElement | null;
  expect(githubLink?.className).toContain("grid-cols-[120px_minmax(0,1fr)]");
  expect(githubLink?.textContent).toContain("Source code");
}

function expectMobileMenuSectionSpacing(menuPanel: Element | null) {
  const actionsHeading = Array.from(menuPanel?.querySelectorAll("div") ?? []).find((element) => element.textContent === "[ ACTIONS ]");
  const systemHeading = Array.from(menuPanel?.querySelectorAll("div") ?? []).find((element) => element.textContent === "[ SYSTEM ]");
  const statusDivider = statBoxParent(menuPanel);
  expect(statusDivider?.className).toContain("border-b");
  expect(actionsHeading?.className).toContain("mb-3");
  expect(systemHeading?.className).toContain("mb-3");
}

function statBoxParent(menuPanel: Element | null) {
  return queryByTestId("mobile-menu-stat-box")?.parentElement ?? menuPanel?.firstElementChild?.firstElementChild ?? null;
}

function expectMobileMenuEntryLayout(menuPanel: Element | null) {
  const storeButton = Array.from(menuPanel?.querySelectorAll("button") ?? []).find((element) => element.textContent?.includes("/store") && element.textContent?.includes("Buy coping mechanisms"));
  expect(storeButton?.className).toContain("grid-cols-[120px_minmax(0,1fr)]");
  expect(storeButton?.className).not.toContain("flex");
}

function expectMobileMenuContents(menuPanel: Element | null, statBox: Element | null) {
  expectMobileMenuHasText(menuPanel, mobileMenuTexts);
  expectMobileMenuFooter(menuPanel);
  expectMobileMenuStatBox(statBox);
  expectMobileMenuLinkStyles(menuPanel);
  expectMobileMenuSectionSpacing(menuPanel);
  expectMobileMenuEntryLayout(menuPanel);
}

function expectMobileMenuUpgradeVisibility(visible: boolean) {
  const menuPanel = queryByTestId("mobile-menu-panel");
  if (visible) {
    expect(menuPanel?.textContent).toContain("/upgrade");
    expect(menuPanel?.textContent).toContain("Unlock MAX 429X");
    return;
  }
  expect(menuPanel?.textContent).not.toContain("/upgrade");
  expect(menuPanel?.textContent).not.toContain("Unlock MAX 429X");
}

function expectDesktopStackedIdentityAndStatus() {
  const identityBlock = queryByTestId("desktop-identity-block");
  const identityLine = identityBlock?.firstElementChild;
  const rankLine = queryByTestId("desktop-rank-line");
  const statusBlock = queryByTestId("desktop-status-block");
  const technicalDebtLine = queryByTestId("desktop-technical-debt-line");
  const detailLine = queryByTestId("desktop-status-detail-line");
  const mobileIdentityBlock = queryByTestId("mobile-identity-block");
  const mobileRankLine = queryByTestId("mobile-rank-line");
  const mobileStatusBlock = queryByTestId("mobile-status-block");

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
  expect(mobileIdentityBlock).not.toBeNull();
  expect(mobileIdentityBlock?.className).toContain("sm:hidden");
  expect(mobileRankLine).not.toBeNull();
  expect(mobileRankLine?.className).toContain("sm:hidden");
  expect(mobileStatusBlock).not.toBeNull();
  expect(mobileStatusBlock?.className).toContain("sm:hidden");
}

function expectMobileIdentityLayout() {
  const mobileLogo = queryByTestId("mobile-header-logo");
  const mobileLogoImage = mobileLogo?.querySelector("img");
  const mobileIdentityBlock = queryByTestId("mobile-identity-block");
  const mobileRankLine = queryByTestId("mobile-rank-line");
  const mobileStatusBlock = queryByTestId("mobile-status-block");

  expect(mobileLogo?.tagName).toBe("BUTTON");
  expect(mobileLogoImage?.getAttribute("src")).toBe("/media/logo-400-transparent.png");
  expect(mobileIdentityBlock?.textContent).toContain("TestUser");
  expect(mobileRankLine?.textContent).toContain("[Jr. Code Monkey]");
  expect(mobileRankLine?.className).toContain("whitespace-nowrap");
  expect(mobileStatusBlock?.textContent).toContain("3,880 TD");
  expect(mobileStatusBlock?.textContent).not.toContain("Debt:");
}

function mockMenuButtonRect(rect: Partial<DOMRect>) {
  const menuButton = container.querySelector("button[aria-label='Menu']") as HTMLButtonElement | null;
  expect(menuButton).not.toBeNull();
  const defaultRect = {
    x: 0,
    y: 0,
    width: 44,
    height: 32,
    top: 12,
    left: 320,
    right: 364,
    bottom: 44,
    toJSON: () => ({}),
  } satisfies Partial<DOMRect>;
  vi.spyOn(menuButton!, "getBoundingClientRect").mockReturnValue({
    ...defaultRect,
    ...rect,
  } as DOMRect);
}

function openMobileMenu() {
  const menuButton = container.querySelector("button[aria-label='Menu']") as HTMLButtonElement | null;
  expect(menuButton).not.toBeNull();
  clickElement(menuButton);
  return menuButton;
}

function mockHeaderRootRect(rect: Partial<DOMRect>) {
  const headerRoot = queryByTestId("header-bar-root") as HTMLDivElement | null;
  expect(headerRoot).not.toBeNull();
  const defaultRect = {
    x: 0,
    y: 0,
    width: 375,
    height: 56,
    top: 0,
    left: 0,
    right: 375,
    bottom: 56,
    toJSON: () => ({}),
  } satisfies Partial<DOMRect>;
  vi.spyOn(headerRoot!, "getBoundingClientRect").mockReturnValue({
    ...defaultRect,
    ...rect,
  } as DOMRect);
}

function expectMaxBadgePlacement() {
  const identityBlock = queryByTestId("desktop-identity-block");
  const rankLine = queryByTestId("desktop-rank-line");
  const badge = queryByTestId("desktop-max-badge");
  const mobileBadge = queryByTestId("mobile-max-badge");

  expect(badge).not.toBeNull();
  expect(identityBlock?.textContent).toContain("MAX 429X");
  expect(rankLine?.textContent).not.toContain("MAX 429X");
  expect(mobileBadge).not.toBeNull();
  expect(mobileBadge?.textContent).toContain("MAX");
  expect(mobileBadge?.textContent).not.toContain("429X");
}

afterEach(() => {
  vi.restoreAllMocks();
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
    expectDesktopStackedIdentityAndStatus();
  });

  it("renders the mobile identity as a two-row layout with a home logo and abbreviated rank", () => {
    renderHeaderBar({ ...baseProps, currentTD: 3880, isBYOK: false, isMax: false });
    expectMobileIdentityLayout();
  });

  it("closes the mobile menu and invokes the shared home handler when the logo is clicked", () => {
    const onHomeClick = vi.fn();
    renderHeaderBar({ ...baseProps, isBYOK: false, isMax: false, onHomeClick });

    openMobileMenu();
    expect(queryByTestId("mobile-menu-panel")).not.toBeNull();

    const mobileLogo = getMobileHomeButton();
    clickElement(mobileLogo);

    expect(onHomeClick).toHaveBeenCalledTimes(1);
    expect(queryByTestId("mobile-menu-panel")).toBeNull();
  });

  it("blurs the active element when the mobile menu opens", () => {
    renderHeaderBar({ ...baseProps, isBYOK: false, isMax: false });

    const promptInput = document.createElement("input");
    document.body.appendChild(promptInput);
    promptInput.focus();
    expect(document.activeElement).toBe(promptInput);

    openMobileMenu();

    expect(document.activeElement).not.toBe(promptInput);
    document.body.removeChild(promptInput);
  });

  it("replaces the mobile header contents with the full logo while the menu is open", () => {
    renderHeaderBar({ ...baseProps, currentTD: 3880, isBYOK: false, isMax: false });

    openMobileMenu();

    const expandedLogo = queryByTestId("mobile-header-logo-expanded");
    const headerRoot = queryByTestId("header-bar-root");
    expect(expandedLogo?.tagName).toBe("BUTTON");
    expect(expandedLogo?.querySelector("img")?.getAttribute("src")).toBe("/media/logo-400-transparent.png");
    expect(expandedLogo?.className).not.toContain("absolute");
    expect(expandedLogo?.className).toContain("col-end-3");
    expect(expandedLogo?.className).toContain("row-span-2");
    expect(headerRoot?.className).toContain("grid-rows-[auto_auto]");
    expect(headerRoot?.className).not.toContain("h-[56px]");
    expect(queryByTestId("mobile-identity-block")).toBeNull();
    expect(queryByTestId("mobile-rank-line")).toBeNull();
    expect(queryByTestId("mobile-status-block")).toBeNull();
  });

  it("invokes the shared home handler from the desktop logo button", () => {
    const onHomeClick = vi.fn();
    renderHeaderBar({ ...baseProps, isBYOK: false, isMax: false, onHomeClick });

    const desktopLogo = Array.from(container.querySelectorAll("button[aria-label='Home']"))
      .find((button) => button.className.includes("sm:block")) as HTMLButtonElement | undefined;
    act(() => {
      desktopLogo?.click();
    });

    expect(onHomeClick).toHaveBeenCalledTimes(1);
  });

  it("renders the desktop quota and upgrade CTA on the second status line for free users", () => {
    renderHeaderBar({ ...baseProps, isBYOK: false, isMax: false });

    const quotaLine = container.querySelector("[data-testid='desktop-status-detail-line']");
    expect(quotaLine).not.toBeNull();
    expect(quotaLine?.textContent).toContain("API Quota:");
    expect(quotaLine?.textContent).toContain("Upgrade to Max 429X");
  });

  it("renders the mobile menu with a single-divider stats header plus action, system, and footer sections", () => {
    renderHeaderBar({ ...baseProps, currentTD: 3880, isBYOK: false, isMax: false });
    mockMenuButtonRect({ bottom: 52 });

    const menuButton = container.querySelector("button[aria-label='Menu']") as HTMLButtonElement | null;
    expect(menuButton?.className).toContain("rounded-none");
    clickElement(menuButton);

    const menuPanel = queryByTestId("mobile-menu-panel");
    const statBox = queryByTestId("mobile-menu-stat-box");

    expectMobileMenuContents(menuPanel, statBox);
  });

  it("hides the mobile /upgrade action for Max users", () => {
    renderHeaderBar({ ...baseProps, currentTD: 3880, isBYOK: false, isMax: true });

    openMobileMenu();

    expectMobileMenuUpgradeVisibility(false);
  });

  it("hides the mobile /upgrade action when no upgrade handler is available", () => {
    const { onUpgradeClick: _unused, ...propsWithoutUpgrade } = baseProps;
    renderHeaderBar({ ...propsWithoutUpgrade, currentTD: 3880, isBYOK: false, isMax: false });

    openMobileMenu();

    expectMobileMenuUpgradeVisibility(false);
  });

  it("keeps menu item taps actionable after the outside-click guard runs on mousedown", () => {
    const onStoreClick = vi.fn();
    renderHeaderBar({ ...baseProps, currentTD: 3880, isBYOK: false, isMax: false, onStoreClick });

    openMobileMenu();

    const menuPanel = queryByTestId("mobile-menu-panel");
    const storeButton = Array.from(menuPanel?.querySelectorAll("button") ?? []).find((element) => element.textContent?.includes("/store") && element.textContent?.includes("Buy coping mechanisms")) as HTMLButtonElement | undefined;
    expect(storeButton).not.toBeUndefined();

    mouseDownElement(storeButton);
    clickElement(storeButton);

    expect(onStoreClick).toHaveBeenCalledTimes(1);
    expect(queryByTestId("mobile-menu-panel")).toBeNull();
  });

  it("anchors the mobile menu to the viewport using the trigger geometry instead of the trigger wrapper", () => {
    const originalInnerHeight = window.innerHeight;
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 900 });
    renderHeaderBar({ ...baseProps, currentTD: 3880, isBYOK: false, isMax: false });
    mockMenuButtonRect({ bottom: 64 });

    openMobileMenu();

    const menuPanel = queryByTestId("mobile-menu-panel") as HTMLDivElement | null;
    const menuAnchor = queryByTestId("mobile-menu-anchor");
    const headerRoot = queryByTestId("header-bar-root");

    expect(menuPanel).not.toBeNull();
    expect(menuPanel?.className).toContain("fixed");
    expect(menuAnchor?.contains(menuPanel)).toBe(false);
    expect(headerRoot?.contains(menuPanel)).toBe(true);
    expect(menuPanel?.style.top).toBe("72px");
    expect(menuPanel?.style.maxHeight).toBe("820px");

    Object.defineProperty(window, "innerHeight", { configurable: true, value: originalInnerHeight });
  });

  it("keeps the mobile menu panel below the header when the header extends lower than the trigger", () => {
    const originalInnerHeight = window.innerHeight;
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 900 });
    renderHeaderBar({ ...baseProps, currentTD: 3880, isBYOK: false, isMax: false });
    mockMenuButtonRect({ bottom: 64 });
    mockHeaderRootRect({ bottom: 88 });

    openMobileMenu();

    const menuPanel = queryByTestId("mobile-menu-panel") as HTMLDivElement | null;
    expect(menuPanel?.style.top).toBe("96px");
    expect(menuPanel?.style.maxHeight).toBe("796px");

    Object.defineProperty(window, "innerHeight", { configurable: true, value: originalInnerHeight });
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
    expectMaxBadgePlacement();
  });
});

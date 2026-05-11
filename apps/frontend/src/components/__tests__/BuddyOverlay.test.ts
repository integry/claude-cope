// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";

import { BuddyOverlay } from "../BuddyOverlay";
import {
  clampBuddyScale,
  getBuddyOverlayScale,
} from "../buddyOverlayScale";

describe("BuddyOverlay scale helpers", () => {
  it("caps scale at full size and hides values below the visible threshold", () => {
    expect(clampBuddyScale(2)).toBe(1);
    expect(clampBuddyScale(0.5)).toBe(0.5);
    expect(clampBuddyScale(0.35)).toBe(0.35);
    expect(clampBuddyScale(0.1)).toBe(0);
  });

  it("returns full scale when overlay dimensions are zero", () => {
    expect(
      getBuddyOverlayScale({
        containerWidth: 320,
        containerHeight: 240,
        rightInset: 0,
        bottomOffset: 0,
        overlayWidth: 0,
        overlayHeight: 120,
      }),
    ).toBe(1);

    expect(
      getBuddyOverlayScale({
        containerWidth: 320,
        containerHeight: 240,
        rightInset: 0,
        bottomOffset: 0,
        overlayWidth: 120,
        overlayHeight: 0,
      }),
    ).toBe(1);
  });

  it("keeps full scale at exact fit boundaries", () => {
    expect(
      getBuddyOverlayScale({
        containerWidth: 212,
        containerHeight: 132,
        rightInset: 0,
        bottomOffset: 0,
        overlayWidth: 200,
        overlayHeight: 120,
      }),
    ).toBe(1);
  });

  it("uses the tighter constrained axis and hides the overlay below the threshold", () => {
    expect(
      getBuddyOverlayScale({
        containerWidth: 240,
        containerHeight: 600,
        rightInset: 8,
        bottomOffset: 0,
        overlayWidth: 440,
        overlayHeight: 120,
      }),
    ).toBe(0.5);

    expect(
      getBuddyOverlayScale({
        containerWidth: 640,
        containerHeight: 200,
        rightInset: 12,
        bottomOffset: 96,
        overlayWidth: 200,
        overlayHeight: 220,
      }),
    ).toBeCloseTo(0.4181818182);

    expect(
      getBuddyOverlayScale({
        containerWidth: 640,
        containerHeight: 140,
        rightInset: 12,
        bottomOffset: 96,
        overlayWidth: 200,
        overlayHeight: 220,
      }),
    ).toBe(0);
  });

  it("does not depend on a reserved right-side chrome gap", () => {
    expect(
      getBuddyOverlayScale({
        containerWidth: 900,
        containerHeight: 600,
        rightInset: 12,
        bottomOffset: 96,
        overlayWidth: 200,
        overlayHeight: 220,
      }),
    ).toBe(1);
  });
});

describe("BuddyOverlay rendering", () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
    root = null;
    container = null;
  });

  it("renders nothing when no buddy exists", () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    act(() => {
      root!.render(createElement(BuddyOverlay, {
        buddy: { type: null, isShiny: false, promptsSinceLastInterjection: 0 },
        containerRef: { current: null },
        bottomChromeRef: { current: null },
      }));
    });

    expect(container.querySelector(".terminal-buddy-overlay")).toBeNull();
  });

  it("renders the docked buddy art when a buddy exists", () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    act(() => {
      root!.render(createElement(BuddyOverlay, {
        buddy: { type: "Agile Snail", isShiny: false, promptsSinceLastInterjection: 0 },
        containerRef: { current: null },
        bottomChromeRef: { current: null },
      }));
    });

    const overlay = container.querySelector(".terminal-buddy-overlay") as HTMLDivElement;
    expect(overlay).not.toBeNull();
    expect(overlay.querySelector(".terminal-buddy-display")).not.toBeNull();
  });
});

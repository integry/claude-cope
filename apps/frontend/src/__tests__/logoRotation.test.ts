import { describe, expect, it } from "vitest";
import {
  SPLASH_VARIANTS,
  WORDMARK_VARIANTS,
  selectSplashVariant,
  selectWordmarkForSplash,
  selectWordmarkVariant,
} from "../logoRotation";

describe("logo rotation", () => {
  it("includes all submitted artworks in the splash pool exactly once", () => {
    expect(SPLASH_VARIANTS).toHaveLength(30);
    expect(new Set(SPLASH_VARIANTS.map(({ id }) => id)).size).toBe(30);
  });

  it("includes only the approved crops in the wordmark pool", () => {
    expect(WORDMARK_VARIANTS).toHaveLength(21);
    expect(new Set(WORDMARK_VARIANTS.map(({ id }) => id)).size).toBe(21);
    expect(WORDMARK_VARIANTS.every(({ id }) => SPLASH_VARIANTS.some((splash) => splash.id === id))).toBe(true);
  });

  it("points both splash sizes at the selected artwork", () => {
    const variant = selectSplashVariant(() => 0.5);
    expect(variant.splashMobile).toContain(variant.id);
    expect(variant.splashDesktop).toContain(variant.id);
  });

  it("can select the first and last entry from each pool", () => {
    expect(selectSplashVariant(() => 0)).toBe(SPLASH_VARIANTS[0]);
    expect(selectSplashVariant(() => 0.999999)).toBe(SPLASH_VARIANTS[SPLASH_VARIANTS.length - 1]);
    expect(selectWordmarkVariant(() => 0)).toBe(WORDMARK_VARIANTS[0]);
    expect(selectWordmarkVariant(() => 0.999999)).toBe(WORDMARK_VARIANTS[WORDMARK_VARIANTS.length - 1]);
  });

  it("pairs an approved wordmark with its splash and falls back safely otherwise", () => {
    expect(selectWordmarkForSplash(SPLASH_VARIANTS[0]!)).toBe(WORDMARK_VARIANTS[0]);

    const splashWithoutWordmark = SPLASH_VARIANTS.find(({ id }) => id === "8rh43q")!;
    expect(selectWordmarkForSplash(splashWithoutWordmark, () => 0.999999)).toBe(
      WORDMARK_VARIANTS[WORDMARK_VARIANTS.length - 1],
    );
  });
});

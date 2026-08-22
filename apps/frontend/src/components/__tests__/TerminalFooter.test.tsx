// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";

import { TerminalFooter } from "../TerminalFooter";

describe("TerminalFooter", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
  });

  function renderFooter(buddyType: string | null) {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    act(() => {
      root.render(
        <TerminalFooter
          closeAllOverlays={vi.fn()}
          buddyType={buddyType}
          buddyIsShiny={false}
          setShowTerms={vi.fn()}
          setShowPrivacy={vi.fn()}
          setShowAbout={vi.fn()}
          setShowHelp={vi.fn()}
          setShowContact={vi.fn()}
        />,
      );
    });
  }

  it("places the mobile buddy on the left with footer copy aligned to the right", () => {
    renderFooter("Agile Snail");

    const mobileFooter = container.querySelector("footer.sm\\:hidden");
    const mobileRow = mobileFooter?.firstElementChild as HTMLElement | null;
    const buddyAscii = mobileRow?.querySelector(".terminal-footer-mobile-buddy pre");
    const buddyStatus = mobileRow?.querySelector(".terminal-footer-mobile-status");
    const copyBlock = mobileRow?.querySelector(".terminal-footer-mobile-copy");

    expect(mobileRow?.className).toContain("terminal-footer-mobile-with-buddy");
    expect(buddyAscii?.textContent).toBeTruthy();
    expect(buddyStatus?.textContent).toContain("Agile Snail is watching...");
    expect(copyBlock?.textContent).toContain("Parody project, no Anthropic affiliation... yet.");
  });

  it("keeps the mobile footer as plain text when no buddy is present", () => {
    renderFooter(null);

    const mobileFooter = container.querySelector("footer.sm\\:hidden");
    const mobileRow = mobileFooter?.firstElementChild as HTMLElement | null;

    expect(mobileFooter?.className).toContain("text-gray-400/80");
    expect(mobileRow?.className).not.toContain("terminal-footer-mobile-with-buddy");
    expect(mobileRow?.textContent).toContain("Parody project, no Anthropic affiliation... yet.");
  });
});

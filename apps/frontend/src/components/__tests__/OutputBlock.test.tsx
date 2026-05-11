// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";

import OutputBlock from "../OutputBlock";
import { BUDDY_ICONS, formatBuddyInterjection } from "../buddyConstants";

describe("OutputBlock", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
  });

  it("renders trailing warning text after a buddy interjection block", () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    const buddyMessage = formatBuddyInterjection("Sarcastic Clippy", "Remember the migration.");
    const content = `${buddyMessage}\n\nThe deploy is still blocked on the failed migration.`;

    act(() => {
      root.render(
        <OutputBlock
          message={{ role: "warning", content, buddyType: "Sarcastic Clippy" }}
          promptString=">"
          username=""
        />,
      );
    });

    expect(container.textContent).toContain("[Sarcastic Clippy]");
    expect(container.textContent).toContain("Remember the migration.");
    expect(container.textContent).toContain("The deploy is still blocked on the failed migration.");
  });

  it("rerenders when buddy metadata arrives for persisted warning content", () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    const content = [
      "🐾   [Mystery Buddy]",
      "    Remember the migration.",
    ].join("\n");

    act(() => {
      root.render(
        <OutputBlock
          message={{ role: "warning", content }}
          promptString=">"
          username=""
        />,
      );
    });

    expect(container.firstElementChild?.className).not.toContain("font-mono");

    act(() => {
      root.render(
        <OutputBlock
          message={{ role: "warning", content, buddyType: "Mystery Buddy" }}
          promptString=">"
          username=""
        />,
      );
    });

    expect(container.firstElementChild?.className).toContain("font-mono");
    expect(container.textContent).toContain("[Mystery Buddy]");
    expect(container.textContent).toContain("Remember the migration.");
  });

  it("renders legacy stacked buddy warnings when only buddyType identifies them", () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    const legacyBlock = `${BUDDY_ICONS["Agile Snail"]}\n[Agile Snail] Remember the backlog.`;

    act(() => {
      root.render(
        <OutputBlock
          message={{ role: "warning", content: legacyBlock, buddyType: "Agile Snail" }}
          promptString=">"
          username=""
        />,
      );
    });

    expect(container.textContent).toContain("[Agile Snail]");
    expect(container.textContent).toContain("Remember the backlog.");
  });
});

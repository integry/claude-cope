// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";

import OutputBlock from "../OutputBlock";
import { formatBuddyInterjection } from "../buddyConstants";

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
});

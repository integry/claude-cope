// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";

import OutputBlock from "../OutputBlock";
import MessageList from "../MessageList";
import { BUDDY_ICONS, formatBuddyInterjection } from "../buddyConstants";
import type { Message } from "../../hooks/useGameState";

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
    expect(container.firstElementChild?.className).not.toContain("font-mono");
    expect(container.querySelector("pre")?.textContent).toContain("[Sarcastic Clippy]");
    expect(container.querySelector("p")?.textContent).toContain("The deploy is still blocked on the failed migration.");
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

    expect(container.querySelector("pre")?.className).toContain("font-mono");
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

  it("keeps the share button on a system reply even when a loading message sits between the user and the answer", () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    const history: Message[] = [
      { role: "user", content: "how do I enable beta mode?" },
      { role: "loading", content: "[⚙️] Thinking..." },
      { role: "system", content: "Edit `config/feature_flags.yaml` and set `beta_mode: true`." },
    ];

    act(() => {
      root.render(
        <MessageList
          history={history}
          messageKeys={[1, 2, 3]}
          initialHistoryLen={history.length}
          promptString="❯ "
          username="tester"
        />,
      );
    });

    expect(container.textContent).toContain("[share]");
  });
});

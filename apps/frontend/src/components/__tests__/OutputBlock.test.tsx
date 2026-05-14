// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
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
      { role: "system", content: "Edit `config/feature_flags.yaml` and set `beta_mode: true`.", shareClaim: "signed-claim-token" },
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

  it("strips orphan bold markers leaked by the model", () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    const content = "You asked for the next step? **\n\nYour latest ok ok left the sprint board with a blank stare. **";

    act(() => {
      root.render(
        <OutputBlock
          message={{ role: "system", content }}
          promptString=">"
          username=""
        />,
      );
    });

    expect(container.textContent).toContain("You asked for the next step?");
    expect(container.textContent).toContain("Your latest ok ok left the sprint board with a blank stare.");
    expect(container.textContent).not.toContain("**");
  });

  it("renders tip messages as terminal-style output with a prefixed comment line", () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    act(() => {
      root.render(
        <OutputBlock
          message={{ role: "system", content: "Tip: Use /help to inspect the command surface.", displayType: "tip" }}
          promptString=">"
          username=""
        />,
      );
    });

    const tipOutput = container.querySelector(".terminal-tip-output");
    expect(tipOutput).toBeTruthy();
    expect(tipOutput?.textContent).toBe("// Tip: Use /help to inspect the command surface.");
    expect(container.querySelector(".terminal-tip-prefix")?.textContent).toBe("// Tip:");
    expect(container.querySelector("p")).toBeNull();
  });

  it("renders terminal tips without slash-command handlers as plain text", () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    act(() => {
      root.render(
        <OutputBlock
          message={{ role: "system", content: "  // tip: Run /backlog before freeform debugging.", displayType: "tip" }}
          promptString=">"
          username=""
        />,
      );
    });

    expect(container.querySelector(".terminal-tip-output")?.textContent).toBe("// Tip: Run /backlog before freeform debugging.");
    expect(container.querySelectorAll("button")).toHaveLength(0);
  });

  it("renders legacy tip strings as terminal-style output even without display metadata", () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    act(() => {
      root.render(
        <OutputBlock
          message={{ role: "system", content: "Tip: Use /backlog before freeform debugging." }}
          promptString=">"
          username=""
        />,
      );
    });

    expect(container.querySelector(".terminal-tip-output")?.textContent).toBe("// Tip: Use /backlog before freeform debugging.");
    expect(container.querySelector("p")).toBeNull();
  });

  it("keeps slash commands clickable inside terminal tip output", () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    const onSlashCommand = vi.fn();

    act(() => {
      root.render(
        <OutputBlock
          message={{ role: "system", content: "Tip: Run /backlog and then /take <#>.", displayType: "tip" }}
          promptString=">"
          username=""
          onSlashCommand={onSlashCommand}
        />,
      );
    });

    const backlogButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "/backlog");
    expect(backlogButton).toBeTruthy();

    act(() => {
      backlogButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onSlashCommand).toHaveBeenCalledWith("/backlog", "prefill");
  });

});

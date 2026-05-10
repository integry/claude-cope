// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";

import OutputBlock from "../OutputBlock";
import type { Message } from "../../hooks/useGameState";

describe("OutputBlock backlog rendering", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  function renderMessage(message: Message, onSlashCommand = vi.fn()) {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    act(() => {
      root.render(
        <OutputBlock
          message={message}
          isNew={false}
          promptString="❯ "
          username="tester"
          onSlashCommand={onSlashCommand}
        />,
      );
    });

    return onSlashCommand;
  }

  afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
  });

  it("renders the responsive backlog component and keeps slash commands clickable", () => {
    const onSlashCommand = renderMessage({
      role: "system",
      content: "backlog fallback text",
      backlogDisplay: {
        kind: "community-backlog",
        title: "[ COMMUNITY BACKLOG ]",
        infoLine: "[INFO] Showing all tickets. Want specific trauma? Try: /backlog MELT",
        footer: ["Type /take 1 through /take 2 to claim a ticket.", "Run /upgrade to unlock premium suffering."],
        tickets: [
          { row: 1, fullId: "BLAME-421", shortId: "BLAME-42", title: "The RCA Template Needs a Rewrite", status: "OPEN", reward: "1440 TD", isLocked: false },
          { row: 2, fullId: "MAIL-1016", shortId: "MAIL-101", title: "🔒 [PREMIUM] Rewrite Domain Warmup", status: "PREMIUM", reward: "--", isLocked: true },
        ],
      },
    });

    expect(container.textContent).toContain("[ COMMUNITY BACKLOG ]");
    expect(container.textContent).toContain("BLAME-42");
    expect(container.textContent).toContain("1440 TD");
    expect(container.textContent).toContain("Rewrite Domain Warmup");

    const buttons = Array.from(container.querySelectorAll("button"));
    const backlogButton = buttons.find((button) => button.textContent === "/backlog");
    const upgradeButton = buttons.find((button) => button.textContent === "/upgrade");

    expect(backlogButton).toBeTruthy();
    expect(upgradeButton).toBeTruthy();

    act(() => {
      backlogButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      upgradeButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onSlashCommand).toHaveBeenCalledWith("/backlog", "execute");
    expect(onSlashCommand).toHaveBeenCalledWith("/upgrade", "execute");
  });

  it("re-renders when backlogDisplay changes even if fallback content stays the same", () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    const firstMessage: Message = {
      role: "system",
      content: "backlog fallback text",
      backlogDisplay: {
        kind: "community-backlog",
        title: "[ COMMUNITY BACKLOG ]",
        footer: ["Type /take 1 through /take 1 to claim a ticket."],
        tickets: [
          { row: 1, fullId: "BLAME-421", shortId: "BLAME-42", title: "First title", status: "OPEN", reward: "1440 TD", isLocked: false },
        ],
      },
    };

    const nextMessage: Message = {
      ...firstMessage,
      backlogDisplay: {
        ...firstMessage.backlogDisplay!,
        tickets: [
          { row: 1, fullId: "BLAME-421", shortId: "BLAME-42", title: "Updated title", status: "OPEN", reward: "1440 TD", isLocked: false },
        ],
      },
    };

    act(() => {
      root.render(
        <OutputBlock message={firstMessage} isNew={false} promptString="❯ " username="tester" />,
      );
    });
    expect(container.textContent).toContain("First title");

    act(() => {
      root.render(
        <OutputBlock message={nextMessage} isNew={false} promptString="❯ " username="tester" />,
      );
    });
    expect(container.textContent).toContain("Updated title");
    expect(container.textContent).not.toContain("First title");
  });
});

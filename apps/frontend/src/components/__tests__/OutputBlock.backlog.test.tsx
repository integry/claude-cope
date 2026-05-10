// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";

import OutputBlock from "../OutputBlock";
import type { Message } from "../../hooks/useGameState";
import { handleBacklogCommand } from "../ticketCommands";

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

  it("renders the responsive backlog component from real backlog copy and keeps slash commands clickable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ([
        {
          id: "BLAME-421",
          title: "BLAME The RCA Template Needs a Rewrite",
          description: "Regular ticket",
          technical_debt: 144,
          kickoff_prompt: "rewrite the template",
          category_prefix: "BLAME",
          tier: "free",
        },
        {
          id: "MAIL-1016",
          title: "MAIL Rewrite Domain Warmup",
          description: "Locked premium ticket",
          technical_debt: 99,
          kickoff_prompt: "never used",
          category_prefix: "MAIL",
          category_label: "Email Deliverability",
          is_locked: true,
          tier: "premium",
        },
      ]),
    }));

    const reply = vi.fn();
    await handleBacklogCommand(reply);

    const message = reply.mock.calls[0]?.[0] as Message;
    const onSlashCommand = renderMessage(message);

    expect(container.textContent).toContain("[ COMMUNITY BACKLOG ]");
    expect(container.textContent).toContain("BLAME-42");
    expect(container.textContent).toContain("1440 TD");
    expect(container.textContent).toContain("Rewrite Domain Warmup");

    const buttons = Array.from(container.querySelectorAll("button"));
    const backlogButton = buttons.find((button) => button.textContent === "/backlog");
    const upgradeButton = buttons.find((button) => button.textContent === "/upgrade");
    const ticketButton = buttons.find((button) => button.textContent === "BLAME-42");

    expect(backlogButton).toBeTruthy();
    expect(upgradeButton).toBeTruthy();
    expect(ticketButton).toBeTruthy();

    act(() => {
      ticketButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      backlogButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      upgradeButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onSlashCommand).toHaveBeenCalledWith("/take BLAME-421", "execute");
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

  it("renders the filtered header and omits the default info line when a category filter is active", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ([
        {
          id: "MELT-002",
          title: "MELT Unpick the Mainframe Ritual",
          description: "Premium category ticket",
          technical_debt: 55,
          kickoff_prompt: "touch the cobol",
          category_prefix: "MELT",
          category_label: "Mainframes / Legacy",
          tier: "premium",
        },
      ]),
    }));

    const reply = vi.fn();
    await handleBacklogCommand(reply, { category: "MELT", paidUser: true });

    const message = reply.mock.calls[0]?.[0] as Message;
    renderMessage(message);

    expect(container.textContent).toContain("[ FILTER ACTIVE: MELT (Mainframes / Legacy) ]");
    expect(container.textContent).not.toContain("Want specific trauma?");
  });

  it("renders the empty backlog fallback without mounting the structured backlog component", () => {
    const message: Message = {
      role: "system",
      content: "[📋 **BACKLOG**]\n\nThe backlog is empty.",
    };

    renderMessage(message);

    expect(container.textContent).toContain("The backlog is empty.");
    expect(container.textContent).not.toContain("[ COMMUNITY BACKLOG ]");
  });

  it("clicks locked ticket ids the same as open rows", () => {
    const onSlashCommand = renderMessage({
      role: "system",
      content: "fallback backlog copy",
      backlogDisplay: {
        kind: "community-backlog",
        title: "[ COMMUNITY BACKLOG ]",
        footer: ["Run `/upgrade` to unlock premium tickets."],
        tickets: [
          { row: 1, fullId: "PIXEL-77", shortId: "PIXEL-77", title: "Locked ticket", status: "PREMIUM", reward: "--", isLocked: true },
        ],
      },
    });

    const ticketButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "PIXEL-77");
    expect(ticketButton).toBeTruthy();

    act(() => {
      ticketButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onSlashCommand).toHaveBeenCalledWith("/take PIXEL-77", "execute");
  });
});

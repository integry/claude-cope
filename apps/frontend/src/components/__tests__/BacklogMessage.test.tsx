// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { BacklogMessage } from "../BacklogMessage";

describe("BacklogMessage", () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
    container = null;
    root = null;
    vi.restoreAllMocks();
  });

  it("executes /take when any part of the mobile row is clicked", () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    const onSlashCommand = vi.fn();

    act(() => {
      root!.render(
        <BacklogMessage
          backlog={{
            kind: "community-backlog",
            title: "[ COMMUNITY BACKLOG ]",
            footer: ["Type /take 1 through /take 1 to claim a ticket."],
            tickets: [
              {
                row: 1,
                fullId: "BLAME-421",
                shortId: "BLAME-421",
                title: "Tap anywhere on this row",
                status: "OPEN",
                reward: "1440 TD",
                isLocked: false,
              },
            ],
          }}
          onSlashCommand={onSlashCommand}
        />,
      );
    });

    const rowButton = container.querySelector('[aria-label="Select backlog item BLAME-421"]');

    expect(rowButton).toBeTruthy();
    expect(rowButton?.querySelector("button")).toBeNull();

    act(() => {
      rowButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onSlashCommand).toHaveBeenCalledWith("/take BLAME-421", "execute");
  });
});

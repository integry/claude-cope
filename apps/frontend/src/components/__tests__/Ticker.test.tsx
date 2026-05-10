// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";

import Ticker from "../Ticker";

vi.mock("../../hooks/useLiveTicker", () => ({
  useLiveTicker: () => [{ message: "Build broke in production" }],
}));

describe("Ticker", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  const renderTicker = (props: React.ComponentProps<typeof Ticker>) => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    act(() => {
      root.render(<Ticker {...props} />);
    });
  };

  afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
  });

  it("renders the full desktop command cluster", () => {
    renderTicker({ onlineCount: 7 });

    expect(container.textContent).toContain("Online:");
    expect(container.textContent).toContain("7");
    expect(container.textContent).toContain("[/who]");
    expect(container.textContent).toContain("Firehose [/party]");
    expect(container.textContent).toContain("Hall of Blame [/leaderboard]");
  });

  it("routes top-right clicks through slash commands without expanding the ticker", () => {
    const onExpand = vi.fn();
    const onSlashCommand = vi.fn();
    renderTicker({ onlineCount: 3, onExpand, onSlashCommand });

    const buttons = Array.from(container.querySelectorAll("button"));
    expect(buttons).toHaveLength(3);

    act(() => {
      buttons[0]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      buttons[1]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      buttons[2]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onSlashCommand).toHaveBeenNthCalledWith(1, "/who");
    expect(onSlashCommand).toHaveBeenNthCalledWith(2, "/party");
    expect(onSlashCommand).toHaveBeenNthCalledWith(3, "/leaderboard");
    expect(onExpand).not.toHaveBeenCalled();
  });

  it("keeps the live event area clickable for expand behavior", () => {
    const onExpand = vi.fn();
    renderTicker({ onlineCount: 2, onExpand });

    const banner = container.firstElementChild;
    expect(banner).not.toBeNull();

    act(() => {
      banner?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onExpand).toHaveBeenCalledTimes(1);
  });
});

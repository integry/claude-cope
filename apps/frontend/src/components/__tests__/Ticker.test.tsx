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

  const getButtonByText = (text: string) => Array.from(container.querySelectorAll("button"))
    .find((button) => button.textContent?.includes(text)) as HTMLButtonElement | undefined;
  const getBannerButton = () => getButtonByText("[LIVE]");
  const activateButtonWithKeyboard = (button: HTMLButtonElement | undefined, key: "Enter" | " ") => {
    if (!button) return;
    button.focus();
    const keydownAccepted = button.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
    button.dispatchEvent(new KeyboardEvent("keyup", { key, bubbles: true, cancelable: true }));
    // jsdom does not consistently perform the browser's default button activation.
    if (keydownAccepted) button.click();
  };

  it("renders the full desktop command cluster", () => {
    renderTicker({ onlineCount: 7, onSlashCommand: vi.fn() });

    expect(container.textContent).toContain("Online:");
    expect(container.textContent).toContain("7");
    expect(container.textContent).toContain("[/who]");
    expect(container.textContent).toContain("Firehose [/party]");
    expect(container.textContent).toContain("Hall of Blame [/leaderboard]");
    expect(Array.from(container.querySelectorAll("span[aria-hidden='true']")).map((span) => span.textContent)).toEqual([" | ", " | "]);
  });

  it("routes top-right clicks through slash commands without expanding the ticker", () => {
    const onExpand = vi.fn();
    const onSlashCommand = vi.fn();
    renderTicker({ onlineCount: 3, onExpand, onSlashCommand });

    const whoButton = getButtonByText("[/who]");
    const partyButton = getButtonByText("Firehose [/party]");
    const leaderboardButton = getButtonByText("Hall of Blame [/leaderboard]");

    expect(whoButton).toBeDefined();
    expect(partyButton).toBeDefined();
    expect(leaderboardButton).toBeDefined();

    act(() => {
      whoButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      partyButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      leaderboardButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onSlashCommand).toHaveBeenNthCalledWith(1, "/who");
    expect(onSlashCommand).toHaveBeenNthCalledWith(2, "/party");
    expect(onSlashCommand).toHaveBeenNthCalledWith(3, "/leaderboard");
    expect(onExpand).not.toHaveBeenCalled();
  });

  it("keeps the live event area clickable for expand behavior", () => {
    const onExpand = vi.fn();
    renderTicker({ onlineCount: 2, onExpand, onSlashCommand: vi.fn() });

    const banner = getBannerButton();
    expect(banner).not.toBeNull();

    act(() => {
      banner?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onExpand).toHaveBeenCalledTimes(1);
  });

  it("uses a native button for the live event banner", () => {
    renderTicker({ onlineCount: 2, onSlashCommand: vi.fn() });

    const banner = getBannerButton();
    expect(banner?.tagName).toBe("BUTTON");
  });

  it("supports keyboard activation for the slash-command buttons", () => {
    const onSlashCommand = vi.fn();
    renderTicker({ onlineCount: 5, onSlashCommand });

    act(() => {
      activateButtonWithKeyboard(getButtonByText("[/who]"), "Enter");
      activateButtonWithKeyboard(getButtonByText("Firehose [/party]"), " ");
    });

    expect(onSlashCommand).toHaveBeenNthCalledWith(1, "/who");
    expect(onSlashCommand).toHaveBeenNthCalledWith(2, "/party");
  });
});

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRoot } from "react-dom/client";
import { act } from "react";

// Mock shareChatUtils before importing the component
const mockShareChatImage = vi.fn();
const mockOpenShareIntent = vi.fn();
const mockGetChatCardBlob = vi.fn();

vi.mock("../shareChatUtils", () => ({
  shareChatImage: (...args: unknown[]) => mockShareChatImage(...args),
  openShareIntent: (...args: unknown[]) => mockOpenShareIntent(...args),
  getChatCardBlob: (...args: unknown[]) => mockGetChatCardBlob(...args),
}));

import { ShareButton } from "../ShareButton";

describe("ShareButton modal share flow", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  const mockBlob = new Blob(["test"], { type: "image/png" });

  // Mock URL.createObjectURL / revokeObjectURL
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  // Mock clipboard
  const mockClipboard = {
    write: vi.fn().mockResolvedValue(undefined),
    writeText: vi.fn().mockResolvedValue(undefined),
  };

  const MockClipboardItem = vi.fn().mockImplementation((items: Record<string, Blob>) => ({
    types: Object.keys(items),
    getType: (type: string) => Promise.resolve(items[type]),
  }));

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    URL.createObjectURL = vi.fn(() => "blob:test-url");
    URL.revokeObjectURL = vi.fn();

    Object.defineProperty(navigator, "clipboard", {
      value: mockClipboard,
      writable: true,
      configurable: true,
    });
    // @ts-expect-error - ClipboardItem may not exist in jsdom
    globalThis.ClipboardItem = MockClipboardItem;

    mockGetChatCardBlob.mockResolvedValue(mockBlob);
    mockShareChatImage.mockResolvedValue({
      success: true,
      method: "image",
      message: "Image copied to clipboard!",
    });

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    act(() => root.unmount());
    container.remove();
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    act(() => {
      root.render(
        <ShareButton
          userMessage="Hello"
          systemMessage="World"
          username="testuser"
        />,
      );
    });
  };

  const openPreview = async () => {
    const shareBtn = container.querySelector("button");
    expect(shareBtn).not.toBeNull();
    expect(shareBtn!.textContent).toBe("[share]");

    await act(async () => {
      shareBtn!.click();
    });

    // Preview modal should appear
    const dialog = container.querySelector("[role='dialog']");
    expect(dialog).not.toBeNull();
    return dialog!;
  };

  it("opens preview modal when share button is clicked", async () => {
    renderComponent();
    const dialog = await openPreview();
    const img = dialog.querySelector("img[alt='Share preview']");
    expect(img).not.toBeNull();
  });

  it("Share on X flow: footer swaps to paste hint, [OPEN X TAB] triggers share intent", async () => {
    renderComponent();
    await openPreview();

    const buttons = container.querySelectorAll("button");
    const shareXBtn = Array.from(buttons).find((b) => b.textContent?.includes("SHARE ON X"));
    expect(shareXBtn).not.toBeNull();

    await act(async () => {
      shareXBtn!.click();
    });
    await act(async () => {
      await Promise.resolve();
    });

    // Modal stays open — the footer swaps in place to a paste hint.
    expect(container.querySelector("[role='dialog']")).not.toBeNull();
    expect(container.textContent).toContain("IMAGE COPIED TO CLIPBOARD");
    expect(container.textContent).toMatch(/\[ (CTRL|CMD) \+ V \]/);
    // Share intent does NOT fire until the user clicks the OPEN-tab action.
    expect(mockOpenShareIntent).not.toHaveBeenCalled();

    const buttonsAfter = container.querySelectorAll("button");
    const openTabBtn = Array.from(buttonsAfter).find((b) => b.textContent?.includes("OPEN X TAB"));
    expect(openTabBtn).not.toBeUndefined();
    await act(async () => {
      openTabBtn!.click();
    });
    expect(mockOpenShareIntent).toHaveBeenCalledWith("twitter");
    // Modal closes when the user opens the share tab.
    expect(container.querySelector("[role='dialog']")).toBeNull();
  });

  it("Share on LinkedIn flow: footer swaps to paste hint, [OPEN LINKEDIN TAB] triggers share intent", async () => {
    renderComponent();
    await openPreview();

    const buttons = container.querySelectorAll("button");
    const linkedInBtn = Array.from(buttons).find((b) => b.textContent?.includes("SHARE ON LINKEDIN"));
    expect(linkedInBtn).not.toBeNull();

    await act(async () => {
      linkedInBtn!.click();
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(container.textContent).toContain("MANDATORY ACTION");
    expect(mockOpenShareIntent).not.toHaveBeenCalled();

    const buttonsAfter = container.querySelectorAll("button");
    const openTabBtn = Array.from(buttonsAfter).find((b) => b.textContent?.includes("OPEN LINKEDIN TAB"));
    expect(openTabBtn).not.toBeUndefined();
    await act(async () => {
      openTabBtn!.click();
    });
    expect(mockOpenShareIntent).toHaveBeenCalledWith("linkedin");
  });

  it("guards against overlapping preview generation from repeated clicks", async () => {
    renderComponent();

    const shareBtn = container.querySelector("button");
    expect(shareBtn).not.toBeNull();

    // Click twice rapidly
    await act(async () => {
      shareBtn!.click();
      shareBtn!.click();
    });

    // getChatCardBlob should only have been called once
    expect(mockGetChatCardBlob).toHaveBeenCalledTimes(1);
  });

  it("paste hint reverts to action buttons after the 30s auto-revert timer", async () => {
    renderComponent();
    await openPreview();

    const buttons = container.querySelectorAll("button");
    const shareXBtn = Array.from(buttons).find((b) => b.textContent?.includes("SHARE ON X"));

    await act(async () => {
      shareXBtn!.click();
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(container.textContent).toContain("IMAGE COPIED TO CLIPBOARD");

    await act(async () => {
      vi.advanceTimersByTime(30000);
    });
    expect(container.textContent).not.toContain("IMAGE COPIED TO CLIPBOARD");
    expect(container.querySelector("[role='dialog']")).not.toBeNull();
  });
});

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
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

  it("Share on X flow: preview → click Share on X → modal closes → share intent opens", async () => {
    renderComponent();
    await openPreview();

    // Click "Share on X" button
    const buttons = container.querySelectorAll("button");
    const shareXBtn = Array.from(buttons).find((b) => b.textContent === "Share on X");
    expect(shareXBtn).not.toBeNull();

    // Click share — this triggers executeShare which has an 800ms delay
    await act(async () => {
      shareXBtn!.click();
    });

    // Modal should close immediately
    const dialogAfterClick = container.querySelector("[role='dialog']");
    expect(dialogAfterClick).toBeNull();

    // Advance past the 800ms delay in executeShare
    await act(async () => {
      vi.advanceTimersByTime(800);
    });

    // After shareChatImage resolves, status should be "copied"
    expect(container.textContent).toContain("Image copied to clipboard!");

    // Advance past the 1200ms share intent delay
    await act(async () => {
      vi.advanceTimersByTime(1200);
    });

    // openShareIntent should have been called with "twitter"
    expect(mockOpenShareIntent).toHaveBeenCalledWith("twitter");
    expect(container.textContent).toContain("Share dialog opened!");
  });

  it("Share on LinkedIn flow: preview → click Share on LinkedIn → share intent opens", async () => {
    renderComponent();
    await openPreview();

    const buttons = container.querySelectorAll("button");
    const linkedInBtn = Array.from(buttons).find((b) => b.textContent === "Share on LinkedIn");
    expect(linkedInBtn).not.toBeNull();

    await act(async () => {
      linkedInBtn!.click();
    });

    await act(async () => {
      vi.advanceTimersByTime(800);
    });

    await act(async () => {
      vi.advanceTimersByTime(1200);
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

  it("resets to idle after share flow completes", async () => {
    renderComponent();
    await openPreview();

    const buttons = container.querySelectorAll("button");
    const shareXBtn = Array.from(buttons).find((b) => b.textContent === "Share on X");

    await act(async () => {
      shareXBtn!.click();
    });

    // Advance through full flow: 800ms (executeShare) + 1200ms (share intent) + 4000ms (resetAfterDelay)
    await act(async () => {
      vi.advanceTimersByTime(800);
    });
    await act(async () => {
      vi.advanceTimersByTime(1200);
    });
    await act(async () => {
      vi.advanceTimersByTime(4000);
    });

    // Should be back to showing the [share] button
    const shareButton = container.querySelector("button");
    expect(shareButton).not.toBeNull();
    expect(shareButton!.textContent).toBe("[share]");
  });
});

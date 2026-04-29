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

  /** Click a share-platform button and flush all async work. */
  const clickShareButton = async (label: string) => {
    const buttons = container.querySelectorAll("button");
    const btn = Array.from(buttons).find((b) => b.textContent?.includes(label));
    expect(btn).not.toBeNull();

    await act(async () => {
      btn!.click();
      // Flush microtasks so the awaited mock promise resolves within act.
      await vi.advanceTimersByTimeAsync(0);
    });

    return btn!;
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

    await clickShareButton("SHARE ON X");

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

    await clickShareButton("SHARE ON LINKEDIN");

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

    await clickShareButton("SHARE ON X");
    expect(container.textContent).toContain("IMAGE COPIED TO CLIPBOARD");

    await act(async () => {
      vi.advanceTimersByTime(30000);
    });
    expect(container.textContent).not.toContain("IMAGE COPIED TO CLIPBOARD");
    expect(container.querySelector("[role='dialog']")).not.toBeNull();
  });

  it("shows text-fallback message when shareChatImage returns method 'text' during platform share", async () => {
    renderComponent();
    await openPreview();

    // Override the mock AFTER preview opens so the preview itself succeeds
    mockShareChatImage.mockResolvedValue({
      success: true,
      method: "text",
      message: "Chat copied to clipboard as text.",
    });

    await clickShareButton("SHARE ON X");

    // Should NOT show paste-image instructions since only text was copied
    expect(container.textContent).not.toContain("IMAGE COPIED TO CLIPBOARD");
    // Should show the text fallback message
    expect(container.textContent).toContain("image copy not supported");
  });

  it("shows error and resets when shareChatImage throws during platform share", async () => {
    renderComponent();
    await openPreview();

    // Override the mock AFTER preview opens
    mockShareChatImage.mockRejectedValue(new Error("Network error"));

    await clickShareButton("SHARE ON X");

    // Should show error, not paste hint
    expect(container.textContent).not.toContain("IMAGE COPIED TO CLIPBOARD");
    expect(container.textContent).toContain("Something went wrong");

    // Should auto-reset after delay
    await act(async () => {
      vi.advanceTimersByTime(4000);
    });
    // Back to idle with share button
    const shareBtn = container.querySelector("button");
    expect(shareBtn?.textContent).toBe("[share]");
  });

  it("shows error and resets when shareChatImage returns failure during platform share", async () => {
    renderComponent();
    await openPreview();

    // Override the mock AFTER preview opens
    mockShareChatImage.mockResolvedValue({
      success: false,
      method: "none",
      message: "Failed to copy to clipboard.",
    });

    await clickShareButton("SHARE ON X");

    expect(container.textContent).toContain("Failed to copy to clipboard.");
  });

  it("passes username through to getChatCardBlob for preview generation", async () => {
    renderComponent();
    await openPreview();

    expect(mockGetChatCardBlob).toHaveBeenCalledWith("Hello", "World", "testuser");
  });
});

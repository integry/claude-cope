// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";

import {
  createDeferred,
  imageBytes,
  mockClipboard,
  shareCardResponse,
  signedShareClaim,
  setupShareButtonTest,
  toArrayBuffer,
} from "./ShareButton.testUtils";
import MessageList from "../MessageList";
import { syncMessageKeys } from "../terminalUtils";
import type { Message } from "../../hooks/useGameState";

function getTwitterIntentText(url: string): string | null {
  return new URL(url).searchParams.get("text");
}

describe("ShareButton modal share flow", () => {
  const testScope = setupShareButtonTest();

  it("guards against overlapping preview creation from repeated clicks", async () => {
    testScope.renderComponent();

    const shareBtn = testScope.container.querySelector("button");
    expect(shareBtn).not.toBeNull();

    await act(async () => {
      shareBtn!.click();
      shareBtn!.click();
    });

    expect(testScope.fetchMock).toHaveBeenCalledTimes(2);
    expect(testScope.fetchMock.mock.calls.filter(([url]) => String(url).includes("/api/share-cards"))).toHaveLength(1);
  });

  it("paste hint reverts to action buttons after the 30s auto-revert timer", async () => {
    await testScope.renderOpenPreview();

    mockClipboard.write.mockReset();
    mockClipboard.write.mockResolvedValue(undefined);

    await testScope.clickShareButton("SHARE ON X");
    expect(testScope.container.textContent).toContain("IMAGE COPIED TO CLIPBOARD");

    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    expect(testScope.container.textContent).not.toContain("IMAGE COPIED TO CLIPBOARD");
    expect(testScope.container.querySelector("[role='dialog']")).not.toBeNull();
  });

  it("shows text-fallback message when clipboard image copy is unavailable during platform share", async () => {
    await testScope.renderOpenPreview();
    mockClipboard.write.mockRejectedValueOnce(new Error("Not supported"));
    mockClipboard.writeText.mockResolvedValueOnce(undefined);
    await testScope.clickShareButton("SHARE ON X");
    expect(testScope.container.textContent).not.toContain("IMAGE COPIED TO CLIPBOARD");
    expect(testScope.container.textContent).toContain("SHARE LINK COPIED TO CLIPBOARD");
    expect(testScope.container.textContent).toContain("IMAGE COPY IS NOT SUPPORTED IN THIS BROWSER");
    expect(testScope.getButtonByLabel("OPEN X TAB")).not.toBeNull();

    const mockOpen = vi.spyOn(window, "open").mockImplementation(() => null);
    const openTabBtn = testScope.getButtonByLabel("OPEN X TAB");
    expect(openTabBtn).not.toBeNull();

    await act(async () => {
      openTabBtn!.click();
    });

    expect(mockOpen).toHaveBeenCalledTimes(1);
    const shareIntentUrl = String(mockOpen.mock.calls[0]?.[0]);
    expect(shareIntentUrl).toContain("twitter.com/intent/tweet");
    const shareIntentText = getTwitterIntentText(shareIntentUrl);
    expect(shareIntentText).not.toBeNull();
    expect(shareIntentText).not.toContain(shareCardResponse.shareUrl);
    expect(shareIntentText).not.toContain("http");
    expect(testScope.container.querySelector("[role='dialog']")).toBeNull();
    mockOpen.mockRestore();
  });

  it("shows backend preview creation errors instead of replacing them with a generic message", async () => {
    testScope.fetchMock.mockImplementationOnce(async () => new Response(JSON.stringify({ error: "share service unavailable" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    }));

    testScope.renderComponent();

    const shareBtn = testScope.container.querySelector("button");
    expect(shareBtn).not.toBeNull();

    await act(async () => {
      shareBtn!.click();
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(testScope.container.textContent).toContain("share service unavailable");
  });

  it("lets the user cancel an in-flight preview creation and try again", async () => {
    const deferredShareCard = createDeferred<Response>();
    testScope.fetchMock.mockImplementationOnce(async () => deferredShareCard.promise);
    testScope.renderComponent();

    const shareBtn = testScope.container.querySelector("button");
    expect(shareBtn).not.toBeNull();

    await act(async () => {
      shareBtn!.click();
      await Promise.resolve();
    });

    expect(testScope.container.textContent).toContain("Creating share preview");
    const cancelButton = testScope.getButtonByLabel("cancel");
    expect(cancelButton).not.toBeNull();

    await act(async () => {
      cancelButton!.click();
    });

    expect(testScope.container.querySelector("[role='dialog']")).toBeNull();
    expect(testScope.container.querySelector("button")?.textContent).toBe("[share]");

    deferredShareCard.resolve(new Response(JSON.stringify(shareCardResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
    await act(async () => {
      await deferredShareCard.promise;
      await Promise.resolve();
    });

    expect(testScope.container.querySelector("[role='dialog']")).toBeNull();

    await testScope.openPreview();
    expect(testScope.fetchMock).toHaveBeenCalledTimes(3);
    expect(testScope.fetchMock.mock.calls.filter(([url]) => String(url).includes("/api/share-cards"))).toHaveLength(2);
  });

  it("shows error and resets when image fetch fails during platform share", async () => {
    testScope.imageFetchOverrides.set(
      shareCardResponse.imageUrl,
      Promise.resolve(new Response("nope", { status: 500 })),
    );
    await testScope.renderOpenPreview();

    await testScope.clickShareButton("SHARE ON X");

    expect(testScope.container.textContent).not.toContain("IMAGE COPIED TO CLIPBOARD");
    expect(testScope.container.textContent).toContain("Something went wrong");

    await act(async () => {
      vi.advanceTimersByTime(4000);
    });

    const shareBtn = testScope.container.querySelector("button");
    expect(shareBtn?.textContent).toBe("[share]");
  });

  it("resets back to the share button when the modal closes during an in-flight share", async () => {
    await testScope.renderOpenPreview();

    const deferredImage = createDeferred<Response>();
    testScope.imageFetchOverrides.set(shareCardResponse.imageUrl, deferredImage.promise);

    const shareOnXButton = testScope.getButtonByLabel("SHARE ON X");
    expect(shareOnXButton).not.toBeNull();

    await act(async () => {
      shareOnXButton!.click();
      await Promise.resolve();
    });

    const closeButton = testScope.getButtonByLabel("[x]");
    expect(closeButton).not.toBeNull();

    await act(async () => {
      closeButton!.click();
    });

    expect(testScope.container.querySelector("[role='dialog']")).toBeNull();
    expect(testScope.container.textContent).not.toContain("Copying image to clipboard");
    expect(testScope.container.querySelector("button")?.textContent).toBe("[share]");

    deferredImage.resolve(new Response(toArrayBuffer(imageBytes), {
      status: 200,
      headers: { "Content-Type": "image/png" },
    }));

    await act(async () => {
      await deferredImage.promise;
      await Promise.resolve();
    });

    expect(testScope.container.querySelector("[role='dialog']")).toBeNull();
    expect(testScope.container.querySelector("button")?.textContent).toBe("[share]");
  });

  it("keeps in-flight preview image fetches isolated by imageUrl", async () => {
    const secondShareCardResponse = {
      shareId: "share-456",
      imageUrl: "https://claudecope.com/api/share-image/share-456",
      shareUrl: "https://claudecope.com/s/share-456",
    };
    testScope.shareCardResponses = [shareCardResponse, secondShareCardResponse];
    testScope.imageBodies.set(
      secondShareCardResponse.imageUrl,
      toArrayBuffer(new TextEncoder().encode("server-image-b")),
    );

    await testScope.renderOpenPreview();

    const firstDeferredImage = createDeferred<Response>();
    testScope.imageFetchOverrides.set(shareCardResponse.imageUrl, firstDeferredImage.promise);

    const firstShareButton = testScope.getButtonByLabel("SHARE ON X");
    expect(firstShareButton).not.toBeNull();

    await act(async () => {
      firstShareButton!.click();
      await Promise.resolve();
    });

    const closeButton = testScope.getButtonByLabel("[x]");
    expect(closeButton).not.toBeNull();
    await act(async () => {
      closeButton!.click();
    });

    await testScope.openPreview();
    await testScope.clickShareButton("COPY IMAGE");

    expect(mockClipboard.write).toHaveBeenCalledTimes(2);
    const clipboardItem = mockClipboard.write.mock.calls[1]?.[0]?.[0];
    const copiedBlob = await clipboardItem.getType("image/png");
    expect(await copiedBlob.text()).toBe("server-image-b");

    firstDeferredImage.resolve(new Response(toArrayBuffer(imageBytes), {
      status: 200,
      headers: { "Content-Type": "image/png" },
    }));
    await act(async () => {
      await firstDeferredImage.promise;
      await Promise.resolve();
    });
  });

  it("ignores stale COPY IMAGE completions after the user closes and reopens share", async () => {
    await testScope.renderOpenPreview();

    const deferredClipboardWrite = createDeferred<void>();
    mockClipboard.write.mockImplementationOnce(() => deferredClipboardWrite.promise);

    const copyImageButton = testScope.getButtonByLabel("COPY IMAGE");
    expect(copyImageButton).not.toBeNull();

    await act(async () => {
      copyImageButton!.click();
      await Promise.resolve();
    });

    expect(testScope.container.textContent).toContain("Copying image to clipboard");

    const closeButton = testScope.getButtonByLabel("[x]");
    expect(closeButton).not.toBeNull();
    await act(async () => {
      closeButton!.click();
    });

    expect(testScope.container.querySelector("[role='dialog']")).toBeNull();
    expect(testScope.container.querySelector("button")?.textContent).toBe("[share]");

    await testScope.openPreview();
    expect(testScope.container.querySelector("[role='dialog']")).not.toBeNull();

    deferredClipboardWrite.resolve();
    await act(async () => {
      await deferredClipboardWrite.promise;
      await Promise.resolve();
    });

    expect(testScope.container.querySelector("[role='dialog']")).not.toBeNull();
    expect(testScope.container.textContent).not.toContain("Image copied to clipboard!");
    expect(testScope.container.textContent).not.toContain("Share link copied to clipboard");
  });

  it("copies the backend PNG when COPY IMAGE is selected", async () => {
    await testScope.renderOpenPreview();

    await testScope.clickShareButton("COPY IMAGE");

    expect(testScope.fetchMock).toHaveBeenCalledWith(shareCardResponse.imageUrl);
    expect(mockClipboard.write).toHaveBeenCalledTimes(1);
    expect(testScope.container.textContent).toContain("Image copied to clipboard!");
  });

  it("falls back to copying the share link when COPY IMAGE cannot write an image", async () => {
    await testScope.renderOpenPreview();

    mockClipboard.write.mockRejectedValueOnce(new Error("Not supported"));
    mockClipboard.writeText.mockResolvedValueOnce(undefined);

    await testScope.clickShareButton("COPY IMAGE");

    expect(mockClipboard.write).toHaveBeenCalledTimes(1);
    expect(mockClipboard.writeText).toHaveBeenCalledWith(shareCardResponse.shareUrl);
    expect(testScope.container.querySelector("[role='dialog']")).toBeNull();
    expect(testScope.container.textContent).toContain("Share link copied to clipboard");
  });

  it("passes username through to share-card creation", async () => {
    await testScope.renderOpenPreview();

    expect(testScope.fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/share-cards"), expect.objectContaining({
      body: JSON.stringify({ shareClaim: signedShareClaim }),
    }));
  });

  it("keeps the share dialog open when a tip is inserted before the shared message", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const keyMap = new WeakMap<Message, number>();
    const nextKeyId = { current: 0 };
    const messageKeys: number[] = [];
    const userMessage: Message = { role: "user", content: "Hello" };
    const sharedMessage: Message = { role: "system", content: "World", shareClaim: signedShareClaim };
    const tipMessage: Message = { role: "system", content: "Tip: Run /backlog first.", displayType: "tip" };

    const renderHistory = (history: Message[]) => {
      syncMessageKeys(messageKeys, nextKeyId, history, keyMap);
      act(() => {
        root.render(
          <MessageList
            history={history}
            messageKeys={messageKeys}
            initialHistoryLen={history.length}
            promptString=">"
            username="testuser"
          />,
        );
      });
    };

    try {
      renderHistory([userMessage, sharedMessage]);

      const shareButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "[share]");
      expect(shareButton).not.toBeNull();

      await act(async () => {
        shareButton!.click();
      });

      expect(container.querySelector("[role='dialog']")).not.toBeNull();

      renderHistory([userMessage, tipMessage, sharedMessage]);

      expect(container.querySelector("[role='dialog']")).not.toBeNull();
      expect(container.textContent).toContain("SHARE ON X");
    } finally {
      act(() => root.unmount());
      container.remove();
    }
  });
});

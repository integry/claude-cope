// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { ShareButton } from "../ShareButton";

describe("ShareButton modal share flow", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;
  let fetchMock: ReturnType<typeof vi.fn>;
  let shareCardResponses: Array<{ shareId: string; imageUrl: string; shareUrl: string }>;
  let imageBodies: Map<string, ArrayBuffer>;
  let imageFetchOverrides: Map<string, Promise<Response>>;

  const mockClipboard = {
    write: vi.fn().mockResolvedValue(undefined),
    writeText: vi.fn().mockResolvedValue(undefined),
  };

  const MockClipboardItem = vi.fn().mockImplementation((items: Record<string, Blob>) => ({
    types: Object.keys(items),
    getType: (type: string) => Promise.resolve(items[type]),
  }));

  const imageBytes = new TextEncoder().encode("server-image");
  const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
    const buffer = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(buffer).set(bytes);
    return buffer;
  };
  const shareCardResponse = {
    shareId: "share-123",
    imageUrl: "https://claudecope.com/api/share-image/share-123",
    shareUrl: "https://claudecope.com/s/share-123",
  };

  const createDeferred = <T,>() => {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    shareCardResponses = [shareCardResponse];
    imageBodies = new Map([[shareCardResponse.imageUrl, toArrayBuffer(imageBytes)]]);
    imageFetchOverrides = new Map();

    Object.defineProperty(navigator, "clipboard", {
      value: mockClipboard,
      writable: true,
      configurable: true,
    });
    // @ts-expect-error - ClipboardItem may not exist in jsdom
    globalThis.ClipboardItem = MockClipboardItem;

    fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/share-cards")) {
        return new Response(JSON.stringify(shareCardResponses.shift() ?? shareCardResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url.includes("/api/share-image/")) {
        const override = imageFetchOverrides.get(url);
        if (override) {
          return override;
        }
        const imageBody = imageBodies.get(url) ?? toArrayBuffer(imageBytes);
        return new Response(imageBody, {
          status: 200,
          headers: { "Content-Type": "image/png" },
        });
      }
      return new Response("unexpected", { status: 500 });
    });
    vi.stubGlobal("fetch", fetchMock);

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
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

    const dialog = container.querySelector("[role='dialog']");
    expect(dialog).not.toBeNull();
    return dialog!;
  };

  const clickShareButton = async (label: string) => {
    const buttons = container.querySelectorAll("button");
    const btn = Array.from(buttons).find((b) => b.textContent?.includes(label));
    expect(btn).not.toBeNull();

    await act(async () => {
      btn!.click();
      await vi.advanceTimersByTimeAsync(0);
    });

    return btn!;
  };

  const getButtonByLabel = (label: string) => {
    const buttons = container.querySelectorAll("button");
    return Array.from(buttons).find((button) => button.textContent?.includes(label)) ?? null;
  };

  it("opens preview modal when share button is clicked", async () => {
    renderComponent();
    const dialog = await openPreview();
    const img = dialog.querySelector("img[alt='Share preview']");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("src")).toBe(shareCardResponse.imageUrl);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/share-cards"), expect.objectContaining({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "Hello", response: "World", username: "testuser" }),
    }));
  });

  it("Share on X flow: footer swaps to paste hint, [OPEN X TAB] uses the stable share URL", async () => {
    renderComponent();
    await openPreview();

    await clickShareButton("SHARE ON X");

    expect(container.querySelector("[role='dialog']")).not.toBeNull();
    expect(container.textContent).toContain("IMAGE COPIED TO CLIPBOARD");
    expect(container.textContent).toMatch(/\[ (CTRL|CMD) \+ V \]/);
    expect(mockClipboard.write).toHaveBeenCalledTimes(1);

    const mockOpen = vi.spyOn(window, "open").mockImplementation(() => null);
    const buttonsAfter = container.querySelectorAll("button");
    const openTabBtn = Array.from(buttonsAfter).find((b) => b.textContent?.includes("OPEN X TAB"));
    expect(openTabBtn).not.toBeUndefined();

    await act(async () => {
      openTabBtn!.click();
    });

    expect(mockOpen).toHaveBeenCalledTimes(1);
    expect(String(mockOpen.mock.calls[0]?.[0])).toContain("twitter.com/intent/tweet");
    expect(decodeURIComponent(String(mockOpen.mock.calls[0]?.[0]))).toContain(shareCardResponse.shareUrl);
    expect(container.querySelector("[role='dialog']")).toBeNull();
    mockOpen.mockRestore();
  });

  it("Share on LinkedIn flow uses the stable public share URL", async () => {
    renderComponent();
    await openPreview();

    await clickShareButton("SHARE ON LINKEDIN");

    expect(container.textContent).toContain("LINKEDIN WILL SHARE THE PUBLIC LINK DIRECTLY");
    expect(container.textContent).not.toContain("PRESS CTRL + V");
    expect(fetchMock).not.toHaveBeenCalledWith(shareCardResponse.imageUrl, { cache: "no-store" });
    expect(mockClipboard.write).not.toHaveBeenCalled();
    expect(mockClipboard.writeText).not.toHaveBeenCalled();

    const mockOpen = vi.spyOn(window, "open").mockImplementation(() => null);
    const openTabBtn = getButtonByLabel("OPEN LINKEDIN TAB");
    expect(openTabBtn).not.toBeUndefined();

    await act(async () => {
      openTabBtn!.click();
    });

    expect(mockOpen).toHaveBeenCalledWith(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareCardResponse.shareUrl)}`,
      "_blank",
      "noopener,noreferrer",
    );
    mockOpen.mockRestore();
  });

  it("keeps the LinkedIn offsite-share action available when image clipboard copy is unsupported", async () => {
    renderComponent();
    await openPreview();

    // @ts-expect-error - simulate browsers without ClipboardItem support
    globalThis.ClipboardItem = undefined;
    mockClipboard.write.mockRejectedValueOnce(new Error("Not supported"));

    await clickShareButton("SHARE ON LINKEDIN");

    expect(container.textContent).toContain("LINKEDIN WILL SHARE THE PUBLIC LINK DIRECTLY");
    expect(container.textContent).not.toContain("image copy not supported");
    expect(getButtonByLabel("OPEN LINKEDIN TAB")).not.toBeNull();
    expect(fetchMock).not.toHaveBeenCalledWith(shareCardResponse.imageUrl, { cache: "no-store" });
    expect(mockClipboard.write).not.toHaveBeenCalled();
    expect(mockClipboard.writeText).not.toHaveBeenCalled();
  });

  it("guards against overlapping preview creation from repeated clicks", async () => {
    renderComponent();

    const shareBtn = container.querySelector("button");
    expect(shareBtn).not.toBeNull();

    await act(async () => {
      shareBtn!.click();
      shareBtn!.click();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("paste hint reverts to action buttons after the 30s auto-revert timer", async () => {
    renderComponent();
    await openPreview();

    mockClipboard.write.mockReset();
    mockClipboard.write.mockResolvedValue(undefined);

    await clickShareButton("SHARE ON X");
    expect(container.textContent).toContain("IMAGE COPIED TO CLIPBOARD");

    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    expect(container.textContent).not.toContain("IMAGE COPIED TO CLIPBOARD");
    expect(container.querySelector("[role='dialog']")).not.toBeNull();
  });

  it("shows text-fallback message when clipboard image copy is unavailable during platform share", async () => {
    renderComponent();
    await openPreview();

    mockClipboard.write.mockRejectedValueOnce(new Error("Not supported"));
    mockClipboard.writeText.mockResolvedValueOnce(undefined);

    await clickShareButton("SHARE ON X");

    expect(container.textContent).not.toContain("IMAGE COPIED TO CLIPBOARD");
    expect(container.textContent).toContain("image copy not supported");
  });

  it("shows error and resets when image fetch fails during platform share", async () => {
    renderComponent();
    await openPreview();

    fetchMock.mockImplementationOnce(async () => new Response("nope", { status: 500 }));

    await clickShareButton("SHARE ON X");

    expect(container.textContent).not.toContain("IMAGE COPIED TO CLIPBOARD");
    expect(container.textContent).toContain("Something went wrong");

    await act(async () => {
      vi.advanceTimersByTime(4000);
    });

    const shareBtn = container.querySelector("button");
    expect(shareBtn?.textContent).toBe("[share]");
  });

  it("resets back to the share button when the modal closes during an in-flight share", async () => {
    renderComponent();
    await openPreview();

    const deferredImage = createDeferred<Response>();
    imageFetchOverrides.set(shareCardResponse.imageUrl, deferredImage.promise);

    const shareOnXButton = getButtonByLabel("SHARE ON X");
    expect(shareOnXButton).not.toBeNull();

    await act(async () => {
      shareOnXButton!.click();
      await Promise.resolve();
    });

    const closeButton = getButtonByLabel("[x]");
    expect(closeButton).not.toBeNull();

    await act(async () => {
      closeButton!.click();
    });

    expect(container.querySelector("[role='dialog']")).toBeNull();
    expect(container.textContent).not.toContain("Copying image to clipboard");
    expect(container.querySelector("button")?.textContent).toBe("[share]");

    deferredImage.resolve(new Response(toArrayBuffer(imageBytes), {
      status: 200,
      headers: { "Content-Type": "image/png" },
    }));

    await act(async () => {
      await deferredImage.promise;
      await Promise.resolve();
    });

    expect(container.querySelector("[role='dialog']")).toBeNull();
    expect(container.querySelector("button")?.textContent).toBe("[share]");
  });

  it("keeps in-flight preview image fetches isolated by imageUrl", async () => {
    const secondShareCardResponse = {
      shareId: "share-456",
      imageUrl: "https://claudecope.com/api/share-image/share-456",
      shareUrl: "https://claudecope.com/s/share-456",
    };
    shareCardResponses = [shareCardResponse, secondShareCardResponse];
    imageBodies.set(
      secondShareCardResponse.imageUrl,
      toArrayBuffer(new TextEncoder().encode("server-image-b")),
    );

    renderComponent();
    await openPreview();

    const firstDeferredImage = createDeferred<Response>();
    imageFetchOverrides.set(shareCardResponse.imageUrl, firstDeferredImage.promise);

    const firstShareButton = getButtonByLabel("SHARE ON X");
    expect(firstShareButton).not.toBeNull();

    await act(async () => {
      firstShareButton!.click();
      await Promise.resolve();
    });

    const closeButton = getButtonByLabel("[x]");
    expect(closeButton).not.toBeNull();
    await act(async () => {
      closeButton!.click();
    });

    await openPreview();
    await clickShareButton("COPY IMAGE");

    expect(mockClipboard.write).toHaveBeenCalledTimes(1);
    const clipboardItem = mockClipboard.write.mock.calls[0]?.[0]?.[0];
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
    renderComponent();
    await openPreview();

    const deferredClipboardWrite = createDeferred<void>();
    mockClipboard.write.mockImplementationOnce(() => deferredClipboardWrite.promise);

    const copyImageButton = getButtonByLabel("COPY IMAGE");
    expect(copyImageButton).not.toBeNull();

    await act(async () => {
      copyImageButton!.click();
      await Promise.resolve();
    });

    expect(container.textContent).toContain("Copying image to clipboard");

    const closeButton = getButtonByLabel("[x]");
    expect(closeButton).not.toBeNull();
    await act(async () => {
      closeButton!.click();
    });

    expect(container.querySelector("[role='dialog']")).toBeNull();
    expect(container.querySelector("button")?.textContent).toBe("[share]");

    await openPreview();
    expect(container.querySelector("[role='dialog']")).not.toBeNull();

    deferredClipboardWrite.resolve();
    await act(async () => {
      await deferredClipboardWrite.promise;
      await Promise.resolve();
    });

    expect(container.querySelector("[role='dialog']")).not.toBeNull();
    expect(container.textContent).not.toContain("Image copied to clipboard!");
    expect(container.textContent).not.toContain("Share link copied to clipboard");
  });

  it("copies the backend PNG when COPY IMAGE is selected", async () => {
    renderComponent();
    await openPreview();

    await clickShareButton("COPY IMAGE");

    expect(fetchMock).toHaveBeenCalledWith(shareCardResponse.imageUrl, { cache: "no-store" });
    expect(mockClipboard.write).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain("Image copied to clipboard!");
  });

  it("passes username through to share-card creation", async () => {
    renderComponent();
    await openPreview();

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/share-cards"), expect.objectContaining({
      body: JSON.stringify({ prompt: "Hello", response: "World", username: "testuser" }),
    }));
  });
});

/* eslint-disable react-refresh/only-export-components */
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, vi } from "vitest";

import { ShareButton } from "../ShareButton";

export type ShareCardResponse = {
  shareId: string;
  imageUrl: string;
  shareUrl: string;
};

export const shareCardResponse: ShareCardResponse = {
  shareId: "share-123",
  imageUrl: "https://claudecope.com/api/share-image/share-123",
  shareUrl: "https://claudecope.com/s/share-123",
};

export const imageBytes = new TextEncoder().encode("server-image");

export const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
};

export const createDeferred = <T,>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

export const mockClipboard = {
  write: vi.fn().mockResolvedValue(undefined),
  writeText: vi.fn().mockResolvedValue(undefined),
};

export const createObjectURLMock = vi.fn((blob: Blob) => `blob:mock-${blob.size}`);
export const revokeObjectURLMock = vi.fn();

export const MockClipboardItem = vi.fn().mockImplementation((items: Record<string, Blob>) => ({
  types: Object.keys(items),
  getType: (type: string) => Promise.resolve(items[type]),
}));

export const setupShareButtonTest = () => {
  let container!: HTMLDivElement;
  let root!: ReturnType<typeof createRoot>;
  let fetchMock!: ReturnType<typeof vi.fn>;
  let shareCardResponses: Array<ShareCardResponse> = [];
  let imageBodies = new Map<string, ArrayBuffer>();
  let imageFetchOverrides = new Map<string, Promise<Response>>();

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
    vi.stubGlobal("URL", class extends URL {
      static createObjectURL = createObjectURLMock;
      static revokeObjectURL = revokeObjectURLMock;
    });

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

  const renderOpenPreview = async () => {
    renderComponent();
    return openPreview();
  };

  const clickShareButton = async (label: string) => {
    const btn = getButtonByLabel(label);
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

  return {
    get container() {
      return container;
    },
    get createObjectURLMock() {
      return createObjectURLMock;
    },
    get fetchMock() {
      return fetchMock;
    },
    get imageBodies() {
      return imageBodies;
    },
    get imageFetchOverrides() {
      return imageFetchOverrides;
    },
    get shareCardResponses() {
      return shareCardResponses;
    },
    set shareCardResponses(value: Array<ShareCardResponse>) {
      shareCardResponses = value;
    },
    clickShareButton,
    getButtonByLabel,
    openPreview,
    renderOpenPreview,
    renderComponent,
  };
};

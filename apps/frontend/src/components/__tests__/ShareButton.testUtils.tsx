/* eslint-disable react-refresh/only-export-components */
import { act, type ComponentProps } from "react";
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
export const signedShareClaim = "signed-share-claim";
export const nextSignedShareClaim = "signed-share-claim-next";

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
export const navigatorShareMock = vi.fn();
const defaultUserAgent = navigator.userAgent;

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
  let currentProps!: ComponentProps<typeof ShareButton>;

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
    Object.defineProperty(navigator, "share", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(navigator, "maxTouchPoints", {
      value: 0,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(navigator, "userAgentData", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(navigator, "userActivation", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    vi.stubGlobal("matchMedia", vi.fn().mockImplementation(() => ({
      matches: false,
      media: "",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));
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
    currentProps = {
      userMessage: "Hello",
      systemMessage: "World",
      username: "testuser",
      shareClaim: signedShareClaim,
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  const renderComponent = (props?: Partial<ComponentProps<typeof ShareButton>>) => {
    currentProps = { ...currentProps, ...props };
    act(() => {
      root.render(<ShareButton {...currentProps} />);
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

  const setDeviceMatchMedia = (coarsePointer: boolean) => {
    vi.stubGlobal("matchMedia", vi.fn().mockImplementation((query: string) => ({
      matches: coarsePointer && (query === "(pointer: coarse)" || query === "(any-pointer: coarse)"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));
  };

  const setNativeShareDevice = (value: boolean) => {
    Object.defineProperty(navigator, "maxTouchPoints", {
      value: value ? 5 : 0,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(navigator, "userAgentData", {
      value: value ? { mobile: true } : undefined,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(navigator, "userAgent", {
      value: value
        ? "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1"
        : defaultUserAgent,
      writable: true,
      configurable: true,
    });
    setDeviceMatchMedia(value);
  };

  const setTouchDesktopDevice = () => {
    Object.defineProperty(navigator, "maxTouchPoints", {
      value: 5,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(navigator, "userAgentData", {
      value: { mobile: false },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/136.0.0.0 Safari/537.36",
      writable: true,
      configurable: true,
    });
    setDeviceMatchMedia(true);
  };

  const setDesktopClassIpadDevice = () => {
    Object.defineProperty(navigator, "maxTouchPoints", {
      value: 5,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(navigator, "userAgentData", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15",
      writable: true,
      configurable: true,
    });
    setDeviceMatchMedia(true);
  };

  const setNavigatorShare = (implementation?: typeof navigator.share) => {
    navigatorShareMock.mockReset();
    if (implementation) {
      navigatorShareMock.mockImplementation(implementation);
    }
    Object.defineProperty(navigator, "share", {
      value: implementation ? navigatorShareMock : undefined,
      writable: true,
      configurable: true,
    });
  };

  const setTransientUserActivation = (isActive?: boolean) => {
    Object.defineProperty(navigator, "userActivation", {
      value: typeof isActive === "boolean" ? { isActive } : undefined,
      writable: true,
      configurable: true,
    });
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
    get navigatorShareMock() {
      return navigatorShareMock;
    },
    openPreview,
    renderOpenPreview,
    renderComponent,
    setDesktopClassIpadDevice,
    setNativeShareDevice,
    setTransientUserActivation,
    setTouchDesktopDevice,
    setNavigatorShare,
  };
};

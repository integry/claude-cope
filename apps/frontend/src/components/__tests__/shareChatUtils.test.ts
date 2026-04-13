/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  renderChatCard,
  shareChatImage,
  getChatCardDataUrl,
  type ShareResult,
} from "../shareChatUtils";

// Mock image loading
const mockImage = {
  naturalWidth: 400,
  naturalHeight: 400,
  onload: null as (() => void) | null,
  onerror: null as (() => void) | null,
  src: "",
};

// Trigger onload when src is set
Object.defineProperty(mockImage, "src", {
  set() {
    setTimeout(() => mockImage.onload?.(), 0);
  },
  get() { return ""; },
});

vi.stubGlobal("Image", vi.fn(() => mockImage));

// Mock canvas context
const mockCtx = {
  font: "",
  textBaseline: "",
  fillStyle: "",
  strokeStyle: "",
  lineWidth: 0,
  measureText: vi.fn((text: string) => ({ width: text.length * 10 })),
  fillText: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  drawImage: vi.fn(),
};

// Mock canvas element
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: vi.fn(() => mockCtx),
  toBlob: vi.fn((callback: (blob: Blob | null) => void) => {
    callback(new Blob(["test"], { type: "image/png" }));
  }),
  toDataURL: vi.fn(() => "data:image/png;base64,test"),
};

describe("renderChatCard", () => {
  beforeEach(() => {
    vi.spyOn(document, "createElement").mockReturnValue(
      mockCanvas as unknown as HTMLCanvasElement
    );
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a canvas element", async () => {
    await renderChatCard("Hello", "World");
    expect(document.createElement).toHaveBeenCalledWith("canvas");
  });

  it("gets 2d context from canvas", async () => {
    await renderChatCard("Hello", "World");
    expect(mockCanvas.getContext).toHaveBeenCalledWith("2d");
  });

  it("draws background rectangle", async () => {
    await renderChatCard("Hello", "World");
    expect(mockCtx.fillRect).toHaveBeenCalled();
    expect(mockCtx.fillStyle).toBeDefined();
  });

  it("does not draw border rectangle", async () => {
    await renderChatCard("Hello", "World");
    expect(mockCtx.strokeRect).not.toHaveBeenCalled();
  });

  it("draws text content", async () => {
    await renderChatCard("User message", "System response");
    expect(mockCtx.fillText).toHaveBeenCalled();
  });

  it("sets canvas dimensions", async () => {
    await renderChatCard("Test", "Response");
    expect(mockCanvas.width).toBeGreaterThan(0);
    expect(mockCanvas.height).toBeGreaterThan(0);
  });
});

describe("getChatCardDataUrl", () => {
  beforeEach(() => {
    vi.spyOn(document, "createElement").mockReturnValue(
      mockCanvas as unknown as HTMLCanvasElement
    );
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a data URL string", async () => {
    const dataUrl = await getChatCardDataUrl("Hello", "World");
    expect(dataUrl).toBe("data:image/png;base64,test");
  });

  it("calls toDataURL with png format", async () => {
    await getChatCardDataUrl("Hello", "World");
    expect(mockCanvas.toDataURL).toHaveBeenCalledWith("image/png");
  });
});

describe("shareChatImage", () => {
  const mockClipboard = {
    write: vi.fn(),
    writeText: vi.fn(),
  };

  // Create a canvas mock that provides a working toBlob
  const createMockCanvasWithBlob = () => {
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockCtx),
      toBlob: vi.fn((callback: (blob: Blob | null) => void) => {
        callback(new Blob(["test"], { type: "image/png" }));
      }),
      toDataURL: vi.fn(() => "data:image/png;base64,test"),
    };
    return canvas as unknown as HTMLCanvasElement;
  };

  // Mock ClipboardItem if not available in jsdom
  const MockClipboardItem = vi.fn().mockImplementation((items: Record<string, Blob>) => ({
    types: Object.keys(items),
    getType: (type: string) => Promise.resolve(items[type]),
  }));

  beforeEach(() => {
    vi.spyOn(document, "createElement").mockImplementation(() =>
      createMockCanvasWithBlob()
    );
    Object.defineProperty(navigator, "clipboard", {
      value: mockClipboard,
      writable: true,
      configurable: true,
    });
    // @ts-expect-error - ClipboardItem may not exist in jsdom
    globalThis.ClipboardItem = MockClipboardItem;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("copies image to clipboard when supported", async () => {
    mockClipboard.write.mockResolvedValueOnce(undefined);

    const result = await shareChatImage({
      userMessage: "Hello",
      systemMessage: "World",
    });

    expect(result.success).toBe(true);
    expect(result.method).toBe("image");
    expect(mockClipboard.write).toHaveBeenCalled();
  });

  it("falls back to text when image copy fails", async () => {
    mockClipboard.write.mockRejectedValueOnce(new Error("Not supported"));
    mockClipboard.writeText.mockResolvedValueOnce(undefined);

    const result = await shareChatImage({
      userMessage: "Hello",
      systemMessage: "World",
    });

    expect(result.success).toBe(true);
    expect(result.method).toBe("text");
    expect(mockClipboard.writeText).toHaveBeenCalled();
  });

  it("returns failure when both methods fail", async () => {
    mockClipboard.write.mockRejectedValueOnce(new Error("Not supported"));
    mockClipboard.writeText.mockRejectedValueOnce(new Error("Not supported"));

    const result = await shareChatImage({
      userMessage: "Hello",
      systemMessage: "World",
    });

    expect(result.success).toBe(false);
    expect(result.method).toBe("none");
  });

  it("opens share intent when requested", async () => {
    mockClipboard.write.mockResolvedValueOnce(undefined);
    const mockOpen = vi.spyOn(window, "open").mockImplementation(() => null);

    await shareChatImage({
      userMessage: "Hello",
      systemMessage: "World",
      platform: "twitter",
      openShareUrl: true,
    });

    expect(mockOpen).toHaveBeenCalled();
    const callArgs = mockOpen.mock.calls[0]!;
    expect(callArgs[0]).toContain("twitter.com/intent/tweet");

    mockOpen.mockRestore();
  });

  it("includes punchline and link in share text fallback", async () => {
    mockClipboard.write.mockRejectedValueOnce(new Error("Not supported"));
    mockClipboard.writeText.mockResolvedValueOnce(undefined);

    await shareChatImage({
      userMessage: "Test prompt",
      systemMessage: "Test response",
    });

    const shareText = mockClipboard.writeText.mock.calls[0]![0] as string;
    expect(shareText).toContain("cope.bot");
    expect(shareText).toContain("#ClaudeCope");
    expect(shareText).not.toContain("Test prompt");
    expect(shareText).not.toContain("Test response");
  });

  it("returns proper ShareResult type", async () => {
    mockClipboard.write.mockResolvedValueOnce(undefined);

    const result: ShareResult = await shareChatImage({
      userMessage: "Hello",
      systemMessage: "World",
    });

    expect(result).toHaveProperty("success");
    expect(result).toHaveProperty("method");
    expect(result).toHaveProperty("message");
    expect(typeof result.success).toBe("boolean");
    expect(["image", "text", "none"]).toContain(result.method);
    expect(typeof result.message).toBe("string");
  });
});

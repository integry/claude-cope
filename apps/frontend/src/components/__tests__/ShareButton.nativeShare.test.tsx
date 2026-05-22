// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { act } from "react";

import { isNativeShareCancellation, shouldUseNativeShareFlowForDevice } from "../shareButtonNativeShare";
import { createDeferred, nextSignedShareClaim, shareCardResponse, signedShareClaim, setupShareButtonTest } from "./ShareButton.testUtils";
import { mockClipboard } from "./ShareButton.testUtils";

describe("ShareButton native share flow", () => {
  const testScope = setupShareButtonTest();

  const triggerMobileTap = async () => {
    const shareBtn = testScope.container.querySelector("button");
    expect(shareBtn).not.toBeNull();

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    await act(async () => {
      shareBtn!.click();
      await Promise.resolve();
    });
  };

  it("uses the native-share device helper only for mobile-class devices", () => {
    expect(shouldUseNativeShareFlowForDevice({
      supportsNativeShare: true,
      userAgentDataMobile: true,
      userAgent: "",
    })).toBe(true);
    expect(shouldUseNativeShareFlowForDevice({
      supportsNativeShare: true,
      userAgentDataMobile: false,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    })).toBe(false);
    expect(shouldUseNativeShareFlowForDevice({
      supportsNativeShare: true,
      userAgentDataMobile: false,
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15",
      maxTouchPoints: 5,
    })).toBe(true);
    expect(shouldUseNativeShareFlowForDevice({
      supportsNativeShare: true,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    })).toBe(false);
  });

  it("only treats known share-sheet dismissals as cancellations", () => {
    expect(isNativeShareCancellation(new DOMException("The share operation was aborted.", "AbortError"))).toBe(true);
    expect(isNativeShareCancellation(new DOMException("Share dismissed", "NotAllowedError"))).toBe(true);
    expect(isNativeShareCancellation(new DOMException("Message port closed unexpectedly", "NotAllowedError"))).toBe(false);
    expect(isNativeShareCancellation(new Error("share request aborted by browser extension"))).toBe(false);
  });

  it("opens the mobile preview modal first and shows only the generic native share action", async () => {
    testScope.setNativeShareDevice(true);
    testScope.setNavigatorShare(async () => undefined);
    testScope.renderComponent();
    await triggerMobileTap();

    expect(testScope.fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/share-cards"), expect.objectContaining({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shareClaim: signedShareClaim }),
    }));
    expect(testScope.navigatorShareMock).not.toHaveBeenCalled();
    expect(testScope.container.querySelector("[role='dialog']")).not.toBeNull();
    expect(testScope.getButtonByLabel("OPEN SHARE MENU")).not.toBeNull();
    expect(testScope.container.textContent).not.toContain("SHARE ON X");
    expect(testScope.container.textContent).not.toContain("COPY IMAGE");
  });

  it("does not create a public share card before the user completes the share action", async () => {
    testScope.setNativeShareDevice(true);
    testScope.setNavigatorShare(async () => undefined);
    testScope.renderComponent();

    const shareBtn = testScope.container.querySelector("button");
    expect(shareBtn).not.toBeNull();

    await act(async () => {
      shareBtn!.dispatchEvent(new Event("pointerdown", { bubbles: true }));
      await Promise.resolve();
    });

    expect(testScope.fetchMock).not.toHaveBeenCalledWith(
      expect.stringContaining("/api/share-cards"),
      expect.anything(),
    );
    expect(testScope.navigatorShareMock).not.toHaveBeenCalled();
  });

  it("shares the rendered backend image through the generic native share action", async () => {
    testScope.setNativeShareDevice(true);
    testScope.setNavigatorShare(async () => undefined);
    testScope.renderComponent();
    await triggerMobileTap();
    await testScope.clickShareButton("OPEN SHARE MENU");

    expect(testScope.navigatorShareMock).toHaveBeenCalledTimes(1);
    const [shareData] = testScope.navigatorShareMock.mock.calls[0] ?? [];
    const file = shareData?.files?.[0];
    expect(shareData).toMatchObject({ title: "Claude Cope chat by @testuser" });
    expect(shareData).not.toHaveProperty("text");
    expect(shareData).not.toHaveProperty("url");
    expect(file).toBeInstanceOf(File);
    expect(file?.name).toBe("claude-cope-chat-share-123.png");
    expect(file?.type).toBe("image/png");
    expect(file?.size).toBeGreaterThan(0);
    expect(testScope.container.querySelector("[role='dialog']")).toBeNull();
    expect(mockClipboard.write).not.toHaveBeenCalled();
    expect(mockClipboard.writeText).not.toHaveBeenCalled();
  });

  it("treats native share cancellation on mobile as a non-error and keeps the preview open", async () => {
    testScope.setNativeShareDevice(true);
    testScope.setNavigatorShare(async () => {
      throw new DOMException("The share operation was aborted.", "AbortError");
    });
    testScope.renderComponent();
    await triggerMobileTap();
    await testScope.clickShareButton("OPEN SHARE MENU");

    expect(testScope.navigatorShareMock).toHaveBeenCalledTimes(1);
    expect(testScope.container.querySelector("[role='dialog']")).not.toBeNull();
    expect(testScope.container.textContent).not.toContain("Failed to open share menu");
    expect(testScope.container.textContent).not.toContain("Something went wrong");
  });

  it("closes the preview and shows an inline error when native share rejects unexpectedly", async () => {
    testScope.setNativeShareDevice(true);
    testScope.setNavigatorShare(async () => {
      throw new Error("share request aborted by browser extension");
    });
    testScope.renderComponent();
    await triggerMobileTap();
    await testScope.clickShareButton("OPEN SHARE MENU");

    expect(testScope.navigatorShareMock).toHaveBeenCalledTimes(1);
    expect(testScope.container.querySelector("[role='dialog']")).toBeNull();
    expect(testScope.container.textContent).toContain("Failed to open share menu. Please try again.");
  });

  it("falls back to the desktop modal actions on mobile when native share is unavailable", async () => {
    testScope.setNativeShareDevice(true);
    testScope.setNavigatorShare(undefined);

    const dialog = await testScope.renderOpenPreview();

    expect(dialog).not.toBeNull();
    expect(testScope.navigatorShareMock).not.toHaveBeenCalled();
    expect(testScope.container.textContent).toContain("SHARE ON X");
    expect(testScope.getButtonByLabel("OPEN SHARE MENU")).toBeNull();
  });

  it("does not use the native-share preview for touch-enabled desktop devices", async () => {
    testScope.setNativeShareDevice(false);
    testScope.setTouchDesktopDevice();
    testScope.setNavigatorShare(async () => undefined);

    const dialog = await testScope.renderOpenPreview();

    expect(testScope.navigatorShareMock).not.toHaveBeenCalled();
    expect(dialog).not.toBeNull();
    expect(testScope.container.textContent).toContain("SHARE ON X");
    expect(testScope.getButtonByLabel("OPEN SHARE MENU")).toBeNull();
  });

  it("uses the generic native-share preview for desktop-class iPad Safari user agents", async () => {
    testScope.setDesktopClassIpadDevice();
    testScope.setNavigatorShare(async () => undefined);
    testScope.renderComponent();
    await triggerMobileTap();

    expect(testScope.navigatorShareMock).not.toHaveBeenCalled();
    expect(testScope.container.querySelector("[role='dialog']")).not.toBeNull();
    expect(testScope.getButtonByLabel("OPEN SHARE MENU")).not.toBeNull();
  });

  it("does not reuse a cached native-share card after shareClaim changes before effects flush", async () => {
    testScope.setNativeShareDevice(true);
    testScope.setNavigatorShare(async () => undefined);
    testScope.shareCardResponses = [
      {
        ...shareCardResponse,
        shareId: "share-old",
        imageUrl: "https://claudecope.com/api/share-image/share-old",
        shareUrl: "https://claudecope.com/s/share-old",
      },
      {
        ...shareCardResponse,
        shareId: "share-new",
        imageUrl: "https://claudecope.com/api/share-image/share-new",
        shareUrl: "https://claudecope.com/s/share-new",
      },
    ];

    testScope.renderComponent({ shareClaim: signedShareClaim });
    await triggerMobileTap();
    await act(async () => {
      testScope.container.querySelector<HTMLButtonElement>("button[aria-label='Close']")?.click();
      await Promise.resolve();
    });

    testScope.renderComponent({ shareClaim: nextSignedShareClaim });
    await triggerMobileTap();
    await testScope.clickShareButton("OPEN SHARE MENU");

    expect(testScope.fetchMock.mock.calls.filter(([url]) => String(url).includes("/api/share-cards"))).toHaveLength(2);
    const [shareData] = testScope.navigatorShareMock.mock.calls[0] ?? [];
    const file = shareData?.files?.[0];
    expect(file?.name).toBe("claude-cope-chat-share-new.png");
  });

  it("aborts native-share card creation when the inline cancel action is used", async () => {
    testScope.setNativeShareDevice(true);
    testScope.setNavigatorShare(async () => undefined);
    const shareCardResponseDeferred = createDeferred<Response>();

    testScope.fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/api/share-cards")) {
        return new Promise<Response>((resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("The operation was aborted.", "AbortError"));
          }, { once: true });
          shareCardResponseDeferred.promise.then(resolve, reject);
        });
      }
      if (url.includes("/api/share-image/")) {
        return Promise.resolve(new Response("unexpected", { status: 500 }));
      }
      return Promise.resolve(new Response("unexpected", { status: 500 }));
    });

    testScope.renderComponent();

    const shareBtn = testScope.container.querySelector("button");
    expect(shareBtn).not.toBeNull();

    await act(async () => {
      shareBtn!.click();
      await Promise.resolve();
    });

    const cancelButton = Array.from(testScope.container.querySelectorAll("button")).find((button) => button.textContent?.includes("[cancel]"));
    expect(cancelButton).not.toBeUndefined();

    await act(async () => {
      cancelButton!.click();
      await Promise.resolve();
    });

    shareCardResponseDeferred.resolve(new Response(JSON.stringify(shareCardResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(testScope.fetchMock.mock.calls.filter(([url]) => String(url).includes("/api/share-cards"))).toHaveLength(1);
    expect(testScope.navigatorShareMock).not.toHaveBeenCalled();
    expect(testScope.container.querySelector("[role='dialog']")).toBeNull();
    expect(testScope.container.querySelector("button")?.textContent).toBe("[share]");
  });
});

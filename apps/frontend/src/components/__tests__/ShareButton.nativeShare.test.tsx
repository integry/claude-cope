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

  it("uses navigator.share on mobile with the backend-generated public share URL", async () => {
    testScope.setNativeShareDevice(true);
    testScope.setNavigatorShare(async () => undefined);
    testScope.renderComponent();
    await triggerMobileTap();

    expect(testScope.fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/share-cards"), expect.objectContaining({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shareClaim: signedShareClaim }),
    }));
    expect(testScope.navigatorShareMock).toHaveBeenCalledWith(expect.objectContaining({
      title: "Claude Cope chat by @testuser",
      text: "Hello",
      url: shareCardResponse.shareUrl,
    }));
    expect(testScope.container.querySelector("[role='dialog']")).toBeNull();
    expect(testScope.fetchMock).not.toHaveBeenCalledWith(shareCardResponse.imageUrl);
    expect(mockClipboard.write).not.toHaveBeenCalled();
    expect(mockClipboard.writeText).not.toHaveBeenCalled();
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

  it("opens the existing modal instead of attempting native share after activation is lost", async () => {
    testScope.setNativeShareDevice(true);
    testScope.setNavigatorShare(async () => undefined);
    testScope.setTransientUserActivation(true);
    const shareCardResponseDeferred = createDeferred<Response>();

    testScope.fetchMock.mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/share-cards")) {
        testScope.setTransientUserActivation(false);
        return shareCardResponseDeferred.promise;
      }
      if (url.includes("/api/share-image/")) {
        return Promise.resolve(new Response("unexpected", { status: 500 }));
      }
      return Promise.resolve(new Response("unexpected", { status: 500 }));
    });

    testScope.renderComponent();

    const shareBtn = testScope.container.querySelector("button");
    expect(shareBtn).not.toBeNull();

    expect(testScope.fetchMock.mock.calls.filter(([url]) => String(url).includes("/api/share-cards"))).toHaveLength(0);

    const clickPromise = act(async () => {
      shareBtn!.click();
      await Promise.resolve();
    });

    shareCardResponseDeferred.resolve(new Response(JSON.stringify(shareCardResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));

    await clickPromise;

    expect(testScope.fetchMock.mock.calls.filter(([url]) => String(url).includes("/api/share-cards"))).toHaveLength(1);
    expect(testScope.navigatorShareMock).not.toHaveBeenCalled();
    expect(testScope.container.querySelector("[role='dialog']")).not.toBeNull();
    expect(testScope.container.textContent).toContain("SHARE ON X");
  });

  it("does not use navigator.share for touch-enabled desktop devices", async () => {
    testScope.setNativeShareDevice(false);
    testScope.setTouchDesktopDevice();
    testScope.setNavigatorShare(async () => undefined);

    const dialog = await testScope.renderOpenPreview();

    expect(testScope.navigatorShareMock).not.toHaveBeenCalled();
    expect(dialog).not.toBeNull();
    expect(testScope.container.textContent).toContain("SHARE ON X");
  });

  it("uses navigator.share for desktop-class iPad Safari user agents", async () => {
    testScope.setDesktopClassIpadDevice();
    testScope.setNavigatorShare(async () => undefined);
    testScope.renderComponent();
    await triggerMobileTap();

    expect(testScope.navigatorShareMock).toHaveBeenCalledTimes(1);
    expect(testScope.navigatorShareMock).toHaveBeenCalledWith(expect.objectContaining({
      url: shareCardResponse.shareUrl,
    }));
    expect(testScope.container.querySelector("[role='dialog']")).toBeNull();
  });

  it("treats native share cancellation on mobile as a non-error", async () => {
    testScope.setNativeShareDevice(true);
    testScope.setNavigatorShare(async () => {
      throw new DOMException("The share operation was aborted.", "AbortError");
    });
    testScope.renderComponent();
    await triggerMobileTap();

    expect(testScope.navigatorShareMock).toHaveBeenCalledTimes(1);
    expect(testScope.container.querySelector("[role='dialog']")).toBeNull();
    expect(testScope.container.textContent).not.toContain("Something went wrong");
    expect(testScope.container.textContent).not.toContain("Failed to create share preview");
    expect(testScope.container.querySelector("button")?.textContent).toBe("[share]");
  });

  it("treats mobile share-sheet dismissal variants as a non-error", async () => {
    testScope.setNativeShareDevice(true);
    testScope.setNavigatorShare(async () => {
      throw new DOMException("Share dismissed", "NotAllowedError");
    });
    testScope.renderComponent();
    await triggerMobileTap();

    expect(testScope.navigatorShareMock).toHaveBeenCalledTimes(1);
    expect(testScope.container.querySelector("[role='dialog']")).toBeNull();
    expect(testScope.container.textContent).not.toContain("Something went wrong");
    expect(testScope.container.textContent).not.toContain("Failed to create share preview");
  });

  it("falls back to the existing modal when native share rejects unexpectedly", async () => {
    testScope.setNativeShareDevice(true);
    testScope.setNavigatorShare(async () => {
      throw new Error("share request aborted by browser extension");
    });
    testScope.renderComponent();
    await triggerMobileTap();

    expect(testScope.navigatorShareMock).toHaveBeenCalledTimes(1);
    expect(testScope.fetchMock.mock.calls.filter(([url]) => String(url).includes("/api/share-cards"))).toHaveLength(1);
    expect(testScope.container.querySelector("[role='dialog']")).not.toBeNull();
    expect(testScope.container.textContent).toContain("SHARE ON X");
  });

  it("falls back to the existing modal on mobile when native share is unavailable", async () => {
    testScope.setNativeShareDevice(true);
    testScope.setNavigatorShare(undefined);

    const dialog = await testScope.renderOpenPreview();

    expect(dialog).not.toBeNull();
    expect(testScope.navigatorShareMock).not.toHaveBeenCalled();
    expect(testScope.container.textContent).toContain("SHARE ON X");
  });

  it("does not reuse a stale native-share card after shareClaim changes mid-request", async () => {
    testScope.setNativeShareDevice(true);
    testScope.setNavigatorShare(async () => undefined);
    const firstCard = {
      ...shareCardResponse,
      shareId: "share-old",
      imageUrl: "https://claudecope.com/api/share-image/share-old",
      shareUrl: "https://claudecope.com/s/share-old",
    };
    const secondCard = {
      ...shareCardResponse,
      shareId: "share-new",
      imageUrl: "https://claudecope.com/api/share-image/share-new",
      shareUrl: "https://claudecope.com/s/share-new",
    };
    const firstResponse = createDeferred<Response>();
    let shareCardRequestCount = 0;

    testScope.fetchMock.mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/share-cards")) {
        shareCardRequestCount += 1;
        if (shareCardRequestCount === 1) {
          return firstResponse.promise;
        }
        return Promise.resolve(new Response(JSON.stringify(secondCard), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }));
      }
      if (url.includes("/api/share-image/")) {
        return Promise.resolve(new Response("unexpected", { status: 500 }));
      }
      return Promise.resolve(new Response("unexpected", { status: 500 }));
    });

    testScope.renderComponent({ shareClaim: signedShareClaim });
    await triggerMobileTap();
    testScope.renderComponent({ shareClaim: nextSignedShareClaim });
    firstResponse.resolve(new Response(JSON.stringify(firstCard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    await triggerMobileTap();

    expect(testScope.navigatorShareMock).toHaveBeenCalledTimes(1);
    expect(testScope.navigatorShareMock).toHaveBeenCalledWith(expect.objectContaining({
      url: secondCard.shareUrl,
    }));
    expect(testScope.fetchMock.mock.calls.filter(([url]) => String(url).includes("/api/share-cards"))).toHaveLength(2);
  });
});

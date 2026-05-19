// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { act } from "react";

import { createDeferred, imageBytes, mockClipboard, shareCardResponse, signedShareClaim, setupShareButtonTest, toArrayBuffer } from "./ShareButton.testUtils";

function getTwitterIntentText(url: string): string | null {
  return new URL(url).searchParams.get("text");
}

describe("ShareButton preview modal flow", () => {
  const testScope = setupShareButtonTest();

  it("opens preview modal immediately with the DOM preview, then swaps to the generated PNG", async () => {
    const deferredImage = createDeferred<Response>();
    testScope.imageFetchOverrides.set(shareCardResponse.imageUrl, deferredImage.promise);
    testScope.renderComponent();
    const dialog = await testScope.openPreview();
    expect(dialog.querySelector("#share-card-root")).not.toBeNull();
    expect(dialog.querySelector('img[alt="Share preview for @testuser"]')).toBeNull();
    expect(testScope.container.textContent).toContain("Rendering final image...");
    expect(testScope.fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/share-cards"), expect.objectContaining({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shareClaim: signedShareClaim }),
    }));

    deferredImage.resolve(new Response(toArrayBuffer(imageBytes), { status: 200, headers: { "Content-Type": "image/png" } }));

    await act(async () => {
      await deferredImage.promise;
      await Promise.resolve();
    });

    const previewImage = dialog.querySelector('img[alt="Share preview for @testuser"]');
    expect(previewImage).not.toBeNull();
    expect(previewImage?.getAttribute("src")).toBe("blob:mock-12");
    expect(previewImage?.getAttribute("alt")).toBe("Share preview for @testuser");
    expect(dialog.querySelector("#share-card-root")).toBeNull();
    expect(testScope.container.textContent).not.toContain("Rendering final image...");
    expect(testScope.createObjectURLMock).toHaveBeenCalledTimes(1);
  });

  it("Share on X flow: footer swaps to paste hint, [OPEN X TAB] uses the stable share URL", async () => {
    await testScope.renderOpenPreview();
    await testScope.clickShareButton("SHARE ON X");
    expect(testScope.container.querySelector("[role='dialog']")).not.toBeNull();
    expect(testScope.container.textContent).toContain("IMAGE COPIED TO CLIPBOARD");
    expect(testScope.container.textContent).toMatch(/\[ (CTRL|CMD) \+ V \]/);
    expect(mockClipboard.write).toHaveBeenCalledTimes(1);

    const mockOpen = vi.spyOn(window, "open").mockImplementation(() => null);
    const openTabBtn = Array.from(testScope.container.querySelectorAll("button")).find((b) => b.textContent?.includes("OPEN X TAB"));
    expect(openTabBtn).not.toBeUndefined();

    await act(async () => { openTabBtn!.click(); });

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

  it("Share on LinkedIn flow uses the stable public share URL", async () => {
    await testScope.renderOpenPreview();
    await testScope.clickShareButton("SHARE ON LINKEDIN");
    expect(testScope.container.textContent).toContain("LINKEDIN WILL SHARE THE PUBLIC LINK DIRECTLY");
    expect(testScope.container.textContent).not.toContain("PRESS CTRL + V");
    expect(testScope.fetchMock).not.toHaveBeenCalledWith(shareCardResponse.imageUrl, { cache: "no-store" });
    expect(mockClipboard.write).not.toHaveBeenCalled();
    expect(mockClipboard.writeText).not.toHaveBeenCalled();

    const mockOpen = vi.spyOn(window, "open").mockImplementation(() => null);
    const openTabBtn = testScope.getButtonByLabel("OPEN LINKEDIN TAB");
    expect(openTabBtn).not.toBeUndefined();

    await act(async () => { openTabBtn!.click(); });

    expect(mockOpen).toHaveBeenCalledWith(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareCardResponse.shareUrl)}`, "_blank", "noopener,noreferrer");
    mockOpen.mockRestore();
  });

  it("keeps the LinkedIn offsite-share action available when image clipboard copy is unsupported", async () => {
    await testScope.renderOpenPreview();
    // @ts-expect-error - simulate browsers without ClipboardItem support
    globalThis.ClipboardItem = undefined;
    mockClipboard.write.mockRejectedValueOnce(new Error("Not supported"));
    await testScope.clickShareButton("SHARE ON LINKEDIN");
    expect(testScope.container.textContent).toContain("LINKEDIN WILL SHARE THE PUBLIC LINK DIRECTLY");
    expect(testScope.container.textContent).not.toContain("image copy not supported");
    expect(testScope.getButtonByLabel("OPEN LINKEDIN TAB")).not.toBeNull();
    expect(testScope.fetchMock).not.toHaveBeenCalledWith(shareCardResponse.imageUrl, { cache: "no-store" });
    expect(mockClipboard.write).not.toHaveBeenCalled();
    expect(mockClipboard.writeText).not.toHaveBeenCalled();
  });
});

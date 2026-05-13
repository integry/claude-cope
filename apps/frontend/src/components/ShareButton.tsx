import { useState, useCallback, useEffect, useRef, type CSSProperties } from "react";
import { createShareCard, type CreateShareCardResult } from "../api/shareCards";
import { copyBlobToClipboard, copyTextToClipboard, openShareIntent } from "./shareChatUtils";
import ShareCardRenderSurface from "./ShareCardRenderSurface";

type MountToken = { cancelled: boolean };
type SharePlatform = "twitter" | "linkedin";
type PasteHintState =
  | { platform: "twitter"; method: "image" | "link" }
  | { platform: "linkedin" };

const SPINNER_FRAMES = ["|", "/", "-", "\\"];
const modalStyle: CSSProperties = { fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace", fontSize: "13px", lineHeight: "1.4", backgroundColor: "#1e232b", border: "2px solid #ff5555", boxShadow: "8px 8px 0px rgba(0, 0, 0, 0.9)", maxWidth: "calc(100vw - 2rem)", maxHeight: "calc(100vh - 2rem)", overflow: "auto", color: "#c9d1d9" };
const modalHeaderStyle: CSSProperties = { padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ff5555" };
const modalTitleStyle: CSSProperties = { color: "#ff5555", fontWeight: "bold", fontSize: "11px" };
const closeButtonStyle: CSSProperties = { color: "#aaaaaa", cursor: "pointer", fontSize: "14px", background: "none", border: "none", padding: 0 };
const modalBodyStyle: CSSProperties = { padding: "12px" };
const modalFooterStyle: CSSProperties = { borderTop: "1px solid #ff5555", padding: "10px 12px" };
const pasteHintStyle: CSSProperties = { fontSize: "12px", lineHeight: "1.6", textAlign: "left" };
const emphasisStyle: CSSProperties = { color: "#ff5555", fontWeight: "bold" };
const highlightStyle: CSSProperties = { color: "#ffff55" };
const actionRowStyle: CSSProperties = { display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" };
const linkStyle: CSSProperties = { background: "none", border: "none", padding: "8px 0 0 0", cursor: "pointer", fontFamily: "inherit", fontSize: "12px", display: "block" };
const previewFrameStyle: CSSProperties = { display: "flex", justifyContent: "center", alignItems: "flex-start", overflow: "auto", maxWidth: "100%", maxHeight: "calc(100vh - 14rem)" };
const previewScaleWrapStyle: CSSProperties = { width: "min(100%, 760px)" };
const previewSurfaceStyle: CSSProperties = { position: "relative", width: "100%" };
const previewLayerBaseStyle: CSSProperties = { transition: "opacity 140ms ease-out" };
const previewLayerOverlayStyle: CSSProperties = { position: "absolute", inset: 0 };
const modalStatusStyle: CSSProperties = { fontSize: "12px", textAlign: "left" };
const modalStatusGeneratingStyle: CSSProperties = { ...modalStatusStyle, color: "#ffff55" };
const modalStatusErrorStyle: CSSProperties = { ...modalStatusStyle, color: "#ff5555" };

function isMacPlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  const uaData = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData;
  if (uaData?.platform) return uaData.platform.toLowerCase().includes("mac");
  return /mac/i.test(navigator.platform || "");
}

export function ShareButton({ userMessage, systemMessage, username, shareClaim }: { userMessage: string; systemMessage: string; username: string; shareClaim: string }) {
  const [status, setStatus] = useState<"idle" | "generating" | "copied" | "error">("idle");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [previewCard, setPreviewCard] = useState<CreateShareCardResult | null>(null);
  const [previewImageStatus, setPreviewImageStatus] = useState<"idle" | "loading" | "ready" | "failed">("idle");
  const [previewImageObjectUrl, setPreviewImageObjectUrl] = useState<string | null>(null);
  const [spinnerFrameIndex, setSpinnerFrameIndex] = useState(0);
  const [pasteHint, setPasteHint] = useState<PasteHintState | null>(null);
  const timeoutIds = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const previewSessionRef = useRef(0);
  const previewCreationAbortRef = useRef<AbortController | null>(null);
  const previewBlobRef = useRef<{ imageUrl: string; blob: Blob } | null>(null);
  const previewBlobRequestRef = useRef<{ imageUrl: string; request: Promise<Blob> } | null>(null);
  const previewImageObjectUrlRef = useRef<string | null>(null);

  const clearTimeouts = useCallback(() => {
    timeoutIds.current.forEach(clearTimeout);
    timeoutIds.current.clear();
  }, []);

  const addTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timeoutIds.current.delete(id);
      fn();
    }, ms);
    timeoutIds.current.add(id);
    return id;
  }, []);

  const mountTokenRef = useRef<MountToken>({ cancelled: false });

  useEffect(() => {
    const token: MountToken = { cancelled: false };
    mountTokenRef.current = token;
    return () => {
      token.cancelled = true;
      if (previewImageObjectUrlRef.current) {
        URL.revokeObjectURL(previewImageObjectUrlRef.current);
        previewImageObjectUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => () => { clearTimeouts(); }, [clearTimeouts]);
  useEffect(() => () => { previewCreationAbortRef.current?.abort(); }, []);
  useEffect(() => {
    const spinnerActive = status === "generating" || previewImageStatus === "loading";
    if (!spinnerActive) {
      setSpinnerFrameIndex(0);
      return;
    }

    const id = setInterval(() => {
      setSpinnerFrameIndex((current) => (current + 1) % SPINNER_FRAMES.length);
    }, 120);

    return () => clearInterval(id);
  }, [status, previewImageStatus]);

  const resetAfterDelay = useCallback((ms: number) => {
    clearTimeouts();
    addTimeout(() => {
      setStatus("idle");
      setFeedback(null);
      triggerRef.current?.focus();
    }, ms);
  }, [clearTimeouts, addTimeout]);

  const generatingRef = useRef(false);
  const sharingRef = useRef(false);

  const closePreview = useCallback((options?: { resetStatus?: boolean }) => {
    previewSessionRef.current += 1;
    previewCreationAbortRef.current?.abort();
    previewCreationAbortRef.current = null;
    generatingRef.current = false;
    sharingRef.current = false;
    clearTimeouts();
    setPreviewCard(null);
    setPreviewImageStatus("idle");
    if (previewImageObjectUrlRef.current) {
      URL.revokeObjectURL(previewImageObjectUrlRef.current);
      previewImageObjectUrlRef.current = null;
    }
    setPreviewImageObjectUrl(null);
    setPasteHint(null);
    if (options?.resetStatus !== false) {
      setStatus("idle");
      setFeedback(null);
    }
  }, [clearTimeouts]);

  const loadPreviewBlob = useCallback(async (imageUrl: string): Promise<Blob> => {
    const cached = previewBlobRef.current;
    if (cached && cached.imageUrl === imageUrl) return cached.blob;
    const inFlight = previewBlobRequestRef.current;
    if (inFlight && inFlight.imageUrl === imageUrl) return inFlight.request;
    const request = (async () => {
      const res = await fetch(imageUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      previewBlobRef.current = { imageUrl, blob };
      return blob;
    })();
    previewBlobRequestRef.current = { imageUrl, request };
    try {
      return await request;
    } finally {
      if (previewBlobRequestRef.current?.request === request) {
        previewBlobRequestRef.current = null;
      }
    }
  }, []);

  const prewarmPreviewImage = useCallback((imageUrl: string) => {
    if (previewBlobRef.current?.imageUrl === imageUrl || previewBlobRequestRef.current?.imageUrl === imageUrl) {
      return;
    }
    void loadPreviewBlob(imageUrl).catch(() => {
      // Best-effort warmup only; preview rendering should not fail if prewarm fails.
    });
  }, [loadPreviewBlob]);

  useEffect(() => {
    if (!previewCard) return;
    setPreviewImageStatus("loading");
    if (previewImageObjectUrlRef.current) {
      URL.revokeObjectURL(previewImageObjectUrlRef.current);
      previewImageObjectUrlRef.current = null;
    }
    setPreviewImageObjectUrl(null);

    let cancelled = false;
    const expectedImageUrl = previewCard.imageUrl;
    void loadPreviewBlob(expectedImageUrl)
      .then((blob) => {
        if (cancelled || previewCard.imageUrl !== expectedImageUrl) return;
        const objectUrl = URL.createObjectURL(blob);
        if (previewImageObjectUrlRef.current) {
          URL.revokeObjectURL(previewImageObjectUrlRef.current);
        }
        previewImageObjectUrlRef.current = objectUrl;
        setPreviewImageStatus("ready");
        setPreviewImageObjectUrl(objectUrl);
      })
      .catch(() => {
        if (cancelled) return;
        setPreviewImageStatus("failed");
      });

    return () => {
      cancelled = true;
    };
  }, [previewCard, loadPreviewBlob]);

  const handleOpenPreview = useCallback(async () => {
    if (generatingRef.current) return;
    generatingRef.current = true;
    const token = mountTokenRef.current;
    const sessionId = ++previewSessionRef.current;
    const abortController = new AbortController();
    previewCreationAbortRef.current = abortController;
    setStatus("generating");
    setFeedback("Creating share preview...");
    setPasteHint(null);

    try {
      const card = await createShareCard({
        shareClaim,
        signal: abortController.signal,
      });
      if (token.cancelled || sessionId !== previewSessionRef.current) return;
      if (previewBlobRef.current?.imageUrl !== card.imageUrl) previewBlobRef.current = null;
      setPreviewCard(card);
      prewarmPreviewImage(card.imageUrl);
      setStatus("idle");
      setFeedback(null);
    } catch (error) {
      if (token.cancelled || sessionId !== previewSessionRef.current) return;
      setStatus("error");
      setFeedback(error instanceof Error ? error.message : "Failed to create share preview.");
      resetAfterDelay(3000);
    } finally {
      if (previewCreationAbortRef.current === abortController) {
        previewCreationAbortRef.current = null;
      }
      if (sessionId === previewSessionRef.current) {
        generatingRef.current = false;
      }
    }
  }, [shareClaim, resetAfterDelay, prewarmPreviewImage]);

  const handleShare = useCallback(async (platform: SharePlatform) => {
    if (!previewCard || sharingRef.current) return;
    sharingRef.current = true;
    const token = mountTokenRef.current;
    const sessionId = previewSessionRef.current;

    try {
      if (platform === "linkedin") {
        setStatus("idle");
        setFeedback(null);
        setPasteHint({ platform: "linkedin" });
        addTimeout(() => setPasteHint(null), 30000);
        return;
      }
      setStatus("generating");
      setFeedback("Copying image to clipboard...");
      const previewBlob = await loadPreviewBlob(previewCard.imageUrl);
      if (token.cancelled || sessionId !== previewSessionRef.current) return;
      const imageCopied = await copyBlobToClipboard(previewBlob);
      if (token.cancelled || sessionId !== previewSessionRef.current) return;
      if (imageCopied) {
        setStatus("idle");
        setFeedback(null);
        setPasteHint({ platform: "twitter", method: "image" });
        addTimeout(() => setPasteHint(null), 30000);
        return;
      }
      const textCopied = await copyTextToClipboard(previewCard.shareUrl);
      if (token.cancelled || sessionId !== previewSessionRef.current) return;
      if (textCopied) {
        setStatus("idle");
        setFeedback(null);
        setPasteHint({ platform: "twitter", method: "link" });
        addTimeout(() => setPasteHint(null), 30000);
      } else {
        setPasteHint(null);
        closePreview({ resetStatus: false });
        setStatus("error");
        setFeedback("Failed to copy to clipboard. Please try again or check browser permissions.");
        resetAfterDelay(4000);
      }
    } catch {
      if (token.cancelled || sessionId !== previewSessionRef.current) return;
      setPasteHint(null);
      closePreview({ resetStatus: false });
      setStatus("error");
      setFeedback("Something went wrong. Please try again.");
      resetAfterDelay(4000);
    } finally {
      sharingRef.current = false;
    }
  }, [previewCard, loadPreviewBlob, addTimeout, closePreview, resetAfterDelay]);

  const handleOpenShareTarget = useCallback((platform: SharePlatform) => {
    if (!previewCard) return;
    openShareIntent(platform, previewCard.shareUrl);
    closePreview();
    triggerRef.current?.focus();
  }, [previewCard, closePreview]);

  const handleCopyImage = useCallback(async () => {
    if (!previewCard || sharingRef.current) return;
    sharingRef.current = true;
    const token = mountTokenRef.current;
    const sessionId = previewSessionRef.current;
    clearTimeouts();
    setStatus("generating");
    setFeedback("Copying image to clipboard...");
    try {
      const previewBlob = await loadPreviewBlob(previewCard.imageUrl);
      if (token.cancelled || sessionId !== previewSessionRef.current) return;
      const imageCopied = await copyBlobToClipboard(previewBlob);
      if (token.cancelled || sessionId !== previewSessionRef.current) return;
      if (imageCopied) {
        closePreview();
        setStatus("copied");
        setFeedback("Image copied to clipboard!");
        resetAfterDelay(3000);
        return;
      }
      const textCopied = await copyTextToClipboard(previewCard.shareUrl);
      if (token.cancelled || sessionId !== previewSessionRef.current) return;
      if (textCopied) {
        closePreview();
        setStatus("copied");
        setFeedback("Share link copied to clipboard (image copy not supported in this browser).");
        resetAfterDelay(3000);
        return;
      }

      closePreview();
      setStatus("error");
      setFeedback("Failed to copy to clipboard. Please try again or check browser permissions.");
      resetAfterDelay(3000);
    } catch {
      if (token.cancelled || sessionId !== previewSessionRef.current) return;
      closePreview();
      setStatus("error");
      setFeedback("Failed to copy image.");
      resetAfterDelay(3000);
    } finally {
      sharingRef.current = false;
    }
  }, [previewCard, clearTimeouts, loadPreviewBlob, closePreview, resetAfterDelay]);

  useEffect(() => {
    if (!previewCard) return;
    const modal = modalRef.current;
    if (modal) modal.querySelector<HTMLButtonElement>("[aria-label='Close']")?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closePreview();
        triggerRef.current?.focus();
        return;
      }

      if (e.key === "Tab" && modal) {
        const focusable = modal.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0]!;
        const last = focusable[focusable.length - 1]!;
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [previewCard, closePreview]);

  const isGenerating = status === "generating";
  const spinnerChar = SPINNER_FRAMES[spinnerFrameIndex]!;
  const isPreviewImageLoading = previewImageStatus === "loading";

  if (status !== "idle" && !previewCard) return (
    <span className="inline-flex items-center gap-2 ml-2 text-[11px] font-mono align-baseline">
      {isGenerating ? <><span className="text-yellow-400 animate-pulse">{spinnerChar} {feedback}</span><button onClick={() => closePreview()} className="font-mono text-[11px] text-gray-400 transition-colors hover:text-[#ff5555]">[cancel]</button></> : null}
      {status === "copied" && <span className="text-green-400">{feedback}</span>}
      {status === "error" && <span className="text-red-400">{feedback}</span>}
    </span>
  );

  return (
    <span className="relative ml-2 inline-flex align-baseline">
      <button
        ref={triggerRef}
        onClick={handleOpenPreview}
        className="font-mono text-[11px] text-gray-600 opacity-20 transition-all duration-200 hover:text-[#56b6c2] group-hover:opacity-100 group-hover:text-[#56b6c2]"
      >
        [share]
      </button>
      {previewCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => { closePreview(); triggerRef.current?.focus(); }}
          role="dialog"
          aria-modal="true"
          aria-label="Share preview"
        >
          <div className="absolute inset-0 bg-black opacity-70" />
          <div
            ref={modalRef}
            className="relative z-10"
            style={modalStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={modalHeaderStyle}>
              <span style={modalTitleStyle}>SHARE PREVIEW</span>
              <button onClick={() => { closePreview(); triggerRef.current?.focus(); }} style={closeButtonStyle} aria-label="Close">[x]</button>
            </div>
            <div style={modalBodyStyle}>
              <div style={previewFrameStyle}>
                <div style={previewScaleWrapStyle}>
                  <div style={previewSurfaceStyle}>
                    <div
                      style={{
                        ...previewLayerBaseStyle,
                        opacity: previewImageObjectUrl ? 0 : 1,
                      }}
                    >
                      <ShareCardRenderSurface
                        prompt={userMessage}
                        response={systemMessage}
                        username={username}
                      />
                    </div>
                    {previewImageObjectUrl ? (
                      <img
                        src={previewImageObjectUrl}
                        alt={`Share preview for @${username}`}
                        className="block h-auto w-full"
                        style={{
                          ...previewLayerBaseStyle,
                          ...previewLayerOverlayStyle,
                          opacity: 1,
                        }}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            <div style={modalFooterStyle}>
              {pasteHint ? (
                <div style={pasteHintStyle}>
                  <div style={emphasisStyle}>
                    {pasteHint.platform === "twitter" ? (
                      <>
                        {pasteHint.method === "image" ? (
                          <>
                            <div>{"> [SYSTEM] IMAGE COPIED TO CLIPBOARD."}</div>
                            <div>
                              {"> MANDATORY ACTION: GO TO THE NEW TAB AND PRESS "}
                              <span style={highlightStyle}>{`[ ${isMacPlatform() ? "CMD" : "CTRL"} + V ]`}</span>
                              {" TO PASTE."}
                            </div>
                          </>
                        ) : (
                          <>
                            <div>{"> [SYSTEM] SHARE LINK COPIED TO CLIPBOARD."}</div>
                            <div>{"> IMAGE COPY IS NOT SUPPORTED IN THIS BROWSER. OPEN X TO POST THE LINK."}</div>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <div>{"> [SYSTEM] LINKEDIN WILL SHARE THE PUBLIC LINK DIRECTLY."}</div>
                        <div>{"> ACTION: OPEN THE NEW TAB TO POST THE SHARE URL."}</div>
                      </>
                    )}
                  </div>
                  <button onClick={() => handleOpenShareTarget(pasteHint.platform)} className="share-popup-action" style={linkStyle}>
                    <span data-cursor="">{">"}</span>
                    <span data-btn="">{` [ OPEN ${pasteHint.platform === "twitter" ? "X" : "LINKEDIN"} TAB ]`}</span>
                  </button>
                </div>
              ) : isGenerating ? (
                <div style={modalStatusGeneratingStyle}>{spinnerChar} {feedback}</div>
              ) : isPreviewImageLoading ? (
                <div style={modalStatusGeneratingStyle}>{spinnerChar} Rendering final image...</div>
              ) : status === "error" && feedback ? (
                <div style={modalStatusErrorStyle}>{feedback}</div>
              ) : (
                <div style={actionRowStyle}>
                  {[{ label: "COPY IMAGE", onClick: handleCopyImage }, { label: "SHARE ON X", onClick: () => handleShare("twitter") }, { label: "SHARE ON LINKEDIN", onClick: () => handleShare("linkedin") }].map(({ label, onClick }) => (
                    <button
                      key={label}
                      onClick={onClick}
                      disabled={isGenerating}
                      className="share-popup-action"
                      style={{ ...closeButtonStyle, padding: 0, cursor: isGenerating ? "not-allowed" : "pointer", fontSize: "12px", opacity: isGenerating ? 0.5 : 1 }}
                    >
                      <span data-cursor="">{">"}</span>
                      <span data-btn="">{` [ ${label} ]`}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </span>
  );
}

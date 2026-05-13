import { useState, useCallback, useEffect, useRef } from "react";
import { createShareCard, type CreateShareCardResult } from "../api/shareCards";
import { openShareIntent } from "./shareChatUtils";

type MountToken = { cancelled: boolean };

const SPINNER_CHAR = "/";

function isMacPlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  const uaData = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData;
  if (uaData?.platform) return uaData.platform.toLowerCase().includes("mac");
  return /mac/i.test(navigator.platform || "");
}

async function copyBlobToClipboard(blob: Blob): Promise<boolean> {
  if (typeof ClipboardItem === "undefined") return false;
  try {
    await navigator.clipboard.write([new ClipboardItem({ [blob.type || "image/png"]: blob })]);
    return true;
  } catch {
    return false;
  }
}

async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function ShareButton({ userMessage, systemMessage, username }: { userMessage: string; systemMessage: string; username: string }) {
  const [status, setStatus] = useState<"idle" | "generating" | "copied" | "error">("idle");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [previewCard, setPreviewCard] = useState<CreateShareCardResult | null>(null);
  const [pasteHint, setPasteHint] = useState<{ platform: "twitter" | "linkedin" } | null>(null);
  const timeoutIds = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const previewSessionRef = useRef(0);
  const previewBlobRef = useRef<{ imageUrl: string; blob: Blob } | null>(null);
  const previewBlobRequestRef = useRef<{ imageUrl: string; request: Promise<Blob> } | null>(null);

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
    return () => { token.cancelled = true; };
  }, []);

  useEffect(() => {
    return () => { clearTimeouts(); };
  }, [clearTimeouts]);

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
    sharingRef.current = false;
    clearTimeouts();
    setPreviewCard(null);
    setPasteHint(null);
    if (options?.resetStatus !== false) {
      setStatus("idle");
      setFeedback(null);
    }
  }, [clearTimeouts]);

  const loadPreviewBlob = useCallback(async (imageUrl: string): Promise<Blob> => {
    const cached = previewBlobRef.current;
    if (cached && cached.imageUrl === imageUrl) {
      return cached.blob;
    }
    const inFlight = previewBlobRequestRef.current;
    if (inFlight && inFlight.imageUrl === imageUrl) {
      return inFlight.request;
    }

    const request = (async () => {
      const res = await fetch(imageUrl, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const bytes = await res.arrayBuffer();
      const blob = new Blob([bytes], {
        type: res.headers.get("Content-Type") || "image/png",
      });
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

  const handleOpenPreview = useCallback(async () => {
    if (generatingRef.current) return;
    generatingRef.current = true;
    const token = mountTokenRef.current;
    const sessionId = ++previewSessionRef.current;
    setStatus("generating");
    setFeedback("Creating share preview...");
    setPasteHint(null);

    try {
      const card = await createShareCard({
        prompt: userMessage,
        response: systemMessage,
        username,
      });
      if (token.cancelled || sessionId !== previewSessionRef.current) return;
      if (previewBlobRef.current?.imageUrl !== card.imageUrl) {
        previewBlobRef.current = null;
      }
      setPreviewCard(card);
      setStatus("idle");
      setFeedback(null);
    } catch {
      if (token.cancelled || sessionId !== previewSessionRef.current) return;
      setStatus("error");
      setFeedback("Failed to create share preview.");
      resetAfterDelay(3000);
    } finally {
      generatingRef.current = false;
    }
  }, [userMessage, systemMessage, username, resetAfterDelay]);

  const handleShare = useCallback(async (platform: "twitter" | "linkedin") => {
    if (!previewCard || sharingRef.current) return;
    sharingRef.current = true;
    const token = mountTokenRef.current;
    const sessionId = previewSessionRef.current;

    setStatus("generating");
    setFeedback("Copying image to clipboard...");

    try {
      const previewBlob = await loadPreviewBlob(previewCard.imageUrl);
      if (token.cancelled || sessionId !== previewSessionRef.current) return;
      const imageCopied = await copyBlobToClipboard(previewBlob);
      if (token.cancelled || sessionId !== previewSessionRef.current) return;

      if (imageCopied) {
        setStatus("idle");
        setFeedback(null);
        setPasteHint({ platform });
        addTimeout(() => setPasteHint(null), 30000);
        return;
      }

      const textCopied = await copyTextToClipboard(previewCard.shareUrl);
      if (token.cancelled || sessionId !== previewSessionRef.current) return;

      if (textCopied) {
        setPasteHint(null);
        closePreview({ resetStatus: false });
        setStatus("copied");
        setFeedback("Share link copied to clipboard (image copy not supported in this browser).");
        resetAfterDelay(4000);
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

  const handleOpenShareTarget = useCallback((platform: "twitter" | "linkedin") => {
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
      closePreview();

      const imageCopied = await copyBlobToClipboard(previewBlob);
      if (imageCopied) {
        setStatus("copied");
        setFeedback("Image copied to clipboard!");
        resetAfterDelay(3000);
        return;
      }

      const textCopied = await copyTextToClipboard(previewCard.shareUrl);
      if (textCopied) {
        setStatus("copied");
        setFeedback("Share link copied to clipboard (image copy not supported in this browser).");
        resetAfterDelay(3000);
        return;
      }

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
    if (modal) {
      const closeBtn = modal.querySelector<HTMLButtonElement>("[aria-label='Close']");
      closeBtn?.focus();
    }

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

  if (status !== "idle" && !previewCard) {
    return (
      <span className="inline-flex items-center gap-2 ml-2 text-[11px] font-mono align-baseline">
        {status === "generating" && <span className="text-yellow-400 animate-pulse">{SPINNER_CHAR} {feedback}</span>}
        {status === "copied" && <span className="text-green-400">{feedback}</span>}
        {status === "error" && <span className="text-red-400">{feedback}</span>}
      </span>
    );
  }

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
            style={{
              fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
              fontSize: "13px",
              lineHeight: "1.4",
              backgroundColor: "#1e232b",
              border: "2px solid #ff5555",
              boxShadow: "8px 8px 0px rgba(0, 0, 0, 0.9)",
              maxWidth: "calc(100vw - 2rem)",
              maxHeight: "calc(100vh - 2rem)",
              overflow: "auto",
              color: "#c9d1d9",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ff5555" }}>
              <span style={{ color: "#ff5555", fontWeight: "bold", fontSize: "11px" }}>SHARE PREVIEW</span>
              <button
                onClick={() => { closePreview(); triggerRef.current?.focus(); }}
                style={{ color: "#aaaaaa", cursor: "pointer", fontSize: "14px", background: "none", border: "none", padding: 0 }}
                aria-label="Close"
              >
                [x]
              </button>
            </div>
            <div style={{ padding: "12px" }}>
              <img
                src={previewCard.imageUrl}
                alt="Share preview"
                style={{ display: "block", maxWidth: "100%", maxHeight: "calc(100vh - 14rem)" }}
              />
            </div>
            <div style={{ borderTop: "1px solid #ff5555", padding: "10px 12px" }}>
              {pasteHint ? (
                <div style={{ fontSize: "12px", lineHeight: "1.6", textAlign: "left" }}>
                  <div style={{ color: "#ff5555", fontWeight: "bold" }}>
                    {pasteHint.platform === "twitter" ? (
                      <>
                        <div>{"> [SYSTEM] IMAGE COPIED TO CLIPBOARD."}</div>
                        <div>
                          {"> MANDATORY ACTION: GO TO THE NEW TAB AND PRESS "}
                          <span style={{ color: "#ffff55" }}>{`[ ${isMacPlatform() ? "CMD" : "CTRL"} + V ]`}</span>
                          {" TO PASTE."}
                        </div>
                      </>
                    ) : (
                      <>
                        <div>{"> [SYSTEM] LINKEDIN WILL SHARE THE PUBLIC LINK DIRECTLY."}</div>
                        <div>{"> ACTION: OPEN THE NEW TAB TO POST THE SHARE URL."}</div>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => handleOpenShareTarget(pasteHint.platform)}
                    className="share-popup-action"
                    style={{
                      background: "none",
                      border: "none",
                      padding: "8px 0 0 0",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: "12px",
                      display: "block",
                    }}
                  >
                    <span data-cursor="">{">"}</span>
                    <span data-btn="">{` [ OPEN ${pasteHint.platform === "twitter" ? "X" : "LINKEDIN"} TAB ]`}</span>
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                  {[
                    { label: "COPY IMAGE", onClick: handleCopyImage },
                    { label: "SHARE ON X", onClick: () => handleShare("twitter") },
                    { label: "SHARE ON LINKEDIN", onClick: () => handleShare("linkedin") },
                  ].map(({ label, onClick }) => (
                    <button
                      key={label}
                      onClick={onClick}
                      disabled={status === "generating"}
                      className="share-popup-action"
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: status === "generating" ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                        fontSize: "12px",
                        opacity: status === "generating" ? 0.5 : 1,
                      }}
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

import { useState, useCallback, useEffect, useRef } from "react";
import { shareChatImage, openShareIntent, getChatCardBlob } from "./shareChatUtils";
import type { ShareResult } from "./shareChatUtils";

/** Sentinel value that async callbacks compare against to bail out when the
 *  component has unmounted (or a newer request has superseded them). */
type MountToken = { cancelled: boolean };

const SPINNER_CHAR = "/";

/** Detect Mac so the paste hint can show CMD+V instead of CTRL+V.
 *  navigator.platform is deprecated but still ships everywhere; the modern
 *  userAgentData isn't on Safari/Firefox yet. Fall back to CTRL on the
 *  rare case both are unavailable (SSR, locked-down browsers). */
function isMacPlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  const uaData = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData;
  if (uaData?.platform) return uaData.platform.toLowerCase().includes("mac");
  return /mac/i.test(navigator.platform || "");
}

export function ShareButton({ userMessage, systemMessage, username }: { userMessage: string; systemMessage: string; username: string }) {
  const [status, setStatus] = useState<"idle" | "generating" | "copied" | "done" | "error">("idle");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pasteHint, setPasteHint] = useState<{ platform: "twitter" | "linkedin" } | null>(null);
  const timeoutIds = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

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

  // Mounted-state token: async callbacks bail out when cancelled.
  const mountTokenRef = useRef<MountToken>({ cancelled: false });

  // Cancel in-flight async work on unmount only.
  useEffect(() => {
    const token: MountToken = { cancelled: false };
    mountTokenRef.current = token;
    return () => { token.cancelled = true; };
  }, []);

  // Revoke stale object URLs when previewUrl changes.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Clean up timeouts on unmount.
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

  const closePreview = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewBlob(null);
    setPreviewUrl(null);
    setPasteHint(null);
  }, [previewUrl]);

  const generatingRef = useRef(false);

  const handleOpenPreview = useCallback(async () => {
    if (generatingRef.current) return;
    generatingRef.current = true;
    const token = mountTokenRef.current;
    setStatus("generating");
    setFeedback("Generating share image...");

    try {
      const blob = await getChatCardBlob(userMessage, systemMessage, username);
      if (token.cancelled) return;
      const url = URL.createObjectURL(blob);
      setPreviewBlob(blob);
      setPreviewUrl(url);
      setStatus("idle");
      setFeedback(null);
    } catch {
      if (token.cancelled) return;
      setStatus("error");
      setFeedback("Failed to generate preview.");
      resetAfterDelay(3000);
    } finally {
      generatingRef.current = false;
    }
  }, [userMessage, systemMessage, username, resetAfterDelay]);

  const executeShare = useCallback(async (
    opts: { platform?: "twitter" | "linkedin"; skipReset?: boolean },
    successHandler: (result: ShareResult, platform?: "twitter" | "linkedin") => void,
  ) => {
    const cachedBlob = previewBlob;
    const token = mountTokenRef.current;
    closePreview();
    clearTimeouts();
    setStatus("generating");
    setFeedback("Generating share image...");

    // Skip the artificial delay when the blob is already rendered.
    if (!cachedBlob) {
      await new Promise((r) => setTimeout(r, 800));
    }
    if (token.cancelled) return;

    try {
      const result: ShareResult = await shareChatImage({
        userMessage,
        systemMessage,
        openShareUrl: false,
        username,
        previewBlob: cachedBlob ?? undefined,
      });
      if (token.cancelled) return;
      successHandler(result, opts.platform);
    } catch {
      if (token.cancelled) return;
      setStatus("error");
      setFeedback(opts.platform ? "Something went wrong. Please try again." : "Failed to copy image.");
      // Always reset on error so the button doesn't get permanently stuck.
      resetAfterDelay(opts.platform ? 4000 : 3000);
      return;
    }

    if (!opts.skipReset) {
      resetAfterDelay(opts.platform ? 4000 : 3000);
    }
  }, [userMessage, systemMessage, username, previewBlob, closePreview, clearTimeouts, resetAfterDelay]);

  const handleShare = useCallback(async (platform: "twitter" | "linkedin") => {
    if (!previewBlob) return;
    const token = mountTokenRef.current;

    // Show a temporary generating state while the clipboard write runs.
    setStatus("generating");
    setFeedback("Copying image to clipboard...");

    try {
      const result: ShareResult = await shareChatImage({
        userMessage,
        systemMessage,
        openShareUrl: false,
        username,
        previewBlob,
      });
      if (token.cancelled) return;

      if (result.success && result.method === "image") {
        // Image successfully copied — show paste instructions.
        setStatus("idle");
        setFeedback(null);
        setPasteHint({ platform });
        addTimeout(() => setPasteHint(null), 30000);
      } else if (result.success && result.method === "text") {
        // Browser doesn't support image clipboard; text was copied instead.
        setPasteHint(null);
        setStatus("copied");
        setFeedback("Text copied to clipboard (image copy not supported in this browser).");
        closePreview();
        resetAfterDelay(4000);
      } else {
        setPasteHint(null);
        setStatus("error");
        setFeedback(result.message);
        closePreview();
        resetAfterDelay(4000);
      }
    } catch {
      if (token.cancelled) return;
      setPasteHint(null);
      setStatus("error");
      setFeedback("Something went wrong. Please try again.");
      closePreview();
      resetAfterDelay(4000);
    }
  }, [previewBlob, userMessage, systemMessage, username, addTimeout, closePreview, resetAfterDelay]);

  const handleOpenShareTarget = useCallback((platform: "twitter" | "linkedin") => {
    openShareIntent(platform);
    closePreview();
    triggerRef.current?.focus();
  }, [closePreview]);

  const handleCopyImage = useCallback(async () => {
    await executeShare({}, (result) => {
      if (result.success && result.method === "image") {
        setStatus("copied");
        setFeedback("Image copied to clipboard!");
      } else if (result.success && result.method === "text") {
        setStatus("copied");
        setFeedback("Text copied to clipboard (image copy not supported in this browser).");
      } else {
        setStatus(result.success ? "done" : "error");
        setFeedback(result.message);
      }
    });
  }, [executeShare]);

  // Focus trap and focus management for modal
  useEffect(() => {
    if (!previewUrl) return;

    // Focus the modal on open
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

      // Focus trap: Tab and Shift+Tab
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
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [previewUrl, closePreview]);

  // When actively showing feedback, render it inline
  if (status !== "idle" && !previewUrl) {
    return (
      <div className="flex items-center gap-2 mt-1 text-[11px] font-mono">
        {status === "generating" && <span className="text-yellow-400 animate-pulse">{SPINNER_CHAR} {feedback}</span>}
        {status === "copied" && <span className="text-green-400">{feedback}</span>}
        {status === "done" && <span className="text-green-400">{feedback}</span>}
        {status === "error" && <span className="text-red-400">{feedback}</span>}
      </div>
    );
  }

  return (
    <div className="relative flex justify-end mt-1">
      <button
        ref={triggerRef}
        onClick={handleOpenPreview}
        className="text-[11px] text-gray-600 hover:text-gray-400 transition-colors font-mono opacity-0 group-hover:opacity-100"
      >
        [share]
      </button>
      {previewUrl && (
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
                src={previewUrl}
                alt="Share preview"
                style={{ display: "block", maxWidth: "100%", maxHeight: "calc(100vh - 14rem)" }}
              />
            </div>
            <div style={{ borderTop: "1px solid #ff5555", padding: "10px 12px" }}>
              {pasteHint ? (
                <div style={{ fontSize: "12px", lineHeight: "1.6", textAlign: "left" }}>
                  <div style={{ color: "#ff5555", fontWeight: "bold" }}>
                    <div>{"> [SYSTEM] IMAGE COPIED TO CLIPBOARD."}</div>
                    <div>
                      {"> MANDATORY ACTION: GO TO THE NEW TAB AND PRESS "}
                      <span style={{ color: "#ffff55" }}>{`[ ${isMacPlatform() ? "CMD" : "CTRL"} + V ]`}</span>
                      {" TO PASTE."}
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenShareTarget(pasteHint.platform)}
                    style={{ background: "none", border: "none", padding: "8px 0 0 0", cursor: "pointer", fontFamily: "inherit", fontSize: "12px", display: "block" }}
                  >
                    <span style={{ color: "#4ade80", fontWeight: "bold" }}>{">"}</span>
                    <span style={{ color: "#4ade80", fontWeight: "bold" }}>{` [ OPEN ${pasteHint.platform === "twitter" ? "X" : "LINKEDIN"} TAB ]`}</span>
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
                      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", fontSize: "12px" }}
                    >
                      <span style={{ color: "#4ade80", fontWeight: "bold" }}>{">"}</span>
                      <span style={{ color: "#4ade80", fontWeight: "bold" }}>{` [ ${label} ]`}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

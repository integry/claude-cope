import { useState, useCallback, useEffect, useRef } from "react";
import { shareChatImage, openShareIntent, getChatCardBlob } from "./shareChatUtils";
import type { ShareResult } from "./shareChatUtils";

const SPINNER_FRAMES = ["/", "-", "\\", "|"];

export function ShareButton({ userMessage, systemMessage, username }: { userMessage: string; systemMessage: string; username: string }) {
  const [status, setStatus] = useState<"idle" | "generating" | "copied" | "done" | "error">("idle");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

  // Clean up timeouts and object URLs on unmount
  useEffect(() => {
    return () => {
      clearTimeouts();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [clearTimeouts, previewUrl]);

  const resetAfterDelay = useCallback((ms: number) => {
    clearTimeouts();
    addTimeout(() => {
      setStatus("idle");
      setFeedback(null);
    }, ms);
  }, [clearTimeouts, addTimeout]);

  const closePreview = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewBlob(null);
    setPreviewUrl(null);
  }, [previewUrl]);

  const handleOpenPreview = useCallback(async () => {
    setStatus("generating");
    setFeedback("Generating share image...");

    try {
      const blob = await getChatCardBlob(userMessage, systemMessage, username);
      const url = URL.createObjectURL(blob);
      setPreviewBlob(blob);
      setPreviewUrl(url);
      setStatus("idle");
      setFeedback(null);
    } catch {
      setStatus("error");
      setFeedback("Failed to generate preview.");
      resetAfterDelay(3000);
    }
  }, [userMessage, systemMessage, username, resetAfterDelay]);

  const executeShare = useCallback(async (
    opts: { platform?: "twitter" | "linkedin" },
    successHandler: (result: ShareResult, platform?: "twitter" | "linkedin") => void,
  ) => {
    const cachedBlob = previewBlob;
    closePreview();
    clearTimeouts();
    setStatus("generating");
    setFeedback("Generating share image...");

    await new Promise((r) => setTimeout(r, 800));

    try {
      const result: ShareResult = await shareChatImage({
        userMessage,
        systemMessage,
        openShareUrl: false,
        username,
        previewBlob: cachedBlob ?? undefined,
      });
      successHandler(result, opts.platform);
    } catch {
      setStatus("error");
      setFeedback(opts.platform ? "Something went wrong. Please try again." : "Failed to copy image.");
    }

    resetAfterDelay(opts.platform ? 4000 : 3000);
  }, [userMessage, systemMessage, username, previewBlob, closePreview, clearTimeouts, resetAfterDelay]);

  const handleShare = useCallback(async (platform: "twitter" | "linkedin") => {
    await executeShare({ platform }, (result, p) => {
      if (result.success && result.method === "image") {
        setStatus("copied");
        setFeedback("Image copied to clipboard!");
        setTimeout(() => {
          openShareIntent(p!);
          setStatus("done");
          if (p === "linkedin") {
            setFeedback("LinkedIn share opened! Note: LinkedIn's share dialog shares a link — your image is still on your clipboard if you'd like to post it separately.");
          } else {
            setFeedback("Share dialog opened! Paste the image in your post.");
          }
        }, 1200);
      } else if (result.success && result.method === "text") {
        setStatus("copied");
        setFeedback("Text copied to clipboard (image copy not supported).");
        setTimeout(() => {
          openShareIntent(p!);
          setStatus("done");
          if (p === "linkedin") {
            setFeedback("LinkedIn share opened! The link has been shared. Your copied text is on your clipboard.");
          } else {
            setFeedback("Share dialog opened! Paste the text in your post.");
          }
        }, 1200);
      } else if (result.success) {
        openShareIntent(p!);
        setStatus("done");
        setFeedback("Share dialog opened!");
      } else {
        setStatus("error");
        setFeedback(result.message);
      }
    });
  }, [executeShare]);

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
        {status === "generating" && <span className="text-yellow-400 animate-pulse">{SPINNER_FRAMES[0]} {feedback}</span>}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => { closePreview(); triggerRef.current?.focus(); }}
          role="dialog"
          aria-modal="true"
          aria-label="Share preview"
        >
          <div
            ref={modalRef}
            className="relative bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-4 max-w-[780px] w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { closePreview(); triggerRef.current?.focus(); }}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-300 text-lg font-mono"
              aria-label="Close"
            >
              x
            </button>
            <img
              src={previewUrl}
              alt="Share preview"
              className="w-full rounded border border-gray-700"
            />
            <div className="flex gap-2 mt-3 justify-center">
              <button
                onClick={handleCopyImage}
                className="px-3 py-1.5 text-[11px] font-mono text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white rounded border border-gray-600 transition-colors"
              >
                Copy image
              </button>
              <button
                onClick={() => handleShare("twitter")}
                className="px-3 py-1.5 text-[11px] font-mono text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white rounded border border-gray-600 transition-colors"
              >
                Share on X
              </button>
              <button
                onClick={() => handleShare("linkedin")}
                className="px-3 py-1.5 text-[11px] font-mono text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white rounded border border-gray-600 transition-colors"
              >
                Share on LinkedIn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

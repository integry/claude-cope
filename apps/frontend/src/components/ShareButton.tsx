import { useState, useCallback, useEffect, useRef } from "react";
import { shareChatImage, openShareIntent, getChatCardDataUrl } from "./shareChatUtils";
import type { ShareResult } from "./shareChatUtils";

const SPINNER_FRAMES = ["/", "-", "\\", "|"];

export function ShareButton({ userMessage, systemMessage, username }: { userMessage: string; systemMessage: string; username: string }) {
  const [status, setStatus] = useState<"idle" | "generating" | "copied" | "done" | "error">("idle");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const timeoutIds = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimeouts = useCallback(() => {
    timeoutIds.current.forEach(clearTimeout);
    timeoutIds.current = [];
  }, []);

  const addTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timeoutIds.current.push(id);
    return id;
  }, []);

  // Clean up timeouts on unmount
  useEffect(() => clearTimeouts, [clearTimeouts]);

  const handleOpenPreview = useCallback(async () => {
    setStatus("generating");
    setFeedback("Generating share image...");

    try {
      const url = await getChatCardDataUrl(userMessage, systemMessage, username);
      setPreviewUrl(url);
      setStatus("idle");
      setFeedback(null);
    } catch {
      setStatus("error");
      setFeedback("Failed to generate preview.");
      addTimeout(() => {
        setStatus("idle");
        setFeedback(null);
      }, 3000);
    }
  }, [userMessage, systemMessage, username, addTimeout]);

  const handleShare = useCallback(async (platform: "twitter" | "linkedin") => {
    setPreviewUrl(null);
    setStatus("generating");
    setFeedback("Generating share image...");

    await new Promise((r) => setTimeout(r, 800));

    try {
      const result: ShareResult = await shareChatImage({
        userMessage,
        systemMessage,
        platform,
        openShareUrl: false,
        username,
      });

      if (result.success && result.method === "image") {
        setStatus("copied");
        setFeedback("Image copied to clipboard!");
        await new Promise((r) => setTimeout(r, 1200));
        openShareIntent(platform);
        setStatus("done");
        setFeedback("Share dialog opened! Paste the image in your post.");
      } else if (result.success && result.method === "text") {
        setStatus("copied");
        setFeedback("Text copied to clipboard (image copy not supported).");
        await new Promise((r) => setTimeout(r, 1200));
        openShareIntent(platform);
        setStatus("done");
        setFeedback("Share dialog opened! Paste the text in your post.");
      } else if (result.success) {
        openShareIntent(platform);
        setStatus("done");
        setFeedback("Share dialog opened!");
      } else {
        setStatus("error");
        setFeedback(result.message);
      }
    } catch {
      setStatus("error");
      setFeedback("Something went wrong. Please try again.");
    }

    addTimeout(() => {
      setStatus("idle");
      setFeedback(null);
    }, 4000);
  }, [userMessage, systemMessage, username, addTimeout]);

  const handleCopyImage = useCallback(async () => {
    setPreviewUrl(null);
    setStatus("generating");
    setFeedback("Generating share image...");

    await new Promise((r) => setTimeout(r, 800));

    try {
      const result: ShareResult = await shareChatImage({
        userMessage,
        systemMessage,
        openShareUrl: false,
        username,
      });
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
    } catch {
      setStatus("error");
      setFeedback("Failed to copy image.");
    }

    addTimeout(() => {
      setStatus("idle");
      setFeedback(null);
    }, 3000);
  }, [userMessage, systemMessage, username, addTimeout]);

  // Close modal on Escape key
  useEffect(() => {
    if (!previewUrl) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewUrl(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [previewUrl]);

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
        onClick={handleOpenPreview}
        className="text-[11px] text-gray-600 hover:text-gray-400 transition-colors font-mono opacity-0 group-hover:opacity-100"
      >
        [share]
      </button>
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setPreviewUrl(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Share preview"
        >
          <div
            className="relative bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-4 max-w-[780px] w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-300 text-lg font-mono"
              aria-label="Close"
            >
              ✕
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

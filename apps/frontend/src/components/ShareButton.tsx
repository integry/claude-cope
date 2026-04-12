import { useState, useCallback } from "react";
import { shareChatImage } from "./shareChatUtils";
import type { ShareResult } from "./shareChatUtils";

const SPINNER_FRAMES = ["/", "-", "\\", "|"];

export function ShareButton({ userMessage, systemMessage, username, currentTD }: { userMessage: string; systemMessage: string; username: string; currentTD: number }) {
  const [status, setStatus] = useState<"idle" | "generating" | "copied" | "done" | "error">("idle");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleShare = useCallback(async (platform: "twitter" | "linkedin") => {
    setMenuOpen(false);
    setStatus("generating");
    setFeedback("Generating share image...");

    // Brief artificial delay so user sees the spinner
    await new Promise((r) => setTimeout(r, 800));

    try {
      const result: ShareResult = await shareChatImage({
        userMessage,
        systemMessage,
        platform,
        openShareUrl: false,
        username,
        currentTD,
      });

      if (result.success && result.method === "image") {
        setStatus("copied");
        setFeedback("Image copied to clipboard!");
        // Wait a moment so user sees the confirmation, then open share URL
        await new Promise((r) => setTimeout(r, 1200));
        const encodedText = encodeURIComponent(`> ${userMessage}\n\n${systemMessage}\n\n— via claudecope.com`);
        const url = platform === "twitter"
          ? `https://twitter.com/intent/tweet?text=${encodedText}`
          : `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://claudecope.com")}&summary=${encodedText}`;
        window.open(url, "_blank", "noopener,noreferrer");
        setStatus("done");
        setFeedback("Share dialog opened! Paste the image in your post.");
      } else {
        setStatus(result.success ? "done" : "error");
        setFeedback(result.message);
      }
    } catch {
      setStatus("error");
      setFeedback("Something went wrong. Please try again.");
    }

    setTimeout(() => {
      setStatus("idle");
      setFeedback(null);
    }, 4000);
  }, [userMessage, systemMessage, username, currentTD]);

  const handleCopyImage = useCallback(async () => {
    setMenuOpen(false);
    setStatus("generating");
    setFeedback("Generating share image...");

    await new Promise((r) => setTimeout(r, 800));

    try {
      const result: ShareResult = await shareChatImage({
        userMessage,
        systemMessage,
        openShareUrl: false,
        username,
        currentTD,
      });
      setStatus(result.success ? "copied" : "error");
      setFeedback(result.success ? "Image copied to clipboard!" : result.message);
    } catch {
      setStatus("error");
      setFeedback("Failed to copy image.");
    }

    setTimeout(() => {
      setStatus("idle");
      setFeedback(null);
    }, 3000);
  }, [userMessage, systemMessage, username, currentTD]);

  // When actively showing feedback, render it inline
  if (status !== "idle") {
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
        onClick={() => setMenuOpen((o) => !o)}
        className="text-[11px] text-gray-600 hover:text-gray-400 transition-colors font-mono opacity-0 group-hover:opacity-100"
      >
        [share]
      </button>
      {menuOpen && (
        <div className="absolute right-0 bottom-6 z-50 bg-gray-900 border border-gray-700 rounded shadow-lg py-1 min-w-[160px]">
          <button onClick={handleCopyImage} className="block w-full text-left px-3 py-1 text-[11px] font-mono text-gray-300 hover:bg-gray-800 hover:text-white">
            Copy image
          </button>
          <button onClick={() => handleShare("twitter")} className="block w-full text-left px-3 py-1 text-[11px] font-mono text-gray-300 hover:bg-gray-800 hover:text-white">
            Share on X
          </button>
          <button onClick={() => handleShare("linkedin")} className="block w-full text-left px-3 py-1 text-[11px] font-mono text-gray-300 hover:bg-gray-800 hover:text-white">
            Share on LinkedIn
          </button>
        </div>
      )}
    </div>
  );
}

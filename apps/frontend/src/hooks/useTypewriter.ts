import { useState, useEffect, useRef } from "react";

/**
 * Gradually reveals text line-by-line with randomized delays,
 * simulating a typewriter / streaming effect for system messages.
 */
export function useTypewriter(
  content: string,
  enabled: boolean
): { visibleContent: string; isTyping: boolean } {
  const lines = content.split("\n");
  const [visibleLineCount, setVisibleLineCount] = useState(enabled ? 0 : lines.length);
  const contentRef = useRef(content);
  const completedRef = useRef(!enabled);

  // If content changes (e.g. message updated), reset if we haven't started yet
  if (content !== contentRef.current) {
    contentRef.current = content;
    if (!enabled) {
      completedRef.current = true;
    }
  }

  useEffect(() => {
    const effectLines = content.split("\n");

    if (!enabled || completedRef.current) {
      setVisibleLineCount(effectLines.length);
      return;
    }

    // Start revealing after a small initial delay
    let timeout: ReturnType<typeof setTimeout>;

    const revealNext = (currentCount: number) => {
      if (currentCount >= effectLines.length) {
        completedRef.current = true;
        return;
      }

      // Base delay per line: 30-80ms for short lines, longer for content lines
      const line = effectLines[currentCount] || "";
      let delay: number;

      if (line.trim() === "") {
        // Blank lines: small pause
        delay = 20 + Math.random() * 40;
      } else if (currentCount > 0 && Math.random() < 0.15) {
        // ~15% chance of a "thinking" pause (200-600ms)
        delay = 200 + Math.random() * 400;
      } else {
        // Normal line reveal: 30-90ms, slightly longer for longer lines
        delay = 30 + Math.min(line.length * 0.8, 60) + Math.random() * 30;
      }

      timeout = setTimeout(() => {
        const next = currentCount + 1;
        setVisibleLineCount(next);
        revealNext(next);
      }, delay);
    };

    // Kick off with a tiny initial delay
    timeout = setTimeout(() => {
      setVisibleLineCount(1);
      revealNext(1);
    }, 40);

    return () => clearTimeout(timeout);
  }, [enabled, content]);

  if (!enabled || completedRef.current) {
    return { visibleContent: content, isTyping: false };
  }

  const visibleContent = lines.slice(0, visibleLineCount).join("\n");
  return { visibleContent, isTyping: visibleLineCount < lines.length };
}

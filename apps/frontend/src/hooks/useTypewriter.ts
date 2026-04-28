import { useState, useEffect, useRef } from "react";

/**
 * Gradually reveals text line-by-line with randomized delays,
 * simulating a typewriter / streaming effect for system messages.
 *
 * When `dialUpMode` is true, delays are drastically increased to simulate
 * an agonising dial-up connection for free-tier users.
 */
export function useTypewriter(
  content: string,
  enabled: boolean,
  dialUpMode = false,
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
      // In dial-up mode, all delays are dramatically increased
      const line = effectLines[currentCount] || "";
      let delay: number;

      if (dialUpMode) {
        // Dial-up mode: agonisingly slow character-by-character feel
        if (line.trim() === "") {
          delay = 150 + Math.random() * 200;
        } else if (currentCount > 0 && Math.random() < 0.25) {
          // 25% chance of a long "buffering" pause (800-2000ms)
          delay = 800 + Math.random() * 1200;
        } else {
          // Slow line reveal: 200-500ms per line, longer for longer lines
          delay = 200 + Math.min(line.length * 3, 300) + Math.random() * 100;
        }
      } else if (line.trim() === "") {
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

    // Kick off with an initial delay (longer in dial-up mode)
    timeout = setTimeout(() => {
      setVisibleLineCount(1);
      revealNext(1);
    }, dialUpMode ? 300 : 40);

    return () => clearTimeout(timeout);
  }, [enabled, content, dialUpMode]);

  if (!enabled || completedRef.current) {
    return { visibleContent: content, isTyping: false };
  }

  const visibleContent = lines.slice(0, visibleLineCount).join("\n");
  return { visibleContent, isTyping: visibleLineCount < lines.length };
}

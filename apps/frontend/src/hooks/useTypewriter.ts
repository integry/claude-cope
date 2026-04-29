import { useState, useEffect, useRef } from "react";

/**
 * Gradually reveals text with randomized delays, simulating a typewriter /
 * streaming effect for system messages.
 *
 * Normal mode: reveals line-by-line.
 * Dial-up mode (`dialUpMode`): reveals character-by-character to create an
 * agonising slow-connection feel — even single-line responses are throttled.
 */
export function useTypewriter(
  content: string,
  enabled: boolean,
  dialUpMode = false,
): { visibleContent: string; isTyping: boolean } {
  const lines = content.split("\n");
  const totalUnits = dialUpMode ? content.length : lines.length;
  const [visibleUnits, setVisibleUnits] = useState(enabled ? 0 : totalUnits);
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
    const effectContent = content;
    const effectLines = effectContent.split("\n");
    const effectTotal = dialUpMode ? effectContent.length : effectLines.length;

    if (!enabled || completedRef.current) {
      setVisibleUnits(effectTotal);
      return;
    }

    let timeout: ReturnType<typeof setTimeout>;

    if (dialUpMode) {
      // Character-by-character reveal for that dial-up feel
      const revealNextChar = (currentCount: number) => {
        if (currentCount >= effectContent.length) {
          completedRef.current = true;
          return;
        }

        const char = effectContent[currentCount];
        let delay: number;

        if (char === "\n") {
          // Newlines: longer pause like a line break loading
          delay = 100 + Math.random() * 150;
        } else if (currentCount > 0 && Math.random() < 0.05) {
          // 5% chance of a "buffering" pause (400-1200ms)
          delay = 400 + Math.random() * 800;
        } else {
          // Normal character delay: 20-60ms per character
          delay = 20 + Math.random() * 40;
        }

        timeout = setTimeout(() => {
          const next = currentCount + 1;
          setVisibleUnits(next);
          revealNextChar(next);
        }, delay);
      };

      // Kick off with an initial delay
      timeout = setTimeout(() => {
        setVisibleUnits(1);
        revealNextChar(1);
      }, 300);
    } else {
      // Line-by-line reveal (normal mode)
      const revealNext = (currentCount: number) => {
        if (currentCount >= effectLines.length) {
          completedRef.current = true;
          return;
        }

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
          setVisibleUnits(next);
          revealNext(next);
        }, delay);
      };

      // Kick off with an initial delay
      timeout = setTimeout(() => {
        setVisibleUnits(1);
        revealNext(1);
      }, 40);
    }

    return () => clearTimeout(timeout);
  }, [enabled, content, dialUpMode]);

  if (!enabled || completedRef.current) {
    return { visibleContent: content, isTyping: false };
  }

  const visibleContent = dialUpMode
    ? content.slice(0, visibleUnits)
    : lines.slice(0, visibleUnits).join("\n");
  const total = dialUpMode ? content.length : lines.length;
  return { visibleContent, isTyping: visibleUnits < total };
}

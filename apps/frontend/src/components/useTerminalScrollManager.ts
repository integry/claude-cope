import { useCallback, useEffect, useRef, type RefObject } from "react";
import type { Message } from "../hooks/useGameState";

type UseTerminalScrollManagerArgs = {
  history: Message[];
  messageKeys: number[];
  isMobileViewport: boolean;
  isProcessing: boolean;
  scrollViewportRef: RefObject<HTMLDivElement | null>;
  bottomRef: RefObject<HTMLDivElement | null>;
};

export function useTerminalScrollManager({
  history,
  messageKeys,
  isMobileViewport,
  isProcessing,
  scrollViewportRef,
  bottomRef,
}: UseTerminalScrollManagerArgs) {
  const hasScrolledTerminalToBottomOnLoadRef = useRef(false);
  const wasMobileRequestProcessingRef = useRef(false);
  const activeMobilePromptKeyRef = useRef<number | null>(null);
  const mobilePromptFollowFrameRef = useRef<number | null>(null);
  const mobilePromptFollowTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMobilePromptScrollHeightRef = useRef(0);
  const lastMobilePromptGrowthAtRef = useRef(0);

  const resolveScrollViewport = useCallback((): HTMLDivElement | null => {
    if (scrollViewportRef.current) return scrollViewportRef.current;
    if (typeof document === "undefined") return null;
    return document.querySelector<HTMLDivElement>('[data-terminal-scroll-viewport="true"]');
  }, [scrollViewportRef]);

  const stopMobilePromptFollowLoop = useCallback(() => {
    if (mobilePromptFollowFrameRef.current !== null && typeof cancelAnimationFrame === "function") {
      cancelAnimationFrame(mobilePromptFollowFrameRef.current);
    }
    mobilePromptFollowFrameRef.current = null;
    if (mobilePromptFollowTimeoutRef.current) {
      clearTimeout(mobilePromptFollowTimeoutRef.current);
    }
    mobilePromptFollowTimeoutRef.current = null;
  }, []);

  const scrollTerminalToBottom = useCallback(() => {
    const viewport = resolveScrollViewport();
    if (viewport) {
      requestAnimationFrame(() => {
        viewport.scrollTop = viewport.scrollHeight;
      });
      return;
    }
    if (typeof bottomRef.current?.scrollIntoView === "function") {
      bottomRef.current.scrollIntoView({ behavior: "auto", block: "end" });
    }
  }, [bottomRef, resolveScrollViewport]);

  useEffect(() => () => {
    stopMobilePromptFollowLoop();
  }, [stopMobilePromptFollowLoop]);

  useEffect(() => {
    if (hasScrolledTerminalToBottomOnLoadRef.current) return;
    hasScrolledTerminalToBottomOnLoadRef.current = true;
    scrollTerminalToBottom();
  }, [scrollTerminalToBottom]);

  useEffect(() => {
    if (isMobileViewport) return;
    scrollTerminalToBottom();
  }, [history, isMobileViewport, scrollTerminalToBottom]);

  useEffect(() => {
    if (!isMobileViewport) {
      wasMobileRequestProcessingRef.current = isProcessing;
      activeMobilePromptKeyRef.current = null;
      lastMobilePromptScrollHeightRef.current = 0;
      lastMobilePromptGrowthAtRef.current = 0;
      stopMobilePromptFollowLoop();
      return;
    }

    let latestPromptIndex = -1;
    for (let i = history.length - 1; i >= 0; i -= 1) {
      if (history[i]?.role === "user") {
        latestPromptIndex = i;
        break;
      }
    }
    if (latestPromptIndex < 0) return;

    const latestPromptKey = messageKeys[latestPromptIndex];
    if (latestPromptKey == null) return;

    const viewport = resolveScrollViewport();
    const justFinishedProcessing = wasMobileRequestProcessingRef.current && !isProcessing;
    if (isProcessing && activeMobilePromptKeyRef.current !== latestPromptKey) {
      activeMobilePromptKeyRef.current = latestPromptKey;
    }
    if (isProcessing && viewport) {
      lastMobilePromptScrollHeightRef.current = viewport.scrollHeight;
      lastMobilePromptGrowthAtRef.current = Date.now();
    } else if (justFinishedProcessing && viewport) {
      lastMobilePromptScrollHeightRef.current = viewport.scrollHeight;
      lastMobilePromptGrowthAtRef.current = Date.now();
    }

    const trackedPromptKey = activeMobilePromptKeyRef.current;
    const shouldTrack = trackedPromptKey === latestPromptKey && (isProcessing || justFinishedProcessing);
    wasMobileRequestProcessingRef.current = isProcessing;
    if (!shouldTrack || !viewport || typeof document === "undefined") return;

    stopMobilePromptFollowLoop();
    const runFollowFrame = () => {
      const currentPromptKey = activeMobilePromptKeyRef.current;
      if (currentPromptKey !== latestPromptKey) {
        mobilePromptFollowFrameRef.current = null;
        return;
      }

      const currentViewport = resolveScrollViewport();
      const target = document.querySelector<HTMLElement>(`[data-message-key="${latestPromptKey}"]`);
      if (!currentViewport || !target) {
        mobilePromptFollowFrameRef.current = null;
        return;
      }

      const viewportRect = currentViewport.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const promptReachedTop = targetRect.top <= viewportRect.top + 1;
      const maxScrollTop = currentViewport.scrollHeight - currentViewport.clientHeight;
      const now = Date.now();
      if (currentViewport.scrollHeight !== lastMobilePromptScrollHeightRef.current) {
        lastMobilePromptScrollHeightRef.current = currentViewport.scrollHeight;
        lastMobilePromptGrowthAtRef.current = now;
      }
      if (!promptReachedTop) {
        const remainingDistance = Math.max(0, maxScrollTop - currentViewport.scrollTop);
        const nextStep = remainingDistance > 0
          ? Math.max(12, Math.min(remainingDistance, remainingDistance * 0.18))
          : 0;
        currentViewport.scrollTop = Math.min(maxScrollTop, currentViewport.scrollTop + nextStep);
      }

      const quietMs = now - lastMobilePromptGrowthAtRef.current;
      const isStuckAtBottom = currentViewport.scrollTop >= maxScrollTop && !promptReachedTop;
      const shouldContinue =
        activeMobilePromptKeyRef.current === latestPromptKey &&
        !promptReachedTop &&
        (isProcessing || quietMs < 1000);
      if (shouldContinue) {
        if (isStuckAtBottom && !isProcessing) {
          mobilePromptFollowTimeoutRef.current = setTimeout(() => {
            mobilePromptFollowTimeoutRef.current = null;
            mobilePromptFollowFrameRef.current = requestAnimationFrame(runFollowFrame);
          }, 80);
        } else {
          mobilePromptFollowFrameRef.current = requestAnimationFrame(runFollowFrame);
        }
        return;
      }

      if (promptReachedTop) activeMobilePromptKeyRef.current = null;
      mobilePromptFollowFrameRef.current = null;
    };

    mobilePromptFollowFrameRef.current = requestAnimationFrame(runFollowFrame);
  }, [history, isMobileViewport, isProcessing, messageKeys, resolveScrollViewport, stopMobilePromptFollowLoop]);

  return { scrollTerminalToBottom };
}

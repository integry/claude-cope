import { useCallback, useEffect, useRef } from "react";
import type { Message } from "../hooks/useGameState";

type UseMobilePromptFollowArgs = {
  history: Message[];
  isMobileViewport: boolean;
  isProcessing: boolean;
  messageKeys: number[];
  resolveScrollViewport: () => HTMLDivElement | null;
};

export function useMobilePromptFollow({
  history,
  isMobileViewport,
  isProcessing,
  messageKeys,
  resolveScrollViewport,
}: UseMobilePromptFollowArgs) {
  const wasMobileRequestProcessingRef = useRef(false);
  const activeMobilePromptKeyRef = useRef<number | null>(null);
  const mobilePromptFollowFrameRef = useRef<number | null>(null);
  const mobilePromptFollowTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMobilePromptScrollHeightRef = useRef(0);
  const lastMobilePromptGrowthAtRef = useRef(0);

  const stopMobilePromptFollowLoop = useCallback(() => {
    if (mobilePromptFollowFrameRef.current !== null && typeof cancelAnimationFrame === "function") {
      cancelAnimationFrame(mobilePromptFollowFrameRef.current);
    }
    mobilePromptFollowFrameRef.current = null;
    if (mobilePromptFollowTimeoutRef.current) clearTimeout(mobilePromptFollowTimeoutRef.current);
    mobilePromptFollowTimeoutRef.current = null;
  }, []);

  useEffect(() => () => {
    stopMobilePromptFollowLoop();
  }, [stopMobilePromptFollowLoop]);

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
    if (latestPromptKey == null || typeof document === "undefined") return;

    const viewport = resolveScrollViewport();
    const justFinishedProcessing = wasMobileRequestProcessingRef.current && !isProcessing;
    if (isProcessing && activeMobilePromptKeyRef.current !== latestPromptKey) {
      activeMobilePromptKeyRef.current = latestPromptKey;
    }
    if ((isProcessing || justFinishedProcessing) && viewport) {
      lastMobilePromptScrollHeightRef.current = viewport.scrollHeight;
      lastMobilePromptGrowthAtRef.current = Date.now();
    }

    const trackedPromptKey = activeMobilePromptKeyRef.current;
    const shouldTrack = trackedPromptKey === latestPromptKey && (isProcessing || justFinishedProcessing);
    wasMobileRequestProcessingRef.current = isProcessing;
    if (!shouldTrack || !viewport) return;

    stopMobilePromptFollowLoop();
    const runFollowFrame = () => {
      if (activeMobilePromptKeyRef.current !== latestPromptKey) {
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
        const nextStep = remainingDistance > 0 ? Math.max(12, Math.min(remainingDistance, remainingDistance * 0.18)) : 0;
        currentViewport.scrollTop = Math.min(maxScrollTop, currentViewport.scrollTop + nextStep);
      }

      const quietMs = now - lastMobilePromptGrowthAtRef.current;
      const isStuckAtBottom = currentViewport.scrollTop >= maxScrollTop && !promptReachedTop;
      const shouldContinue = activeMobilePromptKeyRef.current === latestPromptKey && !promptReachedTop && (isProcessing || quietMs < 1000);
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
    return stopMobilePromptFollowLoop;
  }, [history, isMobileViewport, isProcessing, messageKeys, resolveScrollViewport, stopMobilePromptFollowLoop]);
}

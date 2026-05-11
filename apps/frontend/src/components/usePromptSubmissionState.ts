import { useCallback, useRef, useState } from "react";

type PromptAbortHandle = { abort: () => void };

export function usePromptSubmissionState() {
  const [isProcessing, setIsProcessing] = useState(false);
  const abortControllerRef = useRef<PromptAbortHandle | null>(null);
  const activeAbortControllersRef = useRef(new Set<AbortController>());
  const activePromptCountRef = useRef(0);

  const syncAbortControllerHandle = useCallback(() => {
    abortControllerRef.current = activeAbortControllersRef.current.size === 0
      ? null
      : {
          abort: () => {
            Array.from(activeAbortControllersRef.current).forEach((controller) =>
              controller.abort(),
            );
          },
        };
  }, []);

  const syncPromptProcessingState = useCallback(() => {
    setIsProcessing(activePromptCountRef.current > 0);
  }, []);

  const startPromptProcessing = useCallback(() => {
    activePromptCountRef.current += 1;
    setIsProcessing(true);
  }, []);

  const finishPromptProcessing = useCallback(() => {
    activePromptCountRef.current = Math.max(0, activePromptCountRef.current - 1);
    syncPromptProcessingState();
  }, [syncPromptProcessingState]);

  const resetPromptProcessing = useCallback(() => {
    activePromptCountRef.current = 0;
    setIsProcessing(false);
  }, []);

  const trackAbortController = useCallback((controller: AbortController) => {
    activeAbortControllersRef.current.add(controller);
    syncAbortControllerHandle();
  }, [syncAbortControllerHandle]);

  const untrackAbortController = useCallback((controller: AbortController) => {
    if (!activeAbortControllersRef.current.delete(controller)) return;
    syncAbortControllerHandle();
  }, [syncAbortControllerHandle]);

  const createPromptProcessingSetter = useCallback((controller: AbortController) => {
    let promptProcessingActive = true;
    let controllerReleased = false;

    const releaseController = () => {
      if (controllerReleased) return;
      controllerReleased = true;
      untrackAbortController(controller);
    };

    return (value: boolean | ((prev: boolean) => boolean)) => {
      const nextValue = typeof value === "function" ? value(promptProcessingActive) : value;
      if (nextValue === promptProcessingActive) {
        if (!nextValue) releaseController();
        return;
      }
      promptProcessingActive = nextValue;
      if (promptProcessingActive) {
        startPromptProcessing();
        return;
      }
      releaseController();
      finishPromptProcessing();
    };
  }, [finishPromptProcessing, startPromptProcessing, untrackAbortController]);

  return {
    abortControllerRef,
    createPromptProcessingSetter,
    finishPromptProcessing,
    isProcessing,
    resetPromptProcessing,
    setIsProcessing,
    startPromptProcessing,
    trackAbortController,
    untrackAbortController,
  };
}

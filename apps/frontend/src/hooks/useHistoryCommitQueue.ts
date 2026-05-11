import { useCallback, useEffect, useRef } from "react";

export function useHistoryCommitQueue(historyLength: number) {
  const pendingCallbacksRef = useRef<Array<() => void>>([]);

  useEffect(() => {
    if (pendingCallbacksRef.current.length === 0) {
      return;
    }
    const callbacks = pendingCallbacksRef.current.splice(0);
    callbacks.forEach((callback) => callback());
  }, [historyLength]);

  return useCallback((callback: () => void) => {
    pendingCallbacksRef.current.push(callback);
  }, []);
}

import { useCallback, useEffect, useRef } from "react";
import { createShareCard, type CreateShareCardResult } from "../api/shareCards";

type NativeShareCardCache = { shareClaim: string; card: CreateShareCardResult };
type NativeShareCardRequest = { shareClaim: string; request: Promise<CreateShareCardResult> };

export function useNativeShareCard(shareClaim: string) {
  const nativeShareCardRef = useRef<NativeShareCardCache | null>(null);
  const nativeShareCardRequestRef = useRef<NativeShareCardRequest | null>(null);
  const nativeShareCardAbortRef = useRef<AbortController | null>(null);
  const nativeShareCardGenerationRef = useRef(0);

  const resetNativeShareCardCache = useCallback(() => {
    nativeShareCardGenerationRef.current += 1;
    nativeShareCardAbortRef.current?.abort();
    nativeShareCardAbortRef.current = null;
    nativeShareCardRef.current = null;
    nativeShareCardRequestRef.current = null;
  }, []);

  const invalidateStaleNativeShareCache = useCallback((expectedShareClaim: string) => {
    const cachedCard = nativeShareCardRef.current;
    const inFlightRequest = nativeShareCardRequestRef.current;
    if (cachedCard?.shareClaim === expectedShareClaim && (!inFlightRequest || inFlightRequest.shareClaim === expectedShareClaim)) {
      return;
    }

    nativeShareCardGenerationRef.current += 1;
    nativeShareCardAbortRef.current?.abort();
    nativeShareCardAbortRef.current = null;
    if (cachedCard?.shareClaim !== expectedShareClaim) {
      nativeShareCardRef.current = null;
    }
    if (inFlightRequest?.shareClaim !== expectedShareClaim) {
      nativeShareCardRequestRef.current = null;
    }
  }, []);

  const getCachedNativeShareCard = useCallback((expectedShareClaim: string) => {
    return nativeShareCardRef.current?.shareClaim === expectedShareClaim ? nativeShareCardRef.current.card : null;
  }, []);

  const requestNativeShareCard = useCallback(() => {
    invalidateStaleNativeShareCache(shareClaim);

    const cachedCard = getCachedNativeShareCard(shareClaim);
    if (cachedCard) return Promise.resolve(cachedCard);

    if (nativeShareCardRequestRef.current?.shareClaim === shareClaim) {
      return nativeShareCardRequestRef.current.request;
    }

    const generation = nativeShareCardGenerationRef.current;
    const abortController = new AbortController();
    nativeShareCardAbortRef.current = abortController;

    const request = createShareCard({ shareClaim, signal: abortController.signal })
      .then((card) => {
        if (abortController.signal.aborted || generation !== nativeShareCardGenerationRef.current) {
          throw new DOMException("The operation was aborted.", "AbortError");
        }
        nativeShareCardRef.current = { shareClaim, card };
        return card;
      })
      .finally(() => {
        if (nativeShareCardRequestRef.current?.request === request) {
          nativeShareCardRequestRef.current = null;
        }
        if (nativeShareCardAbortRef.current === abortController) {
          nativeShareCardAbortRef.current = null;
        }
      });

    nativeShareCardRequestRef.current = { shareClaim, request };
    return request;
  }, [getCachedNativeShareCard, invalidateStaleNativeShareCache, shareClaim]);

  useEffect(() => () => {
    nativeShareCardAbortRef.current?.abort();
  }, []);

  return {
    getCachedNativeShareCard,
    invalidateStaleNativeShareCache,
    requestNativeShareCard,
    resetNativeShareCardCache,
  };
}

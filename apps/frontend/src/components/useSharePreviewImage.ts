import { useCallback, useEffect, useRef, useState } from "react";
import type { CreateShareCardResult } from "../api/shareCards";

type PreviewImageStatus = "idle" | "loading" | "ready" | "failed";

export function useSharePreviewImage(previewCard: CreateShareCardResult | null) {
  const [previewImageStatus, setPreviewImageStatus] = useState<PreviewImageStatus>("idle");
  const [previewImageObjectUrl, setPreviewImageObjectUrl] = useState<string | null>(null);
  const previewBlobRef = useRef<{ imageUrl: string; blob: Blob } | null>(null);
  const previewBlobRequestRef = useRef<{ imageUrl: string; request: Promise<Blob> } | null>(null);
  const previewImageObjectUrlRef = useRef<string | null>(null);

  const resetPreviewImage = useCallback(() => {
    setPreviewImageStatus("idle");
    if (previewImageObjectUrlRef.current) {
      URL.revokeObjectURL(previewImageObjectUrlRef.current);
      previewImageObjectUrlRef.current = null;
    }
    setPreviewImageObjectUrl(null);
  }, []);

  useEffect(() => () => {
    if (previewImageObjectUrlRef.current) {
      URL.revokeObjectURL(previewImageObjectUrlRef.current);
      previewImageObjectUrlRef.current = null;
    }
  }, []);

  const loadPreviewBlob = useCallback(async (imageUrl: string): Promise<Blob> => {
    const cached = previewBlobRef.current;
    if (cached && cached.imageUrl === imageUrl) return cached.blob;

    const inFlight = previewBlobRequestRef.current;
    if (inFlight && inFlight.imageUrl === imageUrl) return inFlight.request;

    const request = (async () => {
      const res = await fetch(imageUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      previewBlobRef.current = { imageUrl, blob };
      return blob;
    })();

    previewBlobRequestRef.current = { imageUrl, request };
    try {
      return await request;
    } finally {
      if (previewBlobRequestRef.current?.request === request) {
        previewBlobRequestRef.current = null;
      }
    }
  }, []);

  const prewarmPreviewImage = useCallback((imageUrl: string) => {
    if (previewBlobRef.current?.imageUrl === imageUrl || previewBlobRequestRef.current?.imageUrl === imageUrl) {
      return;
    }

    void loadPreviewBlob(imageUrl).catch(() => {
      // Warmup only; fallback rendering handles the failure path.
    });
  }, [loadPreviewBlob]);

  useEffect(() => {
    if (!previewCard) {
      resetPreviewImage();
      return;
    }

    setPreviewImageStatus("loading");
    if (previewImageObjectUrlRef.current) {
      URL.revokeObjectURL(previewImageObjectUrlRef.current);
      previewImageObjectUrlRef.current = null;
    }
    setPreviewImageObjectUrl(null);

    let cancelled = false;
    const expectedImageUrl = previewCard.imageUrl;

    void loadPreviewBlob(expectedImageUrl)
      .then((blob) => {
        if (cancelled || previewCard.imageUrl !== expectedImageUrl) return;
        const objectUrl = URL.createObjectURL(blob);
        if (previewImageObjectUrlRef.current) {
          URL.revokeObjectURL(previewImageObjectUrlRef.current);
        }
        previewImageObjectUrlRef.current = objectUrl;
        setPreviewImageStatus("ready");
        setPreviewImageObjectUrl(objectUrl);
      })
      .catch(() => {
        if (cancelled) return;
        setPreviewImageStatus("failed");
      });

    return () => {
      cancelled = true;
    };
  }, [previewCard, loadPreviewBlob, resetPreviewImage]);

  return {
    loadPreviewBlob,
    previewImageObjectUrl,
    previewImageStatus,
    prewarmPreviewImage,
    resetPreviewImage,
  };
}

import { useState, useCallback, useEffect, useRef } from "react";
import { createShareCard, type CreateShareCardResult } from "../api/shareCards";
import { copyBlobToClipboard, copyTextToClipboard, openShareIntent } from "./shareChatUtils";
import { isNativeShareCancellation } from "./shareButtonNativeShare";
import { getTransientUserActivationState, shouldUseNativeShareFlow } from "./shareButtonBrowser";
import { ShareButtonInlineStatus, ShareButtonPreviewModal, type ShareButtonPreviewActions, type ShareButtonPreviewModel } from "./ShareButtonPreviewModal";
import { useNativeShareCard } from "./useNativeShareCard";
import { useSharePreviewImage } from "./useSharePreviewImage";

type MountToken = { cancelled: boolean };
type SharePlatform = "twitter" | "linkedin";
type PasteHintState = { platform: "twitter"; method: "image" | "link" } | { platform: "linkedin" };

const SPINNER_FRAMES = ["|", "/", "-", "\\"];

export function ShareButton({ userMessage, systemMessage, username, shareClaim }: { userMessage: string; systemMessage: string; username: string; shareClaim: string }) {
  const [status, setStatus] = useState<"idle" | "generating" | "copied" | "error">("idle");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [previewCard, setPreviewCard] = useState<CreateShareCardResult | null>(null);
  const [spinnerFrameIndex, setSpinnerFrameIndex] = useState(0);
  const [pasteHint, setPasteHint] = useState<PasteHintState | null>(null);
  const timeoutIds = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const previewSessionRef = useRef(0);
  const previewCreationAbortRef = useRef<AbortController | null>(null);
  const { getCachedNativeShareCard, invalidateStaleNativeShareCache, requestNativeShareCard, resetNativeShareCardCache } = useNativeShareCard(shareClaim);
  const { loadPreviewBlob, previewImageObjectUrl, previewImageStatus, prewarmPreviewImage, resetPreviewImage } = useSharePreviewImage(previewCard);

  const clearTimeouts = useCallback(() => {
    timeoutIds.current.forEach(clearTimeout);
    timeoutIds.current.clear();
  }, []);

  const addTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timeoutIds.current.delete(id);
      fn();
    }, ms);
    timeoutIds.current.add(id);
    return id;
  }, []);

  const mountTokenRef = useRef<MountToken>({ cancelled: false });

  useEffect(() => {
    const token: MountToken = { cancelled: false };
    mountTokenRef.current = token;
    return () => {
      token.cancelled = true;
    };
  }, []);

  useEffect(() => () => { clearTimeouts(); }, [clearTimeouts]);
  useEffect(() => () => { previewCreationAbortRef.current?.abort(); }, []);
  useEffect(() => {
    const spinnerActive = status === "generating" || previewImageStatus === "loading";
    if (!spinnerActive) {
      setSpinnerFrameIndex(0);
      return;
    }

    const id = setInterval(() => {
      setSpinnerFrameIndex((current) => (current + 1) % SPINNER_FRAMES.length);
    }, 120);

    return () => clearInterval(id);
  }, [status, previewImageStatus]);

  const resetAfterDelay = useCallback((ms: number) => {
    clearTimeouts();
    addTimeout(() => { setStatus("idle"); setFeedback(null); triggerRef.current?.focus(); }, ms);
  }, [clearTimeouts, addTimeout]);

  const generatingRef = useRef(false);
  const sharingRef = useRef(false);

  const resetPreviewState = useCallback((options?: { resetStatus?: boolean; resetNativeShareCardCache?: boolean }) => {
    previewSessionRef.current += 1;
    previewCreationAbortRef.current?.abort();
    previewCreationAbortRef.current = null;
    generatingRef.current = false;
    sharingRef.current = false;
    if (options?.resetNativeShareCardCache) {
      resetNativeShareCardCache();
    }
    clearTimeouts();
    setPreviewCard(null);
    resetPreviewImage();
    setPasteHint(null);
    if (options?.resetStatus !== false) {
      setStatus("idle");
      setFeedback(null);
    }
  }, [clearTimeouts, resetNativeShareCardCache, resetPreviewImage]);

  const closePreview = useCallback((options?: { resetStatus?: boolean }) => { resetPreviewState(options); }, [resetPreviewState]);

  const openPreviewCard = useCallback((card: CreateShareCardResult) => {
    setPreviewCard(card);
    prewarmPreviewImage(card.imageUrl);
    setStatus("idle");
    setFeedback(null);
  }, [prewarmPreviewImage]);

  useEffect(() => {
    resetPreviewState({ resetNativeShareCardCache: true });
  }, [shareClaim, resetPreviewState]);

  const tryNativeShare = useCallback(async (card: CreateShareCardResult, token: MountToken, sessionId: number): Promise<"shared" | "cancelled" | "fallback"> => {
    try {
      await navigator.share({
        title: `Claude Cope chat by @${username}`,
        text: userMessage.trim().slice(0, 140) || undefined,
        url: card.shareUrl,
      });
      if (token.cancelled || sessionId !== previewSessionRef.current) return "shared";
      setStatus("idle");
      setFeedback(null);
      return "shared";
    } catch (error) {
      if (token.cancelled || sessionId !== previewSessionRef.current) return "shared";
      if (isNativeShareCancellation(error)) {
        setStatus("idle");
        setFeedback(null);
        return "cancelled";
      }
      return "fallback";
    }
  }, [username, userMessage]);

  const canAttemptImmediateNativeShare = useCallback((shareClaimValue: string) => {
    invalidateStaleNativeShareCache(shareClaimValue);
    return getCachedNativeShareCard(shareClaimValue);
  }, [getCachedNativeShareCard, invalidateStaleNativeShareCache]);

  const trySharingExistingNativeCard = useCallback(async (shareClaimValue: string, token: MountToken, sessionId: number) => {
    const nativeShareCard = canAttemptImmediateNativeShare(shareClaimValue);
    if (!nativeShareCard) {
      return false;
    }
    const nativeShareResult = await tryNativeShare(nativeShareCard, token, sessionId);
    if (nativeShareResult !== "fallback") {
      return true;
    }
    openPreviewCard(nativeShareCard);
    return true;
  }, [canAttemptImmediateNativeShare, openPreviewCard, tryNativeShare]);

  const createPreviewCard = useCallback((useNativeShareFlow: boolean, abortController: AbortController) => (
    useNativeShareFlow
      ? requestNativeShareCard({ signal: abortController.signal })
      : createShareCard({ shareClaim, signal: abortController.signal })
  ), [requestNativeShareCard, shareClaim]);

  const maybeHandleNativeShareForNewCard = useCallback(async (card: CreateShareCardResult, activationAtStart: boolean | null, token: MountToken, sessionId: number) => {
    const activationBeforeShare = getTransientUserActivationState();
    if (activationAtStart === false || activationBeforeShare === false) {
      openPreviewCard(card);
      return true;
    }
    const nativeShareResult = await tryNativeShare(card, token, sessionId);
    if (nativeShareResult !== "fallback") {
      return true;
    }
    return false;
  }, [openPreviewCard, tryNativeShare]);

  const handleOpenPreview = useCallback(async () => {
    if (generatingRef.current) return;
    generatingRef.current = true;
    const token = mountTokenRef.current;
    const sessionId = ++previewSessionRef.current;
    const abortController = new AbortController();
    previewCreationAbortRef.current = abortController;
    setStatus("generating");
    setFeedback("Creating share preview...");
    setPasteHint(null);

    try {
      const useNativeShareFlow = shouldUseNativeShareFlow();
      const activationAtStart = useNativeShareFlow ? getTransientUserActivationState() : null;

      if (useNativeShareFlow) {
        const handledCachedShare = await trySharingExistingNativeCard(shareClaim, token, sessionId);
        if (handledCachedShare) {
          return;
        }
      }

      const card = await createPreviewCard(useNativeShareFlow, abortController);
      if (token.cancelled || sessionId !== previewSessionRef.current) return;

      if (useNativeShareFlow && await maybeHandleNativeShareForNewCard(card, activationAtStart, token, sessionId)) return;
      openPreviewCard(card);
    } catch (error) {
      if (token.cancelled || sessionId !== previewSessionRef.current) return;
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStatus("error");
      setFeedback(error instanceof Error ? error.message : "Failed to create share preview.");
      resetAfterDelay(3000);
    } finally {
      if (previewCreationAbortRef.current === abortController) {
        previewCreationAbortRef.current = null;
      }
      if (sessionId === previewSessionRef.current) {
        generatingRef.current = false;
      }
    }
  }, [createPreviewCard, maybeHandleNativeShareForNewCard, shareClaim, resetAfterDelay, openPreviewCard, trySharingExistingNativeCard]);

  const handleShare = useCallback(async (platform: SharePlatform) => {
    if (!previewCard || sharingRef.current) return;
    sharingRef.current = true;
    const token = mountTokenRef.current;
    const sessionId = previewSessionRef.current;

    try {
      if (platform === "linkedin") {
        setStatus("idle");
        setFeedback(null);
        setPasteHint({ platform: "linkedin" });
        addTimeout(() => setPasteHint(null), 30000);
        return;
      }
      setStatus("generating");
      setFeedback("Copying image to clipboard...");
      const previewBlob = await loadPreviewBlob(previewCard.imageUrl);
      if (token.cancelled || sessionId !== previewSessionRef.current) return;
      const imageCopied = await copyBlobToClipboard(previewBlob);
      if (token.cancelled || sessionId !== previewSessionRef.current) return;
      if (imageCopied) {
        setStatus("idle");
        setFeedback(null);
        setPasteHint({ platform: "twitter", method: "image" });
        addTimeout(() => setPasteHint(null), 30000);
        return;
      }
      const textCopied = await copyTextToClipboard(previewCard.shareUrl);
      if (token.cancelled || sessionId !== previewSessionRef.current) return;
      if (textCopied) {
        setStatus("idle");
        setFeedback(null);
        setPasteHint({ platform: "twitter", method: "link" });
        addTimeout(() => setPasteHint(null), 30000);
      } else {
        setPasteHint(null);
        closePreview({ resetStatus: false });
        setStatus("error");
        setFeedback("Failed to copy to clipboard. Please try again or check browser permissions.");
        resetAfterDelay(4000);
      }
    } catch {
      if (token.cancelled || sessionId !== previewSessionRef.current) return;
      setPasteHint(null);
      closePreview({ resetStatus: false });
      setStatus("error");
      setFeedback("Something went wrong. Please try again.");
      resetAfterDelay(4000);
    } finally {
      sharingRef.current = false;
    }
  }, [previewCard, loadPreviewBlob, addTimeout, closePreview, resetAfterDelay]);

  const handleOpenShareTarget = useCallback((platform: SharePlatform) => {
    if (!previewCard) return;
    openShareIntent(platform, previewCard.shareUrl);
    closePreview();
    triggerRef.current?.focus();
  }, [previewCard, closePreview]);

  const handleCopyImage = useCallback(async () => {
    if (!previewCard || sharingRef.current) return;
    sharingRef.current = true;
    const token = mountTokenRef.current;
    const sessionId = previewSessionRef.current;
    clearTimeouts();
    setStatus("generating");
    setFeedback("Copying image to clipboard...");
    try {
      const previewBlob = await loadPreviewBlob(previewCard.imageUrl);
      if (token.cancelled || sessionId !== previewSessionRef.current) return;
      const imageCopied = await copyBlobToClipboard(previewBlob);
      if (token.cancelled || sessionId !== previewSessionRef.current) return;
      if (imageCopied) {
        closePreview();
        setStatus("copied");
        setFeedback("Image copied to clipboard!");
        resetAfterDelay(3000);
        return;
      }
      const textCopied = await copyTextToClipboard(previewCard.shareUrl);
      if (token.cancelled || sessionId !== previewSessionRef.current) return;
      if (textCopied) {
        closePreview();
        setStatus("copied");
        setFeedback("Share link copied to clipboard (image copy not supported in this browser).");
        resetAfterDelay(3000);
        return;
      }
      closePreview();
      setStatus("error");
      setFeedback("Failed to copy to clipboard. Please try again or check browser permissions.");
      resetAfterDelay(3000);
    } catch {
      if (token.cancelled || sessionId !== previewSessionRef.current) return;
      closePreview();
      setStatus("error");
      setFeedback("Failed to copy image.");
      resetAfterDelay(3000);
    } finally {
      sharingRef.current = false;
    }
  }, [previewCard, clearTimeouts, loadPreviewBlob, closePreview, resetAfterDelay]);

  useEffect(() => {
    if (!previewCard) return;
    const modal = modalRef.current;
    if (modal) modal.querySelector<HTMLButtonElement>("[aria-label='Close']")?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closePreview();
        triggerRef.current?.focus();
        return;
      }

      if (e.key === "Tab" && modal) {
        const focusable = modal.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0]!;
        const last = focusable[focusable.length - 1]!;
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [previewCard, closePreview]);

  const isGenerating = status === "generating";
  const spinnerChar = SPINNER_FRAMES[spinnerFrameIndex]!;
  const isPreviewImageLoading = previewImageStatus === "loading";
  const previewActions: ShareButtonPreviewActions = {
    closePreview: () => closePreview(),
    copyImage: handleCopyImage,
    openShareTarget: handleOpenShareTarget,
    shareToPlatform: handleShare,
    triggerFocus: () => triggerRef.current?.focus(),
  };
  const previewModel: ShareButtonPreviewModel = {
    feedback,
    isGenerating,
    isPreviewImageLoading,
    pasteHint,
    previewImageObjectUrl,
    spinnerChar,
    status,
    systemMessage,
    userMessage,
    username,
  };

  if (status !== "idle" && !previewCard) {
    return <ShareButtonInlineStatus closePreview={() => closePreview()} feedback={feedback} spinnerChar={spinnerChar} status={status} />;
  }

  return (
    <span className="relative ml-2 inline-flex align-baseline">
      <button
        ref={triggerRef}
        onClick={handleOpenPreview}
        className="font-mono text-[11px] text-gray-600 opacity-20 transition-all duration-200 hover:text-[#56b6c2] group-hover:opacity-100 group-hover:text-[#56b6c2]"
      >
        [share]
      </button>
      {previewCard ? (
        <ShareButtonPreviewModal
          actions={previewActions}
          modalRef={modalRef}
          preview={previewModel}
        />
      ) : null}
    </span>
  );
}

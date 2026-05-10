import { useCallback, useEffect, useRef, useState } from "react";

import {
  DEFAULT_CLOSE_EFFECT,
  UPGRADE_NAG_CLOSE_EFFECTS,
  type UpgradeNagCloseEffect,
} from "./upgradeOverlayEffects";

const NAG_MINIMUM_OPEN_MS = 3000;
const NAG_FORCED_CLOSE_MS = 3000;

function pickRandomUpgradeNagCloseEffect(): UpgradeNagCloseEffect {
  return (
    UPGRADE_NAG_CLOSE_EFFECTS[
      Math.floor(Math.random() * UPGRADE_NAG_CLOSE_EFFECTS.length)
    ] ?? DEFAULT_CLOSE_EFFECT
  );
}

type UseUpgradeNagStateArgs = {
  closeAllOverlays: () => void;
  setInputValue: (value: string) => void;
  setShowUpgrade: (show: boolean) => void;
};

export function useUpgradeNagState({
  closeAllOverlays,
  setInputValue,
  setShowUpgrade,
}: UseUpgradeNagStateArgs) {
  const pendingNagCommandRef = useRef<string | null>(null);
  const nagArmedFromQuotaRef = useRef(false);
  const nagOpenedAtRef = useRef<number | null>(null);
  const nagCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [upgradeNagDismissPhase, setUpgradeNagDismissPhase] = useState<
    "idle" | "closing"
  >("idle");
  const [upgradeNagDismissEffect, setUpgradeNagDismissEffect] =
    useState<UpgradeNagCloseEffect>(DEFAULT_CLOSE_EFFECT);

  useEffect(() => {
    return () => {
      if (nagCloseTimeoutRef.current) {
        clearTimeout(nagCloseTimeoutRef.current);
      }
    };
  }, []);

  const clearNagCloseTimeout = useCallback(() => {
    if (nagCloseTimeoutRef.current) {
      clearTimeout(nagCloseTimeoutRef.current);
      nagCloseTimeoutRef.current = null;
    }
  }, []);

  const resetDismissState = useCallback(() => {
    setUpgradeNagDismissPhase("idle");
    setUpgradeNagDismissEffect(DEFAULT_CLOSE_EFFECT);
  }, []);

  const clearPendingNag = useCallback(() => {
    pendingNagCommandRef.current = null;
    nagArmedFromQuotaRef.current = false;
  }, []);

  const consumePendingNagCommand = useCallback(() => {
    const command = pendingNagCommandRef.current;
    clearPendingNag();
    return command;
  }, [clearPendingNag]);

  const restorePendingNagCommand = useCallback(() => {
    if (pendingNagCommandRef.current !== null) {
      setInputValue(pendingNagCommandRef.current);
      pendingNagCommandRef.current = null;
    }
    nagArmedFromQuotaRef.current = false;
    nagOpenedAtRef.current = null;
    resetDismissState();
    clearNagCloseTimeout();
  }, [clearNagCloseTimeout, resetDismissState, setInputValue]);

  const openUpgradeNag = useCallback(
    (command?: string) => {
      if (command !== undefined) {
        pendingNagCommandRef.current = command;
      }
      nagOpenedAtRef.current = Date.now();
      resetDismissState();
      clearNagCloseTimeout();
      setShowUpgrade(true);
    },
    [clearNagCloseTimeout, resetDismissState, setShowUpgrade],
  );

  const finalizeUpgradeNagClose = useCallback(
    (onResumePendingCommand: (command: string) => void) => {
      clearNagCloseTimeout();
      resetDismissState();
      nagOpenedAtRef.current = null;
      setShowUpgrade(false);
      if (window.location.pathname === "/upgrade") {
        window.history.pushState(null, "", "/");
      }
      const command = consumePendingNagCommand();
      if (command !== null) {
        onResumePendingCommand(command);
      }
    },
    [
      clearNagCloseTimeout,
      consumePendingNagCommand,
      resetDismissState,
      setShowUpgrade,
    ],
  );

  const dismissUpgradeOverlay = useCallback(() => {
    setShowUpgrade(false);
    if (window.location.pathname === "/upgrade") {
      window.history.pushState(null, "", "/");
    }
  }, [setShowUpgrade]);

  const closeAllOverlaysAndRestoreNag = useCallback(() => {
    closeAllOverlays();
    restorePendingNagCommand();
  }, [closeAllOverlays, restorePendingNagCommand]);

  const closeAllOverlaysPreservingNag = useCallback(() => {
    closeAllOverlays();
    if (pendingNagCommandRef.current !== null) {
      setShowUpgrade(true);
    }
  }, [closeAllOverlays, setShowUpgrade]);

  const handleUpgradeNagClose = useCallback(
    (onResumePendingCommand: (command: string) => void) => {
      if (upgradeNagDismissPhase === "closing") {
        return;
      }
      const nagOpenedAt = nagOpenedAtRef.current;
      const elapsed =
        nagOpenedAt === null ? Number.POSITIVE_INFINITY : Date.now() - nagOpenedAt;
      if (elapsed >= NAG_MINIMUM_OPEN_MS) {
        finalizeUpgradeNagClose(onResumePendingCommand);
        return;
      }
      setUpgradeNagDismissEffect(pickRandomUpgradeNagCloseEffect());
      setUpgradeNagDismissPhase("closing");
      nagCloseTimeoutRef.current = setTimeout(() => {
        nagCloseTimeoutRef.current = null;
        finalizeUpgradeNagClose(onResumePendingCommand);
      }, NAG_FORCED_CLOSE_MS);
    },
    [finalizeUpgradeNagClose, upgradeNagDismissPhase],
  );

  return {
    clearPendingNag,
    closeAllOverlaysAndRestoreNag,
    closeAllOverlaysPreservingNag,
    consumePendingNagCommand,
    dismissUpgradeOverlay,
    handleUpgradeNagClose,
    nagArmedFromQuotaRef,
    openUpgradeNag,
    pendingNagCommand: pendingNagCommandRef.current,
    pendingNagCommandRef,
    restorePendingNagCommand,
    upgradeNagDismissEffect,
    upgradeNagDismissPhase,
  };
}

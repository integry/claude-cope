import { useRef, useEffect, useCallback, type RefObject, type KeyboardEvent, type Dispatch, type SetStateAction } from "react";
import type { Message } from "./useGameState";

export function useTerminalKeyboard({
  slashQuery,
  slashIndex,
  suggestedReply,
  inputValue,
  isProcessing,
  commandHistory,
  historyIndex,
  showStore,
  showLeaderboard,
  showAchievements,
  showSynergize,
  showHelp,
  showAbout,
  showPrivacy,
  showTerms,
  showContact,
  showProfile,
  showParty,
  showUpgrade,
  brrrrrrIntervalRef,
  abortControllerRef,
  freeTierDelayRef,
  inputRef,
  setSlashIndex,
  setInputValue,
  setSuggestedReply,
  setSlashQuery,
  setHistoryIndex,
  setIsProcessing,
  setHistory,
  closeAllOverlays,
  handleUpgradeNagClose,
  runSlashCommand,
  handleEnterSubmit,
  getFilteredSlashCommands,
}: {
  slashQuery: string;
  slashIndex: number;
  suggestedReply: string | null;
  inputValue: string;
  isProcessing: boolean;
  commandHistory: string[];
  historyIndex: number;
  showStore: boolean;
  showLeaderboard: boolean;
  showAchievements: boolean;
  showSynergize: boolean;
  showHelp: boolean;
  showAbout: boolean;
  showPrivacy: boolean;
  showTerms: boolean;
  showContact: boolean;
  showProfile: boolean;
  showParty: boolean;
  showUpgrade: boolean;
  brrrrrrIntervalRef: RefObject<ReturnType<typeof setInterval> | null>;
  abortControllerRef: RefObject<AbortController | null>;
  freeTierDelayRef: RefObject<{ cancelled: boolean; timeoutId: ReturnType<typeof setTimeout> | null; batchId?: string }>;
  inputRef: RefObject<HTMLInputElement | null>;
  setSlashIndex: (val: number | ((prev: number) => number)) => void;
  setInputValue: (val: string) => void;
  setSuggestedReply: (val: string | null) => void;
  setSlashQuery: (val: string) => void;
  setHistoryIndex: (val: number) => void;
  setIsProcessing: (val: boolean) => void;
  setHistory: Dispatch<SetStateAction<Message[]>>;
  closeAllOverlays: () => void;
  handleUpgradeNagClose: () => void;
  runSlashCommand: (cmd: string) => void;
  handleEnterSubmit: () => void;
  getFilteredSlashCommands: () => string[];
}) {
  const lastEscapeRef = useRef<number>(0);

  const setCursorToEnd = useCallback((val: string) => {
    setTimeout(() => {
      const el = inputRef.current;
      if (el) {
        el.focus();
        el.selectionStart = el.selectionEnd = val.length;
      }
    }, 0);
  }, [inputRef]);

  const anyOverlayOpen =
    showStore || showLeaderboard || showAchievements || showSynergize || showHelp || showAbout || showPrivacy || showTerms || showContact || showProfile || showParty || showUpgrade;

  const restoreLastCommand = useCallback(() => {
    if (commandHistory.length > 0) {
      const lastCmd = commandHistory[commandHistory.length - 1]!;
      setInputValue(lastCmd);
      setCursorToEnd(lastCmd);
    }
  }, [commandHistory, setInputValue, setCursorToEnd]);

  const cancelFreeTierDelay = useCallback(() => {
    const ds = freeTierDelayRef.current;
    const cancelBatchId = ds.batchId;
    ds.cancelled = true;
    if (ds.timeoutId) clearTimeout(ds.timeoutId);
    freeTierDelayRef.current = { cancelled: false, timeoutId: null };
    setIsProcessing(false);
    // Only remove scaffold messages from the current in-flight batch, not prior ads
    setHistory((prev) => [...prev.filter((msg) => {
      if (msg.role === "loading") return false;
      if (cancelBatchId && (msg as Message & { _freeTierBatchId?: string })._freeTierBatchId === cancelBatchId) return false;
      return true;
    }), { role: "warning", content: "[⚠️ ABORTED] Queue cancelled. Patience is a virtue you clearly lack." }]);
    restoreLastCommand();
  }, [freeTierDelayRef, setIsProcessing, setHistory, restoreLastCommand]);

  const cancelAbortController = useCallback(() => {
    abortControllerRef.current!.abort();
    abortControllerRef.current = null;
    setIsProcessing(false);
    setHistory((prev) =>
      [
        ...prev.filter((msg) => msg.role !== "loading"),
        { role: "warning", content: "[⚠️ ABORTED] Generation cancelled. Your mass-produced cope has been recalled." },
      ]
    );
    restoreLastCommand();
  }, [abortControllerRef, setIsProcessing, setHistory, restoreLastCommand]);

  const handleEscapeKey = useCallback(() => {
    if (anyOverlayOpen) {
      if (showUpgrade) {
        handleUpgradeNagClose();
      } else {
        closeAllOverlays();
      }
      return;
    }
    // Cancel free-tier artificial delay if one is in progress
    if (isProcessing && freeTierDelayRef.current.timeoutId !== null) {
      cancelFreeTierDelay();
      return;
    }
    if (isProcessing && abortControllerRef.current) {
      cancelAbortController();
      return;
    }
    const now = Date.now();
    if (now - lastEscapeRef.current < 500) {
      if (inputValue.length > 0)
        setHistory((prev) =>
          [...prev, { role: "system", content: "[ESC ESC] Input cleared. Even your half-typed thoughts disappoint me." }]
        );
      setInputValue("");
      setSlashQuery("");
      setSlashIndex(0);
      lastEscapeRef.current = 0;
    } else {
      lastEscapeRef.current = now;
    }
  }, [anyOverlayOpen, showUpgrade, isProcessing, abortControllerRef, freeTierDelayRef, inputValue, closeAllOverlays, handleUpgradeNagClose, setHistory, setInputValue, setSlashQuery, setSlashIndex, cancelFreeTierDelay, cancelAbortController]);

  const handleArrowUp = (slashMenuOpen: boolean, filtered: string[]) => {
    if (slashMenuOpen) {
      setSlashIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
      return;
    }
    if (commandHistory.length === 0) return;
    const newIndex = historyIndex + 1;
    if (newIndex < commandHistory.length) {
      setHistoryIndex(newIndex);
      const val = commandHistory[commandHistory.length - 1 - newIndex]!;
      setInputValue(val);
      setCursorToEnd(val);
    }
  };

  const handleArrowDown = (slashMenuOpen: boolean, filtered: string[]) => {
    if (slashMenuOpen) {
      setSlashIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
      return;
    }
    const newIndex = historyIndex - 1;
    if (newIndex < -1) return;
    setHistoryIndex(newIndex);
    const val = newIndex === -1 ? "" : commandHistory[commandHistory.length - 1 - newIndex]!;
    setInputValue(val);
    setCursorToEnd(val);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "c" && e.ctrlKey && brrrrrrIntervalRef.current) {
      e.preventDefault();
      clearInterval(brrrrrrIntervalRef.current);
      brrrrrrIntervalRef.current = null;
      setHistory((prev) =>
        [...prev, { role: "warning", content: "^C\n[✓] Process interrupted. Your CPU lives to fight another day." }]
      );
      setIsProcessing(false);
      return;
    }
    const filtered = getFilteredSlashCommands();
    const slashMenuOpen = slashQuery !== "" && filtered.length > 0;
    if (e.key === "Escape") return; // handled by global listener
    if (e.key === "Tab") {
      if (slashMenuOpen) {
        e.preventDefault();
        const selected = filtered[slashIndex];
        if (selected) {
          setInputValue(selected);
          setSlashQuery(selected);
        }
      } else if (suggestedReply && !inputValue) {
        e.preventDefault();
        setInputValue(suggestedReply);
        setSuggestedReply(null);
      }
      return;
    }
    if (e.key === "Enter") {
      if (slashMenuOpen) {
        e.preventDefault();
        const selected = filtered[slashIndex];
        if (selected) runSlashCommand(selected);
        return;
      }
      if (inputValue.trim() !== "" && !isProcessing) handleEnterSubmit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      handleArrowUp(slashMenuOpen, filtered);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      handleArrowDown(slashMenuOpen, filtered);
    }
  };

  // Global Escape listener so it works even when input is disabled during processing
  useEffect(() => {
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") handleEscapeKey();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [handleEscapeKey]);

  return { handleKeyDown };
}

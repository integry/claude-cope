import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
import { Message } from "./useGameState";
import { GameState } from "./useGameState";
import { parseSabotageParams } from "../components/slashCommandExecutor";

const DEPLOY_MESSAGES = [
  (v: number, name: string) => `[⬆️ UPDATE] Claude Cope v0.1.4-rc.${v} deploying... Applying patch: ${name}`,
  (v: number, name: string) => `[🔥 HOTFIX] Emergency patch v0.1.4-rc.${v} pushed to prod — ${name}`,
  (v: number, name: string) => `[🚀 DEPLOY] Claude Cope v0.1.4-rc.${v} rolling out... Installing: ${name}`,
  (v: number, name: string) => `[⚙️ PATCH] Applying untested fix v0.1.4-rc.${v}... Module: ${name}`,
  (v: number, name: string) => `[📦 RELEASE] v0.1.4-rc.${v} shipped without review — ${name} enabled`,
  (v: number, name: string) => `[🔄 SYNC] Force-pushing v0.1.4-rc.${v} to production... Overwriting: ${name}`,
];

const ROLLBACK_MESSAGES = [
  (name: string) => `[FATAL ERROR] Rolling back... Reverting ${name}. We apologize for the improved experience.`,
  (name: string) => `[💥 CRASH] ${name} caused a segfault. Rolling back before anyone notices.`,
  (name: string) => `[🚨 PANIC] Kernel panic — ${name} not recoverable. Initiating rollback.`,
  (name: string) => `[❌ REVERT] ${name} broke everything. Pretending it never happened.`,
  (name: string) => `[⚠️ ROLLBACK] ${name} deemed too stable. Reverting to preserve chaos.`,
  (name: string) => `[🔥 INCIDENT] ${name} triggered 47 alerts. Rolling back and blaming intern.`,
];

const REGRESSION_TYPES = [
  { id: "backwards_typing", name: "Backwards Typing", css: "" },
  { id: "broken_scrollback", name: "Broken Scrollback", css: "" },
  { id: "upside_down", name: "Upside-Down Rendering", css: "transform: scaleY(-1);" },
  { id: "opacity_fade", name: "Opacity Fade Leak", css: "opacity: 0.3;" },
  { id: "letter_spacing", name: "Letter Spacing Explosion", css: "letter-spacing: 0.5em;" },
  { id: "comic_sans", name: "Font Corruption", css: 'font-family: "Comic Sans MS", "Comic Sans", cursive;' },
  { id: "all_caps", name: "ALL CAPS", css: "text-transform: uppercase;" },
  { id: "windows_prompt", name: "OS Downgrade", css: "" },
];

interface UseTerminalEffectsArgs {
  history: Message[];
  setHistory: Dispatch<SetStateAction<Message[]>>;
  setState: Dispatch<SetStateAction<GameState>>;
  offlineTDEarned: number;
  clearOfflineTDEarned: () => void;
}

export function useTerminalEffects({ history, setHistory, setState, offlineTDEarned, clearOfflineTDEarned }: UseTerminalEffectsArgs) {
  const [isBooting, setIsBooting] = useState<boolean>(() => {
    if (history.length > 0) return false;
    const params = new URLSearchParams(window.location.search);
    return params.get("sabotage") !== "true";
  });
  const [regressionGlitch, setRegressionGlitch] = useState<string | null>(null);
  const [activeRegression, setActiveRegression] = useState<string | null>(null);

  // Track latest history for the regression glitch inactivity check
  const historyRef = useRef(history);
  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  // Boot sequence for organic visitors
  useEffect(() => {
    if (!isBooting) return;
    const bootLines = [
      "[OK] Initializing Claude Cope v0.1.3...",
      "[OK] Bypassing stackoverflow...",
      "[OK] Injecting technical debt...",
      "[WARN] Loading condescension matrix...",
      "[OK] Disabling all unit tests...",
      "[OK] Replacing documentation with TODO comments...",
      "[OK] Boot complete. Welcome to Claude Cope.",
    ];
    const interval = 3000 / bootLines.length;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    bootLines.forEach((line, i) => {
      const id = setTimeout(() => {
        setHistory((prev) => [...prev, { role: "system" as const, content: line }]);
      }, interval * (i + 1));
      timeouts.push(id);
    });
    const finishId = setTimeout(() => setIsBooting(false), 3000);
    timeouts.push(finishId);
    return () => timeouts.forEach(clearTimeout);
  }, [isBooting, setHistory]);

  // Welcome-back message for offline TD earnings
  useEffect(() => {
    if (offlineTDEarned <= 0) return;
    setHistory((prev) => [...prev, { role: "system", content: `[☕ WELCOME BACK] While you were away, your codebase accumulated ${Math.floor(offlineTDEarned).toLocaleString()} Technical Debt. The suffering never stops.` }]);
    clearOfflineTDEarned();
  }, [offlineTDEarned, clearOfflineTDEarned, setHistory]);

  // Handle sabotage URL parameters on mount
  useEffect(() => {
    parseSabotageParams(setState, setHistory);
  }, [setState, setHistory]);

  // Regression chaos event — fires every 10-15 minutes
  useEffect(() => {
    const scheduleRegression = () => {
      const delayMs = (Math.random() * 5 + 10) * 60 * 1000;
      return setTimeout(() => {
        // Skip regression if user is inactive (last message is a rollback from a previous regression)
        const lastMessage = historyRef.current[historyRef.current.length - 1];
        if (lastMessage && lastMessage.role === "error" && lastMessage.content.includes("Rolling back")) {
          timerId = scheduleRegression();
          return;
        }

        const regression = REGRESSION_TYPES[Math.floor(Math.random() * REGRESSION_TYPES.length)]!;
        const v = Math.floor(Math.random() * 99) + 1;
        const deployMsg = DEPLOY_MESSAGES[Math.floor(Math.random() * DEPLOY_MESSAGES.length)]!;
        const rollbackMsg = ROLLBACK_MESSAGES[Math.floor(Math.random() * ROLLBACK_MESSAGES.length)]!;
        setHistory((prev) => [
          ...prev,
          { role: "warning", content: deployMsg(v, regression.name) },
        ]);
        setRegressionGlitch(regression.css || null);
        setActiveRegression(regression.id);
        setTimeout(() => {
          setRegressionGlitch(null);
          setActiveRegression(null);
          setHistory((prev) => [
            ...prev,
            { role: "error", content: rollbackMsg(regression.name) },
          ]);
        }, 10000);
        timerId = scheduleRegression();
      }, delayMs);
    };
    let timerId = scheduleRegression();
    return () => clearTimeout(timerId);
  }, [setHistory]);

  return { isBooting, regressionGlitch, activeRegression };
}

import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Message } from "./useGameState";
import { GameState } from "./useGameState";
import { parseSabotageParams } from "../components/slashCommandExecutor";

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
  setHistory: (updater: (prev: Message[]) => Message[]) => void;
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
        const regression = REGRESSION_TYPES[Math.floor(Math.random() * REGRESSION_TYPES.length)]!;
        setHistory((prev) => [
          ...prev,
          { role: "warning", content: `[⬆️ UPDATE] Claude Cope v0.1.4-rc.${Math.floor(Math.random() * 99) + 1} deploying... Applying patch: ${regression.name}` },
        ]);
        setRegressionGlitch(regression.css || null);
        setActiveRegression(regression.id);
        setTimeout(() => {
          setRegressionGlitch(null);
          setActiveRegression(null);
          setHistory((prev) => [
            ...prev,
            { role: "error", content: `[FATAL ERROR] Rolling back... Reverting ${regression.name}. We apologize for the improved experience.` },
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

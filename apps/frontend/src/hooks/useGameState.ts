import { useState, useEffect } from "react";
import { GENERATORS } from "../game/constants";

const STORAGE_KEY = "claudeCopeState";

export interface GameState {
  technicalDebt: number;
  totalTechnicalDebt: number;
  inventory: Record<string, number>;
}

function createDefaultState(): GameState {
  const inventory: Record<string, number> = {};
  for (const generator of GENERATORS) {
    inventory[generator.id] = 0;
  }
  return {
    technicalDebt: 0,
    totalTechnicalDebt: 0,
    inventory,
  };
}

function loadState(): GameState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as GameState;
    }
  } catch {
    // Corrupted or inaccessible localStorage — fall through to default
  }
  return createDefaultState();
}

export function useGameState() {
  const [state, setState] = useState<GameState>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // localStorage full or unavailable — silently ignore
    }
  }, [state]);

  return [state, setState] as const;
}

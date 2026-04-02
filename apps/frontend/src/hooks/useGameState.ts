import { useState, useEffect, useRef } from "react";
import { GENERATORS, CORPORATE_RANKS } from "../game/constants";

const STORAGE_KEY = "claudeCopeState";

export interface GameState {
  technicalDebt: number;
  totalTechnicalDebt: number;
  rankIndex: number;
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
    rankIndex: 0,
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

function calculateTDpS(inventory: Record<string, number>): number {
  let tdps = 0;
  for (const generator of GENERATORS) {
    const count = inventory[generator.id] ?? 0;
    tdps += count * generator.baseOutput;
  }
  return tdps;
}

export function useGameState() {
  const [state, setState] = useState<GameState>(loadState);
  const stateRef = useRef(state);

  // Keep the ref in sync with the latest state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // localStorage full or unavailable — silently ignore
    }
  }, [state]);

  // Background game loop — runs every second
  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => {
        const tdps = calculateTDpS(prev.inventory);
        if (tdps === 0) return prev;

        const newTotalTD = prev.totalTechnicalDebt + tdps;

        // Check for rank advancement
        let newRankIndex = prev.rankIndex;
        while (
          newRankIndex < CORPORATE_RANKS.length - 1 &&
          newTotalTD >= CORPORATE_RANKS[newRankIndex + 1]!.threshold
        ) {
          newRankIndex++;
        }

        return {
          ...prev,
          technicalDebt: prev.technicalDebt + tdps,
          totalTechnicalDebt: newTotalTD,
          rankIndex: newRankIndex,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return [state, setState] as const;
}

import { useState, useEffect, useRef, useCallback } from "react";
import { GENERATORS, CORPORATE_RANKS, GROWTH_RATE } from "../game/constants";

const STORAGE_KEY = "claudeCopeState";

export interface BuddyState {
  type: string | null;
  isShiny: boolean;
  promptsSinceLastInterjection: number;
}

export interface GameState {
  technicalDebt: number;
  totalTechnicalDebt: number;
  rankIndex: number;
  inventory: Record<string, number>;
  achievements: string[];
  buddy: BuddyState;
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
    achievements: [],
    buddy: {
      type: null,
      isShiny: false,
      promptsSinceLastInterjection: 0,
    },
  };
}

function loadState(): GameState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as GameState;
      if (!Array.isArray(parsed.achievements)) {
        parsed.achievements = [];
      }
      if (!parsed.buddy) {
        parsed.buddy = {
          type: null,
          isShiny: false,
          promptsSinceLastInterjection: 0,
        };
      }
      return parsed;
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

  // Background game loop — runs every 100ms for smooth visual updates
  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => {
        const tdps = calculateTDpS(prev.inventory);
        if (tdps === 0) return prev;

        const tickTD = tdps / 10;
        const newTotalTD = prev.totalTechnicalDebt + tickTD;

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
          technicalDebt: prev.technicalDebt + tickTD,
          totalTechnicalDebt: newTotalTD,
          rankIndex: newRankIndex,
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const buyGenerator = useCallback((generatorId: string): boolean => {
    const generator = GENERATORS.find((g) => g.id === generatorId);
    if (!generator) return false;

    const current = stateRef.current;
    const owned = current.inventory[generatorId] ?? 0;
    const cost = Math.floor(generator.baseCost * Math.pow(GROWTH_RATE, owned));

    if (current.technicalDebt < cost) return false;

    setState((prev) => {
      const ownedNow = prev.inventory[generatorId] ?? 0;
      const dynamicCost = Math.floor(
        generator.baseCost * Math.pow(GROWTH_RATE, ownedNow),
      );
      if (prev.technicalDebt < dynamicCost) return prev;

      return {
        ...prev,
        technicalDebt: prev.technicalDebt - dynamicCost,
        inventory: {
          ...prev.inventory,
          [generatorId]: ownedNow + 1,
        },
      };
    });

    return true;
  }, []);

  const addActiveTD = useCallback((amount: number) => {
    setState((prev) => {
      const newTotalTD = prev.totalTechnicalDebt + amount;

      let newRankIndex = prev.rankIndex;
      while (
        newRankIndex < CORPORATE_RANKS.length - 1 &&
        newTotalTD >= CORPORATE_RANKS[newRankIndex + 1]!.threshold
      ) {
        newRankIndex++;
      }

      return {
        ...prev,
        technicalDebt: prev.technicalDebt + amount,
        totalTechnicalDebt: newTotalTD,
        rankIndex: newRankIndex,
      };
    });
  }, []);

  const unlockAchievement = useCallback((achievement: string) => {
    setState((prev) => {
      if (prev.achievements.includes(achievement)) return prev;
      return {
        ...prev,
        achievements: [...prev.achievements, achievement],
      };
    });
  }, []);

  return { state, setState, buyGenerator, addActiveTD, unlockAchievement };
}

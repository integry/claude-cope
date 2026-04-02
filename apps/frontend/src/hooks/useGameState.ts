import { useState, useEffect, useRef, useCallback } from "react";
import { GENERATORS, CORPORATE_RANKS, GROWTH_RATE } from "../game/constants";

const STORAGE_KEY = "claudeCopeState";
const STATE_VERSION = "1.0";

export interface BuddyState {
  type: string | null;
  isShiny: boolean;
  promptsSinceLastInterjection: number;
}

export interface EconomyState {
  currentTD: number;
  totalTDEarned: number;
  currentRank: string;
  quotaPercent: number;
  quotaLockouts: number;
}

export interface GameState {
  version: string;
  lastLogin: number;
  economy: EconomyState;
  inventory: Record<string, number>;
  achievements: string[];
  buddy: BuddyState;
}

/** Legacy flat state shape used before the economy refactor. */
interface LegacyGameState {
  technicalDebt: number;
  totalTechnicalDebt: number;
  rankIndex: number;
  inventory: Record<string, number>;
  achievements: string[];
  buddy?: BuddyState;
}

function rankTitleFromIndex(index: number): string {
  return CORPORATE_RANKS[index]?.title ?? CORPORATE_RANKS[0]!.title;
}

function rankIndexFromTitle(title: string): number {
  const idx = CORPORATE_RANKS.findIndex((r) => r.title === title);
  return idx >= 0 ? idx : 0;
}

function resolveRank(totalTDEarned: number, currentRankTitle: string): string {
  let rankIndex = rankIndexFromTitle(currentRankTitle);
  while (
    rankIndex < CORPORATE_RANKS.length - 1 &&
    totalTDEarned >= CORPORATE_RANKS[rankIndex + 1]!.threshold
  ) {
    rankIndex++;
  }
  return rankTitleFromIndex(rankIndex);
}

function createDefaultState(): GameState {
  const inventory: Record<string, number> = {};
  for (const generator of GENERATORS) {
    inventory[generator.id] = 0;
  }
  return {
    version: STATE_VERSION,
    lastLogin: Date.now(),
    economy: {
      currentTD: 0,
      totalTDEarned: 0,
      currentRank: CORPORATE_RANKS[0]!.title,
      quotaPercent: 100,
      quotaLockouts: 0,
    },
    inventory,
    achievements: [],
    buddy: {
      type: null,
      isShiny: false,
      promptsSinceLastInterjection: 0,
    },
  };
}

function isLegacyState(obj: Record<string, unknown>): boolean {
  return "technicalDebt" in obj && !("economy" in obj);
}

function migrateLegacyState(legacy: LegacyGameState): GameState {
  const buddy: BuddyState = legacy.buddy ?? {
    type: null,
    isShiny: false,
    promptsSinceLastInterjection: 0,
  };

  return {
    version: STATE_VERSION,
    lastLogin: Date.now(),
    economy: {
      currentTD: legacy.technicalDebt,
      totalTDEarned: legacy.totalTechnicalDebt,
      currentRank: rankTitleFromIndex(legacy.rankIndex),
      quotaPercent: 100,
      quotaLockouts: 0,
    },
    inventory: legacy.inventory,
    achievements: Array.isArray(legacy.achievements) ? legacy.achievements : [],
    buddy,
  };
}

function loadState(): GameState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Record<string, unknown>;

      // Migrate legacy flat state to new nested structure
      if (isLegacyState(parsed)) {
        return migrateLegacyState(parsed as unknown as LegacyGameState);
      }

      const state = parsed as unknown as GameState;

      // Ensure required fields exist (defensive)
      if (!Array.isArray(state.achievements)) {
        state.achievements = [];
      }
      if (!state.buddy) {
        state.buddy = {
          type: null,
          isShiny: false,
          promptsSinceLastInterjection: 0,
        };
      }
      if (!state.economy) {
        return createDefaultState();
      }

      // Ensure quotaPercent is initialized for existing saves
      if (!state.economy.quotaPercent) {
        state.economy.quotaPercent = 100;
      }

      // Update lastLogin on load
      state.lastLogin = Date.now();
      state.version = STATE_VERSION;

      return state;
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
        const newTotalTDEarned = prev.economy.totalTDEarned + tickTD;

        // Check for rank advancement
        const newRank = resolveRank(newTotalTDEarned, prev.economy.currentRank);

        // Rogue API Key passively drains quota over time
        const rogueCount = prev.inventory["rogue-api-key"] ?? 0;
        let newQuotaPercent = prev.economy.quotaPercent;
        if (rogueCount > 0) {
          // Drain 0.5% per Rogue API Key per second (0.05% per tick at 100ms)
          const quotaDrain = rogueCount * 0.05;
          newQuotaPercent = Math.max(0, prev.economy.quotaPercent - quotaDrain);
        }

        return {
          ...prev,
          economy: {
            ...prev.economy,
            currentTD: prev.economy.currentTD + tickTD,
            totalTDEarned: newTotalTDEarned,
            currentRank: newRank,
            quotaPercent: newQuotaPercent,
          },
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

    if (current.economy.currentTD < cost) return false;

    setState((prev) => {
      const ownedNow = prev.inventory[generatorId] ?? 0;
      const dynamicCost = Math.floor(
        generator.baseCost * Math.pow(GROWTH_RATE, ownedNow),
      );
      if (prev.economy.currentTD < dynamicCost) return prev;

      return {
        ...prev,
        economy: {
          ...prev.economy,
          currentTD: prev.economy.currentTD - dynamicCost,
        },
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
      const newTotalTDEarned = prev.economy.totalTDEarned + amount;
      const newRank = resolveRank(newTotalTDEarned, prev.economy.currentRank);

      return {
        ...prev,
        economy: {
          ...prev.economy,
          currentTD: prev.economy.currentTD + amount,
          totalTDEarned: newTotalTDEarned,
          currentRank: newRank,
        },
      };
    });
  }, []);

  const drainQuota = useCallback((): number => {
    const drain = Math.floor(Math.random() * 43) + 3; // 3% to 45%
    const current = stateRef.current.economy.quotaPercent;
    const raw = current - drain;
    const newPercent = raw < 0 ? 0 : raw;
    setState((prev) => ({
      ...prev,
      economy: {
        ...prev.economy,
        quotaPercent: newPercent,
      },
    }));
    return newPercent;
  }, []);

  const resetQuota = useCallback(() => {
    setState((prev) => ({
      ...prev,
      economy: {
        ...prev.economy,
        quotaPercent: 100,
        quotaLockouts: prev.economy.quotaLockouts + 1,
      },
    }));
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

  return { state, setState, buyGenerator, addActiveTD, drainQuota, resetQuota, unlockAchievement };
}

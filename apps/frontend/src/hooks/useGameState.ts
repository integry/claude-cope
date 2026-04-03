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
  tdMultiplier: number;
}

export interface GameState {
  version: string;
  lastLogin: number;
  economy: EconomyState;
  inventory: Record<string, number>;
  achievements: string[];
  buddy: BuddyState;
  apiKey?: string;
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
      tdMultiplier: 1,
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
      tdMultiplier: 1,
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
      // Ensure tdMultiplier is initialized for existing saves
      if (!state.economy.tdMultiplier) {
        state.economy.tdMultiplier = 1;
      }

      // Preserve lastLogin from storage so we can compute offline TD on mount
      state.version = STATE_VERSION;

      return state;
    }
  } catch {
    // Corrupted or inaccessible localStorage — fall through to default
  }
  return createDefaultState();
}

/** Geometric series sum: total cost to buy `amount` generators starting at `owned`. */
export function calcBulkCost(baseCost: number, owned: number, amount: number): number {
  // Sum = baseCost * r^owned * (r^amount - 1) / (r - 1)
  const rOwned = Math.pow(GROWTH_RATE, owned);
  const rAmount = Math.pow(GROWTH_RATE, amount);
  return Math.floor(baseCost * rOwned * (rAmount - 1) / (GROWTH_RATE - 1));
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

  // Award offline TD on mount based on time since last login
  useEffect(() => {
    setState((prev) => {
      const now = Date.now();
      const elapsed = now - prev.lastLogin;
      if (elapsed <= 0) return { ...prev, lastLogin: now };

      const baseTdps = calculateTDpS(prev.inventory);
      const tdps = baseTdps * prev.economy.tdMultiplier;
      const offlineTD = tdps * (elapsed / 1000);

      if (offlineTD <= 0) return { ...prev, lastLogin: now };

      const newTotalTDEarned = prev.economy.totalTDEarned + offlineTD;
      const newRank = resolveRank(newTotalTDEarned, prev.economy.currentRank);

      return {
        ...prev,
        lastLogin: now,
        economy: {
          ...prev.economy,
          currentTD: prev.economy.currentTD + offlineTD,
          totalTDEarned: newTotalTDEarned,
          currentRank: newRank,
        },
      };
    });
  }, []);

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
        const baseTdps = calculateTDpS(prev.inventory);
        if (baseTdps === 0) return prev;

        const tdps = baseTdps * prev.economy.tdMultiplier;
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

  const buyGenerator = useCallback((generatorId: string, amount: number = 1): boolean => {
    const generator = GENERATORS.find((g) => g.id === generatorId);
    if (!generator || amount < 1) return false;

    const current = stateRef.current;
    const owned = current.inventory[generatorId] ?? 0;
    const cost = calcBulkCost(generator.baseCost, owned, amount);

    if (current.economy.currentTD < cost) return false;

    setState((prev) => {
      const ownedNow = prev.inventory[generatorId] ?? 0;
      const dynamicCost = calcBulkCost(generator.baseCost, ownedNow, amount);
      if (prev.economy.currentTD < dynamicCost) return prev;

      return {
        ...prev,
        economy: {
          ...prev.economy,
          currentTD: prev.economy.currentTD - dynamicCost,
        },
        inventory: {
          ...prev.inventory,
          [generatorId]: ownedNow + amount,
        },
      };
    });

    if (cost > 1_000_000) {
      fetch("/api/recent-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `💰 A player bought ${amount}x ${generator.name} for ${cost.toLocaleString()} TD!` }),
      }).catch(() => {});
    }

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

  const applyOutageReward = useCallback(() => {
    setState((prev) => ({
      ...prev,
      economy: {
        ...prev.economy,
        tdMultiplier: prev.economy.tdMultiplier + 0.05,
      },
    }));
  }, []);

  const debuffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyPvpDebuff = useCallback(() => {
    // Clear any existing debuff timer
    if (debuffTimerRef.current) {
      clearTimeout(debuffTimerRef.current);
    }

    // Halve TD generation
    setState((prev) => ({
      ...prev,
      economy: {
        ...prev.economy,
        tdMultiplier: prev.economy.tdMultiplier * 0.5,
      },
    }));

    // Auto-restore after exactly 60 seconds
    debuffTimerRef.current = setTimeout(() => {
      setState((prev) => ({
        ...prev,
        economy: {
          ...prev.economy,
          tdMultiplier: prev.economy.tdMultiplier * 2,
        },
      }));
      debuffTimerRef.current = null;
    }, 60000);
  }, []);

  // Clean up debuff timer on unmount
  useEffect(() => {
    return () => {
      if (debuffTimerRef.current) {
        clearTimeout(debuffTimerRef.current);
      }
    };
  }, []);

  const applyOutagePenalty = useCallback(() => {
    setState((prev) => {
      // Find the most expensive generator that the player owns at least 1 of
      let mostExpensiveId: string | null = null;
      let highestCost = -1;
      for (const generator of GENERATORS) {
        const count = prev.inventory[generator.id] ?? 0;
        if (count > 0 && generator.baseCost > highestCost) {
          highestCost = generator.baseCost;
          mostExpensiveId = generator.id;
        }
      }
      if (!mostExpensiveId) return prev;

      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          [mostExpensiveId]: (prev.inventory[mostExpensiveId] ?? 0) - 1,
        },
      };
    });
  }, []);

  return { state, setState, buyGenerator, addActiveTD, drainQuota, resetQuota, unlockAchievement, applyOutageReward, applyOutagePenalty, applyPvpDebuff };
}

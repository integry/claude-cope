import { useState, useEffect, useRef, useCallback, SetStateAction } from "react";
import { GENERATORS, UPGRADES } from "../game/constants";
import { supabase } from "../supabaseClient";
import {
  type Message,
  type GameState,
  loadState,
  calcBulkCost,
  calculateTDpS,
  resolveRank,
  STORAGE_KEY,
} from "./gameStateUtils";

export type { Message };
export type { GameState, BuddyState, EconomyState } from "./gameStateUtils";
export { calcBulkCost } from "./gameStateUtils";

export function useGameState() {
  const [state, setState] = useState<GameState>(loadState);
  const stateRef = useRef(state);
  const [offlineTDEarned, setOfflineTDEarned] = useState(0);

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

      const baseTdps = calculateTDpS(prev.inventory, prev.upgrades);
      const tdps = baseTdps * prev.economy.tdMultiplier;
      const offlineTD = tdps * (elapsed / 1000);

      if (offlineTD <= 0) return { ...prev, lastLogin: now };

      setOfflineTDEarned(offlineTD);

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

  // Persist state to localStorage (filter transient "loading" messages from chat history)
  useEffect(() => {
    try {
      const toSave = {
        ...state,
        chatHistory: state.chatHistory.filter((m) => m.role !== "loading"),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // localStorage full or unavailable — silently ignore
    }
  }, [state]);

  // Background game loop — runs every 100ms for smooth visual updates
  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => {
        const baseTdps = calculateTDpS(prev.inventory, prev.upgrades);
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
      const purchaseMessage = `💰 A player bought ${amount}x ${generator.name} for ${cost.toLocaleString()} TD!`;
      fetch("/api/recent-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: purchaseMessage }),
      }).catch(() => {});
      supabase?.channel('global_incidents').send({
        type: 'broadcast',
        event: 'new_incident',
        payload: { message: purchaseMessage },
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
    if (debuffTimerRef.current) {
      clearTimeout(debuffTimerRef.current);
    }

    setState((prev) => ({
      ...prev,
      economy: {
        ...prev.economy,
        tdMultiplier: prev.economy.tdMultiplier * 0.5,
      },
    }));

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

  const buyUpgrade = useCallback((upgradeId: string): boolean => {
    const upgrade = UPGRADES.find((u) => u.id === upgradeId);
    if (!upgrade) return false;

    const current = stateRef.current;
    if (current.upgrades.includes(upgradeId)) return false;
    if ((current.inventory[upgrade.requiredGeneratorId] ?? 0) < 1) return false;
    if (current.economy.currentTD < upgrade.cost) return false;

    setState((prev) => {
      if (prev.upgrades.includes(upgradeId)) return prev;
      if ((prev.inventory[upgrade.requiredGeneratorId] ?? 0) < 1) return prev;
      if (prev.economy.currentTD < upgrade.cost) return prev;

      return {
        ...prev,
        economy: {
          ...prev.economy,
          currentTD: prev.economy.currentTD - upgrade.cost,
        },
        upgrades: [...prev.upgrades, upgradeId],
      };
    });

    return true;
  }, []);

  const applyOutagePenalty = useCallback(() => {
    setState((prev) => {
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

  const setChatHistory = useCallback((action: SetStateAction<Message[]>) => {
    setState((prev) => ({
      ...prev,
      chatHistory: typeof action === "function" ? action(prev.chatHistory) : action,
    }));
  }, []);

  return { state, setState, buyGenerator, buyUpgrade, addActiveTD, drainQuota, resetQuota, unlockAchievement, applyOutageReward, applyOutagePenalty, applyPvpDebuff, setChatHistory, offlineTDEarned, clearOfflineTDEarned: () => setOfflineTDEarned(0) };
}

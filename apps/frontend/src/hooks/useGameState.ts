import { useState, useEffect, useRef, useCallback, SetStateAction } from "react";
import { GENERATORS, UPGRADES, CORPORATE_RANKS } from "../game/constants";
import { supabase } from "../supabaseClient";
import {
  type Message,
  type GameState,
  loadState,
  calcBulkCost,
  calculateActiveMultiplier,
  resolveRank,
  STORAGE_KEY,
} from "./gameStateUtils";

export type { Message };
export type { GameState, BuddyState, EconomyState, ActiveTicket } from "./gameStateUtils";
export { calcBulkCost } from "./gameStateUtils";

export function useGameState() {
  const [state, setState] = useState<GameState>(loadState);
  const stateRef = useRef(state);
  const [offlineTDEarned, setOfflineTDEarned] = useState(0);

  // Keep the ref in sync with the latest state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Update lastLogin on mount (no passive offline TD — active play only)
  useEffect(() => {
    setState((prev) => ({ ...prev, lastLogin: Date.now() }));
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

  // Debounced server score sync — fires 3s after last TD/inventory change
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncedTD = useRef(state.economy.totalTDEarned);
  useEffect(() => {
    // Only sync if TD or inventory actually changed
    if (state.economy.totalTDEarned === lastSyncedTD.current) return;
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      lastSyncedTD.current = state.economy.totalTDEarned;
      fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: state.username,
          currentTD: Math.floor(state.economy.currentTD),
          totalTDEarned: Math.floor(state.economy.totalTDEarned),
          inventory: state.inventory,
          upgrades: state.upgrades,
        }),
      }).catch(() => {});
    }, 3000);
  }, [state.economy.totalTDEarned, state.economy.currentTD, state.inventory, state.upgrades, state.username]);



  // Background loop — checks achievements (no passive TD generation)
  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => {
        // Check economy achievements
        const newAchievements = [...prev.achievements];

        // dependency_hell: own 10+ NPM Dependency Importers
        if (!newAchievements.includes("dependency_hell") && (prev.inventory["npm"] ?? 0) >= 10) {
          newAchievements.push("dependency_hell");
        }

        // ten_x_developer: active multiplier exceeds 100x
        const multiplier = calculateActiveMultiplier(prev.inventory, prev.upgrades);
        if (!newAchievements.includes("ten_x_developer") && multiplier >= 100) {
          newAchievements.push("ten_x_developer");
        }

        // the_java_enterprise: own 5+ different team member types
        if (!newAchievements.includes("the_java_enterprise")) {
          const ownedTypes = GENERATORS.filter((g) => (prev.inventory[g.id] ?? 0) > 0).length;
          if (ownedTypes >= 5) newAchievements.push("the_java_enterprise");
        }

        // heat_death: reach the maximum corporate rank
        const maxRankTitle = CORPORATE_RANKS[CORPORATE_RANKS.length - 1]!.title;
        if (!newAchievements.includes("heat_death") && prev.economy.currentRank === maxRankTitle) {
          newAchievements.push("heat_death");
        }

        if (newAchievements.length === prev.achievements.length) return prev;

        return {
          ...prev,
          achievements: newAchievements,
        };
      });
    }, 1000); // 1s is enough — no smooth tick needed without passive income

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

  /** Add TD. If raw=true, skip the local multiplier (used for server-awarded TD that's already multiplied). */
  const addActiveTD = useCallback((amount: number, raw = false) => {
    setState((prev) => {
      const multiplier = (!raw && amount > 0)
        ? calculateActiveMultiplier(prev.inventory, prev.upgrades) * prev.economy.tdMultiplier
        : 1;
      const boosted = Math.round(amount * multiplier);
      const newCurrentTD = Math.max(0, prev.economy.currentTD + boosted);
      const newTotalTDEarned = Math.max(0, prev.economy.totalTDEarned + boosted);
      const newRank = resolveRank(newTotalTDEarned, prev.economy.currentRank);

      return {
        ...prev,
        economy: {
          ...prev.economy,
          currentTD: newCurrentTD,
          totalTDEarned: newTotalTDEarned,
          currentRank: newRank,
        },
      };
    });
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

  /** Returns true if the achievement was newly unlocked, false if already owned. */
  const unlockAchievement = useCallback((achievement: string): boolean => {
    if (stateRef.current.achievements.includes(achievement)) return false;
    setState((prev) => {
      if (prev.achievements.includes(achievement)) return prev;
      return {
        ...prev,
        achievements: [...prev.achievements, achievement],
      };
    });
    return true;
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

  const updateTicketProgress = useCallback((amount: number) => {
    setState((prev) => {
      if (!prev.activeTicket) return prev;
      const newProgress = Math.min(
        prev.activeTicket.sprintProgress + amount,
        prev.activeTicket.sprintGoal,
      );
      return {
        ...prev,
        activeTicket: {
          ...prev.activeTicket,
          sprintProgress: newProgress,
        },
      };
    });
  }, []);

  return { state, setState, buyGenerator, buyUpgrade, addActiveTD, resetQuota, unlockAchievement, applyOutageReward, applyOutagePenalty, applyPvpDebuff, setChatHistory, updateTicketProgress, offlineTDEarned, clearOfflineTDEarned: () => setOfflineTDEarned(0) };
}

import { useState, useEffect, useRef, useCallback, SetStateAction } from "react";
import { track, identify } from "../analytics";
import { GENERATORS, UPGRADES, CORPORATE_RANKS, THEMES } from "../game/constants";
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
import { applyServerProfile } from "./profileSync";
import {
  buyGeneratorServer,
  buyUpgradeServer,
  buyThemeServer,
  unlockAchievementServer,
  updateTicketServer,
  fetchSessionProfile,
} from "../api/profileApi";

export type { Message };
export type { GameState, BuddyState, EconomyState, ActiveTicket, ByokUsage } from "./gameStateUtils";
export { calcBulkCost } from "./gameStateUtils";

export function useGameState() {
  const [state, setState] = useState<GameState>(loadState);
  const stateRef = useRef(state);
  const [offlineTDEarned, setOfflineTDEarned] = useState(0);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Update lastLogin on mount (no passive offline TD — active play only)
  useEffect(() => {
    setState((prev) => ({ ...prev, lastLogin: Date.now() }));
  }, []);

  // Session restore: if localStorage was cleared (state looks fresh), but the
  // browser cookie maps to a previously-known user on the server, restore that
  // user's profile instead of starting as a brand-new identity.  The server
  // never returns the license hash (it's a credential); Pro users must re-run
  // /sync to regain Max access after clearing localStorage.
  useEffect(() => {
    const initial = stateRef.current;
    const isFreshState =
      initial.economy.totalTDEarned === 0 &&
      initial.chatHistory.length === 0 &&
      !initial.proKey &&
      !initial.proKeyHash;
    if (!isFreshState) return;

    let cancelled = false;
    fetchSessionProfile().then((result) => {
      if (cancelled || !result.found) return;
      const restoredUsername = result.profile?.username ?? result.username;
      if (restoredUsername) identify({ username: restoredUsername });
      setState((prev) => {
        // Full profile restore (server has user_scores row).
        if (result.profile) {
          return applyServerProfile(prev, result.profile, { includeActiveTicket: true });
        }
        // Username-only restore: server knows the identity but has no
        // profile row yet (e.g., the previous attempt 402'd on quota).
        // Restore the username and accurate quota so the UI is honest.
        if (result.username) {
          return {
            ...prev,
            username: result.username,
            economy: {
              ...prev.economy,
              ...(result.quotaPercent != null ? { quotaPercent: result.quotaPercent } : {}),
            },
          };
        }
        return prev;
      });
    });
    return () => { cancelled = true; };
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

  // Background server score sync — fires every 5 minutes if TD has changed
  // Skip for pro users (server is authoritative)
  const lastSyncedTD = useRef(state.economy.totalTDEarned);
  useEffect(() => {
    const syncInterval = setInterval(() => {
      const current = stateRef.current;
      // Skip sync for pro users — server is authoritative
      if (current.proKeyHash) return;
      // Only sync if totalTDEarned has changed since last sync
      if (current.economy.totalTDEarned === lastSyncedTD.current) return;
      lastSyncedTD.current = current.economy.totalTDEarned;
      // Extract country code from browser locale (fallback for cf-ipcountry)
      let country = "Unknown";
      try {
        const locale = new Intl.Locale(navigator.language);
        country = locale.region ?? "Unknown";
      } catch {
        // Intl.Locale not supported or invalid — keep "Unknown"
      }

      const completedTaskIds = current.pendingCompletedTaskIds ?? [];
      fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: current.username,
          currentTD: Math.floor(current.economy.currentTD),
          totalTDEarned: Math.floor(current.economy.totalTDEarned),
          inventory: current.inventory,
          upgrades: current.upgrades,
          country,
          completedTaskIds,
        }),
      }).then((res) => {
        // Only clear pending task IDs on successful (2xx) response
        if (res.ok && completedTaskIds.length > 0) {
          setState((prev) => ({
            ...prev,
            pendingCompletedTaskIds: prev.pendingCompletedTaskIds.filter(
              (id) => !completedTaskIds.includes(id),
            ),
          }));
        }
      }).catch(() => {});
    }, 300000); // 5 minutes

    return () => clearInterval(syncInterval);
  }, []);

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

        // For pro users, fire server calls for new achievements
        if (prev.proKeyHash) {
          const added = newAchievements.filter((a) => !prev.achievements.includes(a));
          for (const achievementId of added) {
            unlockAchievementServer(prev.username, achievementId, prev.proKeyHash).catch(() => {});
          }
        }

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

    // Optimistic local update
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

    // Pro users: fire server call, apply authoritative response
    if (current.proKeyHash) {
      buyGeneratorServer(current.username, generatorId, amount, current.proKeyHash).then((result) => {
        if (result.success && result.profile) {
          setState((prev) => applyServerProfile(prev, result.profile!));
          track("generator_purchased", { generator_id: generatorId, amount, cost });
        } else if (!result.success) {
          // Rollback on failure
          setState((prev) => ({
            ...prev,
            economy: { ...prev.economy, currentTD: prev.economy.currentTD + cost },
            inventory: { ...prev.inventory, [generatorId]: (prev.inventory[generatorId] ?? 0) - amount },
          }));
        }
      }).catch(() => {});
    } else {
      track("generator_purchased", { generator_id: generatorId, amount, cost });
      // Free users: broadcast big purchases
      if (cost > 1_000_000) {
        const playerName = stateRef.current.username || "A player";
        const purchaseMessage = `💰 ${playerName} bought ${amount}x ${generator.name} for ${cost.toLocaleString()} TD!`;
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
    // Pro users: sync achievement to server
    const current = stateRef.current;
    if (current.proKeyHash) {
      unlockAchievementServer(current.username, achievement, current.proKeyHash).catch(() => {});
    }
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

  const buyUpgrade = useCallback((upgradeId: string): boolean => {
    const upgrade = UPGRADES.find((u) => u.id === upgradeId);
    if (!upgrade) return false;

    const current = stateRef.current;
    if (current.upgrades.includes(upgradeId)) return false;
    if ((current.inventory[upgrade.requiredGeneratorId] ?? 0) < 1) return false;
    if (current.economy.currentTD < upgrade.cost) return false;

    // Optimistic local update
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

    // Pro users: fire server call
    if (current.proKeyHash) {
      buyUpgradeServer(current.username, upgradeId, current.proKeyHash).then((result) => {
        if (result.success && result.profile) {
          setState((prev) => applyServerProfile(prev, result.profile!));
          track("upgrade_purchased", { upgrade_id: upgradeId, cost: upgrade.cost });
        } else if (!result.success) {
          // Rollback
          setState((prev) => ({
            ...prev,
            economy: { ...prev.economy, currentTD: prev.economy.currentTD + upgrade.cost },
            upgrades: prev.upgrades.filter((id) => id !== upgradeId),
          }));
        }
      }).catch(() => {});
    } else {
      track("upgrade_purchased", { upgrade_id: upgradeId, cost: upgrade.cost });
    }

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

  const setActiveTheme = useCallback((themeId: string) => {
    setState((prev) => {
      if (!prev.unlockedThemes.includes(themeId)) return prev;
      return { ...prev, activeTheme: themeId };
    });
  }, []);

  const unlockTheme = useCallback((themeId: string) => {
    setState((prev) => {
      if (prev.unlockedThemes.includes(themeId)) return prev;
      return {
        ...prev,
        unlockedThemes: [...prev.unlockedThemes, themeId],
      };
    });
  }, []);

  /** Purchase a theme. Requires proKey, sufficient TD, and theme not already owned. Returns true on success. */
  const buyTheme = useCallback((themeId: string): boolean => {
    const theme = THEMES.find((t) => t.id === themeId);
    if (!theme) return false;

    const current = stateRef.current;
    // Only paid users can purchase themes
    if (!current.proKeyHash) return false;
    // Already unlocked
    if (current.unlockedThemes.includes(themeId)) return false;
    // Can't afford
    if (current.economy.currentTD < theme.cost) return false;

    // Optimistic local update
    setState((prev) => {
      if (!prev.proKeyHash) return prev;
      if (prev.unlockedThemes.includes(themeId)) return prev;
      if (prev.economy.currentTD < theme.cost) return prev;

      return {
        ...prev,
        economy: {
          ...prev.economy,
          currentTD: prev.economy.currentTD - theme.cost,
        },
        unlockedThemes: [...prev.unlockedThemes, themeId],
      };
    });

    // Pro users: fire server call
    if (current.proKeyHash) {
      buyThemeServer(current.username, themeId, current.proKeyHash).then((result) => {
        if (result.success && result.profile) {
          setState((prev) => applyServerProfile(prev, result.profile!));
          track("theme_purchased", { theme_id: themeId, cost: theme.cost });
        } else if (!result.success) {
          // Rollback
          setState((prev) => ({
            ...prev,
            economy: { ...prev.economy, currentTD: prev.economy.currentTD + theme.cost },
            unlockedThemes: prev.unlockedThemes.filter((id) => id !== themeId),
          }));
        }
      }).catch(() => {});
    } else {
      track("theme_purchased", { theme_id: themeId, cost: theme.cost });
    }

    return true;
  }, []);

  const toggleSound = useCallback(() => {
    setState((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  }, []);

  const updateTicketProgress = useCallback((amount: number) => {
    setState((prev) => {
      if (!prev.activeTicket) return prev;
      const newProgress = Math.min(
        prev.activeTicket.sprintProgress + amount,
        prev.activeTicket.sprintGoal,
      );
      const updatedTicket = {
        ...prev.activeTicket,
        sprintProgress: newProgress,
      };

      // Pro users: sync ticket progress to server
      if (prev.proKeyHash) {
        updateTicketServer(prev.username, updatedTicket, prev.proKeyHash).catch(() => {});
      }

      return {
        ...prev,
        activeTicket: updatedTicket,
      };
    });
  }, []);

  return { state, setState, buyGenerator, buyUpgrade, addActiveTD, resetQuota, unlockAchievement, applyOutageReward, applyOutagePenalty, setChatHistory, setActiveTheme, unlockTheme, buyTheme, toggleSound, updateTicketProgress, offlineTDEarned, clearOfflineTDEarned: () => setOfflineTDEarned(0) };
}

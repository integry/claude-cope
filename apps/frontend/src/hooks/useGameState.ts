import { useState, useEffect, useRef, useCallback, SetStateAction } from "react";
import { track, identify } from "../analytics";
import { AnalyticsEvents } from "../analyticsEvents";
import { GENERATORS, UPGRADES, THEMES, FREE_TIER_RANK_CAP } from "../game/constants";
import { supabase } from "../supabaseClient";
import {
  type Message,
  type GameState,
  loadState,
  calcBulkCost,
  calculateActiveMultiplier,
  resolveRank,
  isPaidUser,
  isFreeUser,
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
import { useScoreSync, useAchievementChecker } from "./useGameEffects";

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
        const withPro = result.isPro ? { ...prev, isPro: true } : prev;
        // Full profile restore (server has user_scores row).
        if (result.profile) {
          return applyServerProfile(withPro, result.profile, { includeActiveTicket: true });
        }
        // Username-only restore: server knows the identity but has no
        // profile row yet (e.g., the previous attempt 402'd on quota).
        // Restore the username and accurate quota so the UI is honest.
        if (result.username) {
          return {
            ...withPro,
            username: result.username,
            economy: {
              ...withPro.economy,
              ...(result.quotaPercent != null ? { quotaPercent: result.quotaPercent } : {}),
            },
          };
        }
        return withPro;
      });
    });
    return () => { cancelled = true; };
  }, []);

  // Pro license validation: if local state claims paid status, verify against
  // the server and clear pro fields when the license has been revoked.
  // Only clear when the server explicitly confirms the user is not Pro
  // (result.found && !result.isPro). If the session mapping is missing
  // (found: false — e.g. cookie expired or KV evicted), the license may
  // still be valid; don't wipe pro state or the user would have to re-sync
  // after every cookie reset. They can re-run /sync <key> to restore the
  // session binding.
  useEffect(() => {
    const initial = stateRef.current;
    if (!isPaidUser(initial)) return;

    let cancelled = false;
    fetchSessionProfile().then((result) => {
      if (cancelled) return;
      if (result.found && !result.isPro) {
        setState((prev) => ({
          ...prev,
          proKey: undefined,
          proKeyHash: undefined,
          isPro: undefined,
        }));
      }
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

  useScoreSync(stateRef, setState, state.economy.totalTDEarned);
  useAchievementChecker(setState);

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
          track(AnalyticsEvents.GENERATOR_PURCHASED, { generator_id: generatorId, amount, cost });
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
      track(AnalyticsEvents.GENERATOR_PURCHASED, { generator_id: generatorId, amount, cost });
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
      // TODO(byok): BYOK rank bypass is client-side only. If the user's localStorage
      // is cleared or they sync from another device, the server will return
      // FREE_TIER_RANK_CAP because the backend has no BYOK awareness yet.
      const newRank = isFreeUser(prev) ? FREE_TIER_RANK_CAP : resolveRank(newTotalTDEarned, prev.economy.currentRank);

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
          track(AnalyticsEvents.UPGRADE_PURCHASED, { upgrade_id: upgradeId, cost: upgrade.cost });
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
      track(AnalyticsEvents.UPGRADE_PURCHASED, { upgrade_id: upgradeId, cost: upgrade.cost });
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
    setState((prev) => prev.unlockedThemes.includes(themeId) ? prev : { ...prev, unlockedThemes: [...prev.unlockedThemes, themeId] });
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
          track(AnalyticsEvents.THEME_PURCHASED, { theme_id: themeId, cost: theme.cost });
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
      track(AnalyticsEvents.THEME_PURCHASED, { theme_id: themeId, cost: theme.cost });
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

import { useState, useEffect, useRef, useCallback, type Dispatch, type SetStateAction } from "react";
import type { ServerProfile } from "@claude-cope/shared/profile";
import { track, identify } from "../analytics";
import { AnalyticsEvents } from "../analyticsEvents";
import { GENERATORS, UPGRADES, THEMES, FREE_TIER_RANK_CAP } from "../game/constants";
import { supabase } from "../supabaseClient";
import { type Message, type GameState, loadState, calcBulkCost, calculateActiveMultiplier, resolveRank, isPaidUser, isFreeUser, STORAGE_KEY } from "./gameStateUtils";
import { applyServerProfile } from "./profileSync";
import { buyGeneratorServer, buyUpgradeServer, buyThemeServer, unlockAchievementServer, updateTicketServer, fetchSessionProfile, updateThemeServer } from "../api/profileApi";
import {
  type SessionProfileResult,
  canBuyTheme,
  applyOptimisticThemePurchase,
  applyThemePurchaseFailure,
  applyThemeEntitlementFailure,
  applyValidatedSessionProState,
  isFreshStateForSessionRestore,
  mergeSessionIdentity,
} from "./themePurchaseState";
import { useScoreSync, useAchievementChecker } from "./useGameEffects";

export type { Message };
export type { GameState, BuddyState, EconomyState, ActiveTicket, ByokUsage } from "./gameStateUtils";
export { calcBulkCost } from "./gameStateUtils";
export {
  canBuyTheme,
  applyOptimisticThemePurchase,
  rollbackOptimisticThemePurchase,
  applyThemePurchaseFailure,
  applyValidatedSessionProState,
} from "./themePurchaseState";

type SetGameState = Dispatch<SetStateAction<GameState>>;

function restoreFreshSession(setState: SetGameState, result: SessionProfileResult): void {
  if (!result.found) return;

  const restoredUsername = result.profile?.username ?? result.username;
  if (restoredUsername) identify({ username: restoredUsername });
  setState((prev) => mergeSessionIdentity(prev, result));
}

function validatePaidSession(setState: SetGameState, result: SessionProfileResult): void {
  setState((prev) => (isPaidUser(prev) || prev.hasSessionPro ? applyValidatedSessionProState(prev, result) : prev));
}

function applyGeneratorPurchase(state: GameState, generatorId: string, amount: number, cost: number): GameState {
  const owned = state.inventory[generatorId] ?? 0;
  return {
    ...state,
    economy: { ...state.economy, currentTD: state.economy.currentTD - cost },
    inventory: { ...state.inventory, [generatorId]: owned + amount },
  };
}

function rollbackGeneratorPurchase(state: GameState, generatorId: string, amount: number, cost: number): GameState {
  return {
    ...state,
    economy: { ...state.economy, currentTD: state.economy.currentTD + cost },
    inventory: { ...state.inventory, [generatorId]: (state.inventory[generatorId] ?? 0) - amount },
  };
}

function applyUpgradePurchase(state: GameState, upgradeId: string, cost: number): GameState {
  return {
    ...state,
    economy: { ...state.economy, currentTD: state.economy.currentTD - cost },
    upgrades: [...state.upgrades, upgradeId],
  };
}

function rollbackUpgradePurchase(state: GameState, upgradeId: string, cost: number): GameState {
  return {
    ...state,
    economy: { ...state.economy, currentTD: state.economy.currentTD + cost },
    upgrades: state.upgrades.filter((id) => id !== upgradeId),
  };
}

function broadcastHighValuePurchase(generatorName: string, amount: number, cost: number, username: string): void {
  if (cost <= 1_000_000) return;
  const playerName = username || "A player";
  const purchaseMessage = `💰 ${playerName} bought ${amount}x ${generatorName} for ${cost.toLocaleString()} TD!`;
  fetch("/api/recent-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: purchaseMessage }),
  }).catch(() => {});
  supabase?.channel("global_incidents").send({
    type: "broadcast",
    event: "new_incident",
    payload: { message: purchaseMessage },
  }).catch(() => {});
}

export function useGameState() {
  const [state, setState] = useState<GameState>(loadState);
  const stateRef = useRef(state);
  const confirmedActiveThemeRef = useRef(state.activeTheme);
  const themeUpdateRequestIdRef = useRef(0);
  const [offlineTDEarned, setOfflineTDEarned] = useState(0);

  const mergeServerProfile = useCallback((profile: ServerProfile) => {
    confirmedActiveThemeRef.current = profile.active_theme;
    setState((prev) => applyServerProfile(prev, profile));
  }, []);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    setState((prev) => ({ ...prev, lastLogin: Date.now() }));
  }, []);

  useEffect(() => {
    const initial = stateRef.current;
    if (!isFreshStateForSessionRestore(initial)) return;

    let cancelled = false;
    fetchSessionProfile().then((result) => {
      if (cancelled) return;
      if (result.profile) confirmedActiveThemeRef.current = result.profile.active_theme;
      restoreFreshSession(setState, result);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const initial = stateRef.current;
    if (!isPaidUser(initial)) return;

    let cancelled = false;
    fetchSessionProfile().then((result) => {
      if (cancelled) return;
      validatePaidSession(setState, result);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    try {
      const toSave = { ...state, chatHistory: state.chatHistory.filter((m) => m.role !== "loading") };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
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

    setState((prev) => {
      const ownedNow = prev.inventory[generatorId] ?? 0;
      const dynamicCost = calcBulkCost(generator.baseCost, ownedNow, amount);
      if (prev.economy.currentTD < dynamicCost) return prev;
      return applyGeneratorPurchase(prev, generatorId, amount, dynamicCost);
    });

    if (current.proKeyHash) {
      buyGeneratorServer(current.username, generatorId, amount, current.proKeyHash).then((result) => {
        if (result.success && result.profile) {
          mergeServerProfile(result.profile);
          track(AnalyticsEvents.GENERATOR_PURCHASED, { generator_id: generatorId, amount, cost });
        } else if (!result.success) {
          setState((prev) => rollbackGeneratorPurchase(prev, generatorId, amount, cost));
        }
      }).catch(() => {});
    } else {
      track(AnalyticsEvents.GENERATOR_PURCHASED, { generator_id: generatorId, amount, cost });
      broadcastHighValuePurchase(generator.name, amount, cost, stateRef.current.username);
    }

    return true;
  }, [mergeServerProfile]);

  const addActiveTD = useCallback((amount: number, raw = false) => {
    setState((prev) => {
      const multiplier = !raw && amount > 0 ? calculateActiveMultiplier(prev.inventory, prev.upgrades) * prev.economy.tdMultiplier : 1;
      const boosted = Math.round(amount * multiplier);
      const newCurrentTD = Math.max(0, prev.economy.currentTD + boosted);
      const newTotalTDEarned = Math.max(0, prev.economy.totalTDEarned + boosted);
      const newRank = isFreeUser(prev) ? FREE_TIER_RANK_CAP : resolveRank(newTotalTDEarned, prev.economy.currentRank);

      return { ...prev, economy: { ...prev.economy, currentTD: newCurrentTD, totalTDEarned: newTotalTDEarned, currentRank: newRank } };
    });
  }, []);

  const resetQuota = useCallback(() => {
    setState((prev) => ({
      ...prev,
      economy: { ...prev.economy, quotaPercent: 100, quotaLockouts: prev.economy.quotaLockouts + 1 },
    }));
  }, []);

  const unlockAchievement = useCallback((achievement: string): boolean => {
    if (stateRef.current.achievements.includes(achievement)) return false;
    setState((prev) => {
      if (prev.achievements.includes(achievement)) return prev;
      return { ...prev, achievements: [...prev.achievements, achievement] };
    });
    const current = stateRef.current;
    if (current.proKeyHash) {
      unlockAchievementServer(current.username, achievement, current.proKeyHash).catch(() => {});
    }
    return true;
  }, []);

  const applyOutageReward = useCallback(() => {
    setState((prev) => ({
      ...prev,
      economy: { ...prev.economy, tdMultiplier: prev.economy.tdMultiplier + 0.05 },
    }));
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
      return applyUpgradePurchase(prev, upgradeId, upgrade.cost);
    });

    if (current.proKeyHash) {
      buyUpgradeServer(current.username, upgradeId, current.proKeyHash).then((result) => {
        if (result.success && result.profile) {
          mergeServerProfile(result.profile);
          track(AnalyticsEvents.UPGRADE_PURCHASED, { upgrade_id: upgradeId, cost: upgrade.cost });
        } else if (!result.success) {
          setState((prev) => rollbackUpgradePurchase(prev, upgradeId, upgrade.cost));
        }
      }).catch(() => {});
    } else {
      track(AnalyticsEvents.UPGRADE_PURCHASED, { upgrade_id: upgradeId, cost: upgrade.cost });
    }

    return true;
  }, [mergeServerProfile]);

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
      return { ...prev, inventory: { ...prev.inventory, [mostExpensiveId]: (prev.inventory[mostExpensiveId] ?? 0) - 1 } };
    });
  }, []);

  const setChatHistory = useCallback((action: SetStateAction<Message[]>) => {
    setState((prev) => ({ ...prev, chatHistory: typeof action === "function" ? action(prev.chatHistory) : action }));
  }, []);

  const setActiveTheme = useCallback((themeId: string) => {
    const current = stateRef.current;
    if (!current.unlockedThemes.includes(themeId) || current.activeTheme === themeId) return;
    const requestId = themeUpdateRequestIdRef.current + 1;
    themeUpdateRequestIdRef.current = requestId;

    setState((prev) => (!prev.unlockedThemes.includes(themeId) ? prev : { ...prev, activeTheme: themeId }));

    if (!current.username) return;

    updateThemeServer(current.username, themeId, current.proKeyHash).then((result) => {
      if (themeUpdateRequestIdRef.current !== requestId) return;
      if (result.success && result.profile) {
        mergeServerProfile(result.profile);
        return;
      }
      if (!result.success) {
        setState((prev) => {
          const rollbackThemeId = prev.unlockedThemes.includes(confirmedActiveThemeRef.current) ? confirmedActiveThemeRef.current : "default";
          return applyThemeEntitlementFailure({ ...prev, activeTheme: rollbackThemeId }, result.error, result.errorCode);
        });
      }
    }).catch(() => {
      if (themeUpdateRequestIdRef.current !== requestId) return;
      setState((prev) => {
        const rollbackThemeId = prev.unlockedThemes.includes(confirmedActiveThemeRef.current) ? confirmedActiveThemeRef.current : "default";
        return applyThemeEntitlementFailure({ ...prev, activeTheme: rollbackThemeId }, "Network error");
      });
    });
  }, [mergeServerProfile]);

  const unlockTheme = useCallback((themeId: string) => {
    setState((prev) => prev.unlockedThemes.includes(themeId) ? prev : { ...prev, unlockedThemes: [...prev.unlockedThemes, themeId] });
  }, []);

  const buyTheme = useCallback((themeId: string): boolean => {
    const theme = THEMES.find((t) => t.id === themeId);
    if (!theme) return false;

    const current = stateRef.current;
    if (!canBuyTheme(current, themeId)) return false;

    setState((prev) => applyOptimisticThemePurchase(prev, themeId));

    buyThemeServer(current.username, themeId, current.proKeyHash).then((result) => {
      if (result.success && result.profile) {
        mergeServerProfile(result.profile);
        track(AnalyticsEvents.THEME_PURCHASED, { theme_id: themeId, cost: theme.cost });
      } else if (!result.success) {
        setState((prev) => applyThemePurchaseFailure(prev, themeId, result.error, result.errorCode));
      }
    }).catch(() => {
      setState((prev) => applyThemePurchaseFailure(prev, themeId, "Network error"));
    });

    return true;
  }, [mergeServerProfile]);

  const toggleSound = useCallback(() => {
    setState((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  }, []);

  const updateTicketProgress = useCallback((amount: number) => {
    setState((prev) => {
      if (!prev.activeTicket) return prev;
      const newProgress = Math.min(prev.activeTicket.sprintProgress + amount, prev.activeTicket.sprintGoal);
      const updatedTicket = { ...prev.activeTicket, sprintProgress: newProgress };

      if (prev.proKeyHash) {
        updateTicketServer(prev.username, updatedTicket, prev.proKeyHash).catch(() => {});
      }
      return { ...prev, activeTicket: updatedTicket };
    });
  }, []);

  const getCurrentState = useCallback(() => stateRef.current, []);

  return { state, setState, getCurrentState, buyGenerator, buyUpgrade, addActiveTD, resetQuota, unlockAchievement, applyOutageReward, applyOutagePenalty, setChatHistory, setActiveTheme, unlockTheme, buyTheme, toggleSound, updateTicketProgress, offlineTDEarned, clearOfflineTDEarned: () => setOfflineTDEarned(0) };
}

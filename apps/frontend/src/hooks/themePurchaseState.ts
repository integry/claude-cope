import type { ServerProfile } from "@claude-cope/shared/profile";
import type { ThemeEntitlementErrorCode } from "../api/profileApi";
import { THEMES } from "../game/constants";
import type { GameState } from "./gameStateUtils";
import { isPaidUser, nextMsgId } from "./gameStateUtils";
import { applyServerProfile } from "./profileSync";

export type SessionProfileResult = {
  found: boolean;
  username?: string;
  profile?: ServerProfile | null;
  isPro?: boolean;
  quotaPercent?: number | null;
};

function hasThemePurchaseAccess(state: Pick<GameState, "proKeyHash" | "hasSessionPro">): boolean {
  return Boolean(state.proKeyHash) || Boolean(state.hasSessionPro);
}

function isDefinitiveThemePurchaseEntitlementError(error?: string, errorCode?: ThemeEntitlementErrorCode): boolean {
  if (errorCode === "active_max_license_required" || errorCode === "license_inactive") return true;
  if (!error) return false;
  const normalized = error.toLowerCase();
  return normalized.includes("active max license") || normalized.includes("revoked") || normalized.includes("no longer active");
}

function isThemePurchaseSessionMismatchError(error?: string, errorCode?: ThemeEntitlementErrorCode): boolean {
  if (errorCode === "session_auth_required" || errorCode === "session_user_mismatch") return true;
  if (!error) return false;
  const normalized = error.toLowerCase();
  return normalized.includes("session authentication is required") || normalized.includes("session user does not match");
}

function clearStaleSessionEntitlement(state: GameState): GameState {
  if (state.proKeyHash) return { ...state, hasSessionPro: undefined };
  return {
    ...state,
    proKey: undefined,
    proKeyHash: undefined,
    isPro: undefined,
    hasSessionPro: undefined,
  };
}

export function canBuyTheme(state: Pick<GameState, "economy" | "unlockedThemes" | "proKeyHash" | "hasSessionPro">, themeId: string): boolean {
  const theme = THEMES.find((t) => t.id === themeId);
  if (!theme) return false;
  if (!hasThemePurchaseAccess(state)) return false;
  if (state.unlockedThemes.includes(themeId)) return false;
  if (state.economy.currentTD < theme.cost) return false;
  return true;
}

export function applyOptimisticThemePurchase(state: GameState, themeId: string): GameState {
  const theme = THEMES.find((t) => t.id === themeId);
  if (!theme) return state;
  if (!canBuyTheme(state, themeId)) return state;
  return { ...state, economy: { ...state.economy, currentTD: state.economy.currentTD - theme.cost }, unlockedThemes: [...state.unlockedThemes, themeId] };
}

export function rollbackOptimisticThemePurchase(state: GameState, themeId: string): GameState {
  const theme = THEMES.find((t) => t.id === themeId);
  if (!theme) return state;
  if (!state.unlockedThemes.includes(themeId)) return state;
  return { ...state, economy: { ...state.economy, currentTD: state.economy.currentTD + theme.cost }, unlockedThemes: state.unlockedThemes.filter((id) => id !== themeId) };
}

export function mergeSessionIdentity(state: GameState, result: SessionProfileResult): GameState {
  const nextState = result.isPro ? { ...state, isPro: true, hasSessionPro: true } : state;
  if (result.profile) return applyServerProfile(nextState, result.profile, { includeActiveTicket: true });
  if (!result.username) return nextState;

  return {
    ...nextState,
    username: result.username,
    economy: {
      ...nextState.economy,
      ...(result.quotaPercent != null ? { quotaPercent: result.quotaPercent } : {}),
    },
  };
}

export function isFreshStateForSessionRestore(state: GameState): boolean {
  return state.economy.totalTDEarned === 0
    && state.chatHistory.length === 0
    && !state.proKey
    && !state.proKeyHash;
}

export function applyValidatedSessionProState(state: GameState, result: SessionProfileResult): GameState {
  if (!result.found || !result.isPro) {
    if (!isPaidUser(state) && !state.hasSessionPro) return state;
    return { ...state, proKey: undefined, proKeyHash: undefined, isPro: undefined, hasSessionPro: undefined };
  }

  const restoredUsername = result.profile?.username ?? result.username;
  if (state.hasSessionPro && state.isPro && (!restoredUsername || state.username === restoredUsername)) {
    return state;
  }
  return { ...state, ...(restoredUsername && state.username !== restoredUsername ? { username: restoredUsername } : {}), isPro: true, hasSessionPro: true };
}

export function applyThemePurchaseFailure(state: GameState, themeId: string, error?: string, errorCode?: ThemeEntitlementErrorCode): GameState {
  const rolledBack = rollbackOptimisticThemePurchase(state, themeId);
  const nextState = isDefinitiveThemePurchaseEntitlementError(error, errorCode) ? {
    ...rolledBack,
    proKey: undefined,
    proKeyHash: undefined,
    isPro: undefined,
    hasSessionPro: undefined,
  } : isThemePurchaseSessionMismatchError(error, errorCode) ? clearStaleSessionEntitlement(rolledBack) : rolledBack;
  const message = error ?? "Theme purchase failed";
  return { ...nextState, chatHistory: [...nextState.chatHistory, { id: nextMsgId(), role: "error", content: `[❌ Error] ${message}` }] };
}

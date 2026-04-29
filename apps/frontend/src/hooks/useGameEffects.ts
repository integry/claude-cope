import { useEffect, useRef, type MutableRefObject, type Dispatch, type SetStateAction } from "react";
import { GENERATORS, CORPORATE_RANKS } from "../game/constants";
import { type GameState, calculateActiveMultiplier } from "./gameStateUtils";
import { unlockAchievementServer } from "../api/profileApi";

/**
 * Background server score sync — fires every 5 minutes if TD has changed.
 * Skips pro users (server is authoritative for them).
 */
export function useScoreSync(
  stateRef: MutableRefObject<GameState>,
  setState: Dispatch<SetStateAction<GameState>>,
  initialTotalTD: number,
) {
  const lastSyncedTD = useRef(initialTotalTD);

  useEffect(() => {
    const syncInterval = setInterval(() => {
      const current = stateRef.current;
      if (current.proKeyHash) return;
      if (current.economy.totalTDEarned === lastSyncedTD.current) return;
      lastSyncedTD.current = current.economy.totalTDEarned;

      let country = "Unknown";
      try {
        const locale = new Intl.Locale(navigator.language);
        country = locale.region ?? "Unknown";
      } catch {
        // Intl.Locale not supported or invalid
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
  }, [stateRef, setState]);
}

/**
 * Background achievement checker — runs every second and checks economy-based
 * achievement conditions. No passive TD generation.
 */
export function useAchievementChecker(
  setState: Dispatch<SetStateAction<GameState>>,
) {
  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => {
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
    }, 1000);

    return () => clearInterval(interval);
  }, [setState]);
}

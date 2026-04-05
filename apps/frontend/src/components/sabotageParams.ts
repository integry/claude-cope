import { CORPORATE_RANKS } from "../game/constants";
import type { GameState } from "../hooks/useGameState";
import type { Message } from "./Terminal";

type SetHistory = React.Dispatch<React.SetStateAction<Message[]>>;
type SetState = React.Dispatch<React.SetStateAction<GameState>>;

export function parseSabotageParams(
  setState: SetState,
  setHistory: SetHistory,
) {
  const params = new URLSearchParams(window.location.search);
  if (params.get("sabotage") !== "true") return;

  const target = parseInt(params.get("target") ?? "0", 10);
  const rankTitle = params.get("rank") ?? "";

  if (target > 0) {
    let rankIndex = 0;
    for (let i = 0; i < CORPORATE_RANKS.length; i++) {
      if (CORPORATE_RANKS[i]!.title === rankTitle) {
        rankIndex = i;
        break;
      }
    }

    setState((prev) => {
      const newRankIndex = Math.max(
        CORPORATE_RANKS.findIndex((r) => r.title === prev.economy.currentRank),
        rankIndex,
      );
      return {
        ...prev,
        economy: {
          ...prev.economy,
          currentTD: target,
          totalTDEarned: target,
          currentRank: CORPORATE_RANKS[newRankIndex]?.title ?? prev.economy.currentRank,
        },
      };
    });

    setHistory((prev) => [
      ...prev,
      {
        role: "warning" as const,
        content: `[🚨 **SABOTAGE**] A colleague sent you **${target.toLocaleString()} TD** of inherited technical debt! Your rank has been set to **${rankTitle || "Unknown"}**.`,
      },
    ]);
  }

  window.history.replaceState({}, "", window.location.pathname);
}

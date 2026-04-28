import type { Dispatch, SetStateAction } from "react";
import type { Message, GameState } from "../hooks/useGameState";
import { buildAchievementBox } from "./achievementBox";

export function triggerQuotaLockout({
  playError,
  setHistory,
  state,
  unlockAchievementWithSound,
  resetQuota,
  setInstantBanReady,
  setState,
}: {
  playError: () => void;
  setHistory: Dispatch<SetStateAction<Message[]>>;
  state: { economy: { quotaLockouts: number }; proKey?: string; proKeyHash?: string };
  unlockAchievementWithSound: (id: string) => boolean;
  resetQuota: () => void;
  setInstantBanReady: Dispatch<SetStateAction<boolean>>;
  setState: Dispatch<SetStateAction<GameState>>;
}) {
  playError();
  setHistory((prev) =>
    [
      ...prev.filter((m) => m.role !== "loading"),
      { role: "error", content: "[HTTP 429] Limit Exceeded. You feel like Homer at an all-you-can-eat restaurant." },
      { role: "warning", content: "[⚙️] Upgrading to $200/mo Max Tier..." },
    ]
  );
  setTimeout(() => {
    const newLockouts = state.economy.quotaLockouts + 1;
    const isNew = newLockouts >= 3 && unlockAchievementWithSound("homer_at_the_buffet");
    const achievementMsg: Message[] = isNew ? [{ role: "warning", content: buildAchievementBox("homer_at_the_buffet") }] : [];
    if (state.proKey || state.proKeyHash) {
      resetQuota();
      if (newLockouts === 1) setInstantBanReady(true);
      setHistory((prev) =>
        [
          ...prev,
          { role: "system", content: "[SUCCESS] Max Tier activated. Quota refilled. Your paid plan limit applies — check the header bar." },
          ...achievementMsg,
        ]
      );
    } else {
      setState((prev) => ({ ...prev, economy: { ...prev.economy, quotaPercent: 0, quotaLockouts: prev.economy.quotaLockouts + 1 } }));
      setHistory((prev) =>
        [
          ...prev,
          { role: "error", content: "[QUOTA EXHAUSTED] Free tier API quota depleted. Purchase Max to continue." },
          ...achievementMsg,
        ]
      );
    }
  }, 5000);
}

export function triggerInstantBan({
  setInstantBanReady,
  setIsProcessing,
  playError,
  setHistory,
}: {
  setInstantBanReady: Dispatch<SetStateAction<boolean>>;
  setIsProcessing: Dispatch<SetStateAction<boolean>>;
  playError: () => void;
  setHistory: Dispatch<SetStateAction<Message[]>>;
}) {
  setInstantBanReady(false);
  setIsProcessing(true);
  playError();
  setHistory((prev) =>
    [
      ...prev.filter((m) => m.role !== "loading"),
      { role: "error", content: "[ACCOUNT BANNED] Suspicious activity detected. Thanks for the $200." },
    ]
  );
  setTimeout(() => {
    setIsProcessing(false);
    setHistory((prev) =>
      [
        ...prev,
        { role: "system", content: "[APPEAL ACCEPTED] Your ban has been overturned. We kept the $200." },
      ]
    );
  }, 5000);
}

import type { Dispatch, SetStateAction } from "react";
import type { Message, GameState } from "../hooks/useGameState";
import { submitBrag } from "./submitBrag";
import { rollBuddy } from "./slashCommandExecutor";

export function handleBragSubmit({
  inputValue,
  setInputValue,
  state,
  setHistory,
  setBragPending,
}: {
  inputValue: string;
  setInputValue: Dispatch<SetStateAction<string>>;
  state: GameState;
  setHistory: Dispatch<SetStateAction<Message[]>>;
  setBragPending: Dispatch<SetStateAction<boolean>>;
}) {
  const username = inputValue.trim();
  setInputValue("");
  const generatorsOwned = Object.values(state.inventory).reduce((sum, count) => sum + count, 0);
  const mostAbusedCommand = Object.entries(state.commandUsage).reduce(
    (best, [cmd, count]) => (count > best[1] ? [cmd, count] : best),
    ["/clear", 0] as [string, number]
  )[0];
  submitBrag({ username, currentRank: state.economy.currentRank, totalTDEarned: state.economy.totalTDEarned, generatorsOwned, mostAbusedCommand, setHistory, setBragPending });
}

export function handleBuddyConfirm({
  inputValue,
  setInputValue,
  setBuddyPendingConfirm,
  setState,
  setHistory,
  buddyType,
}: {
  inputValue: string;
  setInputValue: Dispatch<SetStateAction<string>>;
  setBuddyPendingConfirm: Dispatch<SetStateAction<boolean>>;
  setState: Dispatch<SetStateAction<GameState>>;
  setHistory: Dispatch<SetStateAction<Message[]>>;
  buddyType?: string;
}) {
  const answer = inputValue.trim().toLowerCase();
  setInputValue("");
  setBuddyPendingConfirm(false);
  if (answer === "y" || answer === "yes") {
    setHistory((prev) => [...prev, { role: "user", content: inputValue }]);
    rollBuddy(setState, setHistory, buddyType);
  } else {
    setHistory((prev) =>
      [
        ...prev,
        { role: "user", content: inputValue },
        { role: "system", content: "[✓] Buddy re-roll cancelled. Your current buddy is safe... for now." },
      ]
    );
  }
}

export function tryOutageDamage({
  inputValue,
  outageHp,
  DAMAGE_COMMANDS,
  sendDamage,
  setHistory,
  setInputValue,
}: {
  inputValue: string;
  outageHp: number | null;
  DAMAGE_COMMANDS: string[];
  sendDamage: () => void;
  setHistory: Dispatch<SetStateAction<Message[]>>;
  setInputValue: Dispatch<SetStateAction<string>>;
}): boolean {
  if (outageHp === null || !DAMAGE_COMMANDS.includes(inputValue.trim().toLowerCase())) return false;
  sendDamage();
  setHistory((prev) =>
    [...prev, { role: "user", content: inputValue }, { role: "system", content: `[💥 HIT] Damage dealt to PROD OUTAGE!` }]
  );
  setInputValue("");
  return true;
}

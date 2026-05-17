import type { Dispatch, SetStateAction } from "react";
import type { OutageScenario } from "@claude-cope/shared/multiplayer-types";
import {
  outageScenarioMatchesCommand,
} from "@claude-cope/shared/outageScenarios";
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
  username,
  proKeyHash,
}: {
  inputValue: string;
  setInputValue: Dispatch<SetStateAction<string>>;
  setBuddyPendingConfirm: Dispatch<SetStateAction<boolean>>;
  setState: Dispatch<SetStateAction<GameState>>;
  setHistory: Dispatch<SetStateAction<Message[]>>;
  buddyType?: string;
  username?: string;
  proKeyHash?: string;
}) {
  const answer = inputValue.trim().toLowerCase();
  setInputValue("");
  setBuddyPendingConfirm(false);
  if (answer === "y" || answer === "yes") {
    setHistory((prev) => [...prev, { role: "user", content: inputValue }]);
    rollBuddy(setState, setHistory, buddyType, username, proKeyHash);
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
  activeOutageScenario,
  sendDamage,
  setHistory,
  setInputValue,
}: {
  inputValue: string;
  outageHp: number | null;
  activeOutageScenario: OutageScenario | null;
  sendDamage: (command: string) => void;
  setHistory: Dispatch<SetStateAction<Message[]>>;
  setInputValue: Dispatch<SetStateAction<string>>;
}): boolean {
  if (outageHp === null || !activeOutageScenario) return false;
  if (!outageScenarioMatchesCommand(activeOutageScenario, inputValue)) return false;
  sendDamage(inputValue);
  setHistory((prev) =>
    [
      ...prev,
      { role: "user", content: inputValue },
      { role: "system", content: `[💥 HIT] Damage dealt to ${activeOutageScenario.title}!` },
    ]
  );
  setInputValue("");
  return true;
}

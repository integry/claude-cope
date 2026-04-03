import type { Message } from "./Terminal";
import type { GameState } from "../hooks/useGameState";

export function handleKeyCommand(
  inputValue: string,
  setState: React.Dispatch<React.SetStateAction<GameState>>,
  setHistory: React.Dispatch<React.SetStateAction<Message[]>>,
): boolean {
  if (!inputValue.trim().toLowerCase().startsWith("/key ")) return false;

  const keyArg = inputValue.trim().slice(5).trim();
  if (keyArg.toLowerCase() === "clear") {
    setState((prev) => ({ ...prev, apiKey: undefined }));
    setHistory((prev) => [
      ...prev,
      { role: "user", content: "/key clear" },
      { role: "system", content: "[🔑] API key removed. Using default server key." },
    ]);
  } else if (keyArg.length > 0) {
    setState((prev) => ({ ...prev, apiKey: keyArg }));
    const masked = keyArg.slice(0, 6) + "..." + keyArg.slice(-4);
    setHistory((prev) => [
      ...prev,
      { role: "user", content: `/key ${masked}` },
      { role: "system", content: `[🔑] API key set (${masked}). Your key will be used for all future requests.` },
    ]);
  }
  return true;
}

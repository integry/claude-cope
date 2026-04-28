import { Message } from "../hooks/useGameState";

/**
 * Build LLM context from chat history.
 * Pairs user messages with a short summary of the bot reply to maintain
 * conversation rhythm without leaking old content.
 */
export function filterChatHistory(history: Message[]): { role: string; content: string }[] {
  const isSlashCmd = (content: string) => content.startsWith("/");
  return history.filter((m, i) => {
    // Never send free-tier scaffolding (ads, queue messages) to the model
    if ((m as Message & { _freeTierScaffold?: boolean })._freeTierScaffold) return false;
    if (m.role === "user") return !isSlashCmd(m.content);
    if (m.role === "system") {
      const prev = history[i - 1];
      if (prev?.role === "user" && isSlashCmd(prev.content)) return false;
      return true;
    }
    return false;
  }).map((m) => ({
    role: m.role === "system" ? "assistant" : "user",
    content: m.content,
  }));
}

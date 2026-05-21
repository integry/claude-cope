import { Message } from "../hooks/useGameState";

const TICKET_SCAFFOLD_PATTERN = /^\[\s*(?:📋\s+INCOMING TICKET|INCOMING TICKET|CORPORATE DOSSIER|JIRA PAYLOAD IMPORTED|📋\s+\*\*(?:BACKLOG|COMMUNITY BACKLOG)\*\*)\s*\]/;
const CLAIMED_TICKET_FALLBACK_PATTERN = /^\[\s*JIRA PAYLOAD IMPORTED\s*\]/;

function isClaimedTicketBoundary(message: Message): boolean {
  return message.role === "system" && (
    message.ticketDisplay?.status === "claimed"
    || CLAIMED_TICKET_FALLBACK_PATTERN.test(message.content)
  );
}

function getTicketContextScope(history: Message[]): Message[] {
  for (let index = history.length - 1; index >= 0; index -= 1) {
    if (isClaimedTicketBoundary(history[index]!)) {
      return history.slice(index + 1);
    }
  }
  return history;
}

/**
 * Build LLM context from chat history.
 * Pairs user messages with a short summary of the bot reply to maintain
 * conversation rhythm without leaking old content.
 */
export function filterChatHistory(history: Message[]): { role: string; content: string }[] {
  const isSlashCmd = (content: string) => content.startsWith("/");
  const isTicketOfferOrBoardScaffold = (content: string) =>
    TICKET_SCAFFOLD_PATTERN.test(content);
  const scopedHistory = getTicketContextScope(history);

  return scopedHistory.filter((m, i) => {
    // Never send free-tier scaffolding (ads, queue messages) to the model
    if ((m as Message & { _freeTierScaffold?: boolean })._freeTierScaffold) return false;
    if (m.role === "user") return !isSlashCmd(m.content);
    if (m.role === "system") {
      const prev = scopedHistory[i - 1];
      if (prev?.role === "user" && isSlashCmd(prev.content)) return false;
      if (m.ticketDisplay || m.backlogDisplay) return false;
      if (isTicketOfferOrBoardScaffold(m.content)) return false;
      return true;
    }
    return false;
  }).map((m) => ({
    role: m.role === "system" ? "assistant" : "user",
    content: m.content,
  }));
}

import { Message } from "../hooks/useGameState";

const TICKET_SCAFFOLD_PATTERN = /^\[\s*(?:📋\s+INCOMING TICKET|INCOMING TICKET|CORPORATE DOSSIER|JIRA PAYLOAD IMPORTED|📋\s+\*\*(?:BACKLOG|COMMUNITY BACKLOG)\*\*)\s*\]/;
const CLAIMED_TICKET_FALLBACK_HEADER_PATTERN = /^\[\s*JIRA PAYLOAD IMPORTED\s*\]/;
const CLAIMED_TICKET_FALLBACK_REQUIRED_PREFIXES = [
  "ID: ",
  "TITLE: ",
  "REPORTER: ",
] as const;
const CLAIMED_TICKET_FALLBACK_DESCRIPTION_PREFIX = "DESCRIPTION: ";
const CLAIMED_TICKET_FALLBACK_REWARD_PREFIX = "REWARD: ";

function hasLegacyClaimedTicketStructure(content: string): boolean {
  if (!CLAIMED_TICKET_FALLBACK_HEADER_PATTERN.test(content)) return false;

  const lines = content.split("\n");
  const metadataStartIndex = 2;
  const hasMetadataBlock = CLAIMED_TICKET_FALLBACK_REQUIRED_PREFIXES.every(
    (prefix, index) => lines[metadataStartIndex + index]?.startsWith(prefix),
  );

  if (!hasMetadataBlock) return false;

  return lines.some((line) => line.startsWith(CLAIMED_TICKET_FALLBACK_DESCRIPTION_PREFIX))
    && lines.some((line) => line.startsWith(CLAIMED_TICKET_FALLBACK_REWARD_PREFIX));
}

function isClaimedTicketBoundary(message: Message): boolean {
  if (message.role !== "system") return false;
  if (message.contextBoundary === "ticket-claim") return true;
  if (message.ticketDisplay) return false;
  return hasLegacyClaimedTicketStructure(message.content);
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

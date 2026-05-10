import { API_BASE } from "../config";
import type { CommunityBacklogTicket, PlayableBacklogTicket } from "@claude-cope/shared/backlogTickets";
import type { Message } from "./Terminal";

/** The pending ticket offered to the user, waiting for /accept */
let pendingTicketOffer: PlayableBacklogTicket | null = null;

export function getPendingOffer(): PlayableBacklogTicket | null {
  return pendingTicketOffer;
}

export function clearPendingOffer(): void {
  pendingTicketOffer = null;
}

export function extractSender(description: string): { sender: string; body: string } | null {
  const match = description.match(
    /^([\p{L}\w'-]+(?:\s[\p{L}\w'-]+)*)\s+from\s+(?!the\s|a\s|an\s)([\p{L}\w][\p{L}\w\s&-]*?)(?:\s+(?:here|again)\s*[,.:;—–-]?\s+|\s*[,.:;—–-]\s*)([\s\S]+)/u,
  );
  if (!match) return null;
  return {
    sender: `${match[1]!} (${match[2]!.trim()})`,
    body: match[3]!.trim(),
  };
}

/**
 * Fetches a random community ticket and displays it as an offer.
 * Only called if no active ticket exists.
 */
export async function fetchRandomTicketPrompt(
  setHistory: React.Dispatch<React.SetStateAction<Message[]>>,
  proKeyHash?: string,
): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/api/tickets/community`, {
      headers: proKeyHash ? { "x-pro-key-hash": proKeyHash } : undefined,
    });
    if (!res.ok) return;

    const tickets = (await res.json()) as CommunityBacklogTicket[];
    const playableTickets = tickets.filter((ticket): ticket is PlayableBacklogTicket => !ticket.is_locked);
    if (!playableTickets.length) return;

    const ticket = playableTickets[Math.floor(Math.random() * playableTickets.length)]!;
    pendingTicketOffer = ticket;

    const reward = (ticket.technical_debt * 10).toLocaleString("en-US");
    const extracted = extractSender(ticket.description);
    const sender = ticket.reporter_name?.trim()
      ? ticket.reporter_title?.trim()
        ? `${ticket.reporter_name.trim()} [${ticket.reporter_title.trim()}]`
        : ticket.reporter_name.trim()
      : ticket.reporter?.trim() || extracted?.sender || "";
    const senderLine = sender ? `FROM: ${sender}\n\n` : "";
    const body = extracted ? extracted.body : ticket.description;
    const reporterDescriptionLine = ticket.reporter_description?.trim()
      ? `${ticket.reporter_description.trim()}\n\n`
      : "";

    setHistory((prev) => [
      ...prev,
      {
        role: "system",
        content:
          `[📋 INCOMING TICKET] Your PM has assigned you a ticket:\n\n` +
          `===\n\n` +
          `**${ticket.title}**\n\n` +
          senderLine +
          reporterDescriptionLine +
          `> ${body}\n\n` +
          `[✅ REWARD: ${reward} TD]\n\n` +
          `---\n\n` +
          `Type \`/accept\` to start working on it, or \`/backlog\` to browse other tickets.`,
      },
    ]);
  } catch {
    // Network error — silently skip the prompt
  }
}

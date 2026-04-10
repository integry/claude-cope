import { API_BASE } from "../config";
import type { Message } from "./Terminal";

type BacklogTicket = { id: string; title: string; description: string; technical_debt: number; kickoff_prompt: string };

/** The pending ticket offered to the user, waiting for /accept */
let pendingTicketOffer: BacklogTicket | null = null;

export function getPendingOffer(): BacklogTicket | null {
  return pendingTicketOffer;
}

export function clearPendingOffer(): void {
  pendingTicketOffer = null;
}

/**
 * Fetches a random community ticket and displays it as an offer.
 * Only called if no active ticket exists.
 */
export async function fetchRandomTicketPrompt(
  setHistory: React.Dispatch<React.SetStateAction<Message[]>>,
): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/api/tickets/community`);
    if (!res.ok) return;

    const tickets = (await res.json()) as BacklogTicket[];
    if (!tickets.length) return;

    const ticket = tickets[Math.floor(Math.random() * tickets.length)]!;
    pendingTicketOffer = ticket;

    setHistory((prev) => [
      ...prev,
      {
        role: "system",
        content:
          `[📋 INCOMING TICKET] Your PM has assigned you a ticket:\n\n` +
          `**${ticket.title}** (Reward: ${(ticket.technical_debt * 10).toLocaleString()} TD)\n\n` +
          `> ${ticket.description}\n\n` +
          `Type \`/accept\` to start working on it, or \`/backlog\` to browse other tickets.`,
      },
    ]);
  } catch {
    // Network error — silently skip the prompt
  }
}

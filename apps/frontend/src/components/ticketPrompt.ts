import { API_BASE } from "../config";
import type { Message } from "./Terminal";

type BacklogTicket = { id: string; title: string; description: string; technical_debt: number };

/**
 * Fetches a random community ticket and displays it as a first-time prompt.
 * Called once for new users after the boot sequence completes.
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

    setHistory((prev) => [
      ...prev,
      {
        role: "system",
        content:
          `[📋 INCOMING TICKET] Your PM has already assigned you a ticket:\n\n` +
          `**${ticket.title}** (${ticket.technical_debt} TD)\n\n` +
          `> ${ticket.description}\n\n` +
          `Type \`/backlog\` to browse community tickets, or \`/take 1\` after browsing to claim one.`,
      },
    ]);
  } catch {
    // Network error — silently skip the prompt so it doesn't block the experience
  }
}

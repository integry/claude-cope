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

export function extractSender(description: string): { sender: string; body: string } | null {
  const match = description.match(
    /^([\p{L}\w'-]+(?:\s[\p{L}\w'-]+)*)\s+from\s+(?!the\s|a\s|an\s)([\p{L}\w][\p{L}\w\s&-]*?)(?:\s+(?:here|again))?\s*[,.:;—–-]\s*([\s\S]+)/u,
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
): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/api/tickets/community`);
    if (!res.ok) return;

    const tickets = (await res.json()) as BacklogTicket[];
    if (!tickets.length) return;

    const ticket = tickets[Math.floor(Math.random() * tickets.length)]!;
    pendingTicketOffer = ticket;

    const reward = (ticket.technical_debt * 10).toLocaleString("en-US");
    const extracted = extractSender(ticket.description);
    const senderLine = extracted ? `FROM: ${extracted.sender}\n\n` : "";
    const body = extracted ? extracted.body : ticket.description;

    setHistory((prev) => [
      ...prev,
      {
        role: "system",
        content:
          `[📋 INCOMING TICKET] Your PM has assigned you a ticket:\n\n` +
          `---\n\n` +
          `**${ticket.title}**\n\n` +
          senderLine +
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

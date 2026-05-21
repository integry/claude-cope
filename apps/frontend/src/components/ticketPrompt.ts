import { API_BASE } from "../config";
import type { CommunityBacklogTicket, PlayableBacklogTicket } from "@claude-cope/shared/backlogTickets";
import type { Message, TicketDisplayData } from "../hooks/useGameState";

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

function buildReporter(ticket: Pick<PlayableBacklogTicket, "reporter_name" | "reporter_title" | "reporter" | "description">): string {
  const extracted = extractSender(ticket.description);
  if (ticket.reporter_name?.trim()) {
    if (ticket.reporter_title?.trim()) {
      return `${ticket.reporter_name.trim()} [${ticket.reporter_title.trim()}]`;
    }
    return ticket.reporter_name.trim();
  }
  return ticket.reporter?.trim() || extracted?.sender || "Unknown reporter";
}

function buildTicketBody(ticket: Pick<PlayableBacklogTicket, "description">): string {
  return extractSender(ticket.description)?.body || ticket.description;
}

export function buildTicketDisplay(
  ticket: PlayableBacklogTicket,
  status: TicketDisplayData["status"],
): TicketDisplayData {
  return {
    kind: "corporate-dossier",
    status,
    heading: status === "offered" ? "[ INCOMING TICKET ]" : "[ JIRA PAYLOAD IMPORTED ]",
    ticketId: ticket.id,
    title: ticket.title,
    reporter: buildReporter(ticket),
    profile: ticket.reporter_description?.trim() || undefined,
    body: buildTicketBody(ticket),
    reward: `${(ticket.technical_debt * 10).toLocaleString("en-US")} TD`,
    footer: status === "offered"
      ? [
        "Type /accept to start working on it, or /backlog to browse other tickets.",
      ]
      : [
        "Start prompting to make progress.",
      ],
  };
}

export function buildTicketFallbackText(ticketDisplay: TicketDisplayData): string {
  const profileLine = ticketDisplay.profile ? `PROFILE: ${ticketDisplay.profile}\n` : "";
  const descriptionLines = ticketDisplay.body.split("\n");
  const descriptionBlock = descriptionLines.length
    ? `DESCRIPTION: ${descriptionLines[0]}\n${descriptionLines.slice(1).map((line) => `             ${line}`).join("\n")}`
    : "DESCRIPTION:";
  const footerBlock = ticketDisplay.footer.length ? `\n${ticketDisplay.footer.join("\n")}` : "";

  return (
    `${ticketDisplay.heading}\n\n` +
    `ID: ${ticketDisplay.ticketId}\n` +
    `TITLE: ${ticketDisplay.title}\n` +
    `REPORTER: ${ticketDisplay.reporter}\n` +
    profileLine +
    `\n${descriptionBlock}\n\n` +
    `REWARD: ${ticketDisplay.reward}` +
    footerBlock
  );
}

export function buildTicketMessage(
  ticket: PlayableBacklogTicket,
  status: TicketDisplayData["status"],
): Message {
  const ticketDisplay = buildTicketDisplay(ticket, status);
  return {
    role: "system",
    content: buildTicketFallbackText(ticketDisplay),
    ticketDisplay,
  };
}

export type TicketPromptFetchResult = "offered" | "empty" | "error";

/**
 * Fetches a random community ticket and displays it as an offer.
 * Only called if no active ticket exists.
 */
export async function fetchRandomTicketPrompt(
  setHistory: React.Dispatch<React.SetStateAction<Message[]>>,
  proKeyHash?: string,
): Promise<TicketPromptFetchResult> {
  try {
    const res = await fetch(`${API_BASE}/api/tickets/community`, {
      headers: proKeyHash ? { "x-pro-key-hash": proKeyHash } : undefined,
    });
    if (!res.ok) return "error";

    const tickets = (await res.json()) as CommunityBacklogTicket[];
    const playableTickets = tickets.filter((ticket): ticket is PlayableBacklogTicket => !ticket.is_locked);
    if (!playableTickets.length) return "empty";

    const ticket = playableTickets[Math.floor(Math.random() * playableTickets.length)]!;
    pendingTicketOffer = ticket;

    setHistory((prev) => [
      ...prev,
      buildTicketMessage(ticket, "offered"),
    ]);
    return "offered";
  } catch {
    return "error";
  }
}

import { API_BASE } from "../config";
import type { GameState } from "../hooks/useGameState";
import type { Message } from "./Terminal";

type Reply = (msg: Message) => void;
type SetState = React.Dispatch<React.SetStateAction<GameState>>;

export async function handleTicketCommand(command: string, reply: Reply): Promise<boolean> {
  const task = command.slice("/ticket".length).trim();
  if (!task) {
    reply({ role: "error", content: "[❌] Usage: `/ticket <description>` — Describe a task for the PM to over-engineer." });
    return true;
  }

  try {
    const res = await fetch(`${API_BASE}/api/tickets/refine`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task }),
    });

    if (!res.ok) {
      reply({ role: "error", content: `[❌] Ticket refinement failed (HTTP ${res.status}). The PM is on PTO.` });
      return true;
    }

    const data = await res.json() as { id: string; title: string; description: string; estimatedTechDebt: number };
    reply({
      role: "system",
      content: `[📋 **TICKET REFINED**] Your PM has over-scoped your request:\n\n**${data.title}**\n\n${data.description}\n\n**Story Points:** ${data.estimatedTechDebt} TD\n**Ticket ID:** \`${data.id}\``,
    });
  } catch {
    reply({ role: "error", content: "[❌] Network error — could not reach the PM. They're probably in a meeting about meetings." });
  }
  return true;
}

export async function handleBacklogCommand(reply: Reply): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/tickets/community`);
    if (!res.ok) {
      reply({ role: "error", content: `[❌] Failed to fetch backlog (HTTP ${res.status}).` });
      return true;
    }

    const tickets = await res.json() as { id: string; title: string; description: string; technical_debt: number }[];
    if (!tickets.length) {
      reply({ role: "system", content: "[📋 **BACKLOG**] The backlog is empty. Submit tickets with `/ticket <description>`." });
      return true;
    }

    const list = tickets.map((t, i) => `${i + 1}. **${t.title}** — ${t.technical_debt} TD (\`${t.id.slice(0, 8)}\`)`).join("\n");
    reply({ role: "system", content: `[📋 **COMMUNITY BACKLOG**]\n\n${list}\n\nUse \`/take <ticket-id>\` to claim a ticket.` });
  } catch {
    reply({ role: "error", content: "[❌] Network error — the backlog server is unreachable." });
  }
  return true;
}

export async function handleTakeCommand(
  command: string,
  state: GameState,
  setState: SetState,
  reply: Reply,
): Promise<boolean> {
  const ticketId = command.slice("/take".length).trim();
  if (!ticketId) {
    reply({ role: "error", content: "[❌] Usage: `/take <ticket-id>` — Check `/backlog` for available tickets." });
    return true;
  }

  if (state.activeTicket) {
    reply({ role: "error", content: `[❌] You already have an active ticket: **${state.activeTicket.title}**. Finish it first!` });
    return true;
  }

  try {
    const res = await fetch(`${API_BASE}/api/tickets/community`);
    if (!res.ok) {
      reply({ role: "error", content: `[❌] Failed to fetch backlog (HTTP ${res.status}).` });
      return true;
    }

    const tickets = await res.json() as { id: string; title: string; technical_debt: number }[];
    const ticket = tickets.find((t) => t.id.startsWith(ticketId));

    if (!ticket) {
      reply({ role: "error", content: `[❌] Ticket \`${ticketId}\` not found. Check \`/backlog\` for available tickets.` });
      return true;
    }

    setState((prev) => ({
      ...prev,
      activeTicket: {
        id: ticket.id.slice(0, 8),
        title: ticket.title,
        sprintProgress: 0,
        sprintGoal: ticket.technical_debt,
      },
    }));

    reply({
      role: "system",
      content: `[🎫 **TICKET CLAIMED**] You picked up **${ticket.title}**.\n\nSprint goal: **${ticket.technical_debt} TD**. Get grinding!`,
    });
  } catch {
    reply({ role: "error", content: "[❌] Network error — could not fetch tickets." });
  }
  return true;
}

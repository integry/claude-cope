import { API_BASE } from "../config";
import type { GameState } from "../hooks/useGameState";
import type { Message } from "./Terminal";

type Reply = (msg: Message) => void;
type SetState = React.Dispatch<React.SetStateAction<GameState>>;

type BacklogTicket = { id: string; title: string; description: string; technical_debt: number };

/** Cache last backlog results so `/take 2` can resolve by row number */
let lastBacklogResults: BacklogTicket[] = [];

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

    const tickets = await res.json() as BacklogTicket[];
    if (!tickets.length) {
      reply({ role: "system", content: "[📋 **BACKLOG**] The backlog is empty. Submit tickets with `/ticket <description>`." });
      return true;
    }

    lastBacklogResults = tickets;

    const numW = 3;
    const idW = 10;
    const titleW = 64;
    const tdW = 8;
    const sep = `+${"-".repeat(numW + 2)}+${"-".repeat(idW + 2)}+${"-".repeat(titleW + 2)}+${"-".repeat(tdW + 2)}+`;
    const pad = (s: string, w: number) => s.length > w ? s.slice(0, w - 1) + "…" : s + " ".repeat(w - s.length);
    const header = `| ${pad("#", numW)} | ${pad("ID", idW)} | ${pad("Title", titleW)} | ${pad("TD", tdW)} |`;
    const rows = tickets.map((t, i) =>
      `| ${pad(String(i + 1), numW)} | ${pad(t.id.slice(0, 8), idW)} | ${pad(t.title, titleW)} | ${pad(String(t.technical_debt), tdW)} |`
    );
    const table = [sep, header, sep, ...rows, sep].join("\n");
    reply({ role: "system", content: `[📋 **COMMUNITY BACKLOG**]\n\n\`\`\`\n${table}\n\`\`\`\n\nType \`/take 1\` through \`/take ${tickets.length}\` to claim a ticket.` });
  } catch {
    reply({ role: "error", content: "[❌] Network error — the backlog server is unreachable." });
  }
  return true;
}

export function handleTakeCommand(
  command: string,
  state: GameState,
  setState: SetState,
  reply: Reply,
): boolean {
  const input = command.slice("/take".length).trim();
  if (!input) {
    reply({ role: "error", content: "[❌] Usage: `/take <number>` — Run `/backlog` first, then pick a row number." });
    return true;
  }

  if (state.activeTicket) {
    reply({ role: "error", content: `[❌] You already have an active ticket: **${state.activeTicket.title}**. Finish it first!` });
    return true;
  }

  // Resolve ticket: try row number from cached backlog first, then raw ID
  const rowNum = parseInt(input, 10);
  let ticket: BacklogTicket | undefined;
  if (!isNaN(rowNum) && rowNum >= 1 && rowNum <= lastBacklogResults.length) {
    ticket = lastBacklogResults[rowNum - 1];
  } else {
    ticket = lastBacklogResults.find((t) => t.id.startsWith(input));
  }

  if (!ticket) {
    reply({ role: "error", content: `[❌] Ticket "${input}" not found. Run \`/backlog\` to see available tickets.` });
    return true;
  }

  setState((prev) => ({
    ...prev,
    activeTicket: {
      id: ticket.id,
      title: ticket.title,
      sprintProgress: 0,
      sprintGoal: ticket.technical_debt,
    },
  }));

  reply({
    role: "system",
    content: `[🎫 **TICKET CLAIMED**] You picked up **${ticket.title}**.\n\nSprint goal: **${ticket.technical_debt} TD**. Get grinding!`,
  });
  return true;
}

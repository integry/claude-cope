import { track } from "../analytics";
import { AnalyticsEvents, SlashCommandFailureReasons } from "../analyticsEvents";
import { API_BASE, TICKET_REFINE_ENABLED } from "../config";
import type { GameState } from "../hooks/useGameState";
import type { CommunityBacklogTicket } from "@claude-cope/shared/backlogTickets";
import type { Message } from "./Terminal";
import { prefetchSequences } from "./toolSequences";
import { updateTicketServer } from "../api/profileApi";

type Reply = (msg: Message) => void;
type SetState = React.Dispatch<React.SetStateAction<GameState>>;

/** Cache last backlog results so `/take 2` can resolve by row number */
let lastBacklogResults: CommunityBacklogTicket[] = [];

function formatBacklogTitle(ticket: CommunityBacklogTicket): string {
  const premiumPrefix = ticket.is_locked ? "🔒 [PREMIUM] " : "";
  const normalizedPrefix = ticket.category_prefix?.trim();
  const normalizedTitle = normalizedPrefix && ticket.title.startsWith(`${normalizedPrefix} `)
    ? ticket.title.slice(normalizedPrefix.length + 1)
    : ticket.title;
  return `${premiumPrefix}${normalizedTitle}`;
}

export function formatLockedTicketPrompt(ticket: CommunityBacklogTicket): string {
  const teaser = ticket.upgrade_teaser?.trim() ? ` ${ticket.upgrade_teaser.trim()}` : " Upgrade to Claude Cope Max to claim it.";
  return `[🔒 **[PREMIUM]**] **${ticket.title}** is locked behind Max.${teaser}`;
}

export async function handleTicketCommand(command: string, reply: Reply): Promise<boolean> {
  if (!TICKET_REFINE_ENABLED) {
    track(AnalyticsEvents.SLASH_COMMAND_FAILED, { command: "/ticket", reason: SlashCommandFailureReasons.DISABLED });
    reply({ role: "error", content: "[❌] Unknown command: `/ticket`. Type `/help` to see available commands." });
    return true;
  }

  const task = command.slice("/ticket".length).trim();
  if (!task) {
    track(AnalyticsEvents.SLASH_COMMAND_FAILED, { command: "/ticket", reason: SlashCommandFailureReasons.NO_ARGUMENT });
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
      track(AnalyticsEvents.SLASH_COMMAND_FAILED, { command: "/ticket", reason: SlashCommandFailureReasons.SERVER_ERROR });
      reply({ role: "error", content: `[❌] Ticket refinement failed (HTTP ${res.status}). The PM is on PTO.` });
      return true;
    }

    const data = await res.json() as { id: string; title: string; description: string; estimatedTechDebt: number };
    reply({
      role: "system",
      content: `[📋 **TICKET REFINED**] Your PM has over-scoped your request:\n\n**${data.title}**\n\n${data.description}\n\n**Story Points:** ${data.estimatedTechDebt} TD\n**Ticket ID:** \`${data.id}\``,
    });
  } catch {
    track(AnalyticsEvents.SLASH_COMMAND_FAILED, { command: "/ticket", reason: SlashCommandFailureReasons.NETWORK_ERROR });
    reply({ role: "error", content: "[❌] Network error — could not reach the PM. They're probably in a meeting about meetings." });
  }
  return true;
}

export async function handleBacklogCommand(reply: Reply, proKeyHash?: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/tickets/community`, {
      headers: proKeyHash ? { "x-pro-key-hash": proKeyHash } : undefined,
    });
    if (!res.ok) {
      track(AnalyticsEvents.SLASH_COMMAND_FAILED, { command: "/backlog", reason: SlashCommandFailureReasons.SERVER_ERROR });
      reply({ role: "error", content: `[❌] Failed to fetch backlog (HTTP ${res.status}).` });
      return true;
    }

    const tickets = await res.json() as CommunityBacklogTicket[];
    if (!tickets.length) {
      const hint = TICKET_REFINE_ENABLED ? " Submit tickets with `/ticket <description>`." : "";
      reply({ role: "system", content: `[📋 **BACKLOG**] The backlog is empty.${hint}` });
      return true;
    }

    lastBacklogResults = tickets;

    const numW = 3;
    const idW = 10;
    const statusW = 8;
    const titleW = Math.max(5, ...tickets.map((ticket) => formatBacklogTitle(ticket).length));
    const tdW = 8;
    const sep = `+${"-".repeat(numW + 2)}+${"-".repeat(idW + 2)}+${"-".repeat(titleW + 2)}+${"-".repeat(statusW + 2)}+${"-".repeat(tdW + 2)}+`;
    const pad = (s: string, w: number, align: "left" | "right" = "left") =>
      align === "right"
        ? " ".repeat(Math.max(0, w - s.length)) + s
        : s + " ".repeat(Math.max(0, w - s.length));
    const formatReward = (ticket: CommunityBacklogTicket): string =>
      ticket.is_locked ? pad("--", tdW, "right") : pad(String(ticket.technical_debt * 10), tdW, "right");
    const header = `| ${pad("#", numW)} | ${pad("ID", idW)} | ${pad("Title", titleW)} | ${pad("Status", statusW)} | ${pad("Reward", tdW)} |`;
    const rows = tickets.map((t, i) =>
      `| ${pad(String(i + 1), numW)} | ${pad(t.id.slice(0, 8), idW)} | ${pad(formatBacklogTitle(t), titleW)} | ${pad(t.is_locked ? "PREMIUM" : "OPEN", statusW)} | ${formatReward(t)} |`
    );
    const table = [sep, header, sep, ...rows, sep].join("\n");
    const lockedTickets = tickets.filter((ticket) => ticket.is_locked);
    const footer = lockedTickets.length > 0
      ? [
        "Type `/take <row>` to claim an open ticket. Locked rows are teaser-only for free users.",
        "",
        "[UPGRADE REQUIRED] The following categories are locked behind Wallet Extraction:",
        ...Array.from(new Map(
          lockedTickets.map((ticket) => {
            const prefix = ticket.category_prefix?.trim().replace(/^\[|\]$/g, "") || "PREMIUM";
            const label = ticket.category_label?.trim() || "Specialized Suffering";
            return [prefix, ` 🔒 ${prefix} (${label})`] as const;
          }),
        ).values()),
        "",
        "Run `/upgrade` to unlock 50+ specialized categories and premium suffering.",
      ].join("\n")
      : `Type \`/take 1\` through \`/take ${tickets.length}\` to claim a ticket.`;
    reply({ role: "system", content: `[📋 **COMMUNITY BACKLOG**]\n\n\`\`\`\n${table}\n\`\`\`\n\n${footer}` });
  } catch {
    track(AnalyticsEvents.SLASH_COMMAND_FAILED, { command: "/backlog", reason: SlashCommandFailureReasons.NETWORK_ERROR });
    reply({ role: "error", content: "[❌] Network error — the backlog server is unreachable." });
  }
  return true;
}

export function handleTakeCommand(
  command: string,
  state: GameState,
  setState: SetState,
  reply: Reply,
  opts: { setInputValue: (v: string) => void; onAccept?: () => void; onSuggestedReply?: (v: string) => void; onLocked?: (ticket: CommunityBacklogTicket) => void },
): boolean {
  const { onAccept, onSuggestedReply, onLocked } = opts;
  const input = command.slice("/take".length).trim();
  if (!input) {
    track(AnalyticsEvents.SLASH_COMMAND_FAILED, { command: "/take", reason: SlashCommandFailureReasons.NO_ARGUMENT });
    reply({ role: "error", content: "[❌] Usage: `/take <number>` — Run `/backlog` first, then pick a row number." });
    return true;
  }

  if (state.activeTicket) {
    track(AnalyticsEvents.SLASH_COMMAND_FAILED, { command: "/take", reason: SlashCommandFailureReasons.ALREADY_ACTIVE });
    reply({ role: "error", content: `[❌] You already have an active ticket: **${state.activeTicket.title}**. Finish it first!` });
    return true;
  }

  // Resolve ticket: try row number from cached backlog first, then raw ID
  const rowNum = parseInt(input, 10);
  let ticket: CommunityBacklogTicket | undefined;
  if (!isNaN(rowNum) && rowNum >= 1 && rowNum <= lastBacklogResults.length) {
    ticket = lastBacklogResults[rowNum - 1];
  } else {
    ticket = lastBacklogResults.find((t) => t.id.startsWith(input));
  }

  if (!ticket) {
    track(AnalyticsEvents.SLASH_COMMAND_FAILED, { command: "/take", reason: SlashCommandFailureReasons.NOT_FOUND });
    reply({ role: "error", content: `[❌] Ticket "${input}" not found. Run \`/backlog\` to see available tickets.` });
    return true;
  }

  if (ticket.is_locked) {
    track(AnalyticsEvents.SLASH_COMMAND_FAILED, { command: "/take", reason: SlashCommandFailureReasons.LOCKED });
    reply({
      role: "system",
      content: formatLockedTicketPrompt(ticket),
    });
    onLocked?.(ticket);
    return true;
  }

  // Pre-fetch task-specific tool sequences so they're cached before the user prompts
  prefetchSequences(ticket.id);

  const newTicket = {
    id: ticket.id,
    title: ticket.title,
    sprintProgress: 0,
    sprintGoal: ticket.technical_debt,
  };
  setState((prev) => ({ ...prev, activeTicket: newTicket }));
  if (state.proKeyHash && state.username) {
    void updateTicketServer(state.username, newTicket, state.proKeyHash);
  }

  onAccept?.();
  reply({
    role: "system",
    content: `[🎫 **TICKET CLAIMED**] ${ticket.id}: **${ticket.title}**\n\n> ${ticket.description}\n\nReward: **${(ticket.technical_debt * 10).toLocaleString()} TD**. Start prompting to make progress.`,
  });
  onSuggestedReply?.(ticket.kickoff_prompt);
  return true;
}

export function handleAbandonCommand(
  state: GameState,
  setState: SetState,
  addActiveTD: (n: number) => void,
  reply: Reply,
): boolean {
  if (!state.activeTicket) {
    track(AnalyticsEvents.SLASH_COMMAND_FAILED, { command: "/abandon", reason: SlashCommandFailureReasons.NO_TICKET });
    reply({ role: "error", content: "[❌] No active ticket to abandon. You have nothing to flee from." });
    return true;
  }

  const ticket = state.activeTicket;
  const reward = ticket.sprintGoal * 10;
  const penalty = Math.round(reward * 0.2);

  setState((prev) => ({ ...prev, activeTicket: null }));
  if (state.proKeyHash && state.username) {
    void updateTicketServer(state.username, null, state.proKeyHash);
  }
  addActiveTD(-penalty);

  reply({
    role: "warning",
    content: `[🏳️ **TICKET ABANDONED**] You fled from "${ticket.title}" without delivering.\n\nPenalty: **-${penalty.toLocaleString()} TD** (20% of the ${reward.toLocaleString()} TD reward) for being a quitter.\n\nYour coworkers will remember this.`,
  });

  return true;
}

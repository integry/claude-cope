import { TICKET_REFINE_ENABLED } from "../config";

export type TipDefinition = {
  id: string;
  text: string;
  cmd?: string;
  category?: "economy" | "social" | "ticket" | "meta";
  trigger?: ContextualTipTrigger;
};

export type ContextualTipTrigger =
  | "td_1000"
  | "quota_exhausted"
  | "ticket_completed"
  | "lone_user_online";

type TipSelectionContext = {
  totalTDEarned?: number;
  hasActiveTicket?: boolean;
};

type TipFilterOptions = {
  excludeTipIds?: Iterable<string>;
};

const GENERAL_TIPS: TipDefinition[] = [
  { id: "general-help", text: "Tip: Use /help to see all commands. There is no actual help, only commands.", cmd: "/help", category: "meta" },
  { id: "general-store", text: "Tip: The /store sells generators that produce Technical Debt while you sleep. Or cry.", cmd: "/store", category: "economy" },
  { id: "general-backlog", text: "Tip: /backlog shows your tickets. Spoiler: they multiply faster than you can close them.", cmd: "/backlog", category: "ticket" },
  { id: "general-achievements", text: "Tip: /achievements tracks your career-ending decisions. Collect them all!", cmd: "/achievements", category: "meta" },
  { id: "general-blame", text: "Tip: /blame finds someone else to hold responsible. A core engineering skill.", cmd: "/blame", category: "social" },
  { id: "general-leaderboard", text: "Tip: /leaderboard shows who has coped the most. Competitive suffering.", cmd: "/leaderboard", category: "social" },
  { id: "general-preworkout", text: "Tip: /preworkout gives a temporary boost. Side effects may include burnout.", cmd: "/preworkout", category: "economy" },
  { id: "general-synergize", text: "Tip: /synergize multiplies your output. What could possibly go wrong?", cmd: "/synergize", category: "economy" },
  { id: "general-clear", text: "Tip: /clear your terminal to hide the evidence. Out of sight, out of mind.", cmd: "/clear", category: "meta" },
  { id: "general-compact", text: "Tip: /compact the logs when they get too real. Denial is a valid strategy.", cmd: "/compact", category: "meta" },
  { id: "general-profile", text: "Tip: /profile shows your stats. We recommend not looking.", cmd: "/profile", category: "meta" },
  { id: "general-ticket", text: "Tip: /ticket submits a support request to /dev/null. Response time: heat death of universe.", cmd: "/ticket", category: "ticket" },
  { id: "general-upgrade", text: "Tip: /upgrade your suffering with real money. Premium technical debt awaits.", cmd: "/upgrade", category: "meta" },
  { id: "general-model", text: "Tip: /model lets you change AI providers. Different hallucinations, same despair.", cmd: "/model", category: "meta" },
  { id: "general-brrrrrr", text: "Tip: /brrrrrr to ship directly to prod. Best used on Fridays at 4:59 PM.", cmd: "/brrrrrr", category: "meta" },
  { id: "general-alias", text: "Tip: /alias creates shortcuts. Automate your mistakes for maximum efficiency.", cmd: "/alias", category: "meta" },
  { id: "general-upgrades", text: "Tip: Upgrades boost generator output. More debt per second, more problems per minute.", category: "economy" },
  { id: "general-voice", text: "Tip: /voice lets you scream your prompts. Therapeutic, but the neighbors complain.", cmd: "/voice", category: "meta" },
  { id: "general-shill", text: "Tip: /shill tweets about us for free tokens. Your dignity was already in the backlog anyway.", cmd: "/shill", category: "social" },
];

export const IDLE_TIPS: TipDefinition[] = [
  { id: "idle-help", text: "Tip: Staring at the cursor will not move the sprint. Type /help and pretend this is research.", cmd: "/help", category: "meta" },
  { id: "idle-store", text: "Tip: While you hesitate, /store keeps waiting to sell you more problems disguised as leverage.", cmd: "/store", category: "economy" },
  { id: "idle-backlog", text: "Tip: If you're blocked, /backlog is full of fresh opportunities to disappoint multiple stakeholders at once.", cmd: "/backlog", category: "ticket" },
  { id: "idle-who", text: "Tip: Use /who if you need proof that everyone else is also pretending to be productive.", cmd: "/who", category: "social" },
];

export const BACKLOG_REMINDER_TIPS: TipDefinition[] = [
  { id: "backlog-reminder-01", text: "Tip: You've been freelancing in chat for a while. Open /backlog and /take a ticket so the bonuses start compounding.", cmd: "/backlog", category: "ticket" },
  { id: "backlog-reminder-02", text: "Tip: Conversation does not pay nearly as well as completed tickets. Pull /backlog and claim something with /take <#>.", cmd: "/backlog", category: "ticket" },
  { id: "backlog-reminder-03", text: "Tip: You're leaving completed-ticket bonuses on the table. Check /backlog and put a ticket in motion.", cmd: "/backlog", category: "ticket" },
  { id: "backlog-reminder-04", text: "Tip: Chatting is fine. Tickets are profitable. Run /backlog, then /take <#> and get paid for the suffering.", cmd: "/backlog", category: "ticket" },
  { id: "backlog-reminder-05", text: "Tip: No active ticket means no sprint bonus engine. /backlog is where the real game starts.", cmd: "/backlog", category: "ticket" },
  { id: "backlog-reminder-06", text: "Tip: Management loves initiative. By initiative, we mean opening /backlog and grabbing a ticket before someone else does.", cmd: "/backlog", category: "ticket" },
  { id: "backlog-reminder-07", text: "Tip: If you're going to type this much, point it at a ticket. /backlog will happily supply one.", cmd: "/backlog", category: "ticket" },
  { id: "backlog-reminder-08", text: "Tip: Completed ticket bonuses are worth far more than idle banter. Use /backlog and claim a job.", cmd: "/backlog", category: "ticket" },
  { id: "backlog-reminder-09", text: "Tip: Your terminal is asking for direction. /backlog gives you targets. /take gives you consequences.", cmd: "/backlog", category: "ticket" },
  { id: "backlog-reminder-10", text: "Tip: The scoreboard moves faster when you're carrying a ticket. Start with /backlog.", cmd: "/backlog", category: "ticket" },
  { id: "backlog-reminder-11", text: "Tip: Raw chatting is the low-margin path. /backlog plus a completed ticket is where the payout lives.", cmd: "/backlog", category: "ticket" },
  { id: "backlog-reminder-12", text: "Tip: You seem available. That's dangerous. Open /backlog and make it official.", cmd: "/backlog", category: "ticket" },
  { id: "backlog-reminder-13", text: "Tip: No open ticket, no bonus finish. /backlog can correct that oversight immediately.", cmd: "/backlog", category: "ticket" },
  { id: "backlog-reminder-14", text: "Tip: You can keep chatting, or you can get paid. /backlog is the fork in the road.", cmd: "/backlog", category: "ticket" },
  { id: "backlog-reminder-15", text: "Tip: The backlog is not decorative. Run /backlog, pick a mess, and let the reward multiplier do its thing.", cmd: "/backlog", category: "ticket" },
  { id: "backlog-reminder-16", text: "Tip: Every message without a ticket is a missed bonus opportunity. /backlog fixes that.", cmd: "/backlog", category: "ticket" },
  { id: "backlog-reminder-17", text: "Tip: Want the rewarding version of this game? Open /backlog and adopt a problem.", cmd: "/backlog", category: "ticket" },
  { id: "backlog-reminder-18", text: "Tip: You're a few commands deep and still unticketed. /backlog would like a word.", cmd: "/backlog", category: "ticket" },
  { id: "backlog-reminder-19", text: "Tip: Tickets drive the economy around here. /backlog is effectively your paycheck menu.", cmd: "/backlog", category: "ticket" },
  { id: "backlog-reminder-20", text: "Tip: The game rewards ownership, not just commentary. Use /backlog and /take <#>.", cmd: "/backlog", category: "ticket" },
  { id: "backlog-reminder-21", text: "Tip: A claimed ticket turns random effort into bonus-bearing progress. Start at /backlog.", cmd: "/backlog", category: "ticket" },
  { id: "backlog-reminder-22", text: "Tip: You're operating ticket-free, which is fiscally irresponsible. Run /backlog.", cmd: "/backlog", category: "ticket" },
  { id: "backlog-reminder-23", text: "Tip: If you want the bigger rewards, stop freelancing and pull from /backlog.", cmd: "/backlog", category: "ticket" },
  { id: "backlog-reminder-24", text: "Tip: The completed-ticket bonus is doing all the heavy lifting. Go collect one via /backlog.", cmd: "/backlog", category: "ticket" },
];

export const MILESTONE_TIPS: TipDefinition[] = [
  { id: "milestone-help", text: "Tip: /help lists the command surface area you're ignoring with impressive discipline.", cmd: "/help", category: "meta" },
  { id: "milestone-store", text: "Tip: /store buys generators so your technical debt can scale faster than your judgment.", cmd: "/store", category: "economy" },
  { id: "milestone-backlog", text: "Tip: /backlog shows the queue of bad decisions waiting to become your problem.", cmd: "/backlog", category: "ticket" },
  { id: "milestone-take", text: "Tip: /take <#> claims a ticket. Ownership is just scheduled regret.", cmd: "/take", category: "ticket" },
  { id: "milestone-ping", text: "Tip: /ping pays a coworker 50 TD to care about your ticket for almost a full minute.", cmd: "/ping", category: "social" },
  { id: "milestone-who", text: "Tip: /who shows who is online, in case you need a witness for your next production incident.", cmd: "/who", category: "social" },
  { id: "milestone-achievements", text: "Tip: /achievements keeps score for your most durable mistakes.", cmd: "/achievements", category: "meta" },
  { id: "milestone-profile", text: "Tip: /profile surfaces the metrics your manager will misuse in the retro.", cmd: "/profile", category: "meta" },
  { id: "milestone-compact", text: "Tip: /compact compresses the scrollback when the evidence starts looking actionable.", cmd: "/compact", category: "meta" },
  { id: "milestone-ticket", text: "Tip: /ticket <description> lets the PM industrialize your vague idea into a larger problem.", cmd: "/ticket", category: "ticket" },
  { id: "milestone-blame", text: "Tip: /blame is still the fastest route from uncertainty to confidence.", cmd: "/blame", category: "social" },
  { id: "milestone-buddy", text: "Tip: /buddy rolls you a companion. Emotional support is still not included.", cmd: "/buddy", category: "social" },
];

export const CONTEXTUAL_TIPS: TipDefinition[] = [
  { id: "ctx-td-1000", text: "Tip: You broke 1,000 TD. Open /store and reinvest before your temporary competence fades.", cmd: "/store", category: "economy", trigger: "td_1000" },
  { id: "ctx-quota", text: "Tip: Your quota is gone. /upgrade exists because suffering scales better with a payment method.", cmd: "/upgrade", category: "meta", trigger: "quota_exhausted" },
  { id: "ctx-ticket-complete", text: "Tip: Ticket completed. Pull /backlog immediately before management notices your queue is empty.", cmd: "/backlog", category: "ticket", trigger: "ticket_completed" },
  { id: "ctx-lone-user", text: "Tip: You're the only user online. Type /who if you need the loneliness quantified in plain text.", cmd: "/who", category: "social", trigger: "lone_user_online" },
];

function isEnabledTip(tip: TipDefinition): boolean {
  return TICKET_REFINE_ENABLED || tip.cmd !== "/ticket";
}

function isUnlockedTip(tip: TipDefinition, context?: TipSelectionContext): boolean {
  if (context?.hasActiveTicket && (tip.cmd === "/backlog" || tip.cmd === "/take")) {
    return false;
  }
  if (tip.cmd === "/store") {
    return (context?.totalTDEarned ?? 0) >= 1_000;
  }
  return true;
}

function isSelectableTip(tip: TipDefinition, context?: TipSelectionContext): boolean {
  return isEnabledTip(tip) && isUnlockedTip(tip, context);
}

function filterExcludedTips(pool: TipDefinition[], options?: TipFilterOptions): TipDefinition[] {
  if (!options?.excludeTipIds) return pool;
  const excluded = new Set(options.excludeTipIds);
  return pool.filter((tip) => !excluded.has(tip.id));
}

function pickRandomTip(pool: TipDefinition[]): TipDefinition | undefined {
  if (pool.length === 0) return undefined;
  return pool[Math.floor(Math.random() * pool.length)]!;
}

function pickRandomTipAvoidingId(pool: TipDefinition[], previousTipId?: string): TipDefinition | undefined {
  if (pool.length === 0) return undefined;
  if (!previousTipId || pool.length === 1) return pickRandomTip(pool);
  const filteredPool = pool.filter((tip) => tip.id !== previousTipId);
  return pickRandomTip(filteredPool.length > 0 ? filteredPool : pool);
}

function toText(tip: TipDefinition | undefined): string {
  return tip?.text ?? "Tip: Type something. The silence is making middle management nervous.";
}

export const TIPS = GENERAL_TIPS.filter(isEnabledTip);
const ALL_TIP_DEFINITIONS = [
  ...TIPS,
  ...IDLE_TIPS,
  ...BACKLOG_REMINDER_TIPS,
  ...MILESTONE_TIPS,
  ...CONTEXTUAL_TIPS,
];
const TIP_BY_TEXT = new Map(ALL_TIP_DEFINITIONS.map((tip) => [tip.text, tip] as const));

export function getRandomTip(context?: TipSelectionContext): string {
  return toText(pickRandomTip(TIPS.filter((tip) => isUnlockedTip(tip, context))));
}

export function findTipDefinitionByText(text: string): TipDefinition | null {
  return TIP_BY_TEXT.get(text) ?? null;
}

export function getRandomIdleTip(context?: TipSelectionContext): string {
  return toText(pickRandomTip(IDLE_TIPS.filter((tip) => isSelectableTip(tip, context))));
}

export function selectIdleTip(context?: TipSelectionContext, options?: TipFilterOptions): TipDefinition | null {
  const eligible = filterExcludedTips(IDLE_TIPS.filter((tip) => isSelectableTip(tip, context)), options);
  return pickRandomTip(eligible) ?? null;
}

export function getRandomBacklogReminder(previousTipId?: string): TipDefinition {
  return pickRandomTipAvoidingId(BACKLOG_REMINDER_TIPS.filter(isEnabledTip), previousTipId)
    ?? { id: "backlog-reminder-fallback", text: toText(undefined), cmd: "/backlog", category: "ticket" };
}

export function selectBacklogReminder(
  previousTipId?: string,
  context?: TipSelectionContext,
  options?: TipFilterOptions,
): TipDefinition | null {
  const eligible = filterExcludedTips(BACKLOG_REMINDER_TIPS.filter((tip) => isSelectableTip(tip, context)), options);
  return pickRandomTipAvoidingId(eligible, previousTipId) ?? null;
}

export function selectMilestoneTip(
  usedCommands: Iterable<string>,
  shownTipIds: Iterable<string> = [],
  context?: TipSelectionContext,
  options?: TipFilterOptions,
): TipDefinition | null {
  const used = new Set(usedCommands);
  const shown = new Set(shownTipIds);
  const eligible = filterExcludedTips(MILESTONE_TIPS.filter((tip) => {
    if (!isSelectableTip(tip, context)) return false;
    return !tip.cmd || !used.has(tip.cmd);
  }), options);
  if (eligible.length === 0) return null;

  const unseenEligible = eligible.filter((tip) => !shown.has(tip.id));
  return pickRandomTip(unseenEligible.length > 0 ? unseenEligible : eligible) ?? null;
}

export function getMilestoneTip(
  usedCommands: Iterable<string>,
  shownTipIds: Iterable<string> = [],
  context?: TipSelectionContext,
): string | null {
  const tip = selectMilestoneTip(usedCommands, shownTipIds, context);
  return tip ? tip.text : null;
}

export function getContextualTip(trigger: ContextualTipTrigger, context?: TipSelectionContext): string | null {
  const tip = CONTEXTUAL_TIPS.find((entry) => entry.trigger === trigger && isSelectableTip(entry, context));
  return tip ? tip.text : null;
}

export function selectContextualTip(
  trigger: ContextualTipTrigger,
  context?: TipSelectionContext,
  options?: TipFilterOptions,
): TipDefinition | null {
  const eligible = filterExcludedTips(
    CONTEXTUAL_TIPS.filter((entry) => entry.trigger === trigger && isSelectableTip(entry, context)),
    options,
  );
  return eligible[0] ?? null;
}

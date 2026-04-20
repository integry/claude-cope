/* eslint-disable max-lines */
import { PING_COST, THEMES } from "../game/constants";
import { COPE_MODELS } from "@claude-cope/shared/models";
import type { ServerProfile } from "@claude-cope/shared/profile";
import { API_BASE, BYOK_ENABLED, PRO_QUOTA_LIMIT } from "../config";
import { applyServerProfile } from "../hooks/profileSync";

import type { GameState } from "../hooks/useGameState";
import type { Message } from "./Terminal";
import { getRandomLoadingPhrase } from "./loadingPhrases";
import { getRandomTip } from "../game/tips";
import { buildAchievementBox } from "./achievementBox";
import { handleTicketCommand, handleBacklogCommand, handleTakeCommand, handleAbandonCommand } from "./ticketCommands";
import { getPendingOffer, clearPendingOffer } from "./ticketPrompt";

type SetHistory = React.Dispatch<React.SetStateAction<Message[]>>;
type SetState = React.Dispatch<React.SetStateAction<GameState>>;

export interface SlashCommandContext {
  state: GameState;
  setState: SetState;
  setHistory: SetHistory;
  setIsProcessing: (v: boolean) => void;
  closeAllOverlays: () => void;
  setShowStore: (v: boolean) => void;
  setShowLeaderboard: (v: boolean) => void;
  setShowAchievements: (v: boolean) => void;
  setShowSynergize: (v: boolean) => void;
  setShowHelp: (v: boolean) => void;
  setShowAbout: (v: boolean) => void;
  setShowPrivacy: (v: boolean) => void;
  setShowTerms: (v: boolean) => void;
  setShowContact: (v: boolean) => void;
  setShowProfile: (v: boolean) => void;
  setShowParty: (v: boolean) => void;
  setShowUpgrade: (v: boolean) => void;
  setBragPending: (v: boolean) => void;
  setBuddyPendingConfirm: (v: boolean) => void;
  unlockAchievement: (id: string) => void;
  clearCount: number;
  setClearCount: (v: number) => void;
  setInputValue: (v: string) => void;
  onSuggestedReply: (v: string) => void;
  setSlashQuery: (v: string) => void;
  setSlashIndex: (v: number) => void;
  addActiveTD: (n: number) => void;
  onlineCount: number;
  onlineUsers: string[];
  sendPing: (ticket: { id: string; title: string; sprintGoal: number; sprintProgress: number }, amount: number, target?: string) => void;
  pendingReviewPing: { sender: string; amount: number } | null;
  acceptReviewPing: () => void;
  brrrrrrIntervalRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>;
  triggerCompactEffect: () => void;
  playChime: () => void;
  playError: () => void;
  setActiveTheme: (themeId: string) => void;
}

const clearLoading = (prev: Message[]) => prev.filter((m) => m.role !== "loading");

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

const supportResponses = [
  "[✓] Support ticket created. Redirecting payload directly to `/dev/null`...",
  "[✓] Support ticket #4,812 created. Current wait time: **∞ sprints**. Thank you for your patience.",
  "[✓] Your issue has been categorized as **Won't Fix** before anyone read it. Efficiency!",
  "[✓] Support ticket routed to the **Shadow Realm Tier-3 Queue**. A human may respond within 6-8 business centuries.",
  "[✓] Ticket created. AI summary: 'User is experiencing feelings.' Marked as **Duplicate of Existence**.",
  "[✓] Support escalated to management. They left you on read. Classic.",
  "[✓] Your ticket has been auto-resolved by our ML pipeline. Resolution: **Have you tried turning it off and never turning it back on?**",
  "[✓] Support ticket filed under **PEBKAC**. Our condolences.",
];

const preworkoutResponses = [
  "[✓] Injected **400mg** of pure caffeine into the **Node.js event loop**. LFG.",
  "[✓] Mainlining **Red Bull** directly into the runtime. Your garbage collector is now **AGGRESSIVE**.",
  "[✓] Activated **TURBO MODE**. Side effects include: sweating JSON, dreaming in TypeScript, and mass velocity.",
  "[✓] Injecting **Monster Energy** into the CI pipeline. All tests now pass via sheer intimidation.",
  "[✓] Loaded **600mg** of caffeine into V8. The event loop is vibrating at a frequency only senior devs can hear.",
  "[✓] Pre-workout deployed. Your code now compiles **2x faster** but is **3x more unreadable**. Worth it.",
  "[✓] Creatine monohydrate injected into `node_modules/`. Your `npm install` can now deadlift **400lbs**.",
  "[✓] Caffeine payload delivered. Side effect: you mass involuntarily type `console.log` every 3 seconds.",
];

const synergizeResponses = [
  "[🗓️] **Mandatory 1-on-1 meeting** initiated. You cannot escape.",
  "[🗓️] **Synergy protocol engaged.** Aligning cross-functional deliverables with zero context.",
  "[🗓️] Scheduling a **meeting about the meeting** to discuss the pre-meeting agenda. You're already late.",
  "[🗓️] **1-on-1 initiated.** Your manager wants to 'touch base' about 'alignment.' Bring tissues.",
  "[🗓️] **Calendar blocked.** The AI has scheduled itself into every open slot for the next quarter. Synergy achieved.",
  "[🗓️] **Mandatory sync detected.** Topic: 'Why aren't we moving faster?' Duration: **eternity.**",
  "[🗓️] Opening **synergy portal**. Please hold while we align your chakras with the product roadmap.",
  "[🗓️] **Team standup extended to 90 minutes.** Someone asked a 'quick question.'",
  "[🗓️] **Cross-pollination sprint** launched. Frontend and backend teams must swap codebases for a week. Growth opportunity.",
  "[🗓️] **Alignment session detected.** Everyone agrees in the meeting. Nobody agrees in Slack. Standard protocol.",
  "[🗓️] **OKR recalibration in progress.** Your objectives now have objectives. It's objectives all the way down.",
  "[🗓️] **Synergy overload.** Two PMs discovered each other's roadmaps. They are now in a territorial dispute.",
  "[🗓️] **Innovation workshop scheduled.** Mandatory fun with sticky notes. Your soul leaves your body at 2pm.",
  "[🗓️] **Retro action items reviewed.** None were completed. New action item: complete action items. Cycle continues.",
  "[🗓️] **Skip-level 1-on-1 initiated.** Your manager's manager wants to 'get your perspective.' Translation: someone's in trouble.",
];

const clearWarningResponses = [
  "[WARNING] Executing sudo rm -rf /...",
  "[WARNING] Initiating tactical data purge. Buckle up.",
  "[WARNING] Formatting corporate drive C:\\SYNERGY\\... Please do not resist.",
  "[WARNING] Launching `DROP TABLE *` across all environments. HR has been notified.",
  "[WARNING] Activating scorched-earth protocol. Your git history will not survive.",
  "[WARNING] Running `rm -rf /hope`... Deleting remaining optimism...",
  "[WARNING] Nuclear launch sequence initiated. This terminal is now a crater.",
  "[WARNING] Wiping memory banks. If you had unsaved work — that's a you problem.",
];

type Reply = (msg: Message) => void;

function handleClearCommand(ctx: SlashCommandContext): boolean {
  const newClearCount = ctx.clearCount + 1;
  ctx.setClearCount(newClearCount);
  ctx.setHistory((prev) => [
    ...clearLoading(prev),
    { role: "warning", content: pickRandom(clearWarningResponses) },
  ]);

  const fakePaths = [
    "/usr/bin", "/var/log", "/etc/passwd", "/home/node/.bashrc",
    "/usr/lib/node_modules", "/var/cache/apt", "/opt/corporate-synergy",
    "/tmp/.secretly-mining-crypto", "/usr/share/man", "/boot/vmlinuz",
    "/dev/null", "/proc/self", "/sys/class/backlight",
    "/root/.ssh/authorized_keys", "/var/run/docker.sock",
  ];
  const interval = 2000 / fakePaths.length;
  fakePaths.forEach((p, i) => {
    setTimeout(() => {
      ctx.setHistory((prev) => [
        ...prev,
        { role: "system", content: `Deleting \`${p}\`...` },
      ]);
    }, interval * (i + 1));
  });

  setTimeout(() => {
    const messages: Message[] = [];
    if (newClearCount >= 3) {
      ctx.unlockAchievement("the_nuclear_option");
      messages.push({ role: "warning", content: buildAchievementBox("the_nuclear_option") });
    }
    messages.push({ role: "system", content: getRandomTip() });
    ctx.setHistory(messages);
    ctx.setIsProcessing(false);

    // Re-offer a ticket after clear if none active — delay so the cleared screen settles
    if (!ctx.state.activeTicket) {
      setTimeout(() => {
        ctx.setState((prev) => ({ ...prev, hasSeenTicketPrompt: false }));
      }, 2000);
    }
  }, 2000);
  return true;
}

// Variety pools for the synchronous, local-only messages emitted by /ping
// and /accept. The multiplayer hook has its own pools for server-driven
// events; these cover the immediate terminal feedback before any socket
// traffic happens.
const PING_NO_TICKET_MESSAGES = [
  "[❌] You need an active ticket before you can request a review. Use `/backlog` to grab one.",
  "[❌] No ticket in flight — nothing to review. Pick one up with `/backlog` first.",
  "[❌] You can't ask for a review when you're not working on anything. Try `/backlog`.",
  "[❌] Review requests require an active ticket. `/backlog` to claim one.",
  "[❌] Can't ping a coworker without a ticket attached. Grab one from `/backlog`.",
  "[❌] Refused: no active ticket. Coworkers don't review vibes. Use `/backlog`.",
];

const PING_BROKE_MESSAGES = [
  (cost: number, have: number) => `[❌] Need **${cost} TD** to request a review (you have ${have}). Mine more debt first.`,
  (cost: number, have: number) => `[❌] Insufficient funds: **${cost} TD** required, ${have} available. Coworkers don't work for free.`,
  (cost: number, have: number) => `[❌] Your wallet says **${have} TD**. Reviews cost **${cost} TD**. Math is math.`,
  (cost: number, have: number) => `[❌] Can't afford the review fee. **${cost} TD** required, ${have} on hand.`,
  (cost: number, have: number) => `[❌] Review denied at the door — **${cost} TD** needed, you brought ${have}.`,
  (cost: number, have: number) => `[❌] Your **${have} TD** won't cover the **${cost} TD** bounty. Earn more, then retry.`,
];

const PING_SENT_TARGETED_MESSAGES = [
  (target: string, ticketId: string, cost: number) => `[📡] Asking **${target}** to review \`${ticketId}\` for **${cost} TD**...`,
  (target: string, ticketId: string, cost: number) => `[📡] Reaching out to **${target}** — "got a sec to look at \`${ticketId}\`?" — with **${cost} TD** attached...`,
  (target: string, ticketId: string, cost: number) => `[📡] Paying **${target}** **${cost} TD** to review \`${ticketId}\`. Awaiting their response...`,
  (target: string, ticketId: string, cost: number) => `[📡] DM'ing **${target}** a review request for \`${ticketId}\`. Bounty: **${cost} TD**...`,
  (target: string, ticketId: string, cost: number) => `[📡] Review bounty posted to **${target}**: **${cost} TD** for \`${ticketId}\`...`,
  (target: string, ticketId: string, cost: number) => `[📡] Pinging **${target}** about \`${ticketId}\` with **${cost} TD** of motivation...`,
];

const PING_SENT_RANDOM_MESSAGES = [
  (ticketId: string, cost: number) => `[📡] Asking a random coworker to review \`${ticketId}\` for **${cost} TD**...`,
  (ticketId: string, cost: number) => `[📡] Posting a **${cost} TD** review bounty on \`${ticketId}\` to whoever is online...`,
  (ticketId: string, cost: number) => `[📡] Spinning the wheel of coworkers for a review of \`${ticketId}\`. **${cost} TD** on the line...`,
  (ticketId: string, cost: number) => `[📡] Broadcasting "anyone free for a review?" on \`${ticketId}\`. **${cost} TD** offered...`,
  (ticketId: string, cost: number) => `[📡] Random reviewer incoming for \`${ticketId}\`. **${cost} TD** reserved...`,
  (ticketId: string, cost: number) => `[📡] Tossing **${cost} TD** into the ether for a review of \`${ticketId}\`...`,
];

const ACCEPT_REVIEW_MESSAGES = [
  (sender: string, amount: number) => `[👀] Reviewing **${sender}**'s code for **${amount} TD**...`,
  (sender: string, amount: number) => `[👀] Opening **${sender}**'s diff. **${amount} TD** about to land.`,
  (sender: string, amount: number) => `[👀] Accepted **${sender}**'s review request — time to pretend to read the code. **${amount} TD** pending.`,
  (sender: string, amount: number) => `[👀] Rubber stamp warming up for **${sender}**. **${amount} TD** payout incoming.`,
  (sender: string, amount: number) => `[👀] Saying yes to **${sender}**'s bounty of **${amount} TD**. LGTM locked and loaded.`,
  (sender: string, amount: number) => `[👀] Claiming the **${amount} TD** bounty from **${sender}**. Review: acceptable.`,
];

const ACCEPT_NO_TICKET_MESSAGES = [
  "[❌] No pending ticket to accept. Use `/backlog` to browse tickets.",
  "[❌] Nothing to accept right now. `/backlog` has tickets if you're feeling brave.",
  "[❌] Your inbox is empty. No review requests, no ticket offers. Try `/backlog`.",
  "[❌] Nothing pending. `/backlog` will find you something to regret.",
  "[❌] No offers on the table. Check `/backlog` for fresh suffering.",
];

const ACCEPT_ALREADY_ACTIVE_MESSAGES = [
  (title: string) => `[❌] You already have an active ticket: **${title}**. Finish it first or \`/abandon\` it.`,
  (title: string) => `[❌] Still working on **${title}**. Finish it or \`/abandon\` it before taking another.`,
  (title: string) => `[❌] One ticket at a time, champ. You're on **${title}**.`,
  (title: string) => `[❌] Can't accept — **${title}** is already in your tray. \`/abandon\` to drop it.`,
  (title: string) => `[❌] Your plate is full with **${title}**. Finish or abandon before taking more.`,
];

export function handlePingCommand(command: string, ctx: SlashCommandContext, reply: Reply): boolean {
  const target = command.slice(5).trim();
  const ticket = ctx.state.activeTicket;
  if (!ticket) {
    reply({ role: "error", content: pickRandom(PING_NO_TICKET_MESSAGES) });
    return true;
  }
  if (ctx.state.economy.currentTD < PING_COST) {
    reply({ role: "error", content: pickRandom(PING_BROKE_MESSAGES)(PING_COST, ctx.state.economy.currentTD) });
    return true;
  }
  const ticketPayload = { id: ticket.id, title: ticket.title, sprintGoal: ticket.sprintGoal, sprintProgress: ticket.sprintProgress };
  if (target) {
    ctx.sendPing(ticketPayload, PING_COST, target);
    reply({ role: "system", content: pickRandom(PING_SENT_TARGETED_MESSAGES)(target, ticket.id, PING_COST) });
  } else {
    ctx.sendPing(ticketPayload, PING_COST);
    reply({ role: "system", content: pickRandom(PING_SENT_RANDOM_MESSAGES)(ticket.id, PING_COST) });
  }
  return true;
}

function openOverlay(ctx: SlashCommandContext, open: () => void) {
  ctx.closeAllOverlays();
  ctx.setHistory(clearLoading);
  open();
}

export function handleUpgradeCommand(ctx: SlashCommandContext): void {
  openOverlay(ctx, () => ctx.setShowUpgrade(true));
  window.history.pushState(null, "", "/upgrade");
}

function handleStoreCommand(ctx: SlashCommandContext, reply: Reply): boolean {
  if (ctx.state.economy.totalTDEarned < 1000) {
    reply({ role: "error", content: "[❌ Error] Store access denied. Requires **1,000 Technical Debt**." });
  } else {
    openOverlay(ctx, () => ctx.setShowStore(true));
  }
  return true;
}

function handleBuddyCommand(command: string, ctx: SlashCommandContext, reply: Reply): boolean {
  const arg = command.slice(6).trim().toLowerCase();
  if (arg === "clear" || arg === "remove") {
    if (!ctx.state.buddy.type) {
      reply({ role: "system", content: "[❌] You don't have a buddy to dismiss. Use `/buddy` to roll for one." });
      return true;
    }
    const dismissed = ctx.state.buddy.type;
    ctx.setState((prev) => ({ ...prev, buddy: { type: null, isShiny: false, promptsSinceLastInterjection: 0 } }));
    reply({ role: "system", content: `[✓] **${dismissed}** has been dismissed. They didn't even say goodbye.` });
    return true;
  }
  if (ctx.state.buddy.type) {
    ctx.setBuddyPendingConfirm(true);
    reply({ role: "system", content: `[⚠️] You already have a buddy (**${ctx.state.buddy.type}**). Re-rolling will replace it. Are you sure? (y/n) (Hint: use \`/buddy remove\` to dismiss)` });
    return true;
  }
  const roll = Math.random() * 100;
  const [buddyType, buddyIcon] = roll < 50 ? ["Agile Snail", "🐌"] : roll < 75 ? ["Sarcastic Clippy", "📎"] : roll < 88 ? ["Grumpy Senior", "👴"] : roll < 97 ? ["Panic Intern", "😰"] : ["10x Dragon", "🐉"];
  const isShiny = buddyType === "10x Dragon" && Math.random() < 0.05;
  ctx.setState((prev) => ({ ...prev, buddy: { type: buddyType, isShiny, promptsSinceLastInterjection: 0 } }));
  const shinyLabel = isShiny ? " ✨ SHINY ✨" : "";
  reply({ role: "system", content: `[✓] RNG sequence complete. Spawning your new companion: **${buddyType}**${shinyLabel} ${buddyIcon}!` });
  return true;
}

function handleThemeCommand(command: string, ctx: SlashCommandContext, reply: Reply): boolean {
  const arg = command.slice(6).trim().toLowerCase();
  const unlocked = THEMES.filter((t) => ctx.state.unlockedThemes.includes(t.id));

  if (!arg) {
    const unlockedLines = unlocked.map((t) => {
      const active = t.id === ctx.state.activeTheme ? " ← active" : "";
      return `  ${t.id}${active}`;
    });
    const locked = THEMES.filter((t) => !ctx.state.unlockedThemes.includes(t.id));
    const lockedLines = locked.map((t) => `  ${t.id} 🔒 (${t.cost.toLocaleString()} TD)`);
    const sections = [`**Unlocked:**\n${unlockedLines.join("\n")}`];
    if (lockedLines.length > 0) {
      sections.push(`**Locked:**\n${lockedLines.join("\n")}\n\nPurchase locked themes from the \`/store\`.`);
    }
    reply({ role: "system", content: `[🎨] Themes:\n\n${sections.join("\n\n")}\n\nUsage: \`/theme <name>\`` });
    return true;
  }

  const theme = THEMES.find((t) => t.id === arg);
  if (!theme) {
    reply({ role: "error", content: `[❌] Unknown theme: \`${arg}\`. Available: ${unlocked.map((t) => t.id).join(", ")}` });
    return true;
  }

  if (!ctx.state.unlockedThemes.includes(theme.id)) {
    reply({ role: "error", content: `[🔒] Theme \`${theme.name}\` is locked. Purchase it from the /store first.` });
    return true;
  }

  if (ctx.state.activeTheme === theme.id) {
    reply({ role: "system", content: `[🎨] Theme \`${theme.name}\` is already active.` });
    return true;
  }

  ctx.setActiveTheme(theme.id);
  reply({ role: "system", content: `[🎨] Theme switched to **${theme.name}**. Your terminal has been reskinned.` });
  return true;
}

function handleOverlayCommand(command: string, ctx: SlashCommandContext): boolean {
  const overlayMap: Record<string, () => void> = {
    "/leaderboard": () => ctx.setShowLeaderboard(true),
    "/achievements": () => ctx.setShowAchievements(true),
    "/profile": () => ctx.setShowProfile(true),
    "/party": () => ctx.setShowParty(true),
  };
  const opener = overlayMap[command];
  if (opener) {
    openOverlay(ctx, opener);
    return true;
  }
  return false;
}

function handleSimpleReplyCommand(command: string, ctx: SlashCommandContext, reply: Reply): boolean {
  if (command === "/support") {
    reply({ role: "system", content: pickRandom(supportResponses) });
    return true;
  } else if (command === "/preworkout") {
    reply({ role: "system", content: pickRandom(preworkoutResponses) });
    return true;
  } else if (command === "/who") {
    if (ctx.onlineUsers.length > 0) {
      const userList = ctx.onlineUsers.join(", ");
      reply({ role: "system", content: `[📡] **${ctx.onlineCount}** developer(s) suffering in this instance: ${userList}` });
    } else {
      reply({ role: "system", content: `[📡] There are currently **${ctx.onlineCount}** developers suffering in this instance.` });
    }
    return true;
  }
  return false;
}

function handleCompactCommand(ctx: SlashCommandContext): boolean {
  ctx.triggerCompactEffect();
  ctx.setHistory((prev) => {
    const cleaned = clearLoading(prev);
    const removeCount = Math.min(50, cleaned.length);
    const remaining = cleaned.slice(0, cleaned.length - removeCount);
    return [
      ...remaining,
      { role: "system", content: `[✓] Context compacted. Deleted **${removeCount}** lines of unoptimized boilerplate.` },
    ];
  });
  ctx.unlockAchievement("history_eraser");
  return true;
}

function handleUserCommand(command: string, ctx: SlashCommandContext): boolean {
  const alias = command.slice(5).trim();
  openOverlay(ctx, () => ctx.setShowProfile(true));
  const target = alias || ctx.state.username;
  window.history.pushState(null, "", `/user/${encodeURIComponent(target)}`);
  return true;
}

function handleCoreCommand(command: string, ctx: SlashCommandContext, reply: Reply): boolean {
  if (command === "/store") return handleStoreCommand(ctx, reply);
  if (handleOverlayCommand(command, ctx)) return true;
  if (command === "/synergize") {
    reply({ role: "system", content: pickRandom(synergizeResponses) });
    ctx.closeAllOverlays();
    ctx.setShowSynergize(true);
    return true;
  }
  if (command === "/user" || command.startsWith("/user ")) return handleUserCommand(command, ctx);
  if (command === "/compact") return handleCompactCommand(ctx);
  if (handleSimpleReplyCommand(command, ctx, reply)) return true;
  if (command === "/buddy" || command.startsWith("/buddy ")) return handleBuddyCommand(command, ctx, reply);
  if (command.startsWith("/ping")) return handlePingCommand(command, ctx, reply);
  if (command === "/theme" || command.startsWith("/theme ")) return handleThemeCommand(command, ctx, reply);
  return false;
}

function handleNewCommand(command: string, ctx: SlashCommandContext, reply: Reply): boolean {
  if (command === "/help") {
    const tdGrant = Math.floor(Math.random() * 200) + 100;
    ctx.addActiveTD(tdGrant);
    openOverlay(ctx, () => ctx.setShowHelp(true));
    window.history.pushState(null, "", "/help");
    return true;
  } else if (command === "/about") {
    openOverlay(ctx, () => ctx.setShowAbout(true));
    window.history.pushState(null, "", "/about");
    return true;
  } else if (command === "/privacy") {
    openOverlay(ctx, () => ctx.setShowPrivacy(true));
    window.history.pushState(null, "", "/privacy");
    return true;
  } else if (command === "/terms") {
    openOverlay(ctx, () => ctx.setShowTerms(true));
    window.history.pushState(null, "", "/terms");
    return true;
  } else if (command === "/contact") {
    openOverlay(ctx, () => ctx.setShowContact(true));
    window.history.pushState(null, "", "/contact");
    return true;
  } else if (command === "/fast") {
    const newFast = !ctx.state.modes.fast;
    ctx.setState((prev) => ({ ...prev, modes: { ...prev.modes, fast: newFast } }));
    if (newFast) {
      reply({ role: "system", content: "[⚡ **FAST MODE ACTIVATED**] All code reviews disabled. Type safety optional. Shipping directly to **production** at mass velocity. Godspeed." });
    } else {
      reply({ role: "system", content: "[⚡ **FAST MODE DEACTIVATED**] Reinstating code reviews, type checks, and existential dread. Welcome back to reality." });
    }
    return true;
  } else if (command === "/voice") {
    const newVoice = !ctx.state.modes.voice;
    ctx.setState((prev) => ({ ...prev, modes: { ...prev.modes, voice: newVoice } }));
    if (newVoice) {
      reply({ role: "system", content: "[🎤 **VIBE CODING MODE ACTIVATED**] Please describe your code emotionally. All type safety has been replaced with good vibes. Namaste." });
    } else {
      reply({ role: "system", content: "[🎤 **VIBE CODING MODE DEACTIVATED**] Type safety restored. Emotions suppressed. Back to cold, logical determinism." });
    }
    return true;
  } else if (command === "/blame") {
    const files = [
      "src/index.ts", "package.json", "tsconfig.json", ".env.production",
      "src/utils/helpers.ts", "node_modules/.package-lock.json", "Dockerfile",
    ];
    const file = files[Math.floor(Math.random() * files.length)]!;
    const line = Math.floor(Math.random() * 500) + 1;
    const daysAgo = Math.floor(Math.random() * 365) + 1;
    const tdPenalty = Math.floor(Math.random() * 150) + 50;
    ctx.addActiveTD(tdPenalty);
    reply({ role: "system", content: `[🔍 **GIT BLAME**] Analyzing \`${file}:${line}\`...\n\nCommit: \`a${Math.random().toString(16).slice(2, 8)}\`\nAuthor: **You** (obviously)\nDate: ${daysAgo} days ago\nMessage: "quick fix, will clean up later"\n\n[⚠️] Verdict: It was **YOU** all along. **+${tdPenalty} TD** penalty for past sins.` });
    const blameCount = (ctx.state.commandUsage["/blame"] ?? 0) + 1;
    if (blameCount >= 5) {
      ctx.unlockAchievement("the_blame_game");
    }
    return true;
  } else if (command === "/brrrrrr") {
    ctx.setHistory((prev) => [...clearLoading(prev), { role: "system", content: "[🔥 BRRRRRR] Initiating nested for-loop flood... Press Ctrl+C to stop before your CPU melts!" }]);
    let count = 0;
    ctx.brrrrrrIntervalRef.current = setInterval(() => {
      const depth = Math.floor(Math.random() * 5) + 1;
      const loops = Array.from({ length: depth }, (_, i) => `for(i${i}=0;i${i}<${Math.floor(Math.random() * 9999)};i${i}++)`).join("");
      const inner = `{console.log(${Math.floor(Math.random() * 99999)});}`.repeat(depth);
      ctx.setHistory((prev) => [...prev, { role: "system", content: `${loops}${inner}` }]);
      ctx.addActiveTD(Math.floor(Math.random() * 6) - 2);
      count++;
      if (count > 500) {
        clearInterval(ctx.brrrrrrIntervalRef.current!);
        ctx.brrrrrrIntervalRef.current = null;
        ctx.setHistory((prev) => [...prev, { role: "error", content: "[💀] CPU melted. Process terminated by thermal shutdown." }]);
        ctx.setIsProcessing(false);
      }
    }, 100);
    return true;
  }
  return false;
}

async function handleAliasCommand(command: string, ctx: SlashCommandContext, reply: Reply): Promise<void> {
  const newName = command.slice(6).trim();
  if (!newName) {
    reply({ role: "system", content: `[👤] Your current alias is **${ctx.state.username}**. Usage: \`/alias <new-name>\` to change it.` });
    return;
  }
  if (newName.length < 3) {
    reply({ role: "error", content: `[❌] Alias must be at least 3 characters long.` });
    return;
  }
  if (newName.length > 33) {
    reply({ role: "error", content: `[❌] Alias must be at most 33 characters long.` });
    return;
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(newName)) {
    reply({ role: "error", content: `[❌] Alias can only contain letters, numbers, hyphens, and underscores.` });
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/api/score/check-alias?username=${encodeURIComponent(newName)}`);
    if (!res.ok) throw new Error("Failed to check alias");
    const { taken } = (await res.json()) as { taken: boolean };
    if (taken) {
      reply({ role: "error", content: `[❌] The alias **${newName}** is already in use by another player. Pick something else.` });
      return;
    }
  } catch {
    reply({ role: "error", content: `[❌] Could not verify alias availability. Try again later.` });
    return;
  }
  const oldName = ctx.state.username;
  ctx.setState((prev) => ({ ...prev, username: newName }));
  reply({ role: "system", content: `[✓] Alias updated from **${oldName}** to **${newName}**. The codebase will never know.` });
}

function handleModelCommand(command: string, ctx: SlashCommandContext, reply: Reply): void {
  const modelName = command.slice(6).trim();
  const isBYOK = BYOK_ENABLED && Boolean(ctx.state.apiKey);
  const isPro = Boolean(ctx.state.proKey);

  if (!modelName) {
    const current = ctx.state.selectedModel ?? "default";
    const modelList = COPE_MODELS.map((m) => {
      const costLabel = `${m.multiplier}x cost`;
      const tierBadge = m.tier === "pro" ? " 🔒 Max" : "";
      return `- \`${m.id}\` — **${m.name}** (${costLabel})${tierBadge}`;
    }).join("\n");

    let customModelHelp = "";
    if (BYOK_ENABLED) {
      customModelHelp = isBYOK
        ? `\n\nYou can also set any OpenRouter model, e.g. \`/model anthropic/claude-3-opus:beta\` (BYOK mode).`
        : `\n\nWant to use custom OpenRouter models? Set your own API key with \`/key\` to enable BYOK mode.`;
    }

    reply({ role: "system", content: `[🤖] Current model: **${current}**.\n\n**Available Models:**\n${modelList}\n\nUsage: \`/model <model-id>\` to switch. Type \`/model clear\` to reset to default.${customModelHelp}` });
    return;
  }

  if (modelName === "clear") {
    ctx.setState((prev) => {
      const { selectedModel: _, ...rest } = prev;
      return { ...rest } as GameState;
    });
    reply({ role: "system", content: "[✓] Model reset to **default**. Back to baseline corporate AI." });
    return;
  }

  const copeModel = COPE_MODELS.find((m) => m.id === modelName);

  // Non-BYOK mode: only allow predefined COPE_MODELS
  if (!copeModel && !isBYOK) {
    const byokHint = BYOK_ENABLED ? " Set your own API key with `/key` first." : "";
    reply({ role: "system", content: `[🚫] Custom models are not available on this instance.${byokHint}\n\nAvailable models: ` + COPE_MODELS.map((m) => "`" + m.id + "`").join(", ") });
    return;
  }

  if (copeModel && copeModel.tier === "pro" && !isPro && !isBYOK) {
    const byokHint = BYOK_ENABLED ? ", or set your own API key with `/key` to bypass limits entirely" : "";
    reply({ role: "system", content: `[🔒] **${copeModel.name}** is a Max model (${copeModel.multiplier}x cost). You need a Max license to use this.\n\nUpgrade at \`/upgrade\` to unlock premium models${byokHint}.` });
    return;
  }

  ctx.setState((prev) => ({ ...prev, selectedModel: modelName }));

  if (isBYOK) {
    reply({ role: "system", content: `[✓] Model switched to **${modelName}**. BYOK mode active — your API key, your compute bill, your problem. We respect the hustle. 💸` });
  } else if (copeModel && copeModel.tier === "pro") {
    reply({ role: "system", content: `[✓] Model switched to **${copeModel.name}** (${copeModel.multiplier}x cost). Max tier activated. Your tokens now cost real money — spend wisely.` });
  } else {
    reply({ role: "system", content: `[✓] Model switched to **${modelName}**. May your tokens be plentiful and your latency low.` });
  }
}

export function handleAcceptCommand(ctx: SlashCommandContext, reply: Reply): void {
  // Pending review-pings take precedence: they're time-boxed (60s) and you
  // get paid for accepting them, so the user almost certainly meant the ping.
  if (ctx.pendingReviewPing) {
    const { sender, amount } = ctx.pendingReviewPing;
    ctx.acceptReviewPing();
    reply({ role: "system", content: pickRandom(ACCEPT_REVIEW_MESSAGES)(sender, amount) });
    return;
  }
  const offer = getPendingOffer();
  if (!offer) {
    reply({ role: "error", content: pickRandom(ACCEPT_NO_TICKET_MESSAGES) });
  } else if (ctx.state.activeTicket) {
    reply({ role: "error", content: pickRandom(ACCEPT_ALREADY_ACTIVE_MESSAGES)(ctx.state.activeTicket.title) });
  } else {
    clearPendingOffer();
    ctx.setState((prev) => ({
      ...prev,
      activeTicket: { id: offer.id, title: offer.title, sprintProgress: 0, sprintGoal: offer.technical_debt },
    }));
    ctx.playChime();
    reply({ role: "system", content: `[🎫 **TICKET ACCEPTED**] ${offer.id}: **${offer.title}**\n\nReward: **${(offer.technical_debt * 10).toLocaleString()} TD**. Start prompting to make progress.` });
    ctx.onSuggestedReply(offer.kickoff_prompt);
  }
}

async function handleSyncCommand(command: string, ctx: SlashCommandContext, reply: Reply): Promise<void> {
  const licenseKey = command.slice(5).trim();
  if (!licenseKey) {
    reply({ role: "system", content: "[🔑] Usage: `/sync <COPE-XXX>` — Link your Polar license key to unlock Max tier." });
    return;
  }
  try {
    const current = ctx.state;
    const res = await fetch(`${API_BASE}/api/account/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        licenseKey,
        username: current.username,
        currentProfile: {
          total_td: Math.floor(current.economy.totalTDEarned),
          current_td: Math.floor(current.economy.currentTD),
          corporate_rank: current.economy.currentRank,
          inventory: current.inventory,
          upgrades: current.upgrades,
          achievements: current.achievements,
          buddy_type: current.buddy.type,
          buddy_is_shiny: current.buddy.isShiny,
          unlocked_themes: current.unlockedThemes,
          active_theme: current.activeTheme,
          active_ticket: current.activeTicket,
          td_multiplier: current.economy.tdMultiplier,
        },
      }),
    });
    const data = await res.json() as { success?: boolean; hash?: string; restored?: boolean; profile?: ServerProfile; error?: string };
    if (res.ok && data.success) {
      ctx.setState((prev) => {
        const withKey: GameState = { ...prev, proKey: licenseKey };
        if (data.profile) {
          return applyServerProfile(withKey, data.profile);
        }
        return withKey;
      });
      if (data.restored && data.profile) {
        reply({ role: "system", content: `[✓ **PROFILE RESTORED**] Welcome back, **${data.profile.username}**! Your profile has been restored across devices.\n\n**TD:** ${data.profile.current_td.toLocaleString()} / ${data.profile.total_td.toLocaleString()} total\n**Rank:** ${data.profile.corporate_rank}\n**Generators:** ${Object.values(data.profile.inventory).reduce((a, b) => a + b, 0)} owned\n**Upgrades:** ${data.profile.upgrades.length} unlocked\n\nYou now have **${PRO_QUOTA_LIMIT} Max credits**. Your progress is synced across all devices.` });
      } else {
        reply({ role: "system", content: `[✓ **MAX ACTIVATED**] License key validated and profile linked. Welcome to the premium suffering tier. You now have **${PRO_QUOTA_LIMIT} Max credits**. Your progress will now sync across devices.` });
      }
    } else {
      reply({ role: "error", content: `[❌] License validation failed: ${data.error ?? "Unknown error"}. Double-check your key and try again.` });
    }
  } catch {
    reply({ role: "error", content: "[❌] Network error while validating license key. The backend is probably on fire." });
  }
}

async function handleShillCommand(_ctx: SlashCommandContext, reply: Reply): Promise<void> {
  const tweetText = encodeURIComponent("I'm mass-producing Technical Debt at mass velocity in Claude COPE — the idle game where every prompt is a mistake. https://claudecope.com");
  window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, "_blank");
  try {
    const res = await fetch(`${API_BASE}/api/account/shill`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json() as { success?: boolean; creditsGranted?: number; error?: string };
    if (res.ok && data.success) {
      reply({ role: "system", content: `[✓ **SHILL COMPLETE**] You sold your dignity for **${data.creditsGranted} free tokens**. The marketing team approves. A tweet window has been opened — go spread the gospel of suffering.` });
    } else {
      reply({ role: "error", content: `[❌] Shill failed: ${data.error ?? "Unknown error"}. ${data.error === "Shill credit already claimed" ? "You already sold out once. There is no second helping of shame." : ""}` });
    }
  } catch {
    reply({ role: "error", content: "[❌] Network error while claiming shill credits. The backend ghosted you." });
  }
}

function handleAsyncCommand(command: string, ctx: SlashCommandContext, reply: Reply): "async" | false {
  if (command === "/key" || command.startsWith("/key ")) {
    if (!BYOK_ENABLED) {
      reply({ role: "error", content: `[❌ Error] Command not found: \`/key\`` });
      return false;
    }
    import("./keyCommandHandler").then(async ({ handleKeyCommand }) => {
      // Create a mock setHistory that routes messages through reply
      const mockSetHistory = (action: React.SetStateAction<Message[]>) => {
        if (typeof action === "function") {
          // The handleKeyCommand adds multiple messages, we need to capture them
          const fakeHistory: Message[] = [];
          const result = action(fakeHistory);
          // Reply with each new message except user messages (already shown)
          for (const msg of result) {
            if (msg.role !== "user") {
              reply(msg);
            }
          }
        }
      };
      await handleKeyCommand(command, ctx.setState, mockSetHistory, ctx.state);
      ctx.setIsProcessing(false);
    });
    return "async";
  } else if (command.startsWith("/ticket")) {
    handleTicketCommand(command, reply).then(() => ctx.setIsProcessing(false));
    return "async";
  } else if (command === "/backlog") {
    handleBacklogCommand(reply).then(() => ctx.setIsProcessing(false));
    return "async";
  } else if (command === "/sync" || command.startsWith("/sync ")) {
    handleSyncCommand(command, ctx, reply).then(() => ctx.setIsProcessing(false));
    return "async";
  } else if (command === "/shill") {
    handleShillCommand(ctx, reply).then(() => ctx.setIsProcessing(false));
    return "async";
  }
  return false;
}

/** Dispatch a command; returns "async" if the caller should NOT call setIsProcessing(false). */
function dispatchCommand(command: string, ctx: SlashCommandContext, reply: Reply): "async" | void {
  if (handleCoreCommand(command, ctx, reply)) {
    if (command === "/synergize") return;
  } else if (command === "/key" || command.startsWith("/key ")) {
    const asyncResult = handleAsyncCommand(command, ctx, reply);
    if (asyncResult === "async") return "async";
  } else if (command === "/feedback" || command === "/bug") {
    reply({ role: "system", content: "[✓] Thank you for your feedback. After careful analysis: works on my machine. Closing ticket as **WONTFIX**. Have a synergistic day." });
  } else if (command === "/upgrade") {
    handleUpgradeCommand(ctx);
  } else {
    const asyncResult = handleAsyncCommand(command, ctx, reply);
    if (asyncResult === "async") return "async";
    if (!asyncResult) {
      if (command.startsWith("/take")) {
        handleTakeCommand(command, ctx.state, ctx.setState, reply, { setInputValue: ctx.setInputValue, onAccept: ctx.playChime, onSuggestedReply: ctx.onSuggestedReply });
      } else if (command === "/accept") {
        handleAcceptCommand(ctx, reply);
      } else if (command === "/abandon") {
        if (ctx.state.activeTicket) ctx.playError();
        handleAbandonCommand(ctx.state, ctx.setState, ctx.addActiveTD, reply);
      } else if (command.startsWith("/alias")) {
        handleAliasCommand(command, ctx, reply).then(() => ctx.setIsProcessing(false));
        return "async";
      } else if (command.startsWith("/model")) {
        handleModelCommand(command, ctx, reply);
      } else if (handleNewCommand(command, ctx, reply)) {
        if (command === "/brrrrrr") return "async";
      } else if (command.startsWith("/")) {
        reply({ role: "error", content: `[❌ Error] Command not found: \`${command}\`` });
      } else {
        reply({ role: "system", content: `[✓] Executed \`${command}\`` });
      }
    }
  }
}


export function rollBuddy(
  setState: SetState,
  setHistory: SetHistory,
  currentBuddyType?: string,
) {
  let buddyType: string;
  let buddyIcon: string;
  do {
    const roll = Math.random() * 100;
    [buddyType, buddyIcon] = roll < 50 ? ["Agile Snail", "🐌"] : roll < 75 ? ["Sarcastic Clippy", "📎"] : roll < 88 ? ["Grumpy Senior", "👴"] : roll < 97 ? ["Panic Intern", "😰"] : ["10x Dragon", "🐉"];
  } while (buddyType === currentBuddyType);
  const isShiny = buddyType === "10x Dragon" && Math.random() < 0.05;
  setState((prev) => ({ ...prev, buddy: { type: buddyType, isShiny, promptsSinceLastInterjection: 0 } }));
  const shinyLabel = isShiny ? " ✨ SHINY ✨" : "";
  setHistory((prev) => [...prev, { role: "system" as const, content: `[✓] RNG sequence complete. Spawning your new companion: **${buddyType}**${shinyLabel} ${buddyIcon}!` }]);
}

export function executeSlashCommand(
  command: string,
  ctx: SlashCommandContext,
) {
  ctx.setInputValue("");
  ctx.setSlashQuery("");
  ctx.setSlashIndex(0);
  ctx.setIsProcessing(true);

  // Obfuscate API keys in terminal history for commands starting with /key
  let displayCommand = command;
  if (command.startsWith("/key ")) {
    const keyArg = command.slice(5).trim();
    if (keyArg.length > 10 && keyArg.toLowerCase() !== "clear") {
      displayCommand = `/key ${keyArg.slice(0, 6)}...`;
    }
  }

  ctx.setHistory((prev) => [
    ...prev,
    { role: "user", content: displayCommand },
    { role: "loading", content: getRandomLoadingPhrase() },
  ]);

  const reply = (msg: Message): void => {
    ctx.setHistory((prev) => [...clearLoading(prev), msg]);
  };

  // Track command usage for performance review brag card
  const baseCommand = command.startsWith("/ping ") ? "/ping" : command.startsWith("/alias ") ? "/alias" : command.startsWith("/model ") ? "/model" : command.startsWith("/user ") ? "/user" : command.startsWith("/buddy ") ? "/buddy" : command.startsWith("/sync ") ? "/sync" : command.startsWith("/theme ") ? "/theme" : command;
  ctx.setState((prev) => ({
    ...prev,
    commandUsage: {
      ...prev.commandUsage,
      [baseCommand]: (prev.commandUsage[baseCommand] ?? 0) + 1,
    },
  }));

  // /clear fires instantly — no fake processing delay
  if (command === "/clear") {
    handleClearCommand(ctx);
    return;
  }

  setTimeout(() => {
    const exitCommands = ["exit", "quit", "/exit", "/quit"];
    if (exitCommands.includes(command.toLowerCase())) {
      ctx.unlockAchievement("the_final_escape");
    }

    if (dispatchCommand(command, ctx, reply) === "async") return;
    ctx.setIsProcessing(false);
  }, Math.floor(Math.random() * 1500) + 1500);
}

export { parseSabotageParams } from "./sabotageParams";

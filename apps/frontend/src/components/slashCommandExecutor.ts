/* eslint-disable max-lines */
import { GENERATORS } from "../game/constants";
import { COPE_MODELS } from "@claude-cope/shared/models";
import { API_BASE } from "../config";
import { supabase } from "../supabaseClient";
import type { GameState } from "../hooks/useGameState";
import type { Message } from "./Terminal";
import { getRandomLoadingPhrase } from "./loadingPhrases";
import { getRandomTip } from "../game/tips";
import { buildAchievementBox } from "./achievementBox";
import { handleTicketCommand, handleBacklogCommand, handleTakeCommand, handleAbandonCommand } from "./ticketCommands";
import { getPendingOffer, clearPendingOffer } from "./ticketPrompt";

type SetHistory = React.Dispatch<React.SetStateAction<Message[]>>;
type SetState = React.Dispatch<React.SetStateAction<GameState>>;

interface SlashCommandContext {
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
  applyQuotaDrain: () => boolean;
  onlineCount: number;
  onlineUsers: string[];
  sendPing: (target?: string) => void;
  pendingPing: boolean;
  rejectPing: () => void;
  brrrrrrIntervalRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>;
  triggerCompactEffect: () => void;
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

    // Broadcast terminal crash to global incident ticker
    const crashMessage = "💥 A player crashed their terminal with /clear!";
    fetch(`${API_BASE}/api/recent-events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: crashMessage }),
    }).catch(() => {});
    supabase?.channel('global_incidents').send({
      type: 'broadcast',
      event: 'new_incident',
      payload: { message: crashMessage },
    }).catch(() => {});

    // Re-offer a ticket after clear if none active — delay so the cleared screen settles
    if (!ctx.state.activeTicket) {
      setTimeout(() => {
        ctx.setState((prev) => ({ ...prev, hasSeenTicketPrompt: false }));
      }, 2000);
    }
  }, 2000);
  return true;
}

function handlePingCommand(command: string, ctx: SlashCommandContext, reply: Reply): boolean {
  const target = command.slice(5).trim();
  if (target) {
    ctx.sendPing(target);
    reply({ role: "system", content: `[📡] Targeting **${target}** with unsolicited Jira tickets...` });
  } else {
    ctx.sendPing();
    reply({ role: "system", content: "[📡] Pinging a random coworker with unsolicited Jira tickets..." });
  }
  return true;
}

function openOverlay(ctx: SlashCommandContext, open: () => void) {
  ctx.closeAllOverlays();
  ctx.setHistory(clearLoading);
  open();
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

function handleCoreCommand(command: string, ctx: SlashCommandContext, reply: Reply): boolean {
  if (command === "/store") {
    return handleStoreCommand(ctx, reply);
  } else if (command === "/leaderboard") {
    openOverlay(ctx, () => ctx.setShowLeaderboard(true));
    return true;
  } else if (command === "/achievements") {
    openOverlay(ctx, () => ctx.setShowAchievements(true));
    return true;
  } else if (command === "/synergize") {
    reply({ role: "system", content: pickRandom(synergizeResponses) });
    ctx.closeAllOverlays();
    ctx.setShowSynergize(true);
    return true;
  } else if (command === "/profile") {
    openOverlay(ctx, () => ctx.setShowProfile(true));
    return true;
  } else if (command === "/user" || command.startsWith("/user ")) {
    const alias = command.slice(5).trim();
    openOverlay(ctx, () => ctx.setShowProfile(true));
    if (alias) {
      window.history.pushState(null, "", `/user/${encodeURIComponent(alias)}`);
    } else {
      window.history.pushState(null, "", `/user/${encodeURIComponent(ctx.state.username)}`);
    }
    return true;
  } else if (command === "/compact") {
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
  } else if (command === "/support") {
    reply({ role: "system", content: pickRandom(supportResponses) });
    return true;
  } else if (command === "/preworkout") {
    reply({ role: "system", content: pickRandom(preworkoutResponses) });
    return true;
  } else if (command === "/buddy" || command.startsWith("/buddy ")) {
    return handleBuddyCommand(command, ctx, reply);
  } else if (command === "/who") {
    if (ctx.onlineUsers.length > 0) {
      const userList = ctx.onlineUsers.join(", ");
      reply({ role: "system", content: `[📡] **${ctx.onlineCount}** developer(s) suffering in this instance: ${userList}` });
    } else {
      reply({ role: "system", content: `[📡] There are currently **${ctx.onlineCount}** developers suffering in this instance.` });
    }
    return true;
  } else if (command.startsWith("/ping")) {
    return handlePingCommand(command, ctx, reply);
  } else if (command === "/reject") {
    if (ctx.pendingPing) {
      ctx.rejectPing();
      reply({ role: "system", content: "[🛡️] Jira tickets **rejected**! You dodged the corporate sabotage." });
    } else {
      reply({ role: "error", content: "[❌] No incoming ping to reject." });
    }
    return true;
  } else if (command === "/party") {
    openOverlay(ctx, () => ctx.setShowParty(true));
    return true;
  }
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

function handleAliasCommand(command: string, ctx: SlashCommandContext, reply: Reply): void {
  const newName = command.slice(6).trim();
  if (!newName) {
    reply({ role: "system", content: `[👤] Your current alias is **${ctx.state.username}**. Usage: \`/alias <new-name>\` to change it.` });
    return;
  }
  const oldName = ctx.state.username;
  ctx.setState((prev) => ({ ...prev, username: newName }));
  reply({ role: "system", content: `[✓] Alias updated from **${oldName}** to **${newName}**. The codebase will never know.` });
}

function handleModelCommand(command: string, ctx: SlashCommandContext, reply: Reply): void {
  const modelName = command.slice(6).trim();
  const isBYOK = Boolean(ctx.state.apiKey);
  const isPro = Boolean(ctx.state.proKey);

  if (!modelName) {
    const current = ctx.state.selectedModel ?? "default";
    const modelList = COPE_MODELS.map((m) => {
      const costLabel = `${m.multiplier}x cost`;
      const tierBadge = m.tier === "pro" ? " 🔒 Pro" : "";
      return `- \`${m.id}\` — **${m.name}** (${costLabel})${tierBadge}`;
    }).join("\n");

    const customModelHelp = isBYOK
      ? `\n\nYou can also set any OpenRouter model, e.g. \`/model anthropic/claude-3-opus:beta\` (BYOK mode).`
      : `\n\nWant to use custom OpenRouter models? Set your own API key with \`/key\` to enable BYOK mode.`;

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
    reply({ role: "system", content: "[🚫] Custom models are only available in BYOK mode. Set your own API key with `/key` first.\n\nAvailable models: " + COPE_MODELS.map((m) => "`" + m.id + "`").join(", ") });
    return;
  }

  if (copeModel && copeModel.tier === "pro" && !isPro && !isBYOK) {
    reply({ role: "system", content: `[🔒] **${copeModel.name}** is a Pro model (${copeModel.multiplier}x cost). You need a Pro license to use this.\n\nUpgrade at \`/subscribe\` to unlock premium models, or set your own API key with \`/key\` to bypass limits entirely.` });
    return;
  }

  ctx.setState((prev) => ({ ...prev, selectedModel: modelName }));

  if (isBYOK) {
    reply({ role: "system", content: `[✓] Model switched to **${modelName}**. BYOK mode active — your API key, your compute bill, your problem. We respect the hustle. 💸` });
  } else if (copeModel && copeModel.tier === "pro") {
    reply({ role: "system", content: `[✓] Model switched to **${copeModel.name}** (${copeModel.multiplier}x cost). Pro tier activated. Your tokens now cost real money — spend wisely.` });
  } else {
    reply({ role: "system", content: `[✓] Model switched to **${modelName}**. May your tokens be plentiful and your latency low.` });
  }
}

function handleAcceptCommand(ctx: SlashCommandContext, reply: Reply): void {
  const offer = getPendingOffer();
  if (!offer) {
    reply({ role: "error", content: "[❌] No pending ticket to accept. Use `/backlog` to browse tickets." });
  } else if (ctx.state.activeTicket) {
    reply({ role: "error", content: `[❌] You already have an active ticket: **${ctx.state.activeTicket.title}**. Finish it first or \`/abandon\` it.` });
  } else {
    clearPendingOffer();
    ctx.setState((prev) => ({
      ...prev,
      activeTicket: { id: offer.id, title: offer.title, sprintProgress: 0, sprintGoal: offer.technical_debt },
    }));
    reply({ role: "system", content: `[🎫 **TICKET ACCEPTED**] ${offer.id}: **${offer.title}**\n\nReward: **${(offer.technical_debt * 10).toLocaleString()} TD**. Start prompting to make progress.` });
    ctx.onSuggestedReply(offer.kickoff_prompt);
  }
}

async function handleSyncCommand(command: string, ctx: SlashCommandContext, reply: Reply): Promise<void> {
  const licenseKey = command.slice(5).trim();
  if (!licenseKey) {
    reply({ role: "system", content: "[🔑] Usage: `/sync <COPE-XXX>` — Link your Polar license key to unlock Pro tier." });
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/api/account/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licenseKey }),
    });
    const data = await res.json() as { success?: boolean; hash?: string; error?: string };
    if (res.ok && data.success) {
      ctx.setState((prev) => ({ ...prev, proKey: licenseKey }));
      reply({ role: "system", content: "[✓ **PRO ACTIVATED**] License key validated. Welcome to the premium suffering tier. You now have **100 pro credits**. Spend them wisely (you won't)." });
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

function handleKeyCommand(command: string, ctx: SlashCommandContext, reply: Reply): void {
  const keyArg = command.slice(4).trim();
  if (!keyArg) {
    reply({ role: "system", content: "[🔑] Usage: `/key <your-api-key>` — Provide your own OpenRouter API key. Type `/key clear` to remove." });
  } else if (keyArg === "clear") {
    ctx.setState((prev) => ({ ...prev, apiKey: undefined }));
    reply({ role: "system", content: "[🔑] API key removed. Back to the free tier trenches." });
  } else {
    ctx.setState((prev) => ({ ...prev, apiKey: keyArg }));
    reply({ role: "system", content: "[🔑] API key saved. Your key is stored locally and never sent to our servers." });
  }
}

function handleAsyncCommand(command: string, ctx: SlashCommandContext, reply: Reply): "async" | false {
  if (command.startsWith("/ticket")) {
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
    handleKeyCommand(command, ctx, reply);
  } else if (command === "/feedback" || command === "/bug") {
    reply({ role: "system", content: "[✓] Thank you for your feedback. After careful analysis: works on my machine. Closing ticket as **WONTFIX**. Have a synergistic day." });
  } else if (command === "/upgrade") {
    handleUpgradeCommand(ctx, reply);
  } else {
    const asyncResult = handleAsyncCommand(command, ctx, reply);
    if (asyncResult === "async") return "async";
    if (!asyncResult) {
      if (command.startsWith("/take")) {
        handleTakeCommand(command, ctx.state, ctx.setState, reply, ctx.onSuggestedReply);
      } else if (command === "/accept") {
        handleAcceptCommand(ctx, reply);
      } else if (command === "/abandon") {
        handleAbandonCommand(ctx.state, ctx.setState, ctx.addActiveTD, reply);
      } else if (command.startsWith("/alias")) {
        handleAliasCommand(command, ctx, reply);
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

function handleUpgradeCommand(ctx: SlashCommandContext, reply: Reply): boolean {
  const ownedGenerators = GENERATORS
    .filter((g) => (ctx.state.inventory[g.id] ?? 0) > 0)
    .sort((a, b) => b.baseCost - a.baseCost);

  if (ownedGenerators.length === 0) {
    reply({ role: "error", content: "[❌] **Upgrade failed.** You don't own any generators. The AI has nothing to consume. It's judging you silently." });
    return true;
  }

  const target = ownedGenerators[0]!;
  ctx.setState((prev) => ({
    ...prev,
    inventory: {
      ...prev.inventory,
      [target.id]: (prev.inventory[target.id] ?? 1) - 1,
    },
  }));

  const flavorMessages = [
    `The AI devoured your **${target.name}** whole. It didn't even say thank you.`,
    `Your **${target.name}** has been sacrificed to appease the compute gods. The latency remains unchanged.`,
    `One **${target.name}** was fed into the GPU furnace. The AI belched and asked for more.`,
    `Your **${target.name}** was dissolved into pure gradient descent. It felt nothing. Probably.`,
    `The AI absorbed your **${target.name}** and used it to generate 47 more Jira tickets.`,
  ];
  const flavor = flavorMessages[Math.floor(Math.random() * flavorMessages.length)]!;

  reply({ role: "system", content: `[⬆️ UPGRADE] ${flavor}` });
  return true;
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
  ctx.setHistory((prev) => [
    ...prev,
    { role: "user", content: command },
    { role: "loading", content: getRandomLoadingPhrase() },
  ]);

  const reply = (msg: Message): void => {
    ctx.setHistory((prev) => [...clearLoading(prev), msg]);
  };

  // Track command usage for performance review brag card
  const baseCommand = command.startsWith("/ping ") ? "/ping" : command.startsWith("/alias ") ? "/alias" : command.startsWith("/model ") ? "/model" : command.startsWith("/user ") ? "/user" : command.startsWith("/buddy ") ? "/buddy" : command.startsWith("/sync ") ? "/sync" : command;
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
    if (ctx.applyQuotaDrain()) return;

    const exitCommands = ["exit", "quit", "/exit", "/quit"];
    if (exitCommands.includes(command.toLowerCase())) {
      ctx.unlockAchievement("the_final_escape");
    }

    if (dispatchCommand(command, ctx, reply) === "async") return;
    ctx.setIsProcessing(false);
  }, Math.floor(Math.random() * 1500) + 1500);
}

export { parseSabotageParams } from "./sabotageParams";

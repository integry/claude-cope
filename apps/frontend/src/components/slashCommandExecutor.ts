import { GENERATORS } from "../game/constants";
import { API_BASE } from "../config";
import { supabase } from "../supabaseClient";
import type { GameState } from "../hooks/useGameState";
import type { Message } from "./Terminal";
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
  setShowProfile: (v: boolean) => void;
  setBragPending: (v: boolean) => void;
  setBuddyPendingConfirm: (v: boolean) => void;
  unlockAchievement: (id: string) => void;
  clearCount: number;
  setClearCount: (v: number) => void;
  setInputValue: (v: string) => void;
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

type Reply = (msg: Message) => void;

function handleClearCommand(ctx: SlashCommandContext): boolean {
  const newClearCount = ctx.clearCount + 1;
  ctx.setClearCount(newClearCount);
  ctx.setHistory((prev) => [
    ...clearLoading(prev),
    { role: "warning", content: "[WARNING] Executing sudo rm -rf /..." },
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

function handleBuddyCommand(ctx: SlashCommandContext, reply: Reply): boolean {
  if (ctx.state.buddy.type) {
    ctx.setBuddyPendingConfirm(true);
    reply({ role: "system", content: `[⚠️] You already have a buddy (**${ctx.state.buddy.type}**). Re-rolling will replace it. Are you sure? (y/n)` });
    return true;
  }
  const roll = Math.random() * 100;
  const [buddyType, buddyIcon] = roll < 70 ? ["Agile Snail", "🐌"] : roll < 95 ? ["Sarcastic Clippy", "📎"] : ["10x Dragon", "🐉"];
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
    reply({ role: "system", content: "[🗓️] **Mandatory 1-on-1 meeting** initiated. You cannot escape." });
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
  } else if (command === "/brag") {
    ctx.setBragPending(true);
    reply({ role: "system", content: "[🏆] Enter your name for the **Hall of Blame**:" });
    return true;
  } else if (command === "/support") {
    reply({ role: "system", content: "[✓] Support ticket created. Redirecting payload directly to `/dev/null`..." });
    return true;
  } else if (command === "/preworkout") {
    reply({ role: "system", content: "[✓] Injected **400mg** of pure caffeine into the **Node.js event loop**. LFG." });
    return true;
  } else if (command === "/buddy") {
    return handleBuddyCommand(ctx, reply);
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
  if (!modelName) {
    const current = ctx.state.selectedModel ?? "default";
    reply({ role: "system", content: `[🤖] Current model: **${current}**. Usage: \`/model <model-id>\` to switch. Type \`/model clear\` to reset to default.` });
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
  ctx.setState((prev) => ({ ...prev, selectedModel: modelName }));
  reply({ role: "system", content: `[✓] Model switched to **${modelName}**. May your tokens be plentiful and your latency low.` });
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
) {
  const roll = Math.random() * 100;
  const [buddyType, buddyIcon] = roll < 70 ? ["Agile Snail", "🐌"] : roll < 95 ? ["Sarcastic Clippy", "📎"] : ["10x Dragon", "🐉"];
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
    { role: "loading", content: "[⚙️] Coping with your request..." },
  ]);

  const reply = (msg: Message): void => {
    ctx.setHistory((prev) => [...clearLoading(prev), msg]);
  };

  // Track command usage for performance review brag card
  const baseCommand = command.startsWith("/ping ") ? "/ping" : command.startsWith("/alias ") ? "/alias" : command.startsWith("/model ") ? "/model" : command.startsWith("/user ") ? "/user" : command;
  ctx.setState((prev) => ({
    ...prev,
    commandUsage: {
      ...prev.commandUsage,
      [baseCommand]: (prev.commandUsage[baseCommand] ?? 0) + 1,
    },
  }));

  // /clear fires instantly — no fake processing delay
  if (command === "/clear") {
    ctx.addActiveTD(Math.floor(Math.random() * 40) + 10);
    handleClearCommand(ctx);
    return;
  }

  setTimeout(() => {
    ctx.addActiveTD(Math.floor(Math.random() * 40) + 10);
    if (ctx.applyQuotaDrain()) return;

    const exitCommands = ["exit", "quit", "/exit", "/quit"];
    if (exitCommands.includes(command.toLowerCase())) {
      ctx.unlockAchievement("the_final_escape");
    }

    if (handleCoreCommand(command, ctx, reply)) {
      // /synergize handles its own setIsProcessing
      if (command === "/synergize") return;
    } else if (command === "/key") {
      reply({ role: "system", content: "[🔑] Usage: `/key <your-api-key>` — Provide your own OpenRouter or Anthropic API key to bypass default limits. Type `/key clear` to remove your key." });
    } else if (command === "/feedback" || command === "/bug") {
      reply({ role: "system", content: "[✓] Thank you for your feedback. After careful analysis: works on my machine. Closing ticket as **WONTFIX**. Have a synergistic day." });
    } else if (command === "/upgrade") {
      handleUpgradeCommand(ctx, reply);
    } else if (command.startsWith("/ticket")) {
      handleTicketCommand(command, reply).then(() => ctx.setIsProcessing(false));
      return;
    } else if (command === "/backlog") {
      handleBacklogCommand(reply).then(() => ctx.setIsProcessing(false));
      return;
    } else if (command.startsWith("/take")) {
      handleTakeCommand(command, ctx.state, ctx.setState, reply);
    } else if (command === "/accept") {
      const offer = getPendingOffer();
      if (!offer) {
        reply({ role: "error", content: "[❌] No pending ticket to accept. Use `/backlog` to browse tickets." });
      } else if (ctx.state.activeTicket) {
        reply({ role: "error", content: `[❌] You already have an active ticket: **${ctx.state.activeTicket.title}**. Finish it first or \`/abandon\` it.` });
      } else {
        clearPendingOffer();
        ctx.setState((prev) => ({
          ...prev,
          activeTicket: {
            id: offer.id,
            title: offer.title,
            sprintProgress: 0,
            sprintGoal: offer.technical_debt,
          },
        }));
        reply({ role: "system", content: `[🎫 **TICKET ACCEPTED**] ${offer.id}: **${offer.title}**\n\nSprint goal: **${offer.technical_debt} TD**. Start prompting to make progress.` });
      }
    } else if (command === "/abandon") {
      handleAbandonCommand(ctx.state, ctx.setState, ctx.addActiveTD, reply);
    } else if (command.startsWith("/alias")) {
      handleAliasCommand(command, ctx, reply);
    } else if (command.startsWith("/model")) {
      handleModelCommand(command, ctx, reply);
    } else if (handleNewCommand(command, ctx, reply)) {
      // /brrrrrr handles its own setIsProcessing
      if (command === "/brrrrrr") return;
    } else if (command.startsWith("/")) {
      reply({ role: "error", content: `[❌ Error] Command not found: \`${command}\`` });
    } else {
      reply({ role: "system", content: `[✓] Executed \`${command}\`` });
    }

    ctx.setIsProcessing(false);
  }, Math.floor(Math.random() * 1500) + 1500);
}

export { parseSabotageParams } from "./sabotageParams";

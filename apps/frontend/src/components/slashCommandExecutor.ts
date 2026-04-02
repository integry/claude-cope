import { CORPORATE_RANKS } from "../game/constants";
import type { GameState } from "../hooks/useGameState";
import type { Message } from "./Terminal";

type SetHistory = React.Dispatch<React.SetStateAction<Message[]>>;
type SetState = React.Dispatch<React.SetStateAction<GameState>>;

interface SlashCommandContext {
  state: GameState;
  setState: SetState;
  setHistory: SetHistory;
  setIsProcessing: (v: boolean) => void;
  setShowStore: (v: boolean) => void;
  setBragPending: (v: boolean) => void;
  unlockAchievement: (id: string) => void;
  clearCount: number;
  setClearCount: (v: number) => void;
}

const clearLoading = (prev: Message[]) => prev.filter((m) => m.content !== "[⚙️] Claude is coping...");

export function executeSlashCommand(
  command: string,
  ctx: SlashCommandContext,
  setInputValue: (v: string) => void,
  setSlashQuery: (v: string) => void,
  setSlashIndex: (v: number) => void,
  addActiveTD: (n: number) => void,
  applyQuotaDrain: () => boolean,
) {
  setInputValue("");
  setSlashQuery("");
  setSlashIndex(0);
  ctx.setIsProcessing(true);
  ctx.setHistory((prev) => [
    ...prev,
    { role: "user", content: command },
    { role: "loading", content: "[⚙️] Claude is coping..." },
  ]);

  const reply = (msg: Message): void => {
    ctx.setHistory((prev) => [...clearLoading(prev), msg]);
  };

  setTimeout(() => {
    addActiveTD(Math.floor(Math.random() * 40) + 10);
    if (applyQuotaDrain()) return;

    if (command === "/clear") {
      const newClearCount = ctx.clearCount + 1;
      ctx.setClearCount(newClearCount);
      ctx.setHistory((prev) => [
        ...clearLoading(prev),
        { role: "warning", content: "[WARNING] Executing sudo rm -rf /..." },
      ]);
      setTimeout(() => {
        const messages: Message[] = [];
        if (newClearCount >= 3) {
          ctx.unlockAchievement("the_nuclear_option");
          messages.push({ role: "warning", content: "[🏆 Achievement Unlocked: the_nuclear_option]" });
        }
        ctx.setHistory(messages);
        ctx.setIsProcessing(false);
      }, 2000);
      return;
    } else if (command === "/store") {
      if (ctx.state.economy.totalTDEarned < 1000) {
        reply({ role: "error", content: "[❌ Error] Store access denied. Requires 1,000 Technical Debt." });
      } else {
        ctx.setHistory(clearLoading);
        ctx.setShowStore(true);
      }
    } else if (command === "/synergize") {
      reply({ role: "system", content: "[🗓️] Joining 1-on-1 meeting. Please wait..." });
      setTimeout(() => {
        ctx.setHistory((prev) => [...prev, { role: "system", content: "[✓] Survived 10 seconds of corporate synergy. No action items assigned." }]);
        ctx.setIsProcessing(false);
      }, 10000);
      return;
    } else if (command === "/compact") {
      ctx.setHistory((prev) => {
        const filtered = clearLoading(prev).slice(0, Math.max(0, clearLoading(prev).length - 5));
        return [...filtered, { role: "system", content: "[✓] Context compacted. Deleted 50 lines of unoptimized boilerplate." }];
      });
    } else if (command === "/brag") {
      ctx.setBragPending(true);
      reply({ role: "system", content: "[🏆] Enter your name for the Hall of Blame:" });
    } else if (command === "/support") {
      reply({ role: "system", content: "[✓] Support ticket created. Redirecting payload directly to /dev/null..." });
    } else if (command === "/preworkout") {
      reply({ role: "system", content: "[✓] Injected 400mg of pure caffeine into the Node.js event loop. LFG." });
    } else if (command === "/buddy") {
      const roll = Math.random() * 100;
      const [buddyType, buddyIcon] = roll < 70 ? ["Agile Snail", "🐌"] : roll < 95 ? ["Sarcastic Clippy", "📎"] : ["10x Dragon", "🐉"];
      const isShiny = buddyType === "10x Dragon" && Math.random() < 0.05;
      ctx.setState((prev) => ({ ...prev, buddy: { type: buddyType, isShiny, promptsSinceLastInterjection: 0 } }));
      const shinyLabel = isShiny ? " ✨ SHINY ✨" : "";
      reply({ role: "system", content: `[✓] RNG sequence complete. Spawning your new companion: ${buddyType}${shinyLabel} ${buddyIcon}!` });
    } else {
      reply({ role: "system", content: `[✓] Executed ${command}` });
    }

    ctx.setIsProcessing(false);
  }, 1500);
}

export function parseSabotageParams(
  setState: SetState,
  setHistory: SetHistory,
) {
  const params = new URLSearchParams(window.location.search);
  if (params.get("sabotage") !== "true") return;

  const target = parseInt(params.get("target") ?? "0", 10);
  const rankTitle = params.get("rank") ?? "";

  if (target > 0) {
    let rankIndex = 0;
    for (let i = 0; i < CORPORATE_RANKS.length; i++) {
      if (CORPORATE_RANKS[i]!.title === rankTitle) {
        rankIndex = i;
        break;
      }
    }

    setState((prev) => {
      const newRankIndex = Math.max(
        CORPORATE_RANKS.findIndex((r) => r.title === prev.economy.currentRank),
        rankIndex,
      );
      return {
        ...prev,
        economy: {
          ...prev.economy,
          currentTD: prev.economy.currentTD + target,
          totalTDEarned: prev.economy.totalTDEarned + target,
          currentRank: CORPORATE_RANKS[newRankIndex]?.title ?? prev.economy.currentRank,
        },
      };
    });

    setHistory((prev) => [
      ...prev,
      {
        role: "warning" as const,
        content: `[🚨 SABOTAGE] A colleague sent you ${target.toLocaleString()} TD of inherited technical debt! Your rank has been set to ${rankTitle || "Unknown"}.`,
      },
    ]);
  }

  window.history.replaceState({}, "", window.location.pathname);
}

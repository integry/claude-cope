import type { Dispatch, SetStateAction } from "react";
import type { Message } from "./Terminal";
import type { BuddyState } from "../hooks/useGameState";
import type { ModesState } from "../hooks/gameStateUtils";
import { BUDDY_ICONS, BUDDY_INTERJECTIONS } from "./buddyConstants";
import { API_BASE } from "../config";
import { supabase } from "../supabaseClient";
import { buildAchievementBox } from "./achievementBox";
import { ALL_ACHIEVEMENTS } from "../game/achievements";
import { getSystemPrompt } from "@claude-cope/shared/systemPrompt";
import { COPE_MODELS } from "@claude-cope/shared/models";

export type BuddyInterjectionResult = {
  message: Message;
  shouldDeleteHistory: boolean;
};

export function computeBuddyInterjection(buddy: BuddyState): BuddyInterjectionResult | null {
  if (!buddy.type) return null;
  const promptCount = buddy.promptsSinceLastInterjection + 1;
  if (promptCount < 3) return null;
  if (promptCount < 7 && Math.random() >= 0.33) return null;
  const icon = BUDDY_ICONS[buddy.type] ?? "🐾";
  const lines = BUDDY_INTERJECTIONS[buddy.type] ?? ["stares at you blankly."];
  const text = lines[Math.floor(Math.random() * lines.length)]!;
  const shouldDeleteHistory = buddy.type === "10x Dragon" && Math.random() < 0.5;
  return {
    message: { role: "warning", content: `${icon}\n[${buddy.type}] ${text}` },
    shouldDeleteHistory,
  };
}

function processSSEChunk(chunk: string, state: { rawReply: string; usage?: { prompt_tokens: number; completion_tokens: number } }, setHistory: Dispatch<SetStateAction<Message[]>>) {
  const lines = chunk.split("\n");
  for (const line of lines) {
    if (!line.startsWith("data: ")) continue;
    const data = line.slice(6).trim();
    if (data === "[DONE]") continue;
    try {
      const parsed = JSON.parse(data);
      // Capture usage data from the final stream chunk (sent when stream_options.include_usage is true)
      if (parsed?.usage) {
        state.usage = {
          prompt_tokens: parsed.usage.prompt_tokens ?? 0,
          completion_tokens: parsed.usage.completion_tokens ?? 0,
        };
      }
      const delta = parsed?.choices?.[0]?.delta?.content;
      if (delta) {
        state.rawReply += delta;
        const currentReply = state.rawReply;
        setHistory((prev) =>
          prev.map((msg) =>
            msg.role === "loading" ? { ...msg, content: currentReply } : msg
          )
        );
      }
    } catch {
      // Skip malformed JSON chunks
    }
  }
}

type StreamResult = {
  rawReply: string;
  usage?: { prompt_tokens: number; completion_tokens: number };
};

async function readStreamedResponse(res: Response, setHistory: Dispatch<SetStateAction<Message[]>>): Promise<StreamResult> {
  const state: { rawReply: string; usage?: { prompt_tokens: number; completion_tokens: number } } = { rawReply: "" };
  const reader = res.body?.getReader();
  if (!reader) return { rawReply: "" };
  const decoder = new TextDecoder();
  let done = false;
  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;
    if (value) {
      processSSEChunk(decoder.decode(value, { stream: true }), state, setHistory);
    }
  }
  return { rawReply: state.rawReply, usage: state.usage };
}

function processReplyTags(
  rawReply: string,
  unlockAchievement: (id: string) => void,
  onSprintProgress?: (amount: number) => void,
): { achievementMessages: Message[]; reply: string; suggestedReply: string | null; buddySays: string | null } {
  const achievementRegex = /\[ACHIEVEMENT_UNLOCKED:\s*(.+?)\]/g;
  const achievementMessages: Message[] = [];
  let match;
  while ((match = achievementRegex.exec(rawReply)) !== null) {
    const achievementId = match[1]!.trim();
    unlockAchievement(achievementId);
    achievementMessages.push({
      role: "warning",
      content: buildAchievementBox(achievementId),
    });
    const achievementName = ALL_ACHIEVEMENTS.find((a) => a.id === achievementId)?.name ?? achievementId;
    const achievementMessage = `🏆 A player unlocked the achievement: ${achievementName}`;
    fetch(`${API_BASE}/api/recent-events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: achievementMessage }),
    }).catch(() => {});
    supabase?.channel('global_incidents').send({
      type: 'broadcast',
      event: 'new_incident',
      payload: { message: achievementMessage },
    }).catch(() => {});
  }

  const sprintRegex = /\[SPRINT_PROGRESS:\s*(\d+)(?:\s*-\s*\d+)?\]/g;
  const sprintMatch = sprintRegex.exec(rawReply);
  if (onSprintProgress) {
    // Use LLM score if available, otherwise award minimum progress as fallback
    const progress = sprintMatch ? parseInt(sprintMatch[1]!, 10) : 5;
    onSprintProgress(progress);
  }

  // Extract suggested reply for input placeholder
  const suggestedRegex = /\[SUGGESTED_REPLY:\s*(.+?)\]/g;
  const suggestedMatch = suggestedRegex.exec(rawReply);
  const suggestedReply = suggestedMatch?.[1]?.trim().replace(/^["']|["']$/g, "") ?? null;

  // Extract buddy interjection — handle both [BUDDY_SAYS: text] and unclosed [BUDDY_SAYS: text
  const buddyRegex = /\[BUDDY_SAYS:\s*(.+?)(?:\]|$)/gm;
  const buddyMatch = buddyRegex.exec(rawReply);
  const buddySays = buddyMatch?.[1]?.trim() ?? null;

  const reply = rawReply.replace(achievementRegex, "").replace(sprintRegex, "").replace(suggestedRegex, "").replace(buddyRegex, "").trim();
  return { achievementMessages, reply, suggestedReply, buddySays };
}

async function parseResponseBody(
  res: Response,
  setHistory: Dispatch<SetStateAction<Message[]>>,
  addActiveTD?: (n: number, raw?: boolean) => void,
): Promise<{ rawReply: string; tokensSent?: number; tokensReceived?: number }> {
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("text/event-stream")) {
    const streamResult = await readStreamedResponse(res, setHistory);
    return {
      rawReply: streamResult.rawReply,
      tokensSent: streamResult.usage?.prompt_tokens,
      tokensReceived: streamResult.usage?.completion_tokens,
    };
  }
  const data = await res.json();
  const rawReply = data?.choices?.[0]?.message?.content ?? "";
  const tokensSent = data?.usage?.prompt_tokens ?? undefined;
  const tokensReceived = data?.usage?.completion_tokens ?? undefined;
  if (data?.td_awarded && addActiveTD) {
    addActiveTD(data.td_awarded, true);
  }
  return { rawReply, tokensSent, tokensReceived };
}

async function hashKey(key: string): Promise<string> {
  const encoded = new TextEncoder().encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function submitChatMessage(opts: {
  chatMessages: { role: string; content: string }[];
  buddyResult: BuddyInterjectionResult | null;
  unlockAchievement: (id: string) => void;
  setHistory: Dispatch<SetStateAction<Message[]>>;
  setIsProcessing: Dispatch<SetStateAction<boolean>>;
  currentRank: string;
  apiKey?: string;
  customModel?: string;
  proKey?: string;
  modes?: ModesState;
  activeTicket?: { id: string; title: string; sprintGoal: number; sprintProgress: number } | null;
  onSprintProgress?: (amount: number) => void;
  addActiveTD?: (n: number, raw?: boolean) => void;
  onSuggestedReply?: (suggestion: string) => void;
  buddyType?: string | null;
  username?: string;
  inventory?: Record<string, number>;
  upgrades?: string[];
  signal?: AbortSignal;
}) {
  const { chatMessages, buddyResult, unlockAchievement, setHistory, setIsProcessing, currentRank, apiKey, customModel, modes, activeTicket, onSprintProgress, signal } = opts;
  const isBYOK = Boolean(apiKey);

  // Build the system prompt and message list — shared by both paths
  let systemPrompt = getSystemPrompt(currentRank, modes);

  // Active sprint ticket context
  if (activeTicket) {
    const pct = Math.round((activeTicket.sprintProgress / activeTicket.sprintGoal) * 100);
    systemPrompt += `\n\nACTIVE SPRINT TICKET:
The user is currently working on ticket ${activeTicket.id}: "${activeTicket.title}" (${pct}% complete, ${activeTicket.sprintProgress}/${activeTicket.sprintGoal} TD).
Your response should mock their attempt to work on this ticket. If their message is relevant to the ticket topic, acknowledge it sarcastically. If it's completely unrelated, roast them for slacking off during a sprint.
YOU MUST END YOUR RESPONSE WITH THIS TAG — NO EXCEPTIONS:
[SPRINT_PROGRESS: N] where N is a single number.
- Relevant to ticket: N = 18 to 25
- Somewhat relevant: N = 8 to 17
- Off-topic: N = 3 to 7
Example last line: [SPRINT_PROGRESS: 15]
THIS TAG IS MANDATORY. NEVER omit it when a sprint ticket is active.`;
  }

  // Buddy interjection context
  if (opts.buddyType && buddyResult) {
    const BUDDY_PERSONALITIES: Record<string, string> = {
      "Agile Snail": `A slow-moving project manager obsessed with process. Examples: "Have you considered filing a ticket for that?", "This needs a retrospective."`,
      "Sarcastic Clippy": `A digital paperclip that critiques technology choices. Examples: "It looks like you're trying to use JavaScript. Would you like to switch to COBOL?"`,
      "10x Dragon": `A mythical creature that judges code quality with fire. Examples: "Your variable names offend me on a molecular level."`,
      "Grumpy Senior": `A veteran developer tired of everything. Examples: "Back in my day, we didn't have TypeScript. We had raw pointers and fear."`,
      "Panic Intern": `An anxious junior who catastrophizes everything. Examples: "Oh no oh no is that a production error?!", "The CI is red. MY CAREER IS OVER."`,
    };
    const personality = BUDDY_PERSONALITIES[opts.buddyType] ?? "";
    systemPrompt += `\n\nBUDDY INTERJECTION:
The user has a companion called "${opts.buddyType}". ${personality}
Generate a short, in-character one-liner. Append as: [BUDDY_SAYS: your one-liner here]`;
  }

  const recentMessages = chatMessages.slice(-10);
  const messages = [{ role: "system", content: systemPrompt }, ...recentMessages];
  const copeModel = customModel ? COPE_MODELS.find((m) => m.id === customModel) : undefined;
  const model = copeModel ? copeModel.openRouterId : customModel || (isBYOK ? "nvidia/nemotron-3-super-120b-a12b:free" : "nvidia/nemotron-nano-9b-v2:free");

  const requestPromise = isBYOK
    ? fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages, reasoning: { effort: "none" }, stream: true, stream_options: { include_usage: true } }),
        signal,
      })
    : (async () => {
        const proKeyHash = opts.proKey ? await hashKey(opts.proKey) : undefined;
        return fetch(`${API_BASE}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: chatMessages, rank: currentRank, username: opts.username, inventory: opts.inventory, upgrades: opts.upgrades, ...(customModel && COPE_MODELS.some((m) => m.id === customModel) ? { modelId: customModel } : {}), ...(proKeyHash ? { proKeyHash } : {}), ...(modes ? { fast: modes.fast, voice: modes.voice } : {}), ...(activeTicket ? { activeTicket } : {}), ...(opts.buddyType && opts.buddyResult ? { buddy: { type: opts.buddyType, shouldInterject: true } } : {}) }),
          signal,
        });
      })();

  requestPromise
    .then(async (res) => {
      if (res.status === 402) {
        setHistory((prev) => [
          ...prev.filter((msg) => msg.role !== "loading"),
          { role: "warning", content: "[🚫 Quota Exceeded] You've used all your available tokens.\n\n• Downgrade your expectations\n• Upgrade to Pro for 1,000 tokens\n• Shill us on Twitter for bonus tokens" },
        ]);
        return;
      }

      if (res.status === 401) {
        setHistory((prev) => [
          ...prev.filter((msg) => msg.role !== "loading"),
          { role: "error", content: "[🔑 ACCESS DENIED] OpenRouter just slammed the door in your face (HTTP 401). Your API key has been **rejected**, **ghosted**, and **emotionally unavailable**.\n\n[POSSIBLE CAUSES]\n\n• Your key is disabled — like your ambition after the third standup today\n\n• Your key expired — unlike your technical debt, which is eternal\n\n• You copy-pasted it wrong — classic Junior Code Monkey energy\n\n[RECOVERY OPTIONS]\n\n• Check your key at [openrouter.ai/keys](https://openrouter.ai/keys)\n\n• `/key clear` to crawl back to the default model\n\n• `/key <new-key>` to try again with whatever dignity you have left" },
        ]);
        return;
      }

      if (res.status === 429) {
        setHistory((prev) => [
          ...prev.filter((msg) => msg.role !== "loading"),
          { role: "warning", content: "[⚠️] Rate limited. Please wait before sending another message." },
        ]);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        setHistory((prev) => [
          ...prev.filter((msg) => msg.role !== "loading"),
          {
            role: "error",
            content: `[❌ Error] ${errorData?.error?.message ?? errorData?.error ?? "Request failed"} (HTTP ${res.status})`,
          },
        ]);
        return;
      }

      const parsed = await parseResponseBody(res, setHistory, opts.addActiveTD);
      let { rawReply } = parsed;
      const { tokensSent, tokensReceived } = parsed;

      if (!rawReply) {
        rawReply = "[❌ Error] No response from API.";
      }

      const { achievementMessages, reply, suggestedReply, buddySays } = processReplyTags(rawReply, unlockAchievement, onSprintProgress);
      if (suggestedReply && opts.onSuggestedReply) {
        opts.onSuggestedReply(suggestedReply);
      }

      // Build buddy message from LLM-generated interjection or fallback to client-side
      const buddyMessage = buddySays && opts.buddyType
        ? { role: "warning" as const, content: `${BUDDY_ICONS[opts.buddyType] ?? "🐾"}\n[${opts.buddyType}] ${buddySays}` }
        : buddyResult?.message ?? null;

      setHistory((prev) => {
        let updated = [
          ...prev.filter((msg) => msg.role !== "loading"),
          { role: "system" as const, content: reply, tokensSent, tokensReceived },
          ...achievementMessages,
          ...(buddyMessage ? [buddyMessage] : []),
        ];

        if (buddyResult?.shouldDeleteHistory) {
          // Find deletable messages (user or system, not warnings/errors)
          const deletableIndices = updated.reduce<number[]>((acc, msg, i) => {
            if (msg.role === "user" || msg.role === "system") acc.push(i);
            return acc;
          }, []);
          if (deletableIndices.length > 1) {
            const targetIdx = deletableIndices[Math.floor(Math.random() * (deletableIndices.length - 1))]!;
            updated = [
              ...updated.slice(0, targetIdx),
              ...updated.slice(targetIdx + 1),
              { role: "warning" as const, content: "[🐉 10x Dragon] *swoosh* — a line of your history has been incinerated." },
            ];
          }
        }

        return updated;
      });
    })
    .catch((err) => {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setHistory((prev) => [
        ...prev.filter((msg) => msg.role !== "loading"),
        { role: "error", content: "[❌ Error] Network error. Is the backend running?" },
      ]);
    })
    .finally(() => {
      setIsProcessing(false);
    });
}

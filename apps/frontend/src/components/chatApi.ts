import type { Dispatch, SetStateAction } from "react";
import type { Message } from "../hooks/gameStateUtils";
import type { BuddyState } from "../hooks/useGameState";
import type { ModesState } from "../hooks/gameStateUtils";
import type { ServerProfile } from "@claude-cope/shared/profile";
import { BUDDY_ICONS, BUDDY_INTERJECTIONS } from "./buddyConstants";
import { API_BASE, BYOK_ENABLED } from "../config";
import { supabase } from "../supabaseClient";
import { buildAchievementBox } from "./achievementBox";
import { ALL_ACHIEVEMENTS } from "../game/achievements";
import { buildChatMessages } from "@claude-cope/shared/systemPrompt";
import { COPE_MODELS } from "@claude-cope/shared/models";
import { handleChatErrorResponse, parseChatResponseBody } from "./chatApiResponse";

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

function processReplyTags(
  rawReply: string,
  unlockAchievement: (id: string) => void,
  onSprintProgress?: (amount: number) => void,
  username?: string,
): { achievementMessages: Message[]; reply: string; suggestedReply: string | null; buddySays: string | null } {
  const achievementRegex = /\[ACHIEVEMENT_UNLOCKED:\s*(.+?)\]/g;
  const achievementMessages: Message[] = [];
  let match;
  while ((match = achievementRegex.exec(rawReply)) !== null) {
    // Cap at 1 achievement per response to prevent LLM dumping all triggers at once
    if (achievementMessages.length >= 1) break;
    const achievementId = match[1]!.trim();
    unlockAchievement(achievementId);
    achievementMessages.push({
      role: "warning",
      content: buildAchievementBox(achievementId),
    });
    const achievementName = ALL_ACHIEVEMENTS.find((a) => a.id === achievementId)?.name ?? achievementId;
    const playerName = username || "A player";
    const achievementMessage = `🏆 ${playerName} unlocked the achievement: ${achievementName}`;
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
  const suggestedRegex = /\[(?:SUGGESTED_REPLY|USER_NEXT_MESSAGE):\s*(.+?)(?:\]|$)/gm;
  const suggestedMatch = suggestedRegex.exec(rawReply);
  const suggestedReply = suggestedMatch?.[1]?.trim().replace(/^["']|["']$/g, "") ?? null;

  // Extract buddy interjection — handle both [BUDDY_SAYS: text] and unclosed [BUDDY_SAYS: text
  const buddyRegex = /\[BUDDY_SAYS:\s*(.+?)(?:\]|$)/gm;
  const buddyMatch = buddyRegex.exec(rawReply);
  const buddySays = buddyMatch?.[1]?.trim() ?? null;

  const reply = rawReply.replace(achievementRegex, "").replace(sprintRegex, "").replace(suggestedRegex, "").replace(buddyRegex, "").trim();
  return { achievementMessages, reply, suggestedReply, buddySays };
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
  proKeyHash?: string;
  modes?: ModesState;
  activeTicket?: { id: string; title: string; sprintGoal: number; sprintProgress: number } | null;
  onSprintProgress?: (amount: number) => void;
  getSprintCompleteMessage?: () => Message | null;
  addActiveTD?: (n: number, raw?: boolean) => void;
  onSuggestedReply?: (suggestion: string) => void;
  buddyType?: string | null;
  username?: string;
  inventory?: Record<string, number>;
  upgrades?: string[];
  onByokUsage?: (usage: { model: string; prompt_tokens?: number; completion_tokens?: number; cost?: number }) => void;
  onQuotaUpdate?: (quotaPercent: number) => void;
  onQuotaExhausted?: () => void;
  onProfileUpdate?: (profile: ServerProfile) => void;
  onError?: () => void;
  signal?: AbortSignal;
}) {
  const { chatMessages, buddyResult, unlockAchievement, setHistory, setIsProcessing, currentRank, apiKey, customModel, modes, activeTicket, onSprintProgress, onError, signal } = opts;
  // Ignore any locally-stored apiKey when BYOK is disabled at the operator
  // level — stale keys from prior sessions must not reach OpenRouter.
  const isBYOK = BYOK_ENABLED && Boolean(apiKey);

  const copeModel = customModel ? COPE_MODELS.find((m) => m.id === customModel) : undefined;
  const model = copeModel ? copeModel.openRouterId : customModel || (isBYOK ? "openai/gpt-oss-20b:free" : "nvidia/nemotron-nano-9b-v2:free");

  // Determine buddy type for context (only include if buddy result exists)
  const buddyTypeForContext = opts.buddyType && buddyResult ? opts.buddyType : null;

  const requestPromise = isBYOK
    ? (() => {
        // BYOK: Build messages client-side for direct OpenRouter requests
        const messages = buildChatMessages({
          rank: currentRank,
          chatMessages,
          modes,
          activeTicket,
          buddyType: buddyTypeForContext,
        });
        type OpenRouterByokRequestBody = {
          model: string;
          messages: { role: string; content: string }[];
          max_tokens: number;
          reasoning: { effort: string };
          stream: boolean;
          stream_options: { include_usage: boolean };
        };

        const requestBody: OpenRouterByokRequestBody = {
          model,
          messages,
          max_tokens: 2000,
          reasoning: { effort: "low" },
          stream: true,
          stream_options: { include_usage: true },
        };
        return fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify(requestBody),
          signal,
        });
      })()
    : (async () => {
        // Proxy: Send raw components, let backend build the messages
        const proKeyHash = opts.proKeyHash ?? (opts.proKey ? await hashKey(opts.proKey) : undefined);
        return fetch(`${API_BASE}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            chatMessages,
            modes,
            activeTicket,
            buddyType: buddyTypeForContext,
            rank: currentRank,
            username: opts.username,
            inventory: opts.inventory,
            upgrades: opts.upgrades,
            ...(customModel && COPE_MODELS.some((m) => m.id === customModel) ? { modelId: customModel } : {}),
            ...(proKeyHash ? { proKeyHash } : {}),
          }),
          signal,
        });
      })();

  requestPromise
    .then(async (res) => {
      if (await handleChatErrorResponse(res, setHistory, opts.onQuotaExhausted, onError)) return;

      const parsed = await parseChatResponseBody(res, setHistory, opts.addActiveTD, opts.onProfileUpdate);
      let { rawReply } = parsed;
      const { tokensSent, tokensReceived, cost, quotaPercent } = parsed;

      // Track BYOK usage (full stats per model)
      if (isBYOK && opts.onByokUsage) {
        opts.onByokUsage({ model, prompt_tokens: tokensSent, completion_tokens: tokensReceived, cost });
      }

      // Fire quota update for non-BYOK users when quotaPercent is present
      if (!isBYOK && quotaPercent != null && opts.onQuotaUpdate) {
        opts.onQuotaUpdate(quotaPercent);
      }

      if (!rawReply) {
        rawReply = "[❌ Error] No response from API.";
      }

      const { achievementMessages, reply, suggestedReply, buddySays } = processReplyTags(rawReply, unlockAchievement, onSprintProgress, opts.username);
      if (suggestedReply && opts.onSuggestedReply) {
        opts.onSuggestedReply(suggestedReply);
      }

      // Collect any sprint-complete message that was set during onSprintProgress
      const sprintMsg = opts.getSprintCompleteMessage?.();

      // Build buddy message from LLM-generated interjection or fallback to client-side
      const buddyMessage = buddySays && opts.buddyType
        ? { role: "warning" as const, content: `${BUDDY_ICONS[opts.buddyType] ?? "🐾"}\n[${opts.buddyType}] ${buddySays}` }
        : buddyResult?.message ?? null;

      // Merge sprint-complete text into the AI reply so they appear as a single message
      const finalReply = sprintMsg ? sprintMsg.content + "\n\n" + reply : reply;

      setHistory((prev) => {
        let updated = [
          ...prev.filter((msg) => msg.role !== "loading"),
          { role: "system" as const, content: finalReply, tokensSent, tokensReceived, ...(isBYOK && cost != null ? { cost } : {}) },
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
      onError?.();
      setHistory((prev) => [
        ...prev.filter((msg) => msg.role !== "loading"),
        { role: "error", content: "[❌ Error] Network error. Is the backend running?" },
      ]);
    })
    .finally(() => {
      setIsProcessing(false);
    });
}

import type { Dispatch, SetStateAction } from "react";
import type { Message } from "./Terminal";
import type { BuddyState } from "../hooks/useGameState";
import type { ModesState } from "../hooks/gameStateUtils";
import { BUDDY_ICONS, BUDDY_INTERJECTIONS } from "./buddyConstants";
import { API_BASE } from "../config";
import { supabase } from "../supabaseClient";
import { buildAchievementBox } from "./achievementBox";
import { ALL_ACHIEVEMENTS } from "../game/achievements";

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
): { achievementMessages: Message[]; reply: string } {
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
  if (sprintMatch && onSprintProgress) {
    onSprintProgress(parseInt(sprintMatch[1]!, 10));
  }

  const reply = rawReply.replace(achievementRegex, "").replace(sprintRegex, "").trim();
  return { achievementMessages, reply };
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
  modes?: ModesState;
  activeTicket?: { id: string; title: string; sprintGoal: number; sprintProgress: number } | null;
  onSprintProgress?: (amount: number) => void;
  signal?: AbortSignal;
}) {
  const { chatMessages, buddyResult, unlockAchievement, setHistory, setIsProcessing, currentRank, apiKey, customModel, modes, activeTicket, onSprintProgress, signal } = opts;
  fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: chatMessages, rank: currentRank, ...(apiKey ? { apiKey } : {}), ...(customModel ? { customModel } : {}), ...(modes ? { fast: modes.fast, voice: modes.voice } : {}), ...(activeTicket ? { activeTicket } : {}) }),
    signal,
  })
    .then(async (res) => {
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
            content: `[❌ Error] ${errorData?.error ?? "Request failed"}`,
          },
        ]);
        return;
      }

      // Handle both SSE stream (BYOK) and JSON (free tier) responses
      let rawReply: string;
      let tokensSent: number | undefined;
      let tokensReceived: number | undefined;
      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("text/event-stream")) {
        const streamResult = await readStreamedResponse(res, setHistory);
        rawReply = streamResult.rawReply;
        if (streamResult.usage) {
          tokensSent = streamResult.usage.prompt_tokens;
          tokensReceived = streamResult.usage.completion_tokens;
        }
      } else {
        const data = await res.json();
        rawReply = data?.choices?.[0]?.message?.content ?? "";
        if (data?.usage) {
          tokensSent = data.usage.prompt_tokens ?? undefined;
          tokensReceived = data.usage.completion_tokens ?? undefined;
        }
      }

      if (!rawReply) {
        rawReply = "[❌ Error] No response from API.";
      }

      const { achievementMessages, reply } = processReplyTags(rawReply, unlockAchievement, onSprintProgress);

      setHistory((prev) => {
        let updated = [
          ...prev.filter((msg) => msg.role !== "loading"),
          { role: "system" as const, content: reply, tokensSent, tokensReceived },
          ...achievementMessages,
          ...(buddyResult ? [buddyResult.message] : []),
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

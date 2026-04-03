import type { Dispatch, SetStateAction } from "react";
import type { Message } from "./Terminal";
import type { BuddyState } from "../hooks/useGameState";
import { BUDDY_ICONS, BUDDY_INTERJECTIONS } from "./buddyConstants";

export type BuddyInterjectionResult = {
  message: Message;
  shouldDeleteHistory: boolean;
};

export function computeBuddyInterjection(buddy: BuddyState): BuddyInterjectionResult | null {
  if (!buddy.type) return null;
  if (buddy.promptsSinceLastInterjection + 1 < 5) return null;
  const icon = BUDDY_ICONS[buddy.type] ?? "🐾";
  const lines = BUDDY_INTERJECTIONS[buddy.type] ?? ["stares at you blankly."];
  const text = lines[Math.floor(Math.random() * lines.length)]!;
  const shouldDeleteHistory = buddy.type === "10x Dragon" && Math.random() < 0.5;
  return {
    message: { role: "warning", content: `[${icon} ${buddy.type}] ${text}` },
    shouldDeleteHistory,
  };
}

export function submitChatMessage(opts: {
  chatMessages: { role: string; content: string }[];
  buddyResult: BuddyInterjectionResult | null;
  unlockAchievement: (id: string) => void;
  setHistory: Dispatch<SetStateAction<Message[]>>;
  setIsProcessing: Dispatch<SetStateAction<boolean>>;
  currentRank: string;
  apiKey?: string;
}) {
  const { chatMessages, buddyResult, unlockAchievement, setHistory, setIsProcessing, currentRank, apiKey } = opts;
  fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: chatMessages, rank: currentRank, ...(apiKey ? { apiKey } : {}) }),
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

      const data = await res.json();
      const rawReply =
        data?.choices?.[0]?.message?.content ?? "[❌ Error] No response from API.";

      const achievementRegex = /\[ACHIEVEMENT_UNLOCKED:\s*(.+?)\]/g;
      const achievementMessages: Message[] = [];
      let match;
      while ((match = achievementRegex.exec(rawReply)) !== null) {
        const achievementId = match[1]!.trim();
        unlockAchievement(achievementId);
        achievementMessages.push({
          role: "warning",
          content: `[🏆 Achievement Unlocked: ${achievementId}]`,
        });
        fetch("/api/recent-events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: `🏆 A player unlocked the achievement: ${achievementId}` }),
        }).catch(() => {});
      }

      const reply = rawReply.replace(achievementRegex, "").trim();

      setHistory((prev) => {
        let updated = [
          ...prev.filter((msg) => msg.role !== "loading"),
          { role: "system" as const, content: reply },
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
    .catch(() => {
      setHistory((prev) => [
        ...prev.filter((msg) => msg.role !== "loading"),
        { role: "error", content: "[❌ Error] Network error. Is the backend running?" },
      ]);
    })
    .finally(() => {
      setIsProcessing(false);
    });
}

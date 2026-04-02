import type { Dispatch, SetStateAction } from "react";
import type { Message } from "./Terminal";
import type { BuddyState } from "../hooks/useGameState";
import { BUDDY_ICONS, BUDDY_INTERJECTIONS } from "./buddyConstants";

export function computeBuddyInterjection(buddy: BuddyState): Message | null {
  if (!buddy.type) return null;
  if (buddy.promptsSinceLastInterjection + 1 < 5) return null;
  const icon = BUDDY_ICONS[buddy.type] ?? "🐾";
  const lines = BUDDY_INTERJECTIONS[buddy.type] ?? ["stares at you blankly."];
  const text = lines[Math.floor(Math.random() * lines.length)]!;
  return { role: "warning", content: `[${icon} ${buddy.type}] ${text}` };
}

export function submitChatMessage(
  chatMessages: { role: string; content: string }[],
  buddyInterjection: Message | null,
  unlockAchievement: (id: string) => void,
  setHistory: Dispatch<SetStateAction<Message[]>>,
  setIsProcessing: Dispatch<SetStateAction<boolean>>,
) {
  fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: chatMessages }),
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
      }

      const reply = rawReply.replace(achievementRegex, "").trim();

      setHistory((prev) => [
        ...prev.filter((msg) => msg.role !== "loading"),
        { role: "system", content: reply },
        ...achievementMessages,
        ...(buddyInterjection ? [buddyInterjection] : []),
      ]);
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

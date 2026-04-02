import { Message } from "./Terminal";

type SetHistory = React.Dispatch<React.SetStateAction<Message[]>>;
type SetBragPending = React.Dispatch<React.SetStateAction<boolean>>;

export function submitBrag(
  username: string,
  currentRank: string,
  totalTDEarned: number,
  setHistory: SetHistory,
  setBragPending: SetBragPending,
) {
  setHistory((prev) => [
    ...prev,
    { role: "user", content: username },
    { role: "loading", content: "[⚙️] Submitting to the Hall of Blame..." },
  ]);

  fetch("/api/leaderboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, rank: currentRank, debt: totalTDEarned }),
  })
    .then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        setHistory((prev) => [
          ...prev.filter((msg) => msg.role !== "loading"),
          { role: "error", content: `[❌ Error] ${errorData?.error ?? "Failed to submit brag"}` },
        ]);
        return;
      }

      const sabotageUrl = `${window.location.origin}?sabotage=true&target=${totalTDEarned}&rank=${encodeURIComponent(currentRank)}`;

      const payload = [
        "┌──────────────────────────────────────────────┐",
        "│        PERFORMANCE REVIEW — Claude Cope       │",
        "├──────────────────────────────────────────────┤",
        `│  Employee:  ${username.padEnd(33)}│`,
        `│  Rank:      ${currentRank.padEnd(33)}│`,
        `│  Total TD:  ${totalTDEarned.toLocaleString().padEnd(33)}│`,
        "├──────────────────────────────────────────────┤",
        "│  Comments:                                    │",
        "│  \"Has demonstrated an exceptional ability     │",
        "│   to accumulate technical debt at scale.\"     │",
        "├──────────────────────────────────────────────┤",
        "│  🔗 Share the love (sabotage a coworker):     │",
        `│  ${sabotageUrl.length <= 44 ? sabotageUrl.padEnd(44) : sabotageUrl}│`,
        "└──────────────────────────────────────────────┘",
      ].join("\n");

      navigator.clipboard.writeText(payload).catch(() => {
        // clipboard may not be available in all environments
      });

      setHistory((prev) => [
        ...prev.filter((msg) => msg.role !== "loading"),
        {
          role: "system",
          content: `\`\`\`\n${payload}\n\`\`\`\n\n[📋 Copied to clipboard! Paste it anywhere to brag.]`,
        },
      ]);
    })
    .catch(() => {
      setHistory((prev) => [
        ...prev.filter((msg) => msg.role !== "loading"),
        { role: "error", content: "[❌ Error] Network error. Is the backend running?" },
      ]);
    })
    .finally(() => {
      setBragPending(false);
    });
}

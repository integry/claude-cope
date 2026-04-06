import { Message } from "./Terminal";
import { API_BASE } from "../config";

type SetHistory = React.Dispatch<React.SetStateAction<Message[]>>;
type SetBragPending = React.Dispatch<React.SetStateAction<boolean>>;

interface SubmitBragOptions {
  username: string;
  currentRank: string;
  totalTDEarned: number;
  generatorsOwned: number;
  mostAbusedCommand: string;
  setHistory: SetHistory;
  setBragPending: SetBragPending;
}

function renderShareCard(lines: string[]): HTMLCanvasElement {
  const padding = 40;
  const lineHeight = 28;
  const fontSize = 18;
  const font = `${fontSize}px "Courier New", Courier, monospace`;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  ctx.font = font;

  const maxWidth = Math.max(...lines.map((l) => ctx.measureText(l).width));
  canvas.width = maxWidth + padding * 2;
  canvas.height = lines.length * lineHeight + padding * 2;

  // Background
  ctx.fillStyle = "#0d1117";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border
  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 2;
  ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

  // Text
  ctx.font = font;
  ctx.textBaseline = "top";

  lines.forEach((line, i) => {
    const isSeparator = /^=+$/.test(line);
    const isTitle = line === "EMPLOYEE PERFORMANCE REVIEW";
    ctx.fillStyle = isTitle ? "#facc15" : isSeparator ? "#22c55e" : "#4ade80";
    ctx.fillText(line, padding, padding + i * lineHeight);
  });

  return canvas;
}

async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
    if (!blob) return false;
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob }),
    ]);
    return true;
  } catch {
    return false;
  }
}

export function submitBrag(opts: SubmitBragOptions) {
  const { username, currentRank, totalTDEarned, generatorsOwned, mostAbusedCommand, setHistory, setBragPending } = opts;
  setHistory((prev) => [
    ...prev,
    { role: "user", content: username },
    { role: "loading", content: "[⏳] Submitting to the Hall of Blame..." },
  ]);

  fetch(`${API_BASE}/api/leaderboard`, {
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

      const payloadLines = [
        "====================================",
        "EMPLOYEE PERFORMANCE REVIEW",
        "====================================",
        `Rank: ${currentRank}`,
        `Total Technical Debt: $${totalTDEarned.toLocaleString()}`,
        `Generators Owned: ${generatorsOwned}`,
        `Most Abused Command: ${mostAbusedCommand}`,
        "====================================",
        "Challenge your coworkers to do worse:",
        sabotageUrl,
      ];

      const plaintext = payloadLines.join("\n");

      const canvas = renderShareCard(payloadLines);
      const imageCopied = await copyCanvasToClipboard(canvas);

      if (!imageCopied) {
        await navigator.clipboard.writeText(plaintext).catch(() => {});
      }

      const clipboardMsg = imageCopied
        ? "[🖼️ Share card image copied to clipboard! Paste it anywhere to brag.]"
        : "[📋 Copied to clipboard! Paste it anywhere to brag.]";

      setHistory((prev) => [
        ...prev.filter((msg) => msg.role !== "loading"),
        {
          role: "system",
          content: `\`\`\`\n${plaintext}\n\`\`\`\n\n${clipboardMsg}`,
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

import { ALL_ACHIEVEMENTS } from "../game/achievements";

/**
 * Builds a bordered box for achievement unlock notifications.
 * Uses only ASCII for reliable monospace alignment.
 */
export function buildAchievementBox(achievementId: string): string {
  const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === achievementId);
  const label = "ACHIEVEMENT UNLOCKED!";
  const fallbackName = achievementId
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const name = achievement
    ? `* ${achievement.name} *`
    : `* ${fallbackName} *`;
  const description = achievement?.description ?? "";
  const lines = [label, name];
  if (description) {
    lines.push(description);
  }
  const innerWidth = Math.max(...lines.map((l) => l.length)) + 4;
  const pad = (text: string) => {
    const padding = innerWidth - text.length;
    const left = Math.floor(padding / 2);
    const right = padding - left;
    return " ".repeat(left) + text + " ".repeat(right);
  };
  const border = "=".repeat(innerWidth + 2);
  const boxLines = [
    `+${border}+`,
    `| ${pad(label)} |`,
    `| ${pad(name)} |`,
  ];
  if (description) {
    boxLines.push(`| ${pad(description)} |`);
  }
  boxLines.push(`+${border}+`);
  return boxLines.join("\n");
}

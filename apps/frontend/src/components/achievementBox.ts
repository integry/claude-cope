import { ALL_ACHIEVEMENTS } from "../game/achievements";

/**
 * Builds an ANSI-styled bordered box for achievement unlock notifications.
 */
export function buildAchievementBox(achievementId: string): string {
  const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === achievementId);
  const label = "🏆 ACHIEVEMENT UNLOCKED!";
  const name = achievement
    ? `★ ${achievement.name} ★`
    : achievementId;
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
  const border = "═".repeat(innerWidth);
  const boxLines = [
    `╔${border}╗`,
    `║${pad(label)}║`,
    `║${pad(name)}║`,
  ];
  if (description) {
    boxLines.push(`║${pad(description)}║`);
  }
  boxLines.push(`╚${border}╝`);
  return boxLines.join("\n");
}

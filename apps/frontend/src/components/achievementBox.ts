/**
 * Builds an ANSI-styled bordered box for achievement unlock notifications.
 */
export function buildAchievementBox(achievementId: string): string {
  const label = "🏆 ACHIEVEMENT UNLOCKED!";
  const detail = achievementId;
  const innerWidth = Math.max(label.length, detail.length) + 4;
  const pad = (text: string) => {
    const padding = innerWidth - text.length;
    const left = Math.floor(padding / 2);
    const right = padding - left;
    return " ".repeat(left) + text + " ".repeat(right);
  };
  const border = "═".repeat(innerWidth);
  return [
    `╔${border}╗`,
    `║${pad(label)}║`,
    `║${pad(detail)}║`,
    `╚${border}╝`,
  ].join("\n");
}

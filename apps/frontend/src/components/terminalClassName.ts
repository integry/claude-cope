/**
 * Build the Terminal container's Tailwind class string. Kept outside the
 * Terminal component so its conditional branches don't contribute to
 * Terminal's cyclomatic complexity budget.
 */
export function terminalContainerClassName(args: {
  activeRegression: string | null;
  outageHp: number | null;
  pendingReviewPing: unknown;
  pingAcknowledged: boolean;
  activeTheme: string;
}): string {
  const height = args.activeRegression === "broken_scrollback"
    ? "h-screen overflow-hidden"
    : "h-[100dvh] overflow-hidden";
  const outage = args.outageHp !== null ? "bg-red-900" : "";
  const flash = args.pendingReviewPing && !args.pingAcknowledged ? "pvp-ping-flash" : "";
  const theme = args.activeTheme && args.activeTheme !== "default" ? `theme-${args.activeTheme}` : "";
  return `${height} w-full font-mono text-sm leading-snug sm:leading-relaxed p-4 pb-0 flex flex-col transition-all duration-300 ${outage} ${flash} ${theme}`;
}

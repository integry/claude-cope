export const TIPS = [
  "Tip: Use /help to see all commands. There is no actual help, only commands.",
  "Tip: The /store sells generators that produce Technical Debt while you sleep. Or cry.",
  "Tip: /backlog shows your tickets. Spoiler: they multiply faster than you can close them.",
  "Tip: /buddy lets you configure your AI companion. It judges you silently.",
  "Tip: /ping another developer to interrupt their flow state. Misery loves company.",
  "Tip: /achievements tracks your career-ending decisions. Collect them all!",
  "Tip: /blame finds someone else to hold responsible. A core engineering skill.",
  "Tip: Generators keep producing even when you close the tab. The debt never sleeps.",
  "Tip: /leaderboard shows who has coped the most. Competitive suffering.",
  "Tip: /preworkout gives a temporary boost. Side effects may include burnout.",
  "Tip: /synergize multiplies your output. What could possibly go wrong?",
  "Tip: /take a ticket from the backlog. Abandon all hope, ye who enter here.",
  "Tip: /clear your terminal to hide the evidence. Out of sight, out of mind.",
  "Tip: /compact the logs when they get too real. Denial is a valid strategy.",
  "Tip: /profile shows your stats. We recommend not looking.",
  "Tip: /ticket submits a support request to /dev/null. Response time: heat death of universe.",
  "Tip: /upgrade your suffering with real money. Premium technical debt awaits.",
  "Tip: /model lets you change AI providers. Different hallucinations, same despair.",
  "Tip: /brrrrrr to ship directly to prod. Best used on Fridays at 4:59 PM.",
  "Tip: /alias creates shortcuts. Automate your mistakes for maximum efficiency.",
  "Tip: The StackOverflow Copy-Paster is a great first generator. No understanding required.",
  "Tip: Upgrades boost generator output. More debt per second, more problems per minute.",
  "Tip: /who shows online developers. Witness their suffering in real-time.",
  "Tip: /abandon a ticket to give up officially. We knew you would.",
  "Tip: Corporate ranks unlock as you accumulate Technical Debt. Climb that ladder!",
  "Tip: /reject reality and substitute your own backlog.",
  "Tip: /voice lets you scream your prompts. Therapeutic, but the neighbors complain.",
  "Tip: /shill tweets about us for free tokens. Your dignity was already in the backlog anyway.",
];

export function getRandomTip(): string {
  return TIPS[Math.floor(Math.random() * TIPS.length)]!;
}

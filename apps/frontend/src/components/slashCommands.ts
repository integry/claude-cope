import { BYOK_ENABLED, TICKET_REFINE_ENABLED } from "../config";

export type SlashCommandGroup = {
  title: string;
  commands: string[];
};

// /ping is a paid code-review request (see useMultiplayer). /accept handles
// both ticket offers and incoming review-pings — there is no separate defense
// command, because the new protocol is opt-in and ignoring a ping just refunds
// the sender.
export const SLASH_COMMAND_GROUPS: SlashCommandGroup[] = [
  {
    title: "SYSTEM DIRECTIVES",
    commands: ["/help", "/clear", "/compact", "/fast", "/voice", "/theme"],
  },
  {
    title: "COPING MECHANISMS",
    commands: ["/backlog", "/take", "/support", "/preworkout", "/buddy", "/synergize", "/brrrrrr", "/abandon"],
  },
  {
    title: "GUILD HALL",
    commands: ["/who", "/party", "/ping", "/accept", "/shill"],
  },
  {
    title: "LEDGER OF SUFFERING",
    commands: ["/store", "/leaderboard", "/achievements", "/profile", "/upgrade"],
  },
  {
    title: "PAPERWORK & PENANCE",
    commands: ["/ticket", "/bug", "/feedback", "/blame", "/alias", "/model", "/user", "/key", "/sync"],
  },
  {
    title: "LORE & LEGALITIES",
    commands: ["/about", "/privacy", "/terms", "/contact"],
  },
];

export const ALL_SLASH_COMMANDS = SLASH_COMMAND_GROUPS.flatMap((group) => group.commands);

// Feature-gated: `/key` requires BYOK; `/ticket` requires ticket refinement.
export const SLASH_COMMANDS = ALL_SLASH_COMMANDS.filter((cmd) => {
  if (cmd === "/key" && !BYOK_ENABLED) return false;
  if (cmd === "/ticket" && !TICKET_REFINE_ENABLED) return false;
  return true;
});

export const SLASH_COMMAND_DESCRIPTIONS: Record<string, string> = {
  "/backlog": "Stare into the abyss of unfulfilled promises",
  "/clear": "Hide your shame from the console",
  "/support": "Shout into the void",
  "/preworkout": "Inject pure, unadulterated anxiety",
  "/buddy": "Configure your emotional support AI",
  "/store": "Purchase premium technical debt",
  "/synergize": "Multiply your errors by 10x",
  "/compact": "Sweep the garbage under the rug",
  "/who": "Find other suffering developers",
  "/ping": "Pay a coworker 50 TD to review your active ticket",
  "/help": "There is no help. Only commands.",
  "/about": "Read the origin story nobody asked for",
  "/privacy": "Pretend we respect your data",
  "/terms": "The contract you never signed but always agreed to",
  "/contact": "Reach out to absolutely no one",
  "/fast": "Break things at double speed",
  "/voice": "Scream into the microphone",
  "/blame": "Find a suitable scapegoat",
  "/brrrrrr": "Ship directly to prod on a Friday",
  "/feedback": "Send data directly to a shredder",
  "/bug": "Report an undocumented feature",
  "/key": "Your OpenRouter key, unlimited suffering",
  "/upgrade": "Open the Max upgrade flow",
  "/leaderboard": "Compare your suffering to others",
  "/achievements": "Trophies for terrible decisions",
  "/profile": "Review your miserable statistics",
  "/ticket": "Submit a plea to /dev/null",
  "/take": "Voluntarily accept more pain",
  "/accept": "Accept a paid review request, or a ticket from the PM",
  "/abandon": "Give up. We knew you would.",
  "/alias": "Change your identity. Witness protection for devs.",
  "/model": "Swap out the hallucination engine",
  "/user": "Confirm you exist (debatable)",
  "/sync": "Link your Polar license key to unlock Max",
  "/shill": "Tweet about us for 5 free tokens. Dignity sold separately.",
  "/party": "Watch chaos unfold in realtime",
  "/theme": "Switch your terminal theme",
};

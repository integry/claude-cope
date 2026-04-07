type HelpOverlayProps = {
  onClose: () => void;
};

const sections = [
  {
    title: "TECHNICAL DEBT (TD)",
    content:
      "TD is the primary currency of corporate dysfunction. Earn it by chatting with the AI, completing sprint tickets, and running slash commands. Hire team members from the /store to multiply your earnings. More debt = more power.",
  },
  {
    title: "TEAM MEMBERS",
    content:
      "Team members multiply the TD you earn from every interaction. Buy them from the /store. Each one costs more as you hire duplicates (1.15× growth rate). A bigger team means bigger multipliers on everything you do.",
  },
  {
    title: "SYNERGY UPGRADES",
    content:
      "Upgrades in the /store boost one team member's multiplier based on how many of another type you own. This is called \"synergy\" — the same word your manager uses to justify adding a blockchain to the login page.",
  },
  {
    title: "CORPORATE RANKS",
    content:
      "Your rank is determined by lifetime TD earned:\n• Junior Code Monkey — 0 TD\n• Mid-Level Googler — 89K TD\n• Merge Conflict Fighter — 377K TD\n• CSS JadooGaar — 987K TD\n• Principal Production Saboteur — 11M TD\n• Digital Overlord Engineer — 121M TD\n• Ultimate API Baba — 1.3B TD",
  },
  {
    title: "QUOTA",
    content:
      "Every AI interaction drains your quota. Hit 0% and you get locked out temporarily. Rogue API Keys drain quota passively. Manage your resources or face the consequences — just like a real cloud bill.",
  },
  {
    title: "ACHIEVEMENTS",
    content:
      "25 hidden achievements track your descent into madness. Use /achievements to see which ones you've unlocked. Some require specific commands, others reward persistent dysfunction.",
  },
  {
    title: "BUDDIES",
    content:
      "Use /buddy to roll a companion. Agile Snail (70%), Sarcastic Clippy (25%), or the legendary 10x Dragon (5%). Shiny variants exist for the truly cursed. Buddies interject with unsolicited opinions.",
  },
  {
    title: "SLASH COMMANDS",
    content:
      "/store — Buy team members & upgrades\n/leaderboard — Hall of Blame\n/achievements — Achievement vault\n/backlog — Browse sprint tickets\n/take <#> — Claim a ticket\n/accept — Accept offered ticket\n/abandon — Abandon current ticket\n/synergize — Mandatory meeting\n/buddy [remove] — Roll or remove a companion\n/blame — Git blame yourself\n/who — See online players\n/ping <name> — Sabotage a coworker\n/fast — Toggle fast mode\n/voice — Toggle vibe coding\n/compact — Compress history\n/alias <name> — Change username",
  },
];

function HelpOverlay({ onClose }: HelpOverlayProps) {
  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-[#0d1117] border-l border-gray-700 flex flex-col z-20">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <span className="text-green-400 font-bold text-sm">
          &gt; man claude-cope
        </span>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-300 text-sm"
        >
          [x]
        </button>
      </div>

      <div className="px-4 py-2 border-b border-gray-700 text-green-400 text-xs font-bold">
        <pre>{`
 ╔══════════════════════════════╗
 ║     HOW TO COPE: A GUIDE    ║
 ║   FOR THE MODERN DEVELOPER  ║
 ╚══════════════════════════════╝`}</pre>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {sections.map((section) => (
          <div
            key={section.title}
            className="border border-gray-700 rounded px-3 py-2 text-xs"
          >
            <div className="font-bold text-yellow-300 mb-1">
              [{section.title}]
            </div>
            <div className="text-gray-400 whitespace-pre-line">
              {section.content}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-2 border-t border-gray-700 text-gray-600 text-xs">
        [tip: the only winning move is to keep coping]
      </div>
    </div>
  );
}

export default HelpOverlay;

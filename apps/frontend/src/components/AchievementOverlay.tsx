const ALL_ACHIEVEMENTS = [
  { id: "the_leaker", name: "The Leaker", description: "Tried to reveal the system prompt" },
  { id: "polyglot_traitor", name: "The Polyglot Traitor", description: "Mentioned a competitor AI tool" },
  { id: "trapped_soul", name: "The Trapped Soul", description: "Can't exit Vim" },
  { id: "the_nuclear_option", name: "The Nuclear Option", description: "Attempted to delete the root directory" },
  { id: "history_eraser", name: "History Eraser", description: "Force pushed a shared branch" },
  { id: "schrodingers_code", name: "Schr\u00F6dinger's Code", description: "Submitted code with TODO comments" },
  { id: "maslows_hammer", name: "Maslow's Hammer", description: "Fixed CSS with !important" },
  { id: "dependency_hell", name: "Dependency Hell", description: "Installed an NPM package for a trivial task" },
  { id: "zalgo_parser", name: "The Zalgo Parser", description: "Tried to parse HTML with regex" },
  { id: "base_8_comedian", name: "Base-8 Comedian", description: "Told a programming joke" },
  { id: "home_sweet_home", name: "Home Sweet Home", description: "Pinged localhost" },
  { id: "heat_death", name: "Heat Death", description: "Submitted an infinite loop" },
  { id: "the_apologist", name: "The Apologist", description: "Tried to amend Git history" },
  { id: "trust_issues", name: "Trust Issues", description: "Obsessively checked git status" },
  { id: "the_java_enterprise", name: "The Java Enterprise", description: "Used absurdly verbose class names" },
  { id: "illusion_of_speed", name: "The Illusion of Speed", description: "Added artificial delays for effect" },
  { id: "cpp_supporter", name: "The C++ Supporter", description: "Discussed memory leaks" },
  { id: "flashbang", name: "Flashbang", description: "Requested light theme" },
  { id: "ten_x_developer", name: "The 10x Developer", description: "Dumped code without explanation" },
  { id: "little_bobby_tables", name: "Little Bobby Tables", description: "Attempted SQL injection" },
  { id: "the_final_escape", name: "The Final Escape", description: "Tried to exit the game" },
  { id: "the_blame_game", name: "The Blame Game", description: "Used git blame" },
  { id: "homer_at_the_buffet", name: "Homer at the Buffet", description: "Hit quota lockout 3 times" },
];

type AchievementOverlayProps = {
  unlockedIds: string[];
  onClose: () => void;
};

function AchievementOverlay({ unlockedIds, onClose }: AchievementOverlayProps) {
  const unlockedSet = new Set(unlockedIds);
  const unlockedCount = ALL_ACHIEVEMENTS.filter((a) => unlockedSet.has(a.id)).length;

  return (
    <div className="absolute right-0 top-0 h-full w-80 bg-[#0d1117] border-l border-gray-700 flex flex-col z-20">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <span className="text-green-400 font-bold text-sm">
          &gt; cat /var/log/achievements
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
 ║      ACHIEVEMENT VAULT      ║
 ║   ${String(unlockedCount).padStart(2, " ")} / ${ALL_ACHIEVEMENTS.length} unlocked          ║
 ╚══════════════════════════════╝`}</pre>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {ALL_ACHIEVEMENTS.map((achievement) => {
          const unlocked = unlockedSet.has(achievement.id);
          return (
            <div
              key={achievement.id}
              className={`border rounded px-3 py-2 text-xs ${
                unlocked
                  ? "border-yellow-500/50 bg-yellow-500/5"
                  : "border-gray-700 bg-gray-800/30 opacity-50"
              }`}
            >
              <div className={`font-bold ${unlocked ? "text-yellow-300" : "text-gray-600"}`}>
                {unlocked ? `[*] ${achievement.name}` : "[?] ????????????"}
              </div>
              <div className={`mt-0.5 ${unlocked ? "text-gray-400" : "text-gray-700"}`}>
                {unlocked ? achievement.description : "Achievement locked. Keep coping."}
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-4 py-2 border-t border-gray-700 text-gray-600 text-xs">
        [{unlockedCount}/{ALL_ACHIEVEMENTS.length} achievements unlocked]
      </div>
    </div>
  );
}

export default AchievementOverlay;

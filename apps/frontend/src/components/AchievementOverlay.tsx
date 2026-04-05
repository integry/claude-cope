import { ALL_ACHIEVEMENTS } from "../game/achievements";

type AchievementOverlayProps = {
  unlockedIds: string[];
  onClose: () => void;
};

function AchievementOverlay({ unlockedIds, onClose }: AchievementOverlayProps) {
  const unlockedSet = new Set(unlockedIds);
  const unlockedCount = ALL_ACHIEVEMENTS.filter((a) => unlockedSet.has(a.id)).length;

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-[#0d1117] border-l border-gray-700 flex flex-col z-20">
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

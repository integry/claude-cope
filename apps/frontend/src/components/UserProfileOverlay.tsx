import { GENERATORS, CORPORATE_RANKS } from "../game/constants";
import { ALL_ACHIEVEMENTS } from "../game/achievements";
import { calculateActiveMultiplier } from "../hooks/gameStateUtils";
import type { GameState } from "../hooks/useGameState";

type UserProfileOverlayProps = {
  state: GameState;
  onClose: () => void;
};

function formatTD(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return n.toFixed(0);
}

function UserProfileOverlay({ state, onClose }: UserProfileOverlayProps) {
  const { economy, inventory, upgrades, achievements, username, buddy } = state;
  const activeMultiplier = calculateActiveMultiplier(inventory, upgrades) * economy.tdMultiplier;
  const unlockedAchievements = ALL_ACHIEVEMENTS.filter((a) => achievements.includes(a.id)).length;
  const totalGenerators = Object.values(inventory).reduce((sum, count) => sum + count, 0);
  const ownedGeneratorTypes = GENERATORS.filter((g) => (inventory[g.id] ?? 0) > 0);

  // Find next rank
  const currentRankIndex = CORPORATE_RANKS.findIndex((r) => r.title === economy.currentRank);
  const nextRank = CORPORATE_RANKS[currentRankIndex + 1];
  const progressToNext = nextRank
    ? Math.min(100, (economy.totalTDEarned / nextRank.threshold) * 100)
    : 100;
  const progressBarLen = 20;
  const filled = Math.round((progressToNext / 100) * progressBarLen);
  const progressBar = "█".repeat(filled) + "░".repeat(progressBarLen - filled);

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-[#0d1117] border-l border-gray-700 flex flex-col z-20">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <span className="text-green-400 font-bold text-sm">
          &gt; cat /etc/profile
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
 ║       EMPLOYEE PROFILE       ║
 ║   Performance Review v2.0    ║
 ╚══════════════════════════════╝`}</pre>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {/* Identity */}
        <div className="border border-gray-700 rounded px-3 py-2 text-xs">
          <div className="text-green-400 font-bold mb-1">[IDENTITY]</div>
          <div className="text-gray-300">
            Alias: <span className="text-yellow-300">{username}</span>
          </div>
          <div className="text-gray-300">
            Rank: <span className="text-yellow-300">{economy.currentRank}</span>
          </div>
          {buddy.type && (
            <div className="text-gray-300">
              Buddy: <span className="text-cyan-400">{buddy.type}{buddy.isShiny ? " ✨" : ""}</span>
            </div>
          )}
        </div>

        {/* Economy */}
        <div className="border border-gray-700 rounded px-3 py-2 text-xs">
          <div className="text-green-400 font-bold mb-1">[TECHNICAL DEBT]</div>
          <div className="text-gray-300">
            Current TD: <span className="text-green-300">{formatTD(economy.currentTD)}</span>
          </div>
          <div className="text-gray-300">
            Lifetime TD: <span className="text-green-300">{formatTD(economy.totalTDEarned)}</span>
          </div>
          <div className="text-gray-300">
            Active Multiplier: <span className="text-green-300">{activeMultiplier.toFixed(1)}x</span>
          </div>
        </div>

        {/* Rank Progress */}
        <div className="border border-gray-700 rounded px-3 py-2 text-xs">
          <div className="text-green-400 font-bold mb-1">[RANK PROGRESS]</div>
          <div className="text-gray-300 font-mono">
            [{progressBar}] {progressToNext.toFixed(0)}%
          </div>
          <div className="text-gray-500 mt-1">
            {nextRank
              ? `Next: ${nextRank.title} (${formatTD(nextRank.threshold)} TD)`
              : "MAX RANK — You are the corporate singularity."}
          </div>
        </div>

        {/* Inventory */}
        <div className="border border-gray-700 rounded px-3 py-2 text-xs">
          <div className="text-green-400 font-bold mb-1">[INVENTORY]</div>
          {ownedGeneratorTypes.length === 0 ? (
            <div className="text-gray-500">No generators owned. Start coping.</div>
          ) : (
            ownedGeneratorTypes.map((g) => (
              <div key={g.id} className="text-gray-300 flex justify-between">
                <span>{g.name}</span>
                <span className="text-yellow-300">x{inventory[g.id]}</span>
              </div>
            ))
          )}
          {ownedGeneratorTypes.length > 0 && (
            <div className="text-gray-500 mt-1 border-t border-gray-800 pt-1">
              Total units: {totalGenerators} | Upgrades: {upgrades.length}
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="border border-gray-700 rounded px-3 py-2 text-xs">
          <div className="text-green-400 font-bold mb-1">[ACHIEVEMENTS]</div>
          <div className="text-gray-300">
            Unlocked: <span className="text-yellow-300">{unlockedAchievements}</span> / {ALL_ACHIEVEMENTS.length}
          </div>
          <div className="text-gray-300 font-mono mt-1">
            [{
              "█".repeat(Math.round((unlockedAchievements / ALL_ACHIEVEMENTS.length) * 20)) +
              "░".repeat(20 - Math.round((unlockedAchievements / ALL_ACHIEVEMENTS.length) * 20))
            }]
          </div>
        </div>

        {/* Quota */}
        <div className="border border-gray-700 rounded px-3 py-2 text-xs">
          <div className="text-green-400 font-bold mb-1">[API QUOTA]</div>
          <div className="text-gray-300">
            Usage: <span className={economy.quotaPercent > 80 ? "text-red-400" : "text-green-300"}>{economy.quotaPercent.toFixed(0)}%</span>
          </div>
          <div className="text-gray-300">
            Lockouts: <span className="text-red-400">{economy.quotaLockouts}</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-2 border-t border-gray-700 text-gray-600 text-xs">
        [employee #{username.length * 42} | reviewed by /dev/null]
      </div>
    </div>
  );
}

export default UserProfileOverlay;

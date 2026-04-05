import { ActiveTicket } from "../hooks/gameStateUtils";

function HeaderBar({ rank, totalTDEarned, quotaPercent, outageHp, tdps, activeTicket }: { rank: string; totalTDEarned: number; quotaPercent: number; outageHp: number | null; tdps: number; activeTicket: ActiveTicket | null }) {
  const sprintPercent = activeTicket ? Math.min(100, Math.round((activeTicket.sprintProgress / activeTicket.sprintGoal) * 100)) : 0;

  return (
    <div className={`sticky top-0 z-10 border-b pb-2 mb-2 ${outageHp !== null ? "bg-red-900 border-red-500" : "bg-[#0d1117] border-green-800"}`}>
      <div className="flex justify-between text-green-400 mb-1">
        <span><span className="text-gray-500">Rank:</span> <span className="text-white font-bold">{rank}</span></span>
        <span><span className="text-gray-500">Technical Debt:</span> <span className="text-white font-bold">{totalTDEarned.toLocaleString()} TD</span>{tdps > 0 && <span className="text-yellow-400"> (+{tdps.toFixed(1)} TD/s)</span>}</span>
      </div>
      <div className={`text-xs font-mono ${quotaPercent > 50 ? "text-green-400" : quotaPercent > 20 ? "text-yellow-400" : "text-red-400"}`}>
        {(() => {
          const totalBlocks = 20;
          const filledBlocks = Math.round((quotaPercent / 100) * totalBlocks);
          const emptyBlocks = totalBlocks - filledBlocks;
          return `[API Quota: ${"█".repeat(filledBlocks)}${"░".repeat(emptyBlocks)} ${quotaPercent}%]`;
        })()}
      </div>
      {activeTicket && (
        <div className="mt-2 border border-cyan-800 rounded p-2 bg-cyan-950/40">
          <div className="flex items-center justify-between text-cyan-400 text-xs mb-1">
            <span className="font-bold truncate mr-2">[SPRINT] {activeTicket.id}: {activeTicket.title}</span>
            <span className="whitespace-nowrap">{activeTicket.sprintProgress}/{activeTicket.sprintGoal} TD</span>
          </div>
          <div className="h-2 bg-cyan-900 rounded overflow-hidden">
            <div
              className="h-full bg-cyan-400 rounded transition-all duration-500 ease-out"
              style={{ width: `${sprintPercent}%` }}
            />
          </div>
          <div className="text-right text-cyan-500 text-xs mt-0.5">{sprintPercent}%</div>
        </div>
      )}
    </div>
  );
}

export default HeaderBar;

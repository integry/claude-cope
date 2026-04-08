import { memo } from "react";
import { useAnimatedCounter } from "../hooks/useAnimatedCounter";

function HeaderBar({ rank, currentTD, quotaPercent, outageHp, activeMultiplier, username, onProfileClick }: { rank: string; currentTD: number; quotaPercent: number; outageHp: number | null; activeMultiplier: number; username: string; onProfileClick: () => void }) {
  const displayTD = useAnimatedCounter(currentTD, 2660);

  const quotaColor = quotaPercent > 50 ? "bg-green-400" : quotaPercent > 20 ? "bg-yellow-400" : "bg-red-400";

  return (
    <div className={`sticky top-0 z-10 border-b pt-2 pb-2 mb-2 relative flex items-center gap-4 ${outageHp !== null ? "bg-red-900 border-red-500" : "bg-[#0d1117] border-gray-700"}`}>
      <img src="/media/logo-400-transparent.png" alt="Logo" className="hidden sm:block max-h-12 w-auto flex-shrink-0 object-contain" />
      <div className="flex-1 flex items-center justify-between text-green-400 min-w-0 px-2 sm:px-0">
        <span className="flex items-center gap-2 min-w-0">
          <span className="text-gray-500">Rank:</span> <span className="text-white font-bold">{rank}</span>
          <span className="text-gray-600">|</span>
          <button onClick={onProfileClick} className="text-cyan-400 hover:text-white hover:underline cursor-pointer truncate">{username}</button>
          <span className="text-gray-600">|</span>
          <span className="whitespace-nowrap"><span className="text-gray-500">TD:</span> <span className="text-white font-bold">{Math.floor(displayTD).toLocaleString()}</span>{activeMultiplier > 1 && <span className="text-yellow-400"> ({activeMultiplier.toFixed(1)}x)</span>}</span>
        </span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-800">
        <div className={`h-full ${quotaColor} transition-all duration-500`} style={{ width: `${quotaPercent}%` }} />
      </div>
    </div>
  );
}

export default memo(HeaderBar);

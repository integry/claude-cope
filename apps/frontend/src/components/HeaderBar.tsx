function HeaderBar({ rank, currentTD, quotaPercent, outageHp, activeMultiplier, username, onProfileClick }: { rank: string; currentTD: number; quotaPercent: number; outageHp: number | null; activeMultiplier: number; username: string; onProfileClick: () => void }) {
  return (
    <div className={`sticky top-0 z-10 border-b pb-2 mb-2 flex gap-4 ${outageHp !== null ? "bg-red-900 border-red-500" : "bg-[#0d1117] border-green-800"}`}>
      <img src="/media/logo-400.png" alt="Logo" className="flex-shrink-0" />
      <div className="flex-1">
        <div className="flex items-center justify-between text-green-400 mb-1">
          <span className="flex items-center gap-3"><span className="text-gray-500">Rank:</span> <span className="text-white font-bold">{rank}</span></span>
          <span className="flex flex-col items-end"><button onClick={onProfileClick} className="text-cyan-400 hover:text-white hover:underline cursor-pointer mb-0.5">{username}</button><span><span className="text-gray-500">Technical Debt:</span> <span className="text-white font-bold">{Math.floor(currentTD).toLocaleString()} TD</span>{activeMultiplier > 1 && <span className="text-yellow-400"> ({activeMultiplier.toFixed(1)}x)</span>}</span></span>
        </div>
        <div className={`text-xs font-mono ${quotaPercent > 50 ? "text-green-400" : quotaPercent > 20 ? "text-yellow-400" : "text-red-400"}`}>
          {(() => {
            const totalBlocks = 20;
            const filledBlocks = Math.round((quotaPercent / 100) * totalBlocks);
            const emptyBlocks = totalBlocks - filledBlocks;
            return `[API Quota: ${"█".repeat(filledBlocks)}${"░".repeat(emptyBlocks)} ${quotaPercent}%]`;
          })()}
        </div>
      </div>
    </div>
  );
}

export default HeaderBar;

function HeaderBar({ rank, totalTDEarned, quotaPercent, outageHp }: { rank: string; totalTDEarned: number; quotaPercent: number; outageHp: number | null }) {
  return (
    <div className={`sticky top-0 z-10 border-b pb-2 mb-2 ${outageHp !== null ? "bg-red-900 border-red-500" : "bg-[#0d1117] border-green-800"}`}>
      <div className="flex justify-between text-green-400 mb-1">
        <span>Rank: {rank}</span>
        <span>Technical Debt: {totalTDEarned.toLocaleString()} TD</span>
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
  );
}

export default HeaderBar;

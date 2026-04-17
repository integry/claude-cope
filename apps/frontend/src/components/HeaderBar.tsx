import { memo, useState, useRef, useEffect } from "react";
import { useAnimatedCounter } from "../hooks/useAnimatedCounter";
import { FREE_QUOTA_LIMIT, PRO_QUOTA_LIMIT } from "../config";

function getQuotaTextColor(percent: number): string {
  if (percent > 50) return "text-green-400";
  if (percent > 20) return "text-yellow-400";
  return "text-red-400";
}

function getQuotaBgColor(percent: number): string {
  if (percent > 50) return "bg-green-400";
  if (percent > 20) return "bg-yellow-400";
  return "bg-red-400";
}

function formatByokCost(cost: number): string {
  if (cost < 0.01) return cost.toFixed(6);
  if (cost < 0.1) return cost.toFixed(4);
  return cost.toFixed(2);
}

function DesktopQuotaBar({ quotaPercent, remaining, totalQuota, quotaTooltip }: { quotaPercent: number; remaining: number; totalQuota: number; quotaTooltip: string }) {
  const totalBlocks = 20;
  const filledBlocks = Math.round((quotaPercent / 100) * totalBlocks);
  const emptyBlocks = totalBlocks - filledBlocks;
  return (
    <div title={quotaTooltip} className={`flex-shrink-0 text-xs font-mono whitespace-nowrap cursor-default ${getQuotaTextColor(quotaPercent)}`}>
      {`[API Quota: ${"█".repeat(filledBlocks)}${"░".repeat(emptyBlocks)} ${remaining}/${totalQuota}]`}
    </div>
  );
}

function MobileQuotaLine({ quotaPercent, quotaTooltip }: { quotaPercent: number; quotaTooltip: string }) {
  const [tipOpen, setTipOpen] = useState(false);
  return (
    <div className="sm:hidden absolute bottom-0 left-0 right-0 h-[2px] bg-gray-800 cursor-pointer" onClick={() => setTipOpen((v) => !v)}>
      <div className={`h-full ${getQuotaBgColor(quotaPercent)} transition-all duration-500`} style={{ width: `${quotaPercent}%` }} />
      {tipOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-[10px] font-mono whitespace-nowrap bg-gray-900 border border-gray-700 rounded text-gray-300 shadow-lg z-30">
          {quotaTooltip}
        </div>
      )}
    </div>
  );
}

function HeaderBar({ rank, currentTD, quotaPercent, outageHp, activeMultiplier, username, isBYOK, isPro, byokTotalCost, onProfileClick, onHelpClick, onAboutClick, onSlashMenuClick }: { rank: string; currentTD: number; quotaPercent: number; outageHp: number | null; activeMultiplier: number; username: string; isBYOK: boolean; isPro: boolean; byokTotalCost?: number; onProfileClick: () => void; onHelpClick: () => void; onAboutClick: () => void; onSlashMenuClick?: () => void }) {
  const displayTD = useAnimatedCounter(currentTD, 2660);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const totalQuota = isPro ? PRO_QUOTA_LIMIT : FREE_QUOTA_LIMIT;
  const remaining = Math.round((quotaPercent / 100) * totalQuota);
  const used = totalQuota - remaining;
  const quotaTooltip = `${used}/${totalQuota} requests used · ${remaining} remaining`;

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <div className={`sticky top-0 z-10 border-b pt-2 pb-2 mb-2 relative flex items-center gap-4 ${outageHp !== null ? "bg-red-900 border-red-500" : "border-gray-700"}`} style={outageHp !== null ? undefined : { backgroundColor: 'var(--color-bg)' }}>
      {/* Left group: identity */}
      <div className="flex items-center gap-2 min-w-0 px-2 sm:px-0">
        <img src="/media/logo-400-transparent.png" alt="Logo" className="hidden sm:block max-h-12 w-auto flex-shrink-0 object-contain" />
        <button onClick={onProfileClick} className="text-cyan-400 hover:text-white hover:underline cursor-pointer truncate">{username}</button>
        <span className="text-[11px] text-gray-400 leading-none sm:text-xs">[{rank}]</span>
        {isBYOK && <span className="text-[10px] font-bold text-yellow-400 whitespace-nowrap">[BYOK{byokTotalCost != null && byokTotalCost > 0 ? ` $${formatByokCost(byokTotalCost)}` : ""}]</span>}
        {isPro && <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/40 rounded whitespace-nowrap">PRO</span>}
      </div>
      {/* Right group: status (desktop) */}
      <div className="hidden sm:flex items-center gap-6 ml-auto flex-shrink-0 justify-end px-2 sm:px-0">
        <span className="whitespace-nowrap flex items-center gap-1"><span className="text-gray-500 text-xs">TD:</span> <span className="text-white font-bold">{Math.floor(displayTD).toLocaleString()}</span>{activeMultiplier > 1 && <span className="text-yellow-400"> ({activeMultiplier.toFixed(1)}x)</span>}</span>
        {!isBYOK && <><span className="text-gray-600">|</span><DesktopQuotaBar quotaPercent={quotaPercent} remaining={remaining} totalQuota={totalQuota} quotaTooltip={quotaTooltip} /></>}
      </div>
      {/* Right group: status (mobile) */}
      <div className="flex sm:hidden items-center gap-2 ml-auto flex-shrink-0 px-2">
        <span className="whitespace-nowrap flex items-center gap-1"><span className="text-gray-500 text-xs">TD:</span> <span className="text-white font-bold">{Math.floor(displayTD).toLocaleString()}</span>{activeMultiplier > 1 && <span className="text-yellow-400"> ({activeMultiplier.toFixed(1)}x)</span>}</span>
      </div>
      {/* Hamburger menu — mobile only */}
      <div ref={menuRef} className="sm:hidden relative flex-shrink-0">
        <button onClick={() => setMenuOpen((v) => !v)} className="text-gray-400 hover:text-white px-2 py-1" aria-label="Menu">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 bg-gray-900 border border-gray-700 rounded shadow-lg z-20 min-w-[200px] py-1 text-sm">
            <div className="px-4 py-2 border-b border-gray-700">
              <img src="/media/logo-400-transparent.png" alt="Claude Cope" className="max-h-8 w-auto" />
            </div>
            {!isBYOK && (
              <div className={`px-4 py-2 border-b border-gray-700 font-mono text-xs ${getQuotaTextColor(quotaPercent)}`}>
                API Quota: {Math.round(quotaPercent)}% — {used}/{totalQuota} used, {remaining} left
              </div>
            )}
            <button onClick={() => { setMenuOpen(false); onProfileClick(); }} className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white">/profile</button>
            <button onClick={() => { setMenuOpen(false); onHelpClick(); }} className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white">/help</button>
            <button onClick={() => { setMenuOpen(false); onAboutClick(); }} className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white">/about</button>
            <a href="https://github.com/integry/claude-cope" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white">/github</a>
            <a href="https://github.com/integry/claude-cope/blob/main/PRIVACY.md" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white">/privacy</a>
            <a href="https://github.com/integry/claude-cope/blob/main/TERMS.md" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white">/terms</a>
            <div className="border-t border-gray-700 mt-1 pt-1 px-4 py-2 flex gap-3">
              <a href="https://x.com/claudecope" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-xs">/x</a>
              <a href="https://discord.gg/claudecope" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-xs">/discord</a>
            </div>
            <div className="px-4 py-2">
              <button onClick={() => { setMenuOpen(false); onSlashMenuClick?.(); }} className="text-xs text-gray-400 hover:text-gray-200 cursor-pointer text-left">Type <span className="text-green-400">/</span> in terminal for commands</button>
              <p className="text-xs text-gray-500 mt-1">&copy; Rinalds Uzkalns 2026 | made with <a href="https://propr.dev" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">propr.dev</a></p>
            </div>
          </div>
        )}
      </div>
      {!isBYOK && <MobileQuotaLine quotaPercent={quotaPercent} quotaTooltip={quotaTooltip} />}
    </div>
  );
}

export default memo(HeaderBar);

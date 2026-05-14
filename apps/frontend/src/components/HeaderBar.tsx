import { memo, useState, useRef, useEffect } from "react";
import { useAnimatedCounter } from "../hooks/useAnimatedCounter";
import { FREE_QUOTA_LIMIT, PRO_QUOTA_LIMIT } from "../config";

function getMobileRankLabel(rank: string): string {
  return rank.replace(/^Junior\b/, "Jr.");
}

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

function getByokBadgeText(byokTotalCost?: number): string {
  return `[BYOK${byokTotalCost != null && byokTotalCost > 0 ? ` $${formatByokCost(byokTotalCost)}` : ""}]`;
}

function getByokStatusText(byokTotalCost?: number): string {
  return byokTotalCost != null && byokTotalCost > 0
    ? `External Billing Active: $${formatByokCost(byokTotalCost)}`
    : "External Billing Active: BYOK";
}

function EntitlementBadges({
  isBYOK,
  isMax,
  byokTotalCost,
  maxBadgeTestId,
  maxBadgeLabel = "[MAX 429X]",
}: {
  isBYOK: boolean;
  isMax: boolean;
  byokTotalCost?: number;
  maxBadgeTestId?: string;
  maxBadgeLabel?: string;
}) {
  return (
    <>
      {isBYOK && <span className="text-[10px] font-bold text-yellow-400 whitespace-nowrap">{getByokBadgeText(byokTotalCost)}</span>}
      {isMax && <span data-testid={maxBadgeTestId} className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: '#ff00ff' }}>{maxBadgeLabel}</span>}
    </>
  );
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

function DesktopIdentityBlock({ username, rank, isBYOK, isMax, byokTotalCost, onProfileClick }: { username: string; rank: string; isBYOK: boolean; isMax: boolean; byokTotalCost?: number; onProfileClick: () => void }) {
  return (
    <div data-testid="desktop-identity-block" className="hidden sm:flex flex-col justify-center min-w-0 gap-1 leading-snug">
      <div className="flex items-center gap-2 min-w-0">
        <button onClick={onProfileClick} className="text-cyan-400 hover:text-white hover:underline cursor-pointer truncate">{username}</button>
        <EntitlementBadges isBYOK={isBYOK} isMax={isMax} byokTotalCost={byokTotalCost} maxBadgeTestId="desktop-max-badge" />
      </div>
      <div data-testid="desktop-rank-line" title={rank} className="text-xs text-gray-400 truncate max-w-full">[{rank}]</div>
    </div>
  );
}

function MobileIdentityBlock({ username, rank, isBYOK, isMax, byokTotalCost, onProfileClick }: { username: string; rank: string; isBYOK: boolean; isMax: boolean; byokTotalCost?: number; onProfileClick: () => void }) {
  return (
    <>
      <div data-testid="mobile-identity-block" className="col-start-2 row-start-1 flex min-w-0 items-center gap-2 self-end sm:hidden">
        <button onClick={onProfileClick} className="min-w-0 text-cyan-400 hover:text-white hover:underline cursor-pointer">{username}</button>
        <EntitlementBadges isBYOK={isBYOK} isMax={isMax} byokTotalCost={byokTotalCost} maxBadgeTestId="mobile-max-badge" maxBadgeLabel="[MAX]" />
      </div>
      <div data-testid="mobile-rank-line" title={rank} className="col-start-2 row-start-2 min-w-0 whitespace-nowrap text-[11px] leading-none text-gray-400 self-start sm:hidden sm:text-xs">
        [{getMobileRankLabel(rank)}]
      </div>
    </>
  );
}

function DesktopStatusBlock({
  displayTD,
  activeMultiplier,
  isBYOK,
  isMax,
  byokTotalCost,
  quotaPercent,
  remaining,
  totalQuota,
  quotaTooltip,
  onUpgradeClick,
}: {
  displayTD: number;
  activeMultiplier: number;
  isBYOK: boolean;
  isMax: boolean;
  byokTotalCost?: number;
  quotaPercent: number;
  remaining: number;
  totalQuota: number;
  quotaTooltip: string;
  onUpgradeClick?: () => void;
}) {
  return (
    <div data-testid="desktop-status-block" className="hidden sm:flex flex-col items-end gap-1 ml-auto flex-shrink-0 justify-center px-2 sm:px-0 leading-snug">
      <div data-testid="desktop-technical-debt-line" className="whitespace-nowrap flex items-center gap-1">
        <span className="text-gray-500 text-xs">Technical Debt:</span>
        <span className="text-white font-bold">{Math.floor(displayTD).toLocaleString()} TD</span>
        {activeMultiplier > 1 && <span className="text-yellow-400"> ({activeMultiplier.toFixed(1)}x)</span>}
      </div>
      <div data-testid="desktop-status-detail-line" className="whitespace-nowrap flex items-center gap-2 max-w-full">
        {isBYOK ? (
          <span className="text-xs text-yellow-400 truncate" title={getByokStatusText(byokTotalCost)}>
            {getByokStatusText(byokTotalCost)}
          </span>
        ) : (
          <>
          <DesktopQuotaBar quotaPercent={quotaPercent} remaining={remaining} totalQuota={totalQuota} quotaTooltip={quotaTooltip} />
          {!isMax && onUpgradeClick && <button onClick={onUpgradeClick} className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 rounded whitespace-nowrap hover:bg-yellow-500/30 cursor-pointer">Upgrade to Max 429X</button>}
          </>
        )}
      </div>
    </div>
  );
}

function HeaderBar({ rank, currentTD, quotaPercent, outageHp, activeMultiplier, username, isBYOK, isMax, byokTotalCost, onProfileClick, onHelpClick, onAboutClick, onSlashMenuClick, onUpgradeClick }: { rank: string; currentTD: number; quotaPercent: number; outageHp: number | null; activeMultiplier: number; username: string; isBYOK: boolean; isMax: boolean; byokTotalCost?: number; onProfileClick: () => void; onHelpClick: () => void; onAboutClick: () => void; onSlashMenuClick?: () => void; onUpgradeClick?: () => void }) {
  const displayTD = useAnimatedCounter(currentTD, 2660);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const totalQuota = isMax ? PRO_QUOTA_LIMIT : FREE_QUOTA_LIMIT;
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
    <div className={`sticky top-0 z-10 border-b pt-3 pb-2 mb-2 relative grid grid-cols-[auto_minmax(0,1fr)_auto] grid-rows-[auto_auto] items-start gap-x-2 gap-y-1 sm:flex sm:items-center sm:gap-4 ${outageHp !== null ? "bg-red-900 border-red-500" : "border-gray-700"}`} style={outageHp !== null ? undefined : { backgroundColor: 'var(--color-bg)' }}>
      {/* Left group: identity */}
      <div className="hidden sm:flex items-center gap-2 min-w-0 px-2 sm:px-0">
        <img src="/media/logo-400-transparent.png" alt="Logo" className="hidden sm:block max-h-12 w-auto flex-shrink-0 object-contain sm:mr-2" />
        <DesktopIdentityBlock username={username} rank={rank} isBYOK={isBYOK} isMax={isMax} byokTotalCost={byokTotalCost} onProfileClick={onProfileClick} />
      </div>
      <a
        href="/"
        aria-label="Home"
        data-testid="mobile-header-logo"
        className="row-span-2 row-start-1 col-start-1 flex sm:hidden items-center self-center px-2"
      >
        <span className="relative block h-8 w-[34px] overflow-hidden">
          <img src="/media/logo-400-transparent.png" alt="" aria-hidden="true" className="absolute left-0 top-1/2 h-8 max-w-none -translate-y-1/2" />
        </span>
      </a>
      <MobileIdentityBlock username={username} rank={rank} isBYOK={isBYOK} isMax={isMax} byokTotalCost={byokTotalCost} onProfileClick={onProfileClick} />
      {/* Right group: status (desktop) */}
      <DesktopStatusBlock displayTD={displayTD} activeMultiplier={activeMultiplier} isBYOK={isBYOK} isMax={isMax} byokTotalCost={byokTotalCost} quotaPercent={quotaPercent} remaining={remaining} totalQuota={totalQuota} quotaTooltip={quotaTooltip} onUpgradeClick={onUpgradeClick} />
      {/* Right group: status (mobile) */}
      <div data-testid="mobile-status-block" className="col-start-3 row-start-2 flex min-w-0 self-start sm:hidden items-center justify-end whitespace-nowrap px-2 text-right">
        <span className="whitespace-nowrap text-white font-bold">{Math.floor(displayTD).toLocaleString()} TD{activeMultiplier > 1 && <span className="text-yellow-400"> ({activeMultiplier.toFixed(1)}x)</span>}</span>
      </div>
      {/* Hamburger menu — mobile only */}
      <div ref={menuRef} className="sm:hidden relative flex-shrink-0 col-start-3 row-start-1 self-end justify-self-end">
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
            <div className="px-4 py-2">
              <button onClick={() => { setMenuOpen(false); onSlashMenuClick?.(); }} className="text-xs text-gray-400 hover:text-gray-200 cursor-pointer text-left">Type <span className="text-green-400">/</span> in terminal for commands</button>
              <p className="text-xs text-gray-500 mt-1">{"© 2026 Unchained Development OÜ && git blame --author=\"Rinalds Uzkalns\" | made with "}<a href="https://propr.dev" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">propr.dev</a></p>
            </div>
          </div>
        )}
      </div>
      {!isBYOK && <MobileQuotaLine quotaPercent={quotaPercent} quotaTooltip={quotaTooltip} />}
    </div>
  );
}

export default memo(HeaderBar);

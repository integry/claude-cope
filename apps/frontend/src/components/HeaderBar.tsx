import { memo, useState, useRef, useEffect, useCallback } from "react";
import { useAnimatedCounter } from "../hooks/useAnimatedCounter";
import { FREE_QUOTA_LIMIT, PRO_QUOTA_LIMIT } from "../config";

const MOBILE_MENU_VIEWPORT_INSET = 8;
const MOBILE_MENU_VERTICAL_GAP = 8;

function getMobileMenuViewportPosition(triggerRect: DOMRect, headerRect: DOMRect | null, viewportHeight: number) {
  const top = Math.max(triggerRect.bottom, headerRect?.bottom ?? 0) + MOBILE_MENU_VERTICAL_GAP;
  const maxHeight = Math.max(0, viewportHeight - top - MOBILE_MENU_VIEWPORT_INSET);
  return { top, maxHeight };
}

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

function TechnicalDebtLine({ displayTD, activeMultiplier }: { displayTD: number; activeMultiplier: number }) {
  return (
    <div data-testid="technical-debt-line" className="whitespace-nowrap flex items-center gap-1">
      <span className="text-gray-500 text-xs">Technical Debt:</span>
      <span className="text-white font-bold">{Math.floor(displayTD).toLocaleString()} TD</span>
      {activeMultiplier > 1 && <span className="text-yellow-400"> ({activeMultiplier.toFixed(1)}x)</span>}
    </div>
  );
}

function StatusDetailLine({
  isBYOK,
  byokTotalCost,
  quotaPercent,
  remaining,
  totalQuota,
  quotaTooltip,
  isMax,
  onUpgradeClick,
}: {
  isBYOK: boolean;
  byokTotalCost?: number;
  quotaPercent: number;
  remaining: number;
  totalQuota: number;
  quotaTooltip: string;
  isMax: boolean;
  onUpgradeClick?: () => void;
}) {
  return (
    <div data-testid="status-detail-line" className="whitespace-nowrap flex items-center gap-2 max-w-full">
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
  );
}

function MobileQuotaLine({
  quotaPercent,
  quotaTooltip,
  tipOpen,
  setTipOpen,
}: {
  quotaPercent: number;
  quotaTooltip: string;
  tipOpen: boolean;
  setTipOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}) {
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

function MobileMenuStatusBlock({
  displayTD,
  activeMultiplier,
  isBYOK,
  byokTotalCost,
  quotaPercent,
  remaining,
  totalQuota,
  quotaTooltip,
}: {
  displayTD: number;
  activeMultiplier: number;
  isBYOK: boolean;
  byokTotalCost?: number;
  quotaPercent: number;
  remaining: number;
  totalQuota: number;
  quotaTooltip: string;
}) {
  return (
    <div data-testid="mobile-menu-stat-box" className="flex flex-col gap-2 border border-gray-700 bg-black/20 px-3 py-3">
      <TechnicalDebtLine displayTD={displayTD} activeMultiplier={activeMultiplier} />
      {isBYOK ? (
        <div className="max-w-full">
          <StatusDetailLine
            isBYOK={isBYOK}
            byokTotalCost={byokTotalCost}
            quotaPercent={quotaPercent}
            remaining={remaining}
            totalQuota={totalQuota}
            quotaTooltip={quotaTooltip}
            isMax={false}
          />
        </div>
      ) : (
        <DesktopQuotaBar quotaPercent={quotaPercent} remaining={remaining} totalQuota={totalQuota} quotaTooltip={quotaTooltip} />
      )}
    </div>
  );
}

function MobileMenuLink({
  command,
  description,
  onClick,
}: {
  command: string;
  description: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="font-mono text-gray-200">{command}</span>
      <span className="min-w-0 flex-1 text-right text-xs text-gray-500">{description}</span>
    </>
  );

  if (!onClick) {
    return (
      <span className="flex items-center gap-3 py-1.5">
        {content}
      </span>
    );
  }

  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 py-1.5 text-left hover:text-white">
      {content}
    </button>
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
      <div data-testid="mobile-identity-block" className="col-start-2 col-end-4 row-start-1 flex min-w-0 items-center gap-2 self-end pr-14 sm:hidden">
        <button onClick={onProfileClick} className="min-w-0 flex-1 truncate text-left text-cyan-400 hover:text-white hover:underline cursor-pointer">{username}</button>
        <span className="ml-1 flex flex-shrink-0 items-center gap-2">
          <EntitlementBadges isBYOK={isBYOK} isMax={isMax} byokTotalCost={byokTotalCost} maxBadgeTestId="mobile-max-badge" maxBadgeLabel="[MAX]" />
        </span>
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
      <div data-testid="desktop-technical-debt-line">
        <TechnicalDebtLine displayTD={displayTD} activeMultiplier={activeMultiplier} />
      </div>
      <div data-testid="desktop-status-detail-line">
        <StatusDetailLine
          isBYOK={isBYOK}
          byokTotalCost={byokTotalCost}
          quotaPercent={quotaPercent}
          remaining={remaining}
          totalQuota={totalQuota}
          quotaTooltip={quotaTooltip}
          isMax={isMax}
          onUpgradeClick={onUpgradeClick}
        />
      </div>
    </div>
  );
}

function HeaderBar({ rank, currentTD, quotaPercent, outageHp, activeMultiplier, username, isBYOK, isMax, byokTotalCost, onProfileClick, onHelpClick, onAboutClick, onStoreClick, onLeaderboardClick, onAchievementsClick, onContactClick, onSlashMenuClick, onUpgradeClick, onHomeClick }: { rank: string; currentTD: number; quotaPercent: number; outageHp: number | null; activeMultiplier: number; username: string; isBYOK: boolean; isMax: boolean; byokTotalCost?: number; onProfileClick: () => void; onHelpClick: () => void; onAboutClick: () => void; onStoreClick: () => void; onLeaderboardClick: () => void; onAchievementsClick: () => void; onContactClick: () => void; onSlashMenuClick?: () => void; onUpgradeClick?: () => void; onHomeClick?: () => void }) {
  const displayTD = useAnimatedCounter(currentTD, 2660);
  const [menuOpen, setMenuOpen] = useState(false);
  const [quotaTipOpen, setQuotaTipOpen] = useState(false);
  const headerRootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [mobileMenuPosition, setMobileMenuPosition] = useState(() => ({ top: 0, maxHeight: 0 }));

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

  useEffect(() => {
    if (!menuOpen) return;

    const updateMobileMenuPosition = () => {
      if (!menuButtonRef.current) return;
      setMobileMenuPosition(
        getMobileMenuViewportPosition(
          menuButtonRef.current.getBoundingClientRect(),
          headerRootRef.current?.getBoundingClientRect() ?? null,
          window.innerHeight,
        ),
      );
    };

    updateMobileMenuPosition();
    window.addEventListener("resize", updateMobileMenuPosition);
    window.addEventListener("scroll", updateMobileMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMobileMenuPosition);
      window.removeEventListener("scroll", updateMobileMenuPosition, true);
    };
  }, [menuOpen]);

  const handleHomeClick = useCallback(() => {
    setMenuOpen(false);
    setQuotaTipOpen(false);
    onHomeClick?.();
  }, [onHomeClick]);

  return (
    <div ref={headerRootRef} data-testid="header-bar-root" className={`sticky top-0 z-10 border-b pt-3 pb-2 mb-2 relative grid grid-cols-[auto_minmax(0,1fr)_auto] grid-rows-[auto_auto] items-start gap-x-2 gap-y-1 sm:flex sm:items-center sm:gap-4 ${outageHp !== null ? "bg-red-900 border-red-500" : "border-gray-700"}`} style={outageHp !== null ? undefined : { backgroundColor: 'var(--color-bg)' }}>
      {/* Left group: identity */}
      <div className="hidden sm:flex items-center gap-2 min-w-0 px-2 sm:px-0">
        <button type="button" onClick={handleHomeClick} aria-label="Home" className="hidden sm:block cursor-pointer">
          <img src="/media/logo-400-transparent.png" alt="Logo" className="hidden sm:block max-h-12 w-auto flex-shrink-0 object-contain sm:mr-2" />
        </button>
        <DesktopIdentityBlock username={username} rank={rank} isBYOK={isBYOK} isMax={isMax} byokTotalCost={byokTotalCost} onProfileClick={onProfileClick} />
      </div>
      {menuOpen ? (
        <button
          type="button"
          onClick={handleHomeClick}
          aria-label="Home"
          data-testid="mobile-header-logo-expanded"
          className="col-start-1 col-end-3 row-span-2 row-start-1 flex min-w-0 sm:hidden items-center self-center px-2"
        >
          <img src="/media/logo-400-transparent.png" alt="Logo" className="h-8 w-auto max-w-full object-contain" />
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={handleHomeClick}
            aria-label="Home"
            data-testid="mobile-header-logo"
            className="row-span-2 row-start-1 col-start-1 flex sm:hidden items-center self-center px-2"
          >
            <span className="relative block h-8 w-[34px] overflow-hidden">
              <img src="/media/logo-400-transparent.png" alt="" aria-hidden="true" className="absolute left-0 top-1/2 h-8 max-w-none -translate-y-1/2" />
            </span>
          </button>
          <MobileIdentityBlock username={username} rank={rank} isBYOK={isBYOK} isMax={isMax} byokTotalCost={byokTotalCost} onProfileClick={onProfileClick} />
        </>
      )}
      {/* Right group: status (desktop) */}
      <DesktopStatusBlock displayTD={displayTD} activeMultiplier={activeMultiplier} isBYOK={isBYOK} isMax={isMax} byokTotalCost={byokTotalCost} quotaPercent={quotaPercent} remaining={remaining} totalQuota={totalQuota} quotaTooltip={quotaTooltip} onUpgradeClick={onUpgradeClick} />
      {/* Right group: status (mobile) */}
      {!menuOpen && (
        <div data-testid="mobile-status-block" className="col-start-3 row-start-2 flex min-w-0 self-start sm:hidden items-center justify-end whitespace-nowrap px-2 text-right">
          <span className="whitespace-nowrap text-white font-bold">{Math.floor(displayTD).toLocaleString()} TD{activeMultiplier > 1 && <span className="text-yellow-400"> ({activeMultiplier.toFixed(1)}x)</span>}</span>
        </div>
      )}
      {/* Hamburger menu — mobile only */}
      <div ref={menuRef} data-testid="mobile-menu-anchor" className="sm:hidden flex-shrink-0 col-start-3 row-start-1 self-end justify-self-end">
        <button ref={menuButtonRef} type="button" onClick={() => setMenuOpen((v) => !v)} className="rounded-none px-3 py-1.5 text-gray-400 transition-colors hover:bg-gray-800/70 hover:text-white" aria-label="Menu">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>
      {menuOpen && (
        <div
          data-testid="mobile-menu-panel"
          className="fixed left-2 right-2 z-20 flex min-h-[28rem] flex-col overflow-y-auto border border-gray-700 bg-gray-900 px-4 py-4 text-sm shadow-lg sm:hidden"
          style={{ top: `${mobileMenuPosition.top}px`, maxHeight: `${mobileMenuPosition.maxHeight}px` }}
        >
          <div className="flex flex-col gap-4">
            <MobileMenuStatusBlock
              displayTD={displayTD}
              activeMultiplier={activeMultiplier}
              isBYOK={isBYOK}
              byokTotalCost={byokTotalCost}
              remaining={remaining}
              totalQuota={totalQuota}
              quotaPercent={quotaPercent}
              quotaTooltip={quotaTooltip}
            />
            <div>
              <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-500/80">[ ACTIONS ]</div>
              <div className="flex flex-col">
                <MobileMenuLink command="/store" description="Buy coping mechanisms" onClick={() => { setMenuOpen(false); onStoreClick(); }} />
                <MobileMenuLink command="/upgrade" description="Unlock MAX 429X" onClick={() => { setMenuOpen(false); onUpgradeClick?.(); }} />
                <MobileMenuLink command="/leaderboard" description="The Hall of Blame" onClick={() => { setMenuOpen(false); onLeaderboardClick(); }} />
                <MobileMenuLink command="/achievements" description="Trophies for bad choices" onClick={() => { setMenuOpen(false); onAchievementsClick(); }} />
              </div>
            </div>
            <div>
              <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-500/80">[ SYSTEM ]</div>
              <div className="flex flex-col">
                <MobileMenuLink command="/profile" description="Your miserable stats" onClick={() => { setMenuOpen(false); onProfileClick(); }} />
                <MobileMenuLink command="/help" description="Available commands" onClick={() => { setMenuOpen(false); onHelpClick(); }} />
                <a href="https://github.com/integry/claude-cope" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 py-1.5 hover:text-white">
                  <span className="font-mono text-gray-200">/github</span>
                  <span className="min-w-0 flex-1 text-right text-xs text-gray-500">Source code</span>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-auto border-t border-gray-700 pt-3 text-xs text-gray-500">
            <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono">
              <a href="https://github.com/integry/claude-cope/blob/main/TERMS.md" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">/terms</a>
              <a href="https://github.com/integry/claude-cope/blob/main/PRIVACY.md" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">/privacy</a>
              <button type="button" onClick={() => { setMenuOpen(false); onAboutClick(); }} className="hover:text-gray-300">/about</button>
              <button type="button" onClick={() => { setMenuOpen(false); onContactClick(); }} className="hover:text-gray-300">/contact</button>
            </div>
            <p className="mt-1">© 2026 Unchained Development OÜ</p>
            <p>git blame --author="Rinalds Uzkalns"</p>
            <p>{"made with "}<a href="https://propr.dev" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">propr.dev</a></p>
            <button type="button" onClick={() => { setMenuOpen(false); onSlashMenuClick?.(); }} className="mt-2 text-left hover:text-gray-300">Type <span className="text-green-400">/</span> in terminal for commands</button>
          </div>
        </div>
      )}
      {!isBYOK && <MobileQuotaLine quotaPercent={quotaPercent} quotaTooltip={quotaTooltip} tipOpen={quotaTipOpen} setTipOpen={setQuotaTipOpen} />}
    </div>
  );
}

export default memo(HeaderBar);

import { memo, useState, useRef, useEffect, useCallback } from "react";
import { useAnimatedCounter } from "../hooks/useAnimatedCounter";
import { FREE_QUOTA_LIMIT, PRO_QUOTA_LIMIT } from "../config";

const MOBILE_MENU_VIEWPORT_INSET = 8;
const MOBILE_MENU_VERTICAL_GAP = 8;

type BillingProps = { isBYOK: boolean; isMax: boolean; byokTotalCost?: number };
type QuotaProps = { quotaPercent: number; remaining: number; totalQuota: number; quotaTooltip: string };
type TdProps = { displayTD: number; activeMultiplier: number };
type IdentityProps = BillingProps & { username: string; rank: string; onProfileClick: () => void };
type StatusProps = BillingProps & QuotaProps & TdProps & { onUpgradeClick?: () => void };
type MobileQuotaLineProps = { quotaPercent: number; quotaTooltip: string; tipOpen: boolean; setTipOpen: (open: boolean | ((prev: boolean) => boolean)) => void };
type MobileMenuProps = Omit<StatusProps, "onUpgradeClick" | "isMax"> & {
  mobileMenuPosition: { top: number; maxHeight: number };
  closeMenu: () => void;
  onStoreClick: () => void;
  onLeaderboardClick: () => void;
  onAchievementsClick: () => void;
  onProfileClick: () => void;
  onHelpClick: () => void;
  onAboutClick: () => void;
  onContactClick: () => void;
  onSlashMenuClick?: () => void;
  onUpgradeClick?: () => void;
};

function getMobileMenuViewportPosition(triggerRect: DOMRect, headerRect: DOMRect | null, viewportHeight: number) {
  const top = Math.max(triggerRect.bottom, headerRect?.bottom ?? 0) + MOBILE_MENU_VERTICAL_GAP;
  return { top, maxHeight: Math.max(0, viewportHeight - top - MOBILE_MENU_VIEWPORT_INSET) };
}

const getMobileRankLabel = (rank: string) => rank.replace(/^Junior\b/, "Jr.");
const getQuotaTextColor = (percent: number) => percent > 50 ? "text-green-400" : percent > 20 ? "text-yellow-400" : "text-red-400";
const getQuotaBgColor = (percent: number) => percent > 50 ? "bg-green-400" : percent > 20 ? "bg-yellow-400" : "bg-red-400";

function formatByokCost(cost: number): string {
  if (cost < 0.01) return cost.toFixed(6);
  if (cost < 0.1) return cost.toFixed(4);
  return cost.toFixed(2);
}

const getByokBadgeText = (byokTotalCost?: number) => `[BYOK${byokTotalCost != null && byokTotalCost > 0 ? ` $${formatByokCost(byokTotalCost)}` : ""}]`;
const getByokStatusText = (byokTotalCost?: number) => byokTotalCost != null && byokTotalCost > 0 ? `External Billing Active: $${formatByokCost(byokTotalCost)}` : "External Billing Active: BYOK";

function EntitlementBadges({ isBYOK, isMax, byokTotalCost, maxBadgeTestId, maxBadgeLabel = "[MAX 429X]" }: BillingProps & { maxBadgeTestId?: string; maxBadgeLabel?: string }) {
  return <>
    {isBYOK && <span className="text-[10px] font-bold text-yellow-400 whitespace-nowrap">{getByokBadgeText(byokTotalCost)}</span>}
    {isMax && <span data-testid={maxBadgeTestId} className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: "#ff00ff" }}>{maxBadgeLabel}</span>}
  </>;
}

function DesktopQuotaBar({ quotaPercent, remaining, totalQuota, quotaTooltip }: QuotaProps) {
  const totalBlocks = 20;
  const filledBlocks = Math.round((quotaPercent / 100) * totalBlocks);
  return <div title={quotaTooltip} className={`flex-shrink-0 cursor-default whitespace-nowrap text-xs font-mono ${getQuotaTextColor(quotaPercent)}`}>{`[API Quota: ${"█".repeat(filledBlocks)}${"░".repeat(totalBlocks - filledBlocks)} ${remaining}/${totalQuota}]`}</div>;
}

function TechnicalDebtLine({ displayTD, activeMultiplier }: TdProps) {
  return <div data-testid="technical-debt-line" className="flex items-center gap-1 whitespace-nowrap"><span className="text-xs text-gray-500">Technical Debt:</span><span className="font-bold text-white">{Math.floor(displayTD).toLocaleString()} TD</span>{activeMultiplier > 1 && <span className="text-yellow-400"> ({activeMultiplier.toFixed(1)}x)</span>}</div>;
}

function StatusDetailLine({ isBYOK, byokTotalCost, quotaPercent, remaining, totalQuota, quotaTooltip, isMax, onUpgradeClick }: BillingProps & QuotaProps & { onUpgradeClick?: () => void }) {
  return (
    <div data-testid="status-detail-line" className="flex max-w-full items-center gap-2 whitespace-nowrap">
      {isBYOK ? <span className="truncate text-xs text-yellow-400" title={getByokStatusText(byokTotalCost)}>{getByokStatusText(byokTotalCost)}</span> : <>
        <DesktopQuotaBar quotaPercent={quotaPercent} remaining={remaining} totalQuota={totalQuota} quotaTooltip={quotaTooltip} />
        {!isMax && onUpgradeClick && <button onClick={onUpgradeClick} className="cursor-pointer whitespace-nowrap rounded border border-yellow-500/40 bg-yellow-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-yellow-400 hover:bg-yellow-500/30">Upgrade to Max 429X</button>}
      </>}
    </div>
  );
}

function MobileQuotaLine({ quotaPercent, quotaTooltip, tipOpen, setTipOpen }: MobileQuotaLineProps) {
  return <div className="absolute bottom-0 left-0 right-0 h-[2px] cursor-pointer bg-gray-800 sm:hidden" onClick={() => setTipOpen((v) => !v)}><div className={`h-full ${getQuotaBgColor(quotaPercent)} transition-all duration-500`} style={{ width: `${quotaPercent}%` }} />{tipOpen && <div className="absolute bottom-full left-1/2 z-30 mb-1 -translate-x-1/2 whitespace-nowrap rounded border border-gray-700 bg-gray-900 px-2 py-1 text-[10px] font-mono text-gray-300 shadow-lg">{quotaTooltip}</div>}</div>;
}

function MobileMenuStatusBlock({ displayTD, activeMultiplier, isBYOK, byokTotalCost, quotaPercent, remaining, totalQuota, quotaTooltip }: Omit<StatusProps, "isMax" | "onUpgradeClick">) {
  return (
    <div data-testid="mobile-menu-stat-box" className="flex flex-col gap-2 border border-gray-700 bg-black/20 px-3 py-3">
      <TechnicalDebtLine displayTD={displayTD} activeMultiplier={activeMultiplier} />
      {isBYOK ? <div className="max-w-full"><StatusDetailLine isBYOK={isBYOK} isMax={false} byokTotalCost={byokTotalCost} quotaPercent={quotaPercent} remaining={remaining} totalQuota={totalQuota} quotaTooltip={quotaTooltip} /></div> : <DesktopQuotaBar quotaPercent={quotaPercent} remaining={remaining} totalQuota={totalQuota} quotaTooltip={quotaTooltip} />}
    </div>
  );
}

function MobileMenuLink({ command, description, onClick }: { command: string; description: string; onClick?: () => void }) {
  const content = <><span className="font-mono text-gray-200">{command}</span><span className="min-w-0 flex-1 text-right text-xs text-gray-500">{description}</span></>;
  return onClick ? <button type="button" onClick={onClick} className="flex w-full items-center gap-3 py-1.5 text-left hover:text-white">{content}</button> : <span className="flex items-center gap-3 py-1.5">{content}</span>;
}

function MobileMenuPanel({
  displayTD, activeMultiplier, isBYOK, byokTotalCost, quotaPercent, remaining, totalQuota, quotaTooltip, mobileMenuPosition, closeMenu,
  onStoreClick, onLeaderboardClick, onAchievementsClick, onProfileClick, onHelpClick, onAboutClick, onContactClick, onSlashMenuClick, onUpgradeClick,
}: MobileMenuProps) {
  const closeAnd = (callback?: () => void) => () => { closeMenu(); callback?.(); };
  const actionLinks = [
    { command: "/store", description: "Buy coping mechanisms", onClick: closeAnd(onStoreClick) },
    { command: "/upgrade", description: "Unlock MAX 429X", onClick: closeAnd(onUpgradeClick) },
    { command: "/leaderboard", description: "The Hall of Blame", onClick: closeAnd(onLeaderboardClick) },
    { command: "/achievements", description: "Trophies for bad choices", onClick: closeAnd(onAchievementsClick) },
  ];
  const systemLinks = [
    { command: "/profile", description: "Your miserable stats", onClick: closeAnd(onProfileClick) },
    { command: "/help", description: "Available commands", onClick: closeAnd(onHelpClick) },
  ];

  return (
    <div data-testid="mobile-menu-panel" className="fixed left-2 right-2 z-20 flex min-h-[28rem] flex-col overflow-y-auto border border-gray-700 bg-gray-900 px-4 py-4 text-sm shadow-lg sm:hidden" style={{ top: `${mobileMenuPosition.top}px`, maxHeight: `${mobileMenuPosition.maxHeight}px` }}>
      <div className="flex flex-col gap-4">
        <MobileMenuStatusBlock displayTD={displayTD} activeMultiplier={activeMultiplier} isBYOK={isBYOK} byokTotalCost={byokTotalCost} remaining={remaining} totalQuota={totalQuota} quotaPercent={quotaPercent} quotaTooltip={quotaTooltip} />
        <div><div className="mb-1 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-500/80">[ ACTIONS ]</div><div className="flex flex-col">{actionLinks.map((link) => <MobileMenuLink key={link.command} {...link} />)}</div></div>
        <div>
          <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-500/80">[ SYSTEM ]</div>
          <div className="flex flex-col">
            {systemLinks.map((link) => <MobileMenuLink key={link.command} {...link} />)}
            <a href="https://github.com/integry/claude-cope" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 py-1.5 hover:text-white"><span className="font-mono text-gray-200">/github</span><span className="min-w-0 flex-1 text-right text-xs text-gray-500">Source code</span></a>
          </div>
        </div>
      </div>
      <div className="mt-auto border-t border-gray-700 pt-3 text-xs text-gray-500">
        <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono">
          <a href="https://github.com/integry/claude-cope/blob/main/TERMS.md" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">/terms</a>
          <a href="https://github.com/integry/claude-cope/blob/main/PRIVACY.md" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">/privacy</a>
          <button type="button" onClick={closeAnd(onAboutClick)} className="hover:text-gray-300">/about</button>
          <button type="button" onClick={closeAnd(onContactClick)} className="hover:text-gray-300">/contact</button>
        </div>
        <p className="mt-1">© 2026 Unchained Development OÜ</p>
        <p>git blame --author="Rinalds Uzkalns"</p>
        <p>{"made with "}<a href="https://propr.dev" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">propr.dev</a></p>
        <button type="button" onClick={closeAnd(onSlashMenuClick)} className="mt-2 text-left hover:text-gray-300">Type <span className="text-green-400">/</span> in terminal for commands</button>
      </div>
    </div>
  );
}

function DesktopIdentityBlock({ username, rank, isBYOK, isMax, byokTotalCost, onProfileClick }: IdentityProps) {
  return <div data-testid="desktop-identity-block" className="hidden min-w-0 flex-col justify-center gap-1 leading-snug sm:flex"><div className="flex min-w-0 items-center gap-2"><button onClick={onProfileClick} className="cursor-pointer truncate text-cyan-400 hover:text-white hover:underline">{username}</button><EntitlementBadges isBYOK={isBYOK} isMax={isMax} byokTotalCost={byokTotalCost} maxBadgeTestId="desktop-max-badge" /></div><div data-testid="desktop-rank-line" title={rank} className="max-w-full truncate text-xs text-gray-400">[{rank}]</div></div>;
}

function MobileIdentityBlock({ username, rank, isBYOK, isMax, byokTotalCost, onProfileClick }: IdentityProps) {
  return <>
    <div data-testid="mobile-identity-block" className="col-start-2 col-end-4 row-start-1 flex min-w-0 items-center gap-2 self-end pr-14 sm:hidden"><button onClick={onProfileClick} className="min-w-0 flex-1 truncate text-left text-cyan-400 hover:text-white hover:underline cursor-pointer">{username}</button><span className="ml-1 flex flex-shrink-0 items-center gap-2"><EntitlementBadges isBYOK={isBYOK} isMax={isMax} byokTotalCost={byokTotalCost} maxBadgeTestId="mobile-max-badge" maxBadgeLabel="[MAX]" /></span></div>
    <div data-testid="mobile-rank-line" title={rank} className="col-start-2 row-start-2 min-w-0 self-start whitespace-nowrap text-[11px] leading-none text-gray-400 sm:hidden sm:text-xs">[{getMobileRankLabel(rank)}]</div>
  </>;
}

function DesktopStatusBlock({ displayTD, activeMultiplier, isBYOK, isMax, byokTotalCost, quotaPercent, remaining, totalQuota, quotaTooltip, onUpgradeClick }: StatusProps) {
  return <div data-testid="desktop-status-block" className="ml-auto hidden flex-shrink-0 flex-col items-end justify-center gap-1 px-2 leading-snug sm:flex sm:px-0"><div data-testid="desktop-technical-debt-line"><TechnicalDebtLine displayTD={displayTD} activeMultiplier={activeMultiplier} /></div><div data-testid="desktop-status-detail-line"><StatusDetailLine isBYOK={isBYOK} isMax={isMax} byokTotalCost={byokTotalCost} quotaPercent={quotaPercent} remaining={remaining} totalQuota={totalQuota} quotaTooltip={quotaTooltip} onUpgradeClick={onUpgradeClick} /></div></div>;
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
  const quotaTooltip = `${totalQuota - remaining}/${totalQuota} requests used · ${remaining} remaining`;

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const updateMobileMenuPosition = () => {
      if (!menuButtonRef.current) return;
      setMobileMenuPosition(getMobileMenuViewportPosition(menuButtonRef.current.getBoundingClientRect(), headerRootRef.current?.getBoundingClientRect() ?? null, window.innerHeight));
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
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <div ref={headerRootRef} data-testid="header-bar-root" className={`relative sticky top-0 z-10 mb-2 grid grid-cols-[auto_minmax(0,1fr)_auto] grid-rows-[auto_auto] items-start gap-x-2 gap-y-1 border-b pt-3 pb-2 sm:flex sm:items-center sm:gap-4 ${outageHp !== null ? "border-red-500 bg-red-900" : "border-gray-700"}`} style={outageHp !== null ? undefined : { backgroundColor: "var(--color-bg)" }}>
      <div className="hidden min-w-0 items-center gap-2 px-2 sm:flex sm:px-0">
        <button type="button" onClick={handleHomeClick} aria-label="Home" className="hidden cursor-pointer sm:block"><img src="/media/logo-400-transparent.png" alt="Logo" className="hidden max-h-12 w-auto flex-shrink-0 object-contain sm:mr-2 sm:block" /></button>
        <DesktopIdentityBlock username={username} rank={rank} isBYOK={isBYOK} isMax={isMax} byokTotalCost={byokTotalCost} onProfileClick={onProfileClick} />
      </div>
      {menuOpen ? <button type="button" onClick={handleHomeClick} aria-label="Home" data-testid="mobile-header-logo-expanded" className="col-start-1 col-end-3 row-span-2 row-start-1 flex min-w-0 items-center self-center px-2 sm:hidden"><img src="/media/logo-400-transparent.png" alt="Logo" className="h-8 w-auto max-w-full object-contain" /></button> : <>
        <button type="button" onClick={handleHomeClick} aria-label="Home" data-testid="mobile-header-logo" className="col-start-1 row-span-2 row-start-1 flex items-center self-center px-2 sm:hidden"><span className="relative block h-8 w-[34px] overflow-hidden"><img src="/media/logo-400-transparent.png" alt="" aria-hidden="true" className="absolute left-0 top-1/2 h-8 max-w-none -translate-y-1/2" /></span></button>
        <MobileIdentityBlock username={username} rank={rank} isBYOK={isBYOK} isMax={isMax} byokTotalCost={byokTotalCost} onProfileClick={onProfileClick} />
      </>}
      <DesktopStatusBlock displayTD={displayTD} activeMultiplier={activeMultiplier} isBYOK={isBYOK} isMax={isMax} byokTotalCost={byokTotalCost} quotaPercent={quotaPercent} remaining={remaining} totalQuota={totalQuota} quotaTooltip={quotaTooltip} onUpgradeClick={onUpgradeClick} />
      {!menuOpen && <div data-testid="mobile-status-block" className="col-start-3 row-start-2 flex min-w-0 items-center justify-end self-start whitespace-nowrap px-2 text-right sm:hidden"><span className="whitespace-nowrap font-bold text-white">{Math.floor(displayTD).toLocaleString()} TD{activeMultiplier > 1 && <span className="text-yellow-400"> ({activeMultiplier.toFixed(1)}x)</span>}</span></div>}
      <div ref={menuRef} data-testid="mobile-menu-anchor" className="col-start-3 row-start-1 flex-shrink-0 self-end justify-self-end sm:hidden">
        <button ref={menuButtonRef} type="button" onClick={() => setMenuOpen((v) => !v)} className="rounded-none px-3 py-1.5 text-gray-400 transition-colors hover:bg-gray-800/70 hover:text-white" aria-label="Menu">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>{menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}</svg>
        </button>
      </div>
      {menuOpen && <MobileMenuPanel displayTD={displayTD} activeMultiplier={activeMultiplier} isBYOK={isBYOK} byokTotalCost={byokTotalCost} quotaPercent={quotaPercent} remaining={remaining} totalQuota={totalQuota} quotaTooltip={quotaTooltip} mobileMenuPosition={mobileMenuPosition} closeMenu={closeMenu} onStoreClick={onStoreClick} onLeaderboardClick={onLeaderboardClick} onAchievementsClick={onAchievementsClick} onProfileClick={onProfileClick} onHelpClick={onHelpClick} onAboutClick={onAboutClick} onContactClick={onContactClick} onSlashMenuClick={onSlashMenuClick} onUpgradeClick={onUpgradeClick} />}
      {!isBYOK && <MobileQuotaLine quotaPercent={quotaPercent} quotaTooltip={quotaTooltip} tipOpen={quotaTipOpen} setTipOpen={setQuotaTipOpen} />}
    </div>
  );
}

export default memo(HeaderBar);

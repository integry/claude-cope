type MobileMenuProps = {
  displayTD: number;
  activeMultiplier: number;
  isBYOK: boolean;
  isMax: boolean;
  byokTotalCost?: number;
  quotaPercent: number;
  remaining: number;
  totalQuota: number;
  quotaTooltip: string;
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

function formatByokCost(cost: number): string {
  if (cost < 0.01) return cost.toFixed(6);
  if (cost < 0.1) return cost.toFixed(4);
  return cost.toFixed(2);
}

function getByokStatusText(byokTotalCost?: number) {
  return byokTotalCost != null && byokTotalCost > 0
    ? `External Billing Active: $${formatByokCost(byokTotalCost)}`
    : "External Billing Active: BYOK";
}

function getQuotaTextColor(percent: number) {
  return percent > 50 ? "text-green-400" : percent > 20 ? "text-yellow-400" : "text-red-400";
}

function DesktopQuotaBar({
  quotaPercent,
  remaining,
  totalQuota,
  quotaTooltip,
}: Pick<MobileMenuProps, "quotaPercent" | "remaining" | "totalQuota" | "quotaTooltip">) {
  const totalBlocks = 20;
  const filledBlocks = Math.round((quotaPercent / 100) * totalBlocks);
  return (
    <div
      title={quotaTooltip}
      className={`flex-shrink-0 cursor-default whitespace-nowrap text-xs font-mono ${getQuotaTextColor(quotaPercent)}`}
    >
      {`[API Quota: ${"█".repeat(filledBlocks)}${"░".repeat(totalBlocks - filledBlocks)} ${remaining}/${totalQuota}]`}
    </div>
  );
}

function TechnicalDebtLine({ displayTD, activeMultiplier }: Pick<MobileMenuProps, "displayTD" | "activeMultiplier">) {
  return (
    <div data-testid="technical-debt-line" className="flex items-center gap-1 whitespace-nowrap">
      <span className="text-xs text-gray-500">Technical Debt:</span>
      <span className="font-bold text-white">{Math.floor(displayTD).toLocaleString()} TD</span>
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
}: Pick<MobileMenuProps, "isBYOK" | "byokTotalCost" | "quotaPercent" | "remaining" | "totalQuota" | "quotaTooltip">) {
  return (
    <div className="flex max-w-full items-center gap-2 whitespace-nowrap">
      {isBYOK
        ? <span className="truncate text-xs text-yellow-400" title={getByokStatusText(byokTotalCost)}>{getByokStatusText(byokTotalCost)}</span>
        : <DesktopQuotaBar quotaPercent={quotaPercent} remaining={remaining} totalQuota={totalQuota} quotaTooltip={quotaTooltip} />}
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
}: Pick<MobileMenuProps, "displayTD" | "activeMultiplier" | "isBYOK" | "byokTotalCost" | "quotaPercent" | "remaining" | "totalQuota" | "quotaTooltip">) {
  return (
    <div data-testid="mobile-menu-stat-box" className="flex flex-col gap-2 py-1">
      <TechnicalDebtLine displayTD={displayTD} activeMultiplier={activeMultiplier} />
      {isBYOK
        ? <div className="max-w-full"><StatusDetailLine isBYOK={isBYOK} byokTotalCost={byokTotalCost} quotaPercent={quotaPercent} remaining={remaining} totalQuota={totalQuota} quotaTooltip={quotaTooltip} /></div>
        : <DesktopQuotaBar quotaPercent={quotaPercent} remaining={remaining} totalQuota={totalQuota} quotaTooltip={quotaTooltip} />}
    </div>
  );
}

function MobileMenuLink({ command, description, onClick }: { command: string; description: string; onClick?: () => void }) {
  const content = (
    <>
      <span className="w-[120px] font-mono text-gray-200">{command}</span>
      <span className="min-w-0 text-left text-xs text-gray-500">{description}</span>
    </>
  );

  return onClick
    ? <button type="button" onClick={onClick} className="grid w-full grid-cols-[120px_minmax(0,1fr)] items-start gap-x-3 py-1.5 text-left hover:text-white">{content}</button>
    : <span className="grid grid-cols-[120px_minmax(0,1fr)] items-start gap-x-3 py-1.5">{content}</span>;
}

export default function HeaderBarMobileMenu({
  displayTD,
  activeMultiplier,
  isBYOK,
  isMax,
  byokTotalCost,
  quotaPercent,
  remaining,
  totalQuota,
  quotaTooltip,
  mobileMenuPosition,
  closeMenu,
  onStoreClick,
  onLeaderboardClick,
  onAchievementsClick,
  onProfileClick,
  onHelpClick,
  onAboutClick,
  onContactClick,
  onSlashMenuClick,
  onUpgradeClick,
}: MobileMenuProps) {
  const closeAnd = (callback?: () => void) => () => {
    closeMenu();
    callback?.();
  };
  const actionLinks = [
    { command: "/store", description: "Buy coping mechanisms", onClick: closeAnd(onStoreClick) },
    { command: "/leaderboard", description: "The Hall of Blame", onClick: closeAnd(onLeaderboardClick) },
    { command: "/achievements", description: "Trophies for bad choices", onClick: closeAnd(onAchievementsClick) },
  ];

  if (!isMax && onUpgradeClick) {
    actionLinks.splice(1, 0, { command: "/upgrade", description: "Unlock MAX 429X", onClick: closeAnd(onUpgradeClick) });
  }

  const systemLinks = [
    { command: "/profile", description: "Your miserable stats", onClick: closeAnd(onProfileClick) },
    { command: "/help", description: "Available commands", onClick: closeAnd(onHelpClick) },
  ];

  return (
    <div
      id="mobile-menu-panel"
      data-testid="mobile-menu-panel"
      role="dialog"
      aria-modal="true"
      className="fixed left-2 right-2 z-40 flex min-h-[28rem] flex-col overflow-y-auto border border-gray-700 bg-gray-900 px-4 py-4 text-sm shadow-[0px_20px_25px_10px_rgba(0,0,0,0.7)] sm:hidden"
      style={{ top: `${mobileMenuPosition.top}px`, maxHeight: `${mobileMenuPosition.maxHeight}px` }}
    >
      <div className="flex flex-col gap-4">
        <div className="border-b border-gray-700 pb-4">
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
        </div>
        <div>
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-500/80">[ ACTIONS ]</div>
          <div className="flex flex-col">{actionLinks.map((link) => <MobileMenuLink key={link.command} {...link} />)}</div>
        </div>
        <div>
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-500/80">[ SYSTEM ]</div>
          <div className="flex flex-col">
            {systemLinks.map((link) => <MobileMenuLink key={link.command} {...link} />)}
            <a
              href="https://github.com/integry/claude-cope"
              target="_blank"
              rel="noopener noreferrer"
              className="grid grid-cols-[120px_minmax(0,1fr)] items-start gap-x-3 py-1.5 hover:text-white"
            >
              <span className="w-[120px] font-mono text-gray-200">/github</span>
              <span className="min-w-0 text-left text-xs text-gray-500">Source code</span>
            </a>
          </div>
        </div>
      </div>
      <div className="mt-auto border-t border-gray-700 pt-3 text-xs text-gray-500">
        <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1 font-mono">
          <a href="https://github.com/integry/claude-cope/blob/main/TERMS.md" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">/terms</a>
          <a href="https://github.com/integry/claude-cope/blob/main/PRIVACY.md" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">/privacy</a>
          <button type="button" onClick={closeAnd(onAboutClick)} className="hover:text-gray-300">/about</button>
          <button type="button" onClick={closeAnd(onContactClick)} className="hover:text-gray-300">/contact</button>
        </div>
        <div className="mb-3 font-mono leading-[1.15]">
          <p>© 2006 Rinalds Uzkalns</p>
          <p>{"made with "}<a href="https://propr.dev" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">ProPR</a></p>
        </div>
        <div className="flex justify-center">
          <button type="button" onClick={closeAnd(onSlashMenuClick)} className="font-mono text-center hover:text-gray-300">
            Type <span className="px-1 text-green-400">[ / ]</span> in terminal for commands
          </button>
        </div>
      </div>
    </div>
  );
}

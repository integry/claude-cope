import {
  BACKLOG_CATEGORY_UPGRADE_GROUPS,
  PREMIUM_BACKLOG_CATEGORY_COUNT,
} from "@claude-cope/shared/backlogTiers";
import {
  UPGRADE_CHECKOUT_SINGLE,
  UPGRADE_CHECKOUT_MULTI,
  UPGRADE_PRICE_SINGLE,
  UPGRADE_PRICE_MULTI,
  PRO_QUOTA_LIMIT,
} from "../config";
import DesktopLayout from "./UpgradeDesktopLayout";
import UpgradeMobileLayout from "./UpgradeMobileLayout";
import {
  CLOSE_EFFECT_STYLES,
  DEFAULT_CLOSE_EFFECT,
  getCloseEffectPresentation,
  type UpgradeNagCloseEffect,
} from "./upgradeOverlayEffects";
import { getQuotaStatus } from "./upgradeQuotaStatus";

/* ── helpers ─────────────────────────────────────────────────── */

const B = "#ff5555"; // border (red)
const Y = "#ffff55"; // yellow headings
const W = "#c9d1d9"; // soft off-white body text
const BW = "#ffffff"; // bright white (ANSI bold)
const G = "#4ade80"; // green buttons
const DIM = "#aaaaaa"; // dim footer

const MONO_FONT = "'Fira Code', 'Cascadia Code', 'Consolas', monospace";
export { UPGRADE_NAG_CLOSE_EFFECTS } from "./upgradeOverlayEffects";
export type { UpgradeNagCloseEffect } from "./upgradeOverlayEffects";

/* ── component ───────────────────────────────────────────────── */

type UpgradeOverlayProps = {
  quotaPercent: number;
  totalQuota: number;
  isBYOK: boolean;
  onDismiss: () => void;
  dismissMode?: "manual" | "nag";
  dismissPhase?: "idle" | "closing";
  dismissEffect?: UpgradeNagCloseEffect;
};

const PREMIUM_GROUP_SUMMARIES: Record<string, string> = {
  "industry-verticals": "Fintech, Edtech, Govtech, Healthtech...",
  "deep-infrastructure": "Migrations, IAM, K8s, Telemetry...",
  "dark-corporate-arts": "Compliance rites, PMO, sabotage...",
  "marketing-growth-sludge": "SEO spam, Ad-tech, funnel analytics...",
  "emerging-hype": "AI agents, crypto, metaverse delusion...",
};

const PREMIUM_GROUP_DISPLAY_TITLES: Record<string, string> = {
  "marketing-growth-sludge": "Growth Sludge",
};

function UpgradeOverlay({
  quotaPercent,
  totalQuota,
  isBYOK,
  onDismiss,
  dismissMode = "manual",
  dismissPhase = "idle",
  dismissEffect = DEFAULT_CLOSE_EFFECT,
}: UpgradeOverlayProps) {
  const singleAvailable = !!UPGRADE_CHECKOUT_SINGLE;
  const multiAvailable = !!UPGRADE_CHECKOUT_MULTI;

  const singleLabel = `[ AUTHORIZE EXTRACTION - ${UPGRADE_PRICE_SINGLE} ]`;
  const multiLabel = `[ EXPENSE TO EMPLOYER - ${UPGRADE_PRICE_MULTI} ]`;
  const multiOptionHeading = `[OPTION 2: EXECUTIVE SUPPORTER - ${UPGRADE_PRICE_MULTI}]`;
  const multiOptionDescription = "Includes 5 team keys, plus personal vanity upgrades: buy a fake promotion on the leaderboard and unlock premium terminal themes.";
  const mobileSingleLabel = `[ EXTRACT FUNDS - ${UPGRADE_PRICE_SINGLE} ]`;
  const mobileMultiLabel = multiLabel;

  const currentCredits = Math.round((quotaPercent / 100) * totalQuota);
  const quotaLine = isBYOK
    ? "EXTERNAL BILLING ACTIVE. Status: BYOK bypass engaged."
    : `CURRENT QUOTA: ${currentCredits} Credits. Status: ${getQuotaStatus(currentCredits)}.`;
  const closeEffectPresentation = getCloseEffectPresentation(dismissEffect);
  const premiumGroups = BACKLOG_CATEGORY_UPGRADE_GROUPS.map((group) => ({
    id: group.id,
    title: PREMIUM_GROUP_DISPLAY_TITLES[group.id] ?? group.title,
    summary: PREMIUM_GROUP_SUMMARIES[group.id]
      ?? `${group.categories.slice(0, 3).map((entry) => entry.label).join(", ")}...`,
  }));

  return (
    <>
      <style>{CLOSE_EFFECT_STYLES}</style>
      {/* Desktop: visible above the shared mobile max-width breakpoint */}
      <DesktopLayout
        singleLabel={singleLabel}
        multiLabel={multiLabel}
        multiOptionHeading={multiOptionHeading}
        multiOptionDescription={multiOptionDescription}
        singleAvailable={singleAvailable}
        multiAvailable={multiAvailable}
        quotaLine={quotaLine}
        dismissMode={dismissMode}
        dismissPhase={dismissPhase}
        dismissEffect={dismissEffect}
        closeEffectPresentation={closeEffectPresentation}
        premiumCategoryCount={PREMIUM_BACKLOG_CATEGORY_COUNT}
        premiumGroups={premiumGroups}
        onDismiss={onDismiss}
      />
      {/* Mobile: visible up to the shared max-width breakpoint */}
      <UpgradeMobileLayout
        singleLabel={mobileSingleLabel}
        multiLabel={mobileMultiLabel}
        multiOptionHeading={multiOptionHeading}
        multiOptionDescription={multiOptionDescription}
        singleAvailable={singleAvailable}
        multiAvailable={multiAvailable}
        quotaLine={quotaLine}
        onDismiss={onDismiss}
        dismissMode={dismissMode}
        dismissPhase={dismissPhase}
        dismissEffect={dismissEffect}
        closeEffectPresentation={closeEffectPresentation}
        premiumCategoryCount={PREMIUM_BACKLOG_CATEGORY_COUNT}
        premiumGroups={premiumGroups}
      />
    </>
  );
}

export default UpgradeOverlay;

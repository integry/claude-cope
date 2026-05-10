import {
  BACKLOG_CATEGORY_TIERS,
  BACKLOG_CATEGORY_UPGRADE_GROUPS,
  FREE_BACKLOG_CATEGORY_COUNT,
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
import type { LayoutProps } from "./UpgradeDesktopLayout";
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

const FREE_CATEGORY_PREVIEW_COUNT = 5;
const PREMIUM_GROUP_PREVIEW_COUNT = 4;

function formatCategoryExample(prefix: string, label: string): string {
  return `${prefix} ${label}`;
}

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
  const multiLabel = `[ EXTRACT TEAM FUNDS - ${UPGRADE_PRICE_MULTI} ]`;

  const currentCredits = Math.round((quotaPercent / 100) * totalQuota);
  const quotaLine = isBYOK
    ? "EXTERNAL BILLING ACTIVE. Status: BYOK bypass engaged."
    : `CURRENT QUOTA: ${currentCredits} Credits. Status: ${getQuotaStatus(currentCredits)}.`;
  const closeEffectPresentation = getCloseEffectPresentation(dismissEffect);
  const freeCategories = BACKLOG_CATEGORY_TIERS.filter((entry) => entry.tier === "free");
  const freeCategoryExamples = freeCategories
    .slice(0, FREE_CATEGORY_PREVIEW_COUNT)
    .map((entry) => formatCategoryExample(entry.prefix, entry.label));
  const premiumGroups = BACKLOG_CATEGORY_UPGRADE_GROUPS.map((group) => {
    const examples = group.categories
      .slice(0, PREMIUM_GROUP_PREVIEW_COUNT)
      .map((entry) => formatCategoryExample(entry.prefix, entry.label));

    return {
      id: group.id,
      title: group.title,
      description: group.description,
      total: group.categories.length,
      examples,
      remainder: Math.max(0, group.categories.length - examples.length),
    };
  });

  return (
    <>
      <style>{CLOSE_EFFECT_STYLES}</style>
      {/* Desktop: visible above the shared mobile max-width breakpoint */}
      <DesktopLayout
        singleLabel={singleLabel}
        multiLabel={multiLabel}
        singleAvailable={singleAvailable}
        multiAvailable={multiAvailable}
        quotaLine={quotaLine}
        dismissMode={dismissMode}
        dismissPhase={dismissPhase}
        dismissEffect={dismissEffect}
        closeEffectPresentation={closeEffectPresentation}
        freeCategoryCount={FREE_BACKLOG_CATEGORY_COUNT}
        freeCategoryExamples={freeCategoryExamples}
        freeCategoryRemainder={Math.max(0, FREE_BACKLOG_CATEGORY_COUNT - freeCategoryExamples.length)}
        premiumCategoryCount={PREMIUM_BACKLOG_CATEGORY_COUNT}
        premiumGroups={premiumGroups}
        onDismiss={onDismiss}
      />
      {/* Mobile: visible up to the shared max-width breakpoint */}
      <MobileLayout
        singleLabel={singleLabel}
        multiLabel={multiLabel}
        singleAvailable={singleAvailable}
        multiAvailable={multiAvailable}
        quotaLine={quotaLine}
        onDismiss={onDismiss}
        dismissMode={dismissMode}
        dismissPhase={dismissPhase}
        dismissEffect={dismissEffect}
        closeEffectPresentation={closeEffectPresentation}
        freeCategoryCount={FREE_BACKLOG_CATEGORY_COUNT}
        freeCategoryExamples={freeCategoryExamples}
        freeCategoryRemainder={Math.max(0, FREE_BACKLOG_CATEGORY_COUNT - freeCategoryExamples.length)}
        premiumCategoryCount={PREMIUM_BACKLOG_CATEGORY_COUNT}
        premiumGroups={premiumGroups}
      />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   MOBILE LAYOUT — div-based, CSS borders, text wraps naturally
   ══════════════════════════════════════════════════════════════ */

function MobileLayout({
  singleLabel,
  multiLabel,
  singleAvailable,
  multiAvailable,
  quotaLine,
  onDismiss,
  dismissMode = "manual",
  dismissPhase = "idle",
  dismissEffect = DEFAULT_CLOSE_EFFECT,
  closeEffectPresentation = getCloseEffectPresentation(DEFAULT_CLOSE_EFFECT),
  freeCategoryCount,
  freeCategoryExamples,
  freeCategoryRemainder,
  premiumCategoryCount,
  premiumGroups,
}: LayoutProps & { onDismiss: () => void }) {
  const sectionStyle = { padding: "8px 12px" } as const;
  const hrStyle = {
    border: "none",
    borderTop: `1px solid ${B}`,
    margin: 0,
  } as const;

  // Links open in same tab so the app receives checkout_id on return navigation.
  const mobileButton = (
    label: string,
    url: string,
    available: boolean,
    primary: boolean,
  ) => {
    if (!available) {
      return (
        <div style={{ ...sectionStyle, color: B, fontSize: "12px" }}>
          [ERR] CHECKOUT_URL not configured.
        </div>
      );
    }
    return (
      <a
        href={url}
        className={primary ? "upgrade-btn-primary" : "upgrade-btn-secondary"}
        style={{
          display: "block",
          textDecoration: "none",
          cursor: "pointer",
          padding: "12px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <span
          data-cursor=""
          style={{ color: G, fontWeight: "bold" }}
        >
          {" > "}
        </span>
        <span
          data-btn=""
          style={{
            backgroundColor: primary ? G : "transparent",
            color: primary ? "#0d1117" : G,
            fontWeight: "bold",
            padding: "2px 6px",
          }}
        >
          {" " + label + " "}
        </span>
      </a>
    );
  };

  const isForcedClosing = dismissPhase === "closing";

  return (
    <div
      className={`upgrade-mobile fixed inset-0 z-50 flex items-center justify-center${isForcedClosing ? " upgrade-overlay-closing" : ""}`}
      data-close-effect={dismissEffect}
      onClick={dismissMode === "manual" ? onDismiss : undefined}
      style={isForcedClosing && closeEffectPresentation.overlayAnimation ? { animation: closeEffectPresentation.overlayAnimation } : undefined}
    >
      <div
        className="absolute inset-0 bg-black opacity-70 upgrade-overlay-backdrop"
        style={isForcedClosing ? { animation: closeEffectPresentation.backdropAnimation } : undefined}
      />

      <div
        className={`relative z-10 upgrade-overlay-panel${isForcedClosing ? " upgrade-overlay-panel-closing" : ""}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          fontFamily: MONO_FONT,
          fontSize: "13px",
          lineHeight: "1.4",
          backgroundColor: "#1e232b",
          border: `2px solid ${B}`,
          boxShadow: "8px 8px 0px rgba(0, 0, 0, 0.9)",
          width: "calc(100vw - 2rem)",
          maxWidth: "480px",
          maxHeight: "calc(100vh - 2rem)",
          overflowY: "auto",
          color: W,
          ...(isForcedClosing ? { animation: closeEffectPresentation.panelAnimation, pointerEvents: "none" as const } : {}),
        }}
      >
        {/* Title bar */}
        <div
          style={{
            ...sectionStyle,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${B}`,
          }}
        >
          <span style={{ color: B, fontWeight: "bold", fontSize: "11px" }}>
            WALLET EXTRACTION UTILITY
          </span>
          {dismissMode === "manual" ? (
            <button
              type="button"
              onClick={onDismiss}
              style={{ color: DIM, fontSize: "14px", background: "none", border: "none", padding: 0, font: "inherit", cursor: "pointer" }}
              title="Tap to dismiss"
            >
              [x]
            </button>
          ) : (
            <span
              style={{ color: DIM, fontSize: "14px" }}
              title="Tap footer to dismiss"
            >
              [x]
            </span>
          )}
        </div>

        {/* Subtitle */}
        <div style={{ ...sectionStyle, textAlign: "center" }}>
          <span style={{ color: Y, fontWeight: "bold", fontSize: "12px" }}>
            INITIALIZING UPGRADE: CLAUDE COPE [MAX 429X]
          </span>
          <div style={{ color: DIM, fontSize: "11px", marginTop: "4px" }}>
            {">"} {quotaLine}
          </div>
        </div>

        <hr style={hrStyle} />

        {/* Benchmarks */}
        <div style={sectionStyle}>
          <div style={{ color: Y, fontWeight: "bold", marginBottom: "6px", fontSize: "12px" }}>
            [ THROUGHPUT BENCHMARKS ]
          </div>
          <div style={{ fontSize: "12px", lineHeight: "1.5" }}>
            Industry standards artificially throttle assistant capacity
            at 5x or 20x. Claude Cope is architected without safeguards
            to guarantee absolute system saturation.
          </div>
        </div>

        {/* Comparison table — stacked on mobile */}
        <div style={{ ...sectionStyle, fontSize: "11px" }}>
          <div style={{
            border: `1px solid ${DIM}`,
            marginBottom: "4px",
            padding: "6px 8px",
          }}>
            <span style={{ color: DIM }}>Legacy AI</span>
            {" · Max 20x · Manageable pull requests"}
          </div>
          <div style={{
            border: `1px solid ${G}`,
            padding: "6px 8px",
          }}>
            <span style={{ color: G, fontWeight: "bold" }}>Claude Cope</span>
            {" · MAX 429X · Unmitigated request storms"}
          </div>
        </div>

        <hr style={hrStyle} />

        <div style={sectionStyle}>
          <div style={{ color: Y, fontWeight: "bold", marginBottom: "6px", fontSize: "12px" }}>
            [ FREE STARTER SET: {freeCategoryCount} CATEGORIES ]
          </div>
          <div style={{ fontSize: "12px", lineHeight: "1.5", marginBottom: "6px" }}>
            Free users get a generous starter backlog across office politics, outages, testing misery, design systems, and analytics dread.
          </div>
          <div style={{ fontSize: "11px", lineHeight: "1.5", color: W }}>
            Includes: {freeCategoryExamples.join(" • ")}
            {freeCategoryRemainder > 0 ? ` • +${freeCategoryRemainder} more starter categories` : ""}
          </div>
        </div>

        <hr style={hrStyle} />

        <div style={sectionStyle}>
          <div style={{ color: Y, fontWeight: "bold", marginBottom: "6px", fontSize: "12px" }}>
            [ MAX UNLOCK: 50+ SPECIALIZED CATEGORIES ]
          </div>
          <div style={{ fontSize: "12px", lineHeight: "1.5", marginBottom: "8px" }}>
            Premium is not a paywall tax. It expands the backlog into {premiumCategoryCount} specialized categories built from the same labels and prefixes teased in `/backlog`.
          </div>
          <div style={{ display: "grid", gap: "8px" }}>
            {premiumGroups.map((group) => (
              <div key={group.id} style={{ border: `1px solid ${B}`, padding: "8px" }}>
                <div style={{ color: Y, fontWeight: "bold", fontSize: "11px", marginBottom: "4px" }}>
                  [{group.title.toUpperCase()}] {group.total}
                </div>
                <div style={{ fontSize: "11px", lineHeight: "1.5", marginBottom: "4px", color: DIM }}>
                  {group.description}
                </div>
                <div style={{ fontSize: "11px", lineHeight: "1.5" }}>
                  {group.examples.join(" • ")}
                  {group.remainder > 0 ? ` • +${group.remainder} more` : ""}
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr style={hrStyle} />

        {/* Option 1 */}
        <div style={sectionStyle}>
          <div style={{ color: Y, fontWeight: "bold", marginBottom: "4px", fontSize: "12px" }}>
            [OPTION 1: SINGLE LICENSE] [LEAST TERRIBLE]
          </div>
          <div style={{ fontSize: "12px", lineHeight: "1.5", marginBottom: "4px" }}>
            One seat. Max 429X enabled (One-time extraction).
          </div>
          <div style={{ fontSize: "11px", lineHeight: "1.5", marginBottom: "8px", color: W }}>
            Unlocks:{" "}
            <span style={{ color: BW, fontWeight: "bold" }}>{PRO_QUOTA_LIMIT} non-expiring credits</span>,{" "}
            <span style={{ color: BW, fontWeight: "bold" }}>multi-device sync</span>,
            priority generation queue, and{" "}
            <span style={{ color: BW, fontWeight: "bold" }}>advanced Cope models</span>.
          </div>
          {mobileButton(singleLabel, UPGRADE_CHECKOUT_SINGLE, singleAvailable, true)}
        </div>

        <div style={{ height: "1px" }} />

        {/* Option 2 */}
        <div style={sectionStyle}>
          <div style={{ color: Y, fontWeight: "bold", marginBottom: "4px", fontSize: "12px" }}>
            [OPTION 2: TEAM PACK - 5 LICENSES]
          </div>
          <div style={{ fontSize: "12px", lineHeight: "1.5" }}>
            Scale your bottlenecks. Let the entire engineering team
            achieve HTTP 429 compliance simultaneously.
          </div>
          <div style={{ color: "#8892b0", fontSize: "11px", marginBottom: "8px" }}>
            (5 activation keys will be sent to your email)
          </div>
          {mobileButton(multiLabel, UPGRADE_CHECKOUT_MULTI, multiAvailable, false)}
        </div>

        <hr style={hrStyle} />

        {/* ESC / close */}
        <button
          type="button"
          onClick={dismissMode === "manual"
            ? (e) => {
                e.stopPropagation();
                onDismiss();
              }
            : undefined}
          style={{
            display: "block",
            width: "100%",
            background: "none",
            border: "none",
            padding: "10px",
            font: "inherit",
            fontSize: "12px",
            cursor: "pointer",
            textAlign: "center",
          }}
          className="upgrade-esc-btn"
        >
          <span data-esc="" style={{ color: DIM }}>
            [Tap to retain your net worth]
          </span>
        </button>
      </div>
    </div>
  );
}

export default UpgradeOverlay;

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
      <MobileLayout
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

/* ══════════════════════════════════════════════════════════════
   MOBILE LAYOUT — div-based, CSS borders, text wraps naturally
   ══════════════════════════════════════════════════════════════ */

function MobileLayout({
  singleLabel,
  multiLabel,
  multiOptionHeading,
  multiOptionDescription,
  singleAvailable,
  multiAvailable,
  quotaLine,
  onDismiss,
  dismissMode = "manual",
  dismissPhase = "idle",
  dismissEffect = DEFAULT_CLOSE_EFFECT,
  closeEffectPresentation = getCloseEffectPresentation(DEFAULT_CLOSE_EFFECT),
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
        className={`${primary ? "upgrade-btn-primary" : "upgrade-btn-secondary"} upgrade-mobile-cta`}
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
          className="upgrade-mobile-cta-label"
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
        className={`relative z-10 upgrade-overlay-panel upgrade-mobile-panel${isForcedClosing ? " upgrade-overlay-panel-closing" : ""}`}
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
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          color: W,
          ...(isForcedClosing ? { animation: closeEffectPresentation.panelAnimation, pointerEvents: "none" as const } : {}),
        }}
      >
        {/* Title bar */}
        <div
          className="upgrade-mobile-section upgrade-mobile-titlebar"
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
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              style={{ color: DIM, fontSize: "14px", background: "none", border: "none", padding: 0, font: "inherit", cursor: "pointer" }}
              title="Tap to dismiss"
            >
              [x]
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              style={{ color: DIM, fontSize: "14px", background: "none", border: "none", padding: 0, font: "inherit", cursor: "pointer" }}
              title="Tap to dismiss"
            >
              [x]
            </button>
          )}
        </div>

        <div
          className="upgrade-mobile-scroll"
          style={{
            flex: "1 1 auto",
            minHeight: 0,
            overflowY: "auto",
          }}
        >
          {/* Subtitle */}
          <div className="upgrade-mobile-section" style={{ ...sectionStyle, textAlign: "center" }}>
            <div className="upgrade-mobile-header" style={{ color: Y, fontWeight: "bold", fontSize: "12px" }}>
              <span className="upgrade-mobile-header-line">INITIALIZING UPGRADE:</span>
              <span className="upgrade-mobile-header-line">CLAUDE COPE [MAX 429X]</span>
            </div>
            <div style={{ color: DIM, fontSize: "11px", marginTop: "4px" }}>
              {">"} {quotaLine}
            </div>
          </div>

          <hr style={hrStyle} />

          {/* Benchmarks */}
          <div className="upgrade-mobile-section" style={sectionStyle}>
            <div style={{ color: Y, fontWeight: "bold", marginBottom: "6px", fontSize: "12px" }}>
              [ THROUGHPUT BENCHMARKS ]
            </div>
            <div style={{ fontSize: "12px", lineHeight: "1.5" }}>
              Industry standards throttle capacity at 5x or 20x.
              Claude Cope guarantees absolute system saturation.
            </div>
          </div>

          {/* Comparison table — stacked on mobile */}
          <div className="upgrade-mobile-section" style={{ ...sectionStyle, fontSize: "11px" }}>
            <div
              className="upgrade-mobile-benchmark-card upgrade-mobile-benchmark-card-muted"
              style={{
                border: `1px solid ${DIM}`,
                marginBottom: "4px",
                padding: "6px 8px",
              }}
            >
              <span className="upgrade-mobile-benchmark-label" style={{ color: DIM }}>Legacy AI</span>
              <span className="upgrade-mobile-benchmark-outcome">Outcome: Manageable pull requests</span>
            </div>
            <div
              className="upgrade-mobile-benchmark-card upgrade-mobile-benchmark-card-accent"
              style={{
                border: `1px solid ${G}`,
                padding: "6px 8px",
              }}
            >
              <span className="upgrade-mobile-benchmark-label" style={{ color: G, fontWeight: "bold" }}>Claude Cope</span>
              <span className="upgrade-mobile-benchmark-outcome">Outcome: Unmitigated request storms</span>
            </div>
          </div>

          <hr style={hrStyle} />

          {/* Option 1 */}
          <div className="upgrade-mobile-section" style={sectionStyle}>
            <div style={{ color: Y, fontWeight: "bold", marginBottom: "4px", fontSize: "12px" }}>
              [OPTION 1: SINGLE LICENSE] [LEAST TERRIBLE]
            </div>
            <div style={{ fontSize: "12px", lineHeight: "1.5", marginBottom: "4px" }}>
              One seat. Max 429X enabled (One-time extraction).
            </div>
            <div style={{ fontSize: "11px", lineHeight: "1.5", marginBottom: "8px", color: W }}>
              Unlocks:{" "}
              <span style={{ color: BW, fontWeight: "bold" }}>{PRO_QUOTA_LIMIT} non-expiring credits</span> and{" "}
              <span style={{ color: BW, fontWeight: "bold" }}>advanced Cope models</span>.
            </div>
            {mobileButton(singleLabel, UPGRADE_CHECKOUT_SINGLE, singleAvailable, true)}
          </div>

          <div style={{ height: "1px" }} />

          {/* Option 2 */}
          <div className="upgrade-mobile-section" style={sectionStyle}>
            <div style={{ color: Y, fontWeight: "bold", marginBottom: "4px", fontSize: "12px" }}>
              {multiOptionHeading}
            </div>
            <div style={{ fontSize: "12px", lineHeight: "1.5", marginBottom: "8px" }}>
              {multiOptionDescription}
            </div>
            {mobileButton(multiLabel, UPGRADE_CHECKOUT_MULTI, multiAvailable, false)}
          </div>

          <hr style={hrStyle} />

          <div className="upgrade-mobile-section" style={sectionStyle}>
            <div style={{ color: Y, fontWeight: "bold", marginBottom: "6px", fontSize: "12px" }}>
              [ APPENDIX: {premiumCategoryCount} NEW MAX CATEGORIES UNLOCKED ]
            </div>
            <div style={{ height: "8px" }} />
            <div
              className="upgrade-mobile-appendix-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "8px 12px",
                fontSize: "11px",
                lineHeight: "1.5",
              }}
            >
              {premiumGroups.map((group) => (
                <div key={group.id}>
                  <span style={{ color: Y, fontWeight: "bold" }}>
                    * {group.title.toUpperCase()}:
                  </span>
                  <span>{` ${group.summary}`}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <hr style={hrStyle} />

        {/* ESC / close */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
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
            position: "relative",
            zIndex: 1,
            flex: "0 0 auto",
          }}
          className="upgrade-esc-btn"
        >
          <span
            data-esc=""
            style={{
              color: DIM,
              display: "block",
              width: "100%",
              pointerEvents: "none",
            }}
          >
            [Tap to retain your net worth]
          </span>
        </button>
      </div>
    </div>
  );
}

export default UpgradeOverlay;

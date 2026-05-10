import {
  UPGRADE_CHECKOUT_SINGLE,
  UPGRADE_CHECKOUT_MULTI,
  UPGRADE_PRICE_SINGLE,
  UPGRADE_PRICE_MULTI,
  PRO_QUOTA_LIMIT,
} from "../config";
import DesktopLayout from "./UpgradeDesktopLayout";
import type { LayoutProps } from "./UpgradeDesktopLayout";
import { getQuotaStatus } from "./upgradeQuotaStatus";

/* ── helpers ─────────────────────────────────────────────────── */

const B = "#ff5555"; // border (red)
const Y = "#ffff55"; // yellow headings
const W = "#c9d1d9"; // soft off-white body text
const BW = "#ffffff"; // bright white (ANSI bold)
const G = "#4ade80"; // green buttons
const DIM = "#aaaaaa"; // dim footer

const MONO_FONT = "'Fira Code', 'Cascadia Code', 'Consolas', monospace";

export const UPGRADE_NAG_CLOSE_EFFECTS = [
  "death-spiral",
  "emergency-eject",
  "singularity",
  "task-manager",
  "bsod",
  "catastrophic-reorg",
] as const;

export type UpgradeNagCloseEffect = typeof UPGRADE_NAG_CLOSE_EFFECTS[number];

const DEFAULT_CLOSE_EFFECT: UpgradeNagCloseEffect = "death-spiral";

const CLOSE_EFFECT_STYLES = `
@keyframes upgrade-overlay-death-spiral{0%{opacity:1;filter:blur(0) saturate(1) contrast(1);transform:perspective(1200px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1) skew(0deg,0deg)}100%{opacity:0;filter:blur(12px) saturate(.15) contrast(1.8);transform:perspective(1200px) rotateX(-24deg) rotateY(24deg) rotateZ(-18deg) scale(.68) skew(-8deg,5deg)}}
@keyframes upgrade-overlay-emergency-eject{0%{opacity:1;filter:blur(0) brightness(1);transform:translate3d(0,0,0) rotate(0deg) scale(1)}20%{transform:translate3d(18px,-12px,0) rotate(4deg) scale(1.02)}100%{opacity:0;filter:blur(10px) brightness(1.5);transform:translate3d(180px,-120vh,0) rotate(18deg) scale(.72)}}
@keyframes upgrade-overlay-singularity{0%{opacity:1;filter:blur(0) hue-rotate(0deg);transform:scale(1) rotate(0deg)}45%{opacity:1;filter:blur(1px) hue-rotate(90deg);transform:scale(1.08) rotate(-8deg)}100%{opacity:0;filter:blur(18px) hue-rotate(240deg);transform:scale(.03) rotate(1080deg)}}
@keyframes upgrade-overlay-task-manager{0%{opacity:1;filter:grayscale(0) blur(0);transform:scaleX(1) scaleY(1) translate3d(0,0,0)}50%{opacity:1;filter:grayscale(.8) blur(1px);transform:scaleX(1.06) scaleY(.92) translate3d(-12px,0,0)}100%{opacity:0;filter:grayscale(1) blur(8px);transform:scaleX(.02) scaleY(.78) translate3d(-120vw,0,0)}}
@keyframes upgrade-overlay-bsod{0%{opacity:1;background-color:#1e232b;color:inherit;filter:blur(0);transform:scale(1) rotate(0deg)}12%{background-color:#0015aa;color:#d6e4ff}55%{opacity:1;filter:blur(1px);transform:scale(1.02) rotate(-1deg)}100%{opacity:0;background-color:#0015aa;color:#d6e4ff;filter:blur(14px);transform:scale(.82) rotate(-7deg) translate3d(0,26vh,0)}}
@keyframes upgrade-overlay-catastrophic-reorg{0%{opacity:1;filter:blur(0) saturate(1);transform:translate3d(0,0,0) rotate(0deg) scale(1)}15%{transform:translate3d(-24px,8px,0) rotate(-3deg) scale(1.02)}30%{transform:translate3d(26px,-10px,0) rotate(4deg) scale(1.03)}45%{transform:translate3d(-18px,14px,0) rotate(-6deg) scale(1.01)}100%{opacity:0;filter:blur(16px) saturate(2.1) hue-rotate(135deg);transform:translate3d(0,120vh,0) rotate(22deg) scale(1.28)}}
@keyframes upgrade-overlay-backdrop-collapse{0%{opacity:.7;backdrop-filter:blur(0)}100%{opacity:0;backdrop-filter:blur(6px)}}
@keyframes upgrade-overlay-backdrop-pulse-out{0%{opacity:.7;transform:scale(1)}35%{opacity:.9;transform:scale(1.01)}100%{opacity:0;transform:scale(1.08)}}
@keyframes upgrade-overlay-backdrop-blue-screen{0%{opacity:.7;background:rgba(0,0,0,.7)}15%{opacity:.95;background:rgba(0,21,170,.96)}100%{opacity:0;background:rgba(0,21,170,.2)}}
@keyframes upgrade-overlay-screen-quake{0%,100%{transform:translate3d(0,0,0)}10%{transform:translate3d(-16px,6px,0)}20%{transform:translate3d(14px,-10px,0)}30%{transform:translate3d(-12px,-6px,0)}40%{transform:translate3d(18px,12px,0)}50%{transform:translate3d(-14px,8px,0)}60%{transform:translate3d(10px,-12px,0)}70%{transform:translate3d(-8px,10px,0)}80%{transform:translate3d(12px,-8px,0)}90%{transform:translate3d(-6px,4px,0)}}
`;

type CloseEffectPresentation = {
  panelAnimation: string;
  backdropAnimation: string;
  overlayAnimation?: string;
};

const CLOSE_EFFECT_PRESENTATIONS: Record<UpgradeNagCloseEffect, CloseEffectPresentation> = {
  "death-spiral": { panelAnimation: "upgrade-overlay-death-spiral 3s cubic-bezier(0.2, 0.02, 0.1, 1) forwards", backdropAnimation: "upgrade-overlay-backdrop-collapse 3s ease-out forwards" },
  "emergency-eject": { panelAnimation: "upgrade-overlay-emergency-eject 3s cubic-bezier(0.18, 0.7, 0.18, 1) forwards", backdropAnimation: "upgrade-overlay-backdrop-pulse-out 3s ease-out forwards" },
  singularity: { panelAnimation: "upgrade-overlay-singularity 3s cubic-bezier(0.45, 0, 0.2, 1) forwards", backdropAnimation: "upgrade-overlay-backdrop-pulse-out 3s ease-in forwards" },
  "task-manager": { panelAnimation: "upgrade-overlay-task-manager 3s cubic-bezier(0.3, 0.02, 0.1, 1) forwards", backdropAnimation: "upgrade-overlay-backdrop-collapse 3s linear forwards" },
  bsod: { panelAnimation: "upgrade-overlay-bsod 3s cubic-bezier(0.15, 0.75, 0.2, 1) forwards", backdropAnimation: "upgrade-overlay-backdrop-blue-screen 3s ease-out forwards" },
  "catastrophic-reorg": { panelAnimation: "upgrade-overlay-catastrophic-reorg 3s cubic-bezier(0.18, 0.82, 0.18, 1) forwards", backdropAnimation: "upgrade-overlay-backdrop-pulse-out 3s ease-out forwards", overlayAnimation: "upgrade-overlay-screen-quake 260ms steps(2, end) 0s 10" },
};

function getCloseEffectPresentation(effect: UpgradeNagCloseEffect): CloseEffectPresentation {
  return CLOSE_EFFECT_PRESENTATIONS[effect] ?? CLOSE_EFFECT_PRESENTATIONS[DEFAULT_CLOSE_EFFECT];
}

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
          onClick={(e) => { e.stopPropagation(); onDismiss(); }}
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

import {
  UPGRADE_CHECKOUT_SINGLE,
  UPGRADE_CHECKOUT_MULTI,
  PRO_QUOTA_LIMIT,
  FREE_QUOTA_LIMIT,
  UPGRADE_PRICE_SINGLE,
  UPGRADE_PRICE_MULTI,
} from "../config";
import DesktopLayout from "./UpgradeDesktopLayout";
import type { LayoutProps } from "./UpgradeDesktopLayout";

/* ── helpers ─────────────────────────────────────────────────── */

const B = "#ff5555"; // border (red)
const Y = "#ffff55"; // yellow headings
const W = "#c9d1d9"; // soft off-white body text
const BW = "#ffffff"; // bright white (ANSI bold)
const G = "#4ade80"; // green buttons
const DIM = "#aaaaaa"; // dim footer

const MONO_FONT = "'Fira Code', 'Cascadia Code', 'Consolas', monospace";

/** Returns a humorous status adjective scaled to the user's current credits. */
function getQuotaStatus(credits: number): string {
  if (credits <= 0) return "Depleted";
  if (credits <= 5) return "Pathetic";
  if (credits <= 15) return "Embarrassing";
  if (credits <= 50) return "Insufficient";
  if (credits <= 200) return "Mediocre";
  if (credits <= 500) return "Tolerable";
  return "Adequate";
}

/* ── component ───────────────────────────────────────────────── */

type UpgradeOverlayProps = {
  quotaPercent: number;
  onDismiss: () => void;
};

function UpgradeOverlay({ quotaPercent, onDismiss }: UpgradeOverlayProps) {
  const singleAvailable = !!UPGRADE_CHECKOUT_SINGLE;
  const multiAvailable = !!UPGRADE_CHECKOUT_MULTI;

  const singleLabel = `[ AUTHORIZE EXTRACTION - ${UPGRADE_PRICE_SINGLE} ]`;
  const multiLabel = `[ EXTRACT TEAM FUNDS - ${UPGRADE_PRICE_MULTI} ]`;

  // Only free-tier users see this overlay, so always use FREE_QUOTA_LIMIT.
  const totalQuota = FREE_QUOTA_LIMIT;
  const currentCredits = Math.round((quotaPercent / 100) * totalQuota);

  return (
    <>
      {/* Desktop: visible ≥641px, hidden below via CSS */}
      <DesktopLayout
        singleLabel={singleLabel}
        multiLabel={multiLabel}
        singleAvailable={singleAvailable}
        multiAvailable={multiAvailable}
        currentCredits={currentCredits}
      />
      {/* Mobile: visible ≤640px, hidden above via CSS */}
      <MobileLayout
        singleLabel={singleLabel}
        multiLabel={multiLabel}
        singleAvailable={singleAvailable}
        multiAvailable={multiAvailable}
        currentCredits={currentCredits}
        onDismiss={onDismiss}
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
  currentCredits,
  onDismiss,
}: LayoutProps & { onDismiss: () => void }) {
  const sectionStyle = { padding: "8px 12px" } as const;
  const hrStyle = {
    border: "none",
    borderTop: `1px solid ${B}`,
    margin: 0,
  } as const;

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
        target="_blank"
        rel="noopener noreferrer"
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

  return (
    <div
      className="upgrade-mobile fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black opacity-70" />

      <div
        className="relative z-10"
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
          <span
            style={{ color: DIM, fontSize: "14px" }}
            title="Tap footer to dismiss"
          >
            [x]
          </span>
        </div>

        {/* Subtitle */}
        <div style={{ ...sectionStyle, textAlign: "center" }}>
          <span style={{ color: Y, fontWeight: "bold", fontSize: "12px" }}>
            INITIALIZING UPGRADE: CLAUDE COPE [MAX 429X]
          </span>
          <div style={{ color: DIM, fontSize: "11px", marginTop: "4px" }}>
            {">"} CURRENT QUOTA: {currentCredits} Credits. Status: {getQuotaStatus(currentCredits)}.
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

import {
  UPGRADE_CHECKOUT_SINGLE,
  UPGRADE_CHECKOUT_MULTI,
  PRO_QUOTA_LIMIT,
} from "../config";

/* ── shared constants (mirrored from UpgradeOverlay) ────────── */

const B = "#ff5555"; // border (red)
const Y = "#ffff55"; // yellow headings
const W = "#ffffff"; // white body text
const G = "#4ade80"; // green buttons
const DIM = "#aaaaaa"; // dim footer

const INNER_W = 64; // inner content width (between ║ chars)
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

/* ── types ──────────────────────────────────────────────────── */

export type LayoutProps = {
  singleLabel: string;
  multiLabel: string;
  singleAvailable: boolean;
  multiAvailable: boolean;
  isUpgraded: boolean;
  currentCredits: number;
  onClose: () => void;
};

/* ══════════════════════════════════════════════════════════════
   DESKTOP LAYOUT — original ASCII <pre> box
   ══════════════════════════════════════════════════════════════ */

export default function DesktopLayout({
  singleLabel,
  multiLabel,
  singleAvailable,
  multiAvailable,
  currentCredits,
  onClose,
}: LayoutProps) {
  const topBorder = (
    <span style={{ color: B }}>{"╔" + "═".repeat(INNER_W) + "╗"}</span>
  );
  const midBorder = (
    <span style={{ color: B }}>{"╠" + "═".repeat(INNER_W) + "╣"}</span>
  );
  const botBorder = (
    <span style={{ color: B }}>{"╚" + "═".repeat(INNER_W) + "╝"}</span>
  );

  const boxLine = (text: string, color = W) => {
    const padded = text.length < INNER_W
      ? text + " ".repeat(INNER_W - text.length)
      : text.slice(0, INNER_W);
    return (
      <>
        <span style={{ color: B }}>{"║"}</span>
        <span style={{ color }}>{padded}</span>
        <span style={{ color: B }}>{"║"}</span>
      </>
    );
  };

  const emptyLine = boxLine("");

  const centeredBoxLine = (text: string, color = W) => {
    const totalPad = INNER_W - text.length;
    const left = Math.max(0, Math.floor(totalPad / 2));
    const right = Math.max(0, totalPad - left);
    return (
      <>
        <span style={{ color: B }}>{"║"}</span>
        <span style={{ color }}>{" ".repeat(left) + text + " ".repeat(right)}</span>
        <span style={{ color: B }}>{"║"}</span>
      </>
    );
  };

  const buttonBlock = (
    label: string,
    url: string,
    available: boolean,
    primary = true,
  ) => {
    const MARGIN = 2;
    const cursorPrefix = " > ";
    const btnContent = " " + label + " ";
    const totalUsed = MARGIN + cursorPrefix.length + btnContent.length;
    const suffixLen = Math.max(0, INNER_W - totalUsed);
    const emptyInner = " ".repeat(INNER_W);

    if (!available) {
      const errText = "    [ERR] CHECKOUT_URL not configured.";
      const errPad = Math.max(0, INNER_W - errText.length);
      return (
        <>
          <span style={{ color: B }}>{"║"}</span>
          <span style={{ color: W }}>{emptyInner}</span>
          <span style={{ color: B }}>{"║"}</span>{"\n"}
          <span style={{ color: B }}>{"║"}</span>
          <span style={{ color: B }}>{errText + " ".repeat(errPad)}</span>
          <span style={{ color: B }}>{"║"}</span>{"\n"}
          <span style={{ color: B }}>{"║"}</span>
          <span style={{ color: W }}>{emptyInner}</span>
          <span style={{ color: B }}>{"║"}</span>
        </>
      );
    }
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={primary ? "upgrade-btn-primary" : "upgrade-btn-secondary"}
        style={{
          display: "inline",
          textDecoration: "none",
          cursor: "pointer",
          backgroundColor: "transparent",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <span style={{ color: B }}>{"║"}</span>
        <span style={{ color: "transparent" }}>{emptyInner}</span>
        <span style={{ color: B }}>{"║"}</span>{"\n"}
        <span style={{ color: B }}>{"║"}</span>
        <span style={{ color: "transparent" }}>{" ".repeat(MARGIN)}</span>
        <span
          data-cursor=""
          style={{ color: G, fontWeight: "bold" }}
        >
          {cursorPrefix}
        </span>
        <span
          data-btn=""
          style={{
            backgroundColor: primary ? G : "transparent",
            color: primary ? "#0d1117" : G,
            fontWeight: "bold",
          }}
        >
          {btnContent}
        </span>
        <span style={{ color: "transparent" }}>{" ".repeat(suffixLen)}</span>
        <span style={{ color: B }}>{"║"}</span>{"\n"}
        <span style={{ color: B }}>{"║"}</span>
        <span style={{ color: "transparent" }}>{emptyInner}</span>
        <span style={{ color: B }}>{"║"}</span>
      </a>
    );
  };

  const tableBorderTop = boxLine("  +----------------+----------+------------------------------+");
  const tableHeader    = boxLine("  | ARCHITECTURE   | CAPACITY | GUARANTEED OUTCOME           |");
  const tableBorderMid = boxLine("  +----------------+----------+------------------------------+");
  const tableRow1      = boxLine("  | Legacy AI      | Max 20x  | Manageable pull requests     |");
  const tableRow2      = boxLine("  | Claude Cope    | MAX 429X | Unmitigated request storms   |");
  const tableBorderBot = boxLine("  +----------------+----------+------------------------------+");

  const title = "[ W A L L E T   E X T R A C T I O N   U T I L I T Y ]";
  const closeBtn = "[x]";
  const titleGap = Math.max(1, INNER_W - title.length - closeBtn.length - 1);
  const titlePadRight = Math.max(0, INNER_W - title.length - titleGap - closeBtn.length);

  return (
    <div
      className="upgrade-desktop fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black opacity-70" />

      <pre
        className="relative z-10 mx-4"
        style={{
          fontFamily: MONO_FONT,
          fontSize: "13px",
          lineHeight: "1.1",
          backgroundColor: "#1e232b",
          boxShadow: "12px 12px 0px rgba(0, 0, 0, 0.9)",
          padding: 0,
          margin: 0,
          whiteSpace: "pre",
          overflowX: "auto",
          overflowY: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {topBorder}{"\n"}
        <span style={{ color: B }}>{"║"}</span>
        <span style={{ color: B }}>{" " + title + " ".repeat(titleGap - 1)}</span>
        <span
          style={{ color: DIM, cursor: "pointer" }}
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          onMouseEnter={(e) => { e.currentTarget.style.color = W; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = DIM; }}
        >
          {closeBtn}
        </span>
        <span style={{ color: B }}>{" ".repeat(titlePadRight)}</span>
        <span style={{ color: B }}>{"║"}</span>
        {"\n"}
        {midBorder}{"\n"}
        {emptyLine}{"\n"}
        {centeredBoxLine("INITIALIZING UPGRADE: CLAUDE COPE [MAX 429X]", Y)}{"\n"}
        {boxLine(`  > CURRENT QUOTA: ${currentCredits} Credits. Status: ${getQuotaStatus(currentCredits)}.`, DIM)}{"\n"}
        {emptyLine}{"\n"}
        {boxLine("  [ THROUGHPUT BENCHMARKS ]", Y)}{"\n"}
        {boxLine("  Industry standards artificially throttle assistant capacity")}{"\n"}
        {boxLine("  at 5x or 20x. Claude Cope is architected without safeguards")}{"\n"}
        {boxLine("  to guarantee absolute system saturation.")}{"\n"}
        {emptyLine}{"\n"}
        {tableBorderTop}{"\n"}
        {tableHeader}{"\n"}
        {tableBorderMid}{"\n"}
        {tableRow1}{"\n"}
        {tableRow2}{"\n"}
        {tableBorderBot}{"\n"}
        {emptyLine}{"\n"}
        {boxLine("  [OPTION 1: SINGLE LICENSE] [LEAST TERRIBLE]", Y)}{"\n"}
        {boxLine(`  One seat. Max 429X enabled (One-time extraction).`)}{"\n"}
        {boxLine(`  Unlocks: ${PRO_QUOTA_LIMIT} non-expiring credits, multi-device sync,`)}{"\n"}
        {boxLine("  priority generation queue, and advanced Cope models.")}{"\n"}
        {buttonBlock(singleLabel, UPGRADE_CHECKOUT_SINGLE, singleAvailable)}{"\n"}
        {emptyLine}{"\n"}
        {boxLine("  [OPTION 2: TEAM PACK - 5 LICENSES]", Y)}{"\n"}
        {boxLine("  Scale your bottlenecks. Let the entire engineering team")}{"\n"}
        {boxLine("  achieve HTTP 429 compliance simultaneously.")}{"\n"}
        {boxLine("  (5 activation keys will be sent to your email)", "#8892b0")}{"\n"}
        {buttonBlock(multiLabel, UPGRADE_CHECKOUT_MULTI, multiAvailable, false)}{"\n"}
        {midBorder}{"\n"}
        {(() => {
          const text = "[Press ESC to retain your net worth]";
          const totalPad = INNER_W - text.length;
          const left = Math.max(0, Math.floor(totalPad / 2));
          const right = Math.max(0, totalPad - left);
          return (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              style={{
                display: "inline",
                background: "none",
                border: "none",
                padding: 0,
                margin: 0,
                font: "inherit",
                cursor: "pointer",
                lineHeight: "inherit",
              }}
              className="upgrade-esc-btn"
            >
              <span style={{ color: B }}>{"║"}</span>
              <span
                data-esc=""
                style={{ color: DIM }}
              >
                {" ".repeat(left) + text + " ".repeat(right)}
              </span>
              <span style={{ color: B }}>{"║"}</span>
            </button>
          );
        })()}{"\n"}
        {botBorder}
      </pre>
    </div>
  );
}

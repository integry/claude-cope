import {
  UPGRADE_CHECKOUT_SINGLE,
  UPGRADE_CHECKOUT_MULTI,
  PRO_QUOTA_LIMIT,
  UPGRADE_PRICE_SINGLE,
  UPGRADE_PRICE_MULTI,
} from "../config";

type UpgradeOverlayProps = {
  isUpgraded: boolean;
  onClose: () => void;
};

/* ── helpers ─────────────────────────────────────────────────── */

const B = "#ff5555"; // border (red)
const Y = "#ffff55"; // yellow headings
const W = "#ffffff"; // white body text
const G = "#4ade80"; // green buttons
const DIM = "#aaaaaa"; // dim footer

const INNER_W = 64; // inner content width (between ║ chars)

/* ── component ───────────────────────────────────────────────── */

function UpgradeOverlay({ isUpgraded, onClose }: UpgradeOverlayProps) {
  const singleAvailable = !!UPGRADE_CHECKOUT_SINGLE;
  const multiAvailable = !!UPGRADE_CHECKOUT_MULTI;

  const singleLabel = isUpgraded
    ? `[ AUTHORIZE EXTRACTION - ${UPGRADE_PRICE_SINGLE} ]`
    : `[ AUTHORIZE EXTRACTION - ${UPGRADE_PRICE_SINGLE} ]`;

  const multiLabel = isUpgraded
    ? `[ EXTRACT TEAM FUNDS - ${UPGRADE_PRICE_MULTI} ]`
    : `[ EXTRACT TEAM FUNDS - ${UPGRADE_PRICE_MULTI} ]`;

  /* ── render helpers ── */

  /** Top border: ╔════...════╗ */
  const topBorder = (
    <span style={{ color: B }}>{"╔" + "═".repeat(INNER_W) + "╗"}</span>
  );

  /** Mid border: ╠════...════╣ */
  const midBorder = (
    <span style={{ color: B }}>{"╠" + "═".repeat(INNER_W) + "╣"}</span>
  );

  /** Bottom border: ╚════...════╝ */
  const botBorder = (
    <span style={{ color: B }}>{"╚" + "═".repeat(INNER_W) + "╝"}</span>
  );

  /** A content line padded to INNER_W between ║ ... ║ */
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

  /** An empty line: ║ (spaces) ║ */
  const emptyLine = boxLine("");

  /** A centered content line between ║ ... ║ */
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

  /** Button block: a single <a> spanning 3 rows (empty + button + empty)
   *  so the entire area is one clickable element with shared hover.
   *  primary = solid green block (default selected)
   *  secondary = green text only, turns solid green on hover */
  const buttonBlock = (
    label: string,
    url: string,
    available: boolean,
    primary = true,
  ) => {
    const MARGIN = 2; // gap so green never touches red borders
    const cursorPrefix = " > "; // shown outside the green block
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
        style={{
          display: "block",
          textDecoration: "none",
          cursor: "pointer",
          backgroundColor: "transparent",
        }}
        onMouseEnter={(e) => {
          const btn = e.currentTarget.querySelector("[data-btn]") as HTMLElement;
          if (btn) {
            btn.style.backgroundColor = primary ? "#ffffff" : G;
            btn.style.color = primary ? "#000000" : "#0d1117";
          }
          const cursor = e.currentTarget.querySelector("[data-cursor]") as HTMLElement;
          if (cursor) {
            cursor.style.color = G;
          }
        }}
        onMouseLeave={(e) => {
          const btn = e.currentTarget.querySelector("[data-btn]") as HTMLElement;
          if (btn) {
            btn.style.backgroundColor = primary ? G : "transparent";
            btn.style.color = primary ? "#0d1117" : G;
          }
          const cursor = e.currentTarget.querySelector("[data-cursor]") as HTMLElement;
          if (cursor) {
            cursor.style.color = G;
          }
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top padding row */}
        <span style={{ color: B }}>{"║"}</span>
        <span style={{ color: "transparent" }}>{emptyInner}</span>
        <span style={{ color: B }}>{"║"}</span>{"\n"}
        {/* Button row */}
        <span style={{ color: B }}>{"║"}</span>
        <span style={{ color: "transparent" }}>{" ".repeat(MARGIN)}</span>
        <span
          data-cursor=""
          style={{
            color: G,
            fontWeight: "bold",
          }}
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
        {/* Bottom padding row */}
        <span style={{ color: B }}>{"║"}</span>
        <span style={{ color: "transparent" }}>{emptyInner}</span>
        <span style={{ color: B }}>{"║"}</span>
      </a>
    );
  };

  /* ── ASCII table lines ── */
  const tableBorderTop = boxLine("  +----------------+----------+------------------------------+");
  const tableHeader    = boxLine("  | ARCHITECTURE   | CAPACITY | GUARANTEED OUTCOME           |");
  const tableBorderMid = boxLine("  +----------------+----------+------------------------------+");
  const tableRow1      = boxLine("  | Legacy AI      | Max 20x  | Manageable pull requests     |");
  const tableRow2      = boxLine("  | Claude Cope    | MAX 429X | Unmitigated request storms   |");
  const tableBorderBot = boxLine("  +----------------+----------+------------------------------+");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Dimmed backdrop */}
      <div className="absolute inset-0 bg-black opacity-70" />

      {/* Modal box */}
      <pre
        className="relative z-10 mx-4"
        style={{
          fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
          fontSize: "13px",
          lineHeight: "1.1",
          backgroundColor: "#1e232b",
          boxShadow: "12px 12px 0px rgba(0, 0, 0, 0.9)",
          padding: 0,
          margin: 0,
          whiteSpace: "pre",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {topBorder}{"\n"}
        {centeredBoxLine("[ W A L L E T   E X T R A C T I O N   U T I L I T Y ]", B)}{"\n"}
        {midBorder}{"\n"}
        {emptyLine}{"\n"}
        {centeredBoxLine("INITIALIZING UPGRADE: CLAUDE COPE [MAX 429X]", Y)}{"\n"}
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
        {boxLine("  [OPTION 1: SINGLE LICENSE]", Y)}{"\n"}
        {boxLine(`  One seat. Max 429X enabled. ${PRO_QUOTA_LIMIT} non-expiring`)}{"\n"}
        {boxLine("  credits (one-time extraction).")}{"\n"}
        {buttonBlock(singleLabel, UPGRADE_CHECKOUT_SINGLE, singleAvailable)}{"\n"}
        {emptyLine}{"\n"}
        {boxLine("  [OPTION 2: TEAM PACK - 5 LICENSES]", Y)}{"\n"}
        {boxLine("  Scale your bottlenecks. Let the entire engineering team")}{"\n"}
        {boxLine("  achieve HTTP 429 compliance simultaneously.")}{"\n"}
        {buttonBlock(multiLabel, UPGRADE_CHECKOUT_MULTI, multiAvailable, false)}{"\n"}
        {midBorder}{"\n"}
        {(() => {
          const text = "[Press ESC to retain your net worth]";
          const totalPad = INNER_W - text.length;
          const left = Math.max(0, Math.floor(totalPad / 2));
          const right = Math.max(0, totalPad - left);
          return (
            <>
              <span style={{ color: B }}>{"║"}</span>
              <span
                style={{ color: DIM, cursor: "pointer" }}
                onClick={onClose}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = W;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = DIM;
                }}
              >
                {" ".repeat(left) + text + " ".repeat(right)}
              </span>
              <span style={{ color: B }}>{"║"}</span>
            </>
          );
        })()}{"\n"}
        {botBorder}
      </pre>
    </div>
  );
}

export default UpgradeOverlay;

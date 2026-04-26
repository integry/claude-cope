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

  /** Clickable empty line: entire row between ║...║ is a link */
  const clickableEmptyLine = (url: string, available: boolean) => {
    if (!available) return emptyLine;
    return (
      <>
        <span style={{ color: B }}>{"║"}</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline",
            textDecoration: "none",
            color: "transparent",
            cursor: "pointer",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {" ".repeat(INNER_W)}
        </a>
        <span style={{ color: B }}>{"║"}</span>
      </>
    );
  };

  /** Button line: clickable <a> padded between ║ ... ║
   *  primary = solid green block (default selected)
   *  secondary = green text only, turns solid green on hover */
  const buttonBoxLine = (
    label: string,
    url: string,
    available: boolean,
    primary = true,
  ) => {
    const MARGIN = 2; // gap so green never touches red borders
    const btnContent = " > " + label + " ";
    const totalUsed = MARGIN + btnContent.length;
    const suffixLen = Math.max(0, INNER_W - totalUsed);
    if (!available) {
      const errText = "    [ERR] CHECKOUT_URL not configured.";
      const errPad = Math.max(0, INNER_W - errText.length);
      return (
        <>
          <span style={{ color: B }}>{"║"}</span>
          <span style={{ color: B }}>{errText + " ".repeat(errPad)}</span>
          <span style={{ color: B }}>{"║"}</span>
        </>
      );
    }
    return (
      <>
        <span style={{ color: B }}>{"║"}</span>
        <span>{" ".repeat(MARGIN)}</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline",
            backgroundColor: primary ? G : "transparent",
            color: primary ? "#0d1117" : G,
            textDecoration: "none",
            fontWeight: "bold",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = primary ? "#ffffff" : G;
            e.currentTarget.style.color = primary ? "#000000" : "#0d1117";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = primary ? G : "transparent";
            e.currentTarget.style.color = primary ? "#0d1117" : G;
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {btnContent}
        </a>
        <span>{" ".repeat(suffixLen)}</span>
        <span style={{ color: B }}>{"║"}</span>
      </>
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
        {boxLine(`  One seat. Max 429X enabled. ${PRO_QUOTA_LIMIT} credits of pure throughput.`)}{"\n"}
        {clickableEmptyLine(UPGRADE_CHECKOUT_SINGLE, singleAvailable)}{"\n"}
        {buttonBoxLine(singleLabel, UPGRADE_CHECKOUT_SINGLE, singleAvailable)}{"\n"}
        {clickableEmptyLine(UPGRADE_CHECKOUT_SINGLE, singleAvailable)}{"\n"}
        {boxLine("  [OPTION 2: TEAM PACK - 5 LICENSES]", Y)}{"\n"}
        {boxLine("  Scale your bottlenecks. Let the entire engineering team")}{"\n"}
        {boxLine("  achieve HTTP 429 compliance simultaneously.")}{"\n"}
        {clickableEmptyLine(UPGRADE_CHECKOUT_MULTI, multiAvailable)}{"\n"}
        {buttonBoxLine(multiLabel, UPGRADE_CHECKOUT_MULTI, multiAvailable, false)}{"\n"}
        {clickableEmptyLine(UPGRADE_CHECKOUT_MULTI, multiAvailable)}{"\n"}
        {midBorder}{"\n"}
        {centeredBoxLine("[Press ESC to retain your net worth]", DIM)}{"\n"}
        {botBorder}
      </pre>
    </div>
  );
}

export default UpgradeOverlay;

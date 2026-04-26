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

const BOX_W = 66; // inner width of box

/* ── component ───────────────────────────────────────────────── */

function UpgradeOverlay({ isUpgraded, onClose }: UpgradeOverlayProps) {
  const singleAvailable = !!UPGRADE_CHECKOUT_SINGLE;
  const multiAvailable = !!UPGRADE_CHECKOUT_MULTI;

  const singleLabel = isUpgraded
    ? `[ BUY ANOTHER SEAT - ${UPGRADE_PRICE_SINGLE} ]`
    : `[ PURCHASE SINGLE - ${UPGRADE_PRICE_SINGLE} ]`;

  const multiLabel = isUpgraded
    ? `[ BUY MORE SEATS - ${UPGRADE_PRICE_MULTI} ]`
    : `[ PURCHASE TEAM PACK - ${UPGRADE_PRICE_MULTI} ]`;

  const title = isUpgraded ? "MANAGE YOUR LICENSES" : "UPGRADE TO MAX";
  const subtitle = isUpgraded
    ? "Purchase additional licenses to spread the suffering across your team."
    : "Unlock Premium Suffering.";

  const statusHeading = isUpgraded ? "[CURRENT STATUS]" : "[FREE TIER]";
  const statusLine1 = isUpgraded
    ? "You are on the Max tier. Your suffering is premium-grade."
    : `You are on the free tier. Upgrade to Max for ${PRO_QUOTA_LIMIT} credits,`;
  const statusLine2 = isUpgraded
    ? null
    : "premium models, and the privilege of paying for your own exploitation.";

  /* ── render helpers ── */

  const hrBorder = (
    <span style={{ color: B }}>{"═".repeat(BOX_W)}</span>
  );

  const textLine = (text: string, color = W) => (
    <span style={{ color }}>{"  " + text}</span>
  );

  const centeredLine = (text: string, color = W) => {
    const totalPad = BOX_W - text.length;
    const left = Math.floor(totalPad / 2);
    return (
      <span style={{ color }}>
        {" ".repeat(left) + text}
      </span>
    );
  };

  const headerLine = (
    <span style={{ color: B }}>
      {"             [ S Y S T E M   O V E R R I D E ]"}
    </span>
  );

  const footerLine = (
    <span style={{ color: DIM }}>
      {"             [Press ESC to return to mediocrity]"}
    </span>
  );

  /* Button line: rendered as a clickable <a> inside the <pre> */
  const buttonLine = (
    label: string,
    url: string,
    available: boolean,
  ) => {
    const inner = "    > " + label;
    if (!available) {
      return (
        <span style={{ color: B }}>{"    [ERR] CHECKOUT_URL not configured. Contact your operator."}</span>
      );
    }
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: G,
          textDecoration: "none",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = G;
          e.currentTarget.style.color = "#000000";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = G;
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {inner}
      </a>
    );
  };

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
          border: `1px solid ${B}`,
          boxShadow: "12px 12px 0px rgba(0, 0, 0, 0.9)",
          padding: "0 8px",
          margin: 0,
          whiteSpace: "pre",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {hrBorder}{"\n"}
        {headerLine}{"\n"}
        {hrBorder}{"\n"}
        {"\n"}
        {centeredLine(title, Y)}{"\n"}
        {centeredLine(subtitle, W)}{"\n"}
        {"\n"}
        {textLine(statusHeading, Y)}{"\n"}
        {textLine(statusLine1, W)}{"\n"}
        {statusLine2 ? <>{textLine(statusLine2, W)}{"\n"}</> : null}
        {"\n"}
        {textLine("[OPTION 1: SINGLE LICENSE]", Y)}{"\n"}
        {textLine(`One seat. One soul. ${PRO_QUOTA_LIMIT} credits of technical debt`, W)}{"\n"}
        {textLine("generation for a single developer who has given up.", W)}{"\n"}
        {"\n"}
        {buttonLine(singleLabel, UPGRADE_CHECKOUT_SINGLE, singleAvailable)}{"\n"}
        {"\n"}
        {textLine("[OPTION 2: MULTI-LICENSE PACK — 5 LICENSES]", Y)}{"\n"}
        {textLine("Five seats for the whole team. Because misery loves company,", W)}{"\n"}
        {textLine("and your manager wants everyone on the same page of suffering.", W)}{"\n"}
        {"\n"}
        {buttonLine(multiLabel, UPGRADE_CHECKOUT_MULTI, multiAvailable)}{"\n"}
        {"\n"}
        {textLine("[WHAT YOU GET]", Y)}{"\n"}
        {textLine(`• ${PRO_QUOTA_LIMIT} API credits per license (fewer 429s)`, W)}{"\n"}
        {textLine("• Access to premium models", W)}{"\n"}
        {textLine("• Priority queue for suffering", W)}{"\n"}
        {textLine("• A warm feeling of corporate compliance", W)}{"\n"}
        {textLine("• The mass right to mass-produce technical debt", W)}{"\n"}
        {"\n"}
        {hrBorder}{"\n"}
        {footerLine}{"\n"}
        {hrBorder}
      </pre>
    </div>
  );
}

export default UpgradeOverlay;

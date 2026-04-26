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

const bc = (s: string) => <span style={{ color: B }}>{s}</span>;

const BOX_W = 66; // inner width between ║ chars

function pad(text: string, width = BOX_W): string {
  return text + " ".repeat(Math.max(0, width - text.length));
}

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

  const topBorder = (
    <span style={{ color: B }}>{"╔" + "═".repeat(BOX_W) + "╗"}</span>
  );
  const midBorder = (
    <span style={{ color: B }}>{"╠" + "═".repeat(BOX_W) + "╣"}</span>
  );
  const botBorder = (
    <span style={{ color: B }}>{"╚" + "═".repeat(BOX_W) + "╝"}</span>
  );

  const emptyLine = (
    <>
      {bc("║")}<span style={{ color: W }}>{pad("")}</span>{bc("║")}
    </>
  );

  const textLine = (text: string, color = W) => (
    <>
      {bc("║")}<span style={{ color }}>{pad("  " + text)}</span>{bc("║")}
    </>
  );

  const centeredLine = (text: string, color = W) => {
    const totalPad = BOX_W - text.length;
    const left = Math.floor(totalPad / 2);
    const right = totalPad - left;
    return (
      <>
        {bc("║")}
        <span style={{ color }}>
          {" ".repeat(left) + text + " ".repeat(right)}
        </span>
        {bc("║")}
      </>
    );
  };

  const headerLine = (
    <>
      {bc("║")}
      <span style={{ color: B }}>
        {pad("             [ S Y S T E M   O V E R R I D E ]")}
      </span>
      {bc("║")}
    </>
  );

  const footerLine = (
    <>
      {bc("║")}
      <span style={{ color: DIM }}>
        {pad("             [Press ESC to return to mediocrity]")}
      </span>
      {bc("║")}
    </>
  );

  /* Button line: rendered as a clickable <a> inside the <pre> */
  const buttonLine = (
    label: string,
    url: string,
    available: boolean,
  ) => {
    const inner = "    > " + label;
    const padded = pad(inner);
    if (!available) {
      const errText = pad("    [ERR] CHECKOUT_URL not configured. Contact your operator.");
      return (
        <>
          {bc("║")}<span style={{ color: B }}>{errText}</span>{bc("║")}
        </>
      );
    }
    return (
      <>
        {bc("║")}
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
          {padded}
        </a>
        {bc("║")}
      </>
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
          boxShadow: "12px 12px 0px rgba(0, 0, 0, 0.9)",
          padding: 0,
          margin: 0,
          whiteSpace: "pre",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {topBorder}{"\n"}
        {headerLine}{"\n"}
        {midBorder}{"\n"}
        {emptyLine}{"\n"}
        {centeredLine(title, Y)}{"\n"}
        {centeredLine(subtitle, W)}{"\n"}
        {emptyLine}{"\n"}
        {textLine(statusHeading, Y)}{"\n"}
        {textLine(statusLine1, W)}{"\n"}
        {statusLine2 ? <>{textLine(statusLine2, W)}{"\n"}</> : null}
        {emptyLine}{"\n"}
        {textLine("[OPTION 1: SINGLE LICENSE]", Y)}{"\n"}
        {textLine(`One seat. One soul. ${PRO_QUOTA_LIMIT} credits of technical debt`, W)}{"\n"}
        {textLine("generation for a single developer who has given up.", W)}{"\n"}
        {emptyLine}{"\n"}
        {buttonLine(singleLabel, UPGRADE_CHECKOUT_SINGLE, singleAvailable)}{"\n"}
        {emptyLine}{"\n"}
        {textLine("[OPTION 2: MULTI-LICENSE PACK — 5 LICENSES]", Y)}{"\n"}
        {textLine("Five seats for the whole team. Because misery loves company,", W)}{"\n"}
        {textLine("and your manager wants everyone on the same page of suffering.", W)}{"\n"}
        {emptyLine}{"\n"}
        {buttonLine(multiLabel, UPGRADE_CHECKOUT_MULTI, multiAvailable)}{"\n"}
        {emptyLine}{"\n"}
        {textLine("[WHAT YOU GET]", Y)}{"\n"}
        {textLine(`• ${PRO_QUOTA_LIMIT} API credits per license (fewer 429s)`, W)}{"\n"}
        {textLine("• Access to premium models", W)}{"\n"}
        {textLine("• Priority queue for suffering", W)}{"\n"}
        {textLine("• A warm feeling of corporate compliance", W)}{"\n"}
        {textLine("• The mass right to mass-produce technical debt", W)}{"\n"}
        {emptyLine}{"\n"}
        {midBorder}{"\n"}
        {footerLine}{"\n"}
        {botBorder}
      </pre>
    </div>
  );
}

export default UpgradeOverlay;

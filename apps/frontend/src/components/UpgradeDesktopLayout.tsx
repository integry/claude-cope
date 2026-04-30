import type React from "react";
import {
  UPGRADE_CHECKOUT_SINGLE,
  UPGRADE_CHECKOUT_MULTI,
  PRO_QUOTA_LIMIT,
} from "../config";

/* ── shared constants (mirrored from UpgradeOverlay) ────────── */

const B = "#ff5555"; // border (red)
const Y = "#ffff55"; // yellow headings
const W = "#c9d1d9"; // soft off-white body text
const BW = "#ffffff"; // bright white (ANSI bold)
const G = "#4ade80"; // green buttons
const DIM = "#aaaaaa"; // dim footer

const INNER_W = 64; // inner content width (between ║ chars)
const MONO_FONT = "'Fira Code', 'Cascadia Code', 'Consolas', monospace";

/* ── types ──────────────────────────────────────────────────── */

export type LayoutProps = {
  singleLabel: string;
  multiLabel: string;
  singleAvailable: boolean;
  multiAvailable: boolean;
  quotaLine: string;
  dismissMode?: "manual" | "nag";
  onDismiss?: () => void;
};

/* ══════════════════════════════════════════════════════════════
   DESKTOP LAYOUT — original ASCII <pre> box
   ══════════════════════════════════════════════════════════════ */

export default function DesktopLayout({
  singleLabel,
  multiLabel,
  singleAvailable,
  multiAvailable,
  quotaLine,
  dismissMode = "manual",
  onDismiss,
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

  /** Like boxLine but accepts JSX content; caller must supply the exact char-length used. */
  const boxLineRich = (content: React.ReactNode, textLength: number) => {
    const padLen = Math.max(0, INNER_W - textLength);
    return (
      <>
        <span style={{ color: B }}>{"║"}</span>
        {content}
        <span>{" ".repeat(padLen)}</span>
        <span style={{ color: B }}>{"║"}</span>
      </>
    );
  };

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

  // Links open in same tab so the app receives checkout_id on return navigation.
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
  const canPointerDismiss = dismissMode === "manual" && !!onDismiss;

  return (
    <div
      className="upgrade-desktop fixed inset-0 z-50 flex items-center justify-center"
      onClick={canPointerDismiss ? onDismiss : undefined}
    >
      <div className="absolute inset-0 bg-black opacity-70" />

      <pre
        className="relative z-10 mx-4"
        onClick={(e) => e.stopPropagation()}
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
      >
        {topBorder}{"\n"}
        <span style={{ color: B }}>{"║"}</span>
        <span style={{ color: B }}>{" " + title + " ".repeat(titleGap - 1)}</span>
        {canPointerDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            style={{ color: DIM, background: "none", border: "none", padding: 0, font: "inherit", cursor: "pointer" }}
            title="Click to dismiss"
          >
            {closeBtn}
          </button>
        ) : dismissMode === "nag" ? (
          <span>{" ".repeat(closeBtn.length)}</span>
        ) : (
          <span
            style={{ color: DIM }}
            title="Press ESC to dismiss"
          >
            {closeBtn}
          </span>
        )}
        <span style={{ color: B }}>{" ".repeat(titlePadRight)}</span>
        <span style={{ color: B }}>{"║"}</span>
        {"\n"}
        {midBorder}{"\n"}
        {emptyLine}{"\n"}
        {centeredBoxLine("INITIALIZING UPGRADE: CLAUDE COPE [MAX 429X]", Y)}{"\n"}
        {boxLine(`  > ${quotaLine}`, DIM)}{"\n"}
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
        {(() => {
          const creditsStr = `${PRO_QUOTA_LIMIT} non-expiring credits`;
          const line1 = `  Unlocks: ${creditsStr}, multi-device sync,`;
          return boxLineRich(
            <span style={{ color: W }}>
              {"  Unlocks: "}
              <span style={{ color: BW, fontWeight: "bold" }}>{creditsStr}</span>
              {", "}
              <span style={{ color: BW, fontWeight: "bold" }}>multi-device sync</span>
              {","}
            </span>,
            line1.length,
          );
        })()}{"\n"}
        {boxLineRich(
          <span style={{ color: W }}>
            {"  priority generation queue, and "}
            <span style={{ color: BW, fontWeight: "bold" }}>advanced Cope models</span>
            {"."}
          </span>,
          "  priority generation queue, and advanced Cope models.".length,
        )}{"\n"}
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
            <span style={{ display: "inline" }} className="upgrade-esc-btn">
              <span style={{ color: B }}>{"║"}</span>
              {canPointerDismiss ? (
                <button
                  type="button"
                  onClick={onDismiss}
                  data-esc=""
                  style={{ color: DIM, background: "none", border: "none", padding: 0, font: "inherit", cursor: "pointer" }}
                >
                  {" ".repeat(left) + text + " ".repeat(right)}
                </button>
              ) : (
                <span
                  data-esc=""
                  style={{ color: DIM }}
                >
                  {" ".repeat(left) + text + " ".repeat(right)}
                </span>
              )}
              <span style={{ color: B }}>{"║"}</span>
            </span>
          );
        })()}{"\n"}
        {botBorder}
      </pre>
    </div>
  );
}

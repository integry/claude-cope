import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { UPGRADE_CHECKOUT_SINGLE, UPGRADE_CHECKOUT_MULTI, PRO_QUOTA_LIMIT } from "../config";
import { DEFAULT_CLOSE_EFFECT, type UpgradeNagCloseEffect } from "./upgradeOverlayEffects";

const B = "#ff5555"; // border (red)
const Y = "#ffff55"; // yellow headings
const W = "#c9d1d9"; // soft off-white body text
const BW = "#ffffff"; // bright white (ANSI bold)
const G = "#4ade80"; // green buttons
const DIM = "#aaaaaa"; // dim footer

const INNER_W = 64; // inner content width (between ║ chars)
const MONO_FONT = "'Fira Code', 'Cascadia Code', 'Consolas', monospace";
export const UPGRADE_OVERLAY_MOBILE_MAX_WIDTH = 640;

export type LayoutProps = {
  singleLabel: string;
  multiLabel: string;
  singleAvailable: boolean;
  multiAvailable: boolean;
  quotaLine: string;
  premiumCategoryCount: number;
  premiumGroups: Array<{
    id: string;
    title: string;
    summary: string;
  }>;
  dismissMode?: "manual" | "nag";
  dismissPhase?: "idle" | "closing";
  dismissEffect?: UpgradeNagCloseEffect;
  closeEffectPresentation?: {
    panelAnimation: string;
    backdropAnimation: string;
    overlayAnimation?: string;
  };
  onDismiss?: () => void;
};

const PANEL_STYLE = {
  fontFamily: MONO_FONT, fontSize: "13px", lineHeight: "1.1", backgroundColor: "#1e232b",
  boxShadow: "12px 12px 0px rgba(0, 0, 0, 0.9)", padding: 0, margin: 0, whiteSpace: "pre" as const, overflowX: "auto" as const, overflowY: "hidden" as const,
};

export default function DesktopLayout({
  singleLabel,
  multiLabel,
  singleAvailable,
  multiAvailable,
  quotaLine,
  premiumCategoryCount,
  premiumGroups,
  dismissMode = "manual",
  dismissPhase = "idle",
  dismissEffect = DEFAULT_CLOSE_EFFECT,
  closeEffectPresentation,
  onDismiss,
}: LayoutProps) {
  const optionRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const getIsDesktopViewport = useCallback(() => typeof window !== "undefined" && window.innerWidth > UPGRADE_OVERLAY_MOBILE_MAX_WIDTH, []);
  const [isDesktopViewport, setIsDesktopViewport] = useState(getIsDesktopViewport);
  const topBorder = <span style={{ color: B }}>{"╔" + "═".repeat(INNER_W) + "╗"}</span>;
  const midBorder = <span style={{ color: B }}>{"╠" + "═".repeat(INNER_W) + "╣"}</span>;
  const botBorder = <span style={{ color: B }}>{"╚" + "═".repeat(INNER_W) + "╝"}</span>;
  const boxLine = (text: string, color = W) => {
    const padded = text.length < INNER_W ? text + " ".repeat(INNER_W - text.length) : text.slice(0, INNER_W);
    return (
      <>
        <span style={{ color: B }}>{"║"}</span>
        <span style={{ color }}>{padded}</span>
        <span style={{ color: B }}>{"║"}</span>
      </>
    );
  };
  const emptyLine = boxLine("");
  const availableOptionIds = useMemo(
    () => [singleAvailable ? 0 : null, multiAvailable ? 1 : null].filter((id): id is number => id !== null),
    [singleAvailable, multiAvailable],
  );
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(availableOptionIds[0] ?? null);
  const boxLineRich = (content: React.ReactNode, textLength: number) => {
    const padLen = Math.max(0, INNER_W - textLength);
    return (
      <>
        <span style={{ color: B }}>{"║"}</span>
        {content}
        <span>{padLen > 0 ? " ".repeat(padLen) : ""}</span>
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
  const wrapText = (text: string, maxWidth = INNER_W - 2) => {
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length === 0) return [""];

    const lines: string[] = [];
    let currentLine = "";
    for (const word of words) {
      const nextLine = currentLine ? `${currentLine} ${word}` : word;
      if (nextLine.length <= maxWidth) {
        currentLine = nextLine;
        continue;
      }
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };
  const renderWrappedBoxLines = (text: string, color = W) =>
    wrapText(text).map((line, index) => (
      <span key={`${color}-${index}-${line}`}>
        {boxLine(`  ${line}`, color)}
        {"\n"}
      </span>
    ));
  const buttonBlock = (
    id: number,
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
    const selected = selectedOptionId === id;
    if (!available) return <>{boxLine("")}{"\n"}{boxLine("    [ERR] CHECKOUT_URL not configured.", B)}{"\n"}{boxLine("")}</>;
    return (
      <a
        href={url}
        ref={(element) => { optionRefs.current[id] = element; }}
        className={primary ? "upgrade-btn-primary" : "upgrade-btn-secondary"}
        data-selected={selected ? "true" : "false"}
        style={{
          display: "inline",
          textDecoration: "none",
          cursor: "pointer",
          backgroundColor: "transparent",
        }}
        tabIndex={isForcedClosing ? -1 : undefined}
        aria-hidden={isForcedClosing ? true : undefined}
        onClick={(e) => e.stopPropagation()}
        onFocus={() => { setSelectedOptionId(id); }}
      >
        <span style={{ color: B }}>{"║"}</span>
        <span style={{ color: "transparent" }}>{emptyInner}</span>
        <span style={{ color: B }}>{"║"}</span>{"\n"}
        <span style={{ color: B }}>{"║"}</span>
        <span style={{ color: "transparent" }}>{" ".repeat(MARGIN)}</span>
        <span data-cursor="" style={{ color: G, fontWeight: "bold" }}>
          {selected ? cursorPrefix : " ".repeat(cursorPrefix.length)}
        </span>
        <span data-btn="" style={{ backgroundColor: selected ? G : "transparent", color: selected ? "#0d1117" : G, fontWeight: "bold" }}>
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
  const isForcedClosing = dismissPhase === "closing";
  const creditsStr = `${PRO_QUOTA_LIMIT} non-expiring credits`;
  useEffect(() => {
    if (availableOptionIds.length === 0) {
      setSelectedOptionId(null);
      return;
    }
    if (selectedOptionId === null || !availableOptionIds.includes(selectedOptionId)) {
      setSelectedOptionId(availableOptionIds[0] ?? null);
    }
  }, [availableOptionIds, selectedOptionId]);
  useEffect(() => {
    const syncViewport = () => { setIsDesktopViewport(getIsDesktopViewport()); };
    window.addEventListener("resize", syncViewport);
    return () => { window.removeEventListener("resize", syncViewport); };
  }, [getIsDesktopViewport]);
  const cycleSelection = useCallback((direction: -1 | 1) => {
    if (availableOptionIds.length === 0) return;
    if (selectedOptionId === null) {
      setSelectedOptionId(availableOptionIds[0] ?? null);
      return;
    }
    const currentIndex = availableOptionIds.indexOf(selectedOptionId);
    const startIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (startIndex + direction + availableOptionIds.length) % availableOptionIds.length;
    setSelectedOptionId(availableOptionIds[nextIndex] ?? null);
  }, [availableOptionIds, selectedOptionId]);
  useEffect(() => {
    if (!isDesktopViewport || !isForcedClosing) return;
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement && overlayRef.current?.contains(activeElement)) {
      activeElement.blur();
    }
  }, [isDesktopViewport, isForcedClosing]);
  useEffect(() => {
    if (!isDesktopViewport) {
      const activeElement = document.activeElement;
      if (activeElement instanceof HTMLElement && overlayRef.current?.contains(activeElement)) {
        activeElement.blur();
      }
      return;
    }
    if (isForcedClosing) {
      overlayRef.current?.focus();
      return;
    }
    if (selectedOptionId !== null) {
      optionRefs.current[selectedOptionId]?.focus();
      return;
    }
    overlayRef.current?.focus();
  }, [isDesktopViewport, isForcedClosing, selectedOptionId]);
  useEffect(() => {
    if (!isDesktopViewport || isForcedClosing) return undefined;
    const overlay = overlayRef.current;
    if (!overlay) return undefined;
    const restoreFocus = () => { requestAnimationFrame(() => { if (!overlay.contains(document.activeElement)) overlay.focus(); }); };
    overlay.addEventListener("focusout", restoreFocus);
    return () => { overlay.removeEventListener("focusout", restoreFocus); };
  }, [isDesktopViewport, isForcedClosing]);
  const handleOverlayKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isDesktopViewport) return;
    if (isForcedClosing) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const target = event.target;
    const isEditableTarget = target instanceof HTMLElement
      && (target.isContentEditable
        || target.tagName === "INPUT"
        || target.tagName === "TEXTAREA"
        || target.tagName === "SELECT");
    if (isEditableTarget) return;
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      cycleSelection(-1);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      cycleSelection(1);
      return;
    }
    if (event.key === "Enter" && selectedOptionId !== null && target instanceof HTMLElement && target.tagName !== "A" && target.tagName !== "BUTTON") {
      event.preventDefault();
      optionRefs.current[selectedOptionId]?.click();
    }
  }, [cycleSelection, isDesktopViewport, isForcedClosing, selectedOptionId]);
  return (
    <div
      ref={overlayRef}
      className={`upgrade-desktop fixed inset-0 z-50 flex items-center justify-center${isForcedClosing ? " upgrade-overlay-closing" : ""}`}
      data-close-effect={dismissEffect}
      onClick={canPointerDismiss ? onDismiss : undefined}
      onKeyDown={handleOverlayKeyDown}
      tabIndex={-1}
      style={isForcedClosing && closeEffectPresentation?.overlayAnimation ? { animation: closeEffectPresentation.overlayAnimation } : undefined}
    >
      <div
        className="absolute inset-0 bg-black opacity-70 upgrade-overlay-backdrop"
        style={isForcedClosing ? { animation: closeEffectPresentation?.backdropAnimation } : undefined}
      />
      <pre
        className={`relative z-10 mx-4 upgrade-overlay-panel${isForcedClosing ? " upgrade-overlay-panel-closing" : ""}`}
        onClick={(e) => e.stopPropagation()}
        style={isForcedClosing && closeEffectPresentation ? { ...PANEL_STYLE, animation: closeEffectPresentation.panelAnimation, pointerEvents: "none" } : PANEL_STYLE}
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
          >{closeBtn}</button>
        ) : dismissMode === "nag" ? (
          <span>{" ".repeat(closeBtn.length)}</span>
        ) : (
          <span style={{ color: DIM }} title="Press ESC to dismiss">{closeBtn}</span>
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
        {boxLine("  Industry standards throttle capacity at 5x or 20x.")}{"\n"}
        {boxLine("  Claude Cope guarantees absolute system saturation.")}{"\n"}
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
        {boxLineRich(
          <span style={{ color: W }}>
            {"  Unlocks: "}
            <span style={{ color: BW, fontWeight: "bold" }}>{creditsStr}</span>
            {" and "}
            <span style={{ color: BW, fontWeight: "bold" }}>advanced Cope models</span>
            {"."}
          </span>,
          `  Unlocks: ${creditsStr} and advanced Cope models.`.length,
        )}{"\n"}
        {buttonBlock(0, singleLabel, UPGRADE_CHECKOUT_SINGLE, singleAvailable)}{"\n"}
        {emptyLine}{"\n"}
        {boxLine("  [OPTION 2: TEAM PACK - 5 LICENSES]", Y)}{"\n"}
        {boxLine("  Let the entire team achieve HTTP 429 compliance.")}{"\n"}
        {boxLine("  (5 activation keys will be sent to your email)", "#8892b0")}{"\n"}
        {buttonBlock(1, multiLabel, UPGRADE_CHECKOUT_MULTI, multiAvailable, false)}{"\n"}
        {emptyLine}{"\n"}
        {boxLine("  ---------------------------------------------------------")}{"\n"}
        {boxLine(`  [ APPENDIX: ${premiumCategoryCount} NEW MAX CATEGORIES UNLOCKED ]`, Y)}{"\n"}
        {emptyLine}{"\n"}
        {premiumGroups.map((group) => (
          <span key={group.id}>
            {renderWrappedBoxLines(`* ${group.title.toUpperCase()}: ${group.summary}`)}
          </span>
        ))}
        {midBorder}{"\n"}
        {(() => {
          const text = "[Press ESC to retain your net worth]";
          const left = Math.max(0, Math.floor((INNER_W - text.length) / 2));
          const paddedText = " ".repeat(left) + text + " ".repeat(Math.max(0, INNER_W - text.length - left));
          return <span style={{ display: "inline" }} className="upgrade-esc-btn"><span style={{ color: B }}>{"║"}</span>{canPointerDismiss ? <button type="button" onClick={onDismiss} data-esc="" style={{ color: DIM, background: "none", border: "none", padding: 0, font: "inherit", cursor: "pointer" }}>{paddedText}</button> : <span data-esc="" style={{ color: DIM }}>{paddedText}</span>}<span style={{ color: B }}>{"║"}</span></span>;
        })()}{"\n"}
        {botBorder}
      </pre>
    </div>
  );
}

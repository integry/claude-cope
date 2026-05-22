import { PRO_QUOTA_LIMIT, UPGRADE_CHECKOUT_MULTI, UPGRADE_CHECKOUT_SINGLE } from "../config";
import type { CSSProperties } from "react";
import type { LayoutProps } from "./UpgradeDesktopLayout";
import { openBoundCheckoutUrl } from "./checkoutLinks";
import {
  DEFAULT_CLOSE_EFFECT,
  getCloseEffectPresentation,
} from "./upgradeOverlayEffects";

const B = "#ff5555"; // border (red)
const Y = "#ffff55"; // yellow headings
const W = "#c9d1d9"; // soft off-white body text
const G = "#4ade80"; // green buttons
const DIM = "#aaaaaa"; // dim footer

const MONO_FONT = "'Courier New', 'Courier Prime', Courier, monospace";

type BenchmarkCard = {
  label: string;
  outcome: string;
  color: string;
  borderColor: string;
  className: string;
  fontWeight?: CSSProperties["fontWeight"];
};

export default function UpgradeMobileLayout({
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
  const dismissButtonStyle = {
    color: DIM,
    fontSize: "14px",
    background: "none",
    border: "none",
    padding: 0,
    font: "inherit",
    cursor: "pointer",
  } as const;
  const benchmarkCards: readonly BenchmarkCard[] = [
    {
      label: "Legacy AI",
      outcome: "Outcome: Manageable pull requests",
      color: DIM,
      borderColor: DIM,
      className: "upgrade-mobile-benchmark-card upgrade-mobile-benchmark-card-muted",
      fontWeight: undefined,
    },
    {
      label: "Claude Cope",
      outcome: "Outcome: Unmitigated request storms",
      color: G,
      borderColor: G,
      className: "upgrade-mobile-benchmark-card upgrade-mobile-benchmark-card-accent",
      fontWeight: "bold",
    },
  ] as const;
  const mobileOptions = [
    {
      key: "single",
      heading: "[OPTION 1: SINGLE LICENSE] [LEAST TERRIBLE]",
      body: `One seat. Unlocks ${PRO_QUOTA_LIMIT} lifetime credits and advanced Cope models.`,
      ctaLabel: singleLabel,
      ctaUrl: UPGRADE_CHECKOUT_SINGLE,
      ctaAvailable: singleAvailable,
      ctaPrimary: true,
      extra: null,
    },
    {
      key: "multi",
      heading: multiOptionHeading,
      body: multiOptionDescription,
      ctaLabel: multiLabel,
      ctaUrl: UPGRADE_CHECKOUT_MULTI,
      ctaAvailable: multiAvailable,
      ctaPrimary: false,
      extra: null,
    },
  ] as const;

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
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void openBoundCheckoutUrl(url).catch(() => {
            window.alert("Checkout could not be bound to this session. Please retry.");
          });
        }}
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
          maxHeight: "80vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          color: W,
          ...(isForcedClosing ? { animation: closeEffectPresentation.panelAnimation, pointerEvents: "none" as const } : {}),
        }}
      >
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
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            style={dismissButtonStyle}
            title="Tap to dismiss"
          >
            [x]
          </button>
        </div>

        <div
          className="upgrade-mobile-scroll"
          style={{
            flex: "1 1 auto",
            minHeight: 0,
            overflowY: "auto",
          }}
        >
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

          <div className="upgrade-mobile-section" style={sectionStyle}>
            <div style={{ color: Y, fontWeight: "bold", marginBottom: "6px", fontSize: "12px" }}>
              [ THROUGHPUT BENCHMARKS ]
            </div>
            <div style={{ fontSize: "12px", lineHeight: "1.5" }}>
              Industry standards stop at 5x.
              Claude Cope guarantees absolute system saturation.
            </div>
          </div>

          <div className="upgrade-mobile-section" style={{ ...sectionStyle, fontSize: "11px" }}>
            {benchmarkCards.map((card, index) => (
              <div
                key={card.label}
                className={card.className}
                style={{
                  border: `1px solid ${card.borderColor}`,
                  marginBottom: index === 0 ? "4px" : undefined,
                  padding: "6px 8px",
                }}
              >
                <span className="upgrade-mobile-benchmark-label" style={{ color: card.color, fontWeight: card.fontWeight }}>
                  {card.label}
                </span>
                <span className="upgrade-mobile-benchmark-outcome">{card.outcome}</span>
              </div>
            ))}
          </div>

          <hr style={hrStyle} />

          {mobileOptions.map((option, index) => (
            <div key={option.key}>
              <div className="upgrade-mobile-section" style={sectionStyle}>
                <div style={{ color: Y, fontWeight: "bold", marginBottom: "4px", fontSize: "12px" }}>
                  {option.heading}
                </div>
                <div style={{ fontSize: "12px", lineHeight: "1.5", marginBottom: option.extra ? "4px" : "8px" }}>
                  {option.body}
                </div>
                {option.extra}
                {mobileButton(option.ctaLabel, option.ctaUrl, option.ctaAvailable, option.ctaPrimary)}
              </div>
              {index === 0 ? <div style={{ height: "1px" }} /> : null}
            </div>
          ))}

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

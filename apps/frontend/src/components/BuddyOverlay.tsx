import type { CSSProperties, RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import { BuddyDisplay } from "./BuddyDisplay";
import type { GameState } from "../hooks/useGameState";

type BuddyOverlayProps = {
  buddy: GameState["buddy"];
  bottomOffset: number;
  containerRef: RefObject<HTMLDivElement | null>;
};

const BUDDY_OVERLAY_LEFT_PADDING = 12;
const BUDDY_OVERLAY_TOP_PADDING = 12;
const BUDDY_OVERLAY_MIN_SCALE = 0.35;

type BuddyOverlayStyle = CSSProperties & {
  "--terminal-buddy-offset": string;
  "--terminal-buddy-scale": number;
};

function clampBuddyScale(scale: number) {
  return Math.max(BUDDY_OVERLAY_MIN_SCALE, Math.min(1, scale));
}

function getBuddyOverlayScale({
  containerWidth,
  containerHeight,
  rightInset,
  bottomOffset,
  overlayWidth,
  overlayHeight,
}: {
  containerWidth: number;
  containerHeight: number;
  rightInset: number;
  bottomOffset: number;
  overlayWidth: number;
  overlayHeight: number;
}) {
  const widthScale =
    overlayWidth > 0
      ? clampBuddyScale(
          (containerWidth - rightInset - BUDDY_OVERLAY_LEFT_PADDING) /
            overlayWidth,
        )
      : 1;
  const heightScale =
    overlayHeight > 0
      ? clampBuddyScale(
          (containerHeight - bottomOffset - BUDDY_OVERLAY_TOP_PADDING) /
            overlayHeight,
        )
      : 1;

  return Math.min(widthScale, heightScale);
}

export function BuddyOverlay({
  buddy,
  bottomOffset,
  containerRef,
}: BuddyOverlayProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!buddy.type) {
      return undefined;
    }

    const overlay = overlayRef.current;
    if (!overlay) {
      return undefined;
    }

    const setScaleIfChanged = (nextScale: number) => {
      setScale((currentScale) =>
        currentScale === nextScale ? currentScale : nextScale,
      );
    };

    const updateScale = () => {
      const container = containerRef.current;
      const width = overlay.scrollWidth;
      const height = overlay.scrollHeight;

      if (!width || !height || !container) {
        setScaleIfChanged(1);
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const overlayRect = overlay.getBoundingClientRect();
      const rightInset = Math.max(0, containerRect.right - overlayRect.right);
      const nextScale = getBuddyOverlayScale({
        containerWidth: containerRect.width,
        containerHeight: containerRect.height,
        rightInset,
        bottomOffset,
        overlayWidth: width,
        overlayHeight: height,
      });

      setScaleIfChanged(nextScale);
    };

    updateScale();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(updateScale);
      resizeObserver.observe(overlay);
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }
    }

    window.addEventListener("resize", updateScale);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, [bottomOffset, buddy.type, containerRef]);

  if (!buddy.type) {
    return null;
  }

  const overlayStyle: BuddyOverlayStyle = {
    "--terminal-buddy-offset": `${bottomOffset}px`,
    "--terminal-buddy-scale": scale,
  };

  return (
    <div
      ref={overlayRef}
      className="terminal-buddy-overlay"
      style={overlayStyle}
      aria-hidden="true"
    >
      <BuddyDisplay
        type={buddy.type}
        isShiny={buddy.isShiny}
        className="terminal-buddy-display"
      />
    </div>
  );
}

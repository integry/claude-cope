import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { BuddyDisplay } from "./BuddyDisplay";
import { getBuddyOverlayScale } from "./buddyOverlayScale";
import type { GameState } from "../hooks/useGameState";

type BuddyOverlayProps = {
  buddy: GameState["buddy"];
  containerRef: RefObject<HTMLDivElement | null>;
  bottomChromeRef: RefObject<HTMLDivElement | null>;
};

const DEFAULT_BUDDY_BOTTOM_OFFSET = 56;
const BUDDY_RIGHT_INSET = 12;
const BUDDY_BOTTOM_GAP = 8;

function getVisibleFooterHeight(container: HTMLDivElement) {
  return Array.from(container.querySelectorAll("footer")).reduce((maxHeight, footer) => {
    const { height } = footer.getBoundingClientRect();
    return Math.max(maxHeight, height);
  }, 0);
}

export function BuddyOverlay({
  buddy,
  containerRef,
  bottomChromeRef,
}: BuddyOverlayProps) {
  const displayRef = useRef<HTMLDivElement | null>(null);
  const [overlayMetrics, setOverlayMetrics] = useState({
    bottomOffset: DEFAULT_BUDDY_BOTTOM_OFFSET,
    scale: 1,
  });

  useLayoutEffect(() => {
    if (!buddy.type) {
      return undefined;
    }

    const measure = () => {
      const container = containerRef.current;
      const display = displayRef.current;

      if (!container || !display) {
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const bottomChromeRect = bottomChromeRef.current?.getBoundingClientRect() ?? null;
      const bottomOffset = bottomChromeRect
        ? Math.max(
            getVisibleFooterHeight(container) + BUDDY_BOTTOM_GAP,
            containerRect.bottom - bottomChromeRect.top + BUDDY_BOTTOM_GAP,
          )
        : getVisibleFooterHeight(container) + BUDDY_BOTTOM_GAP;
      const overlayWidth = display.offsetWidth;
      const overlayHeight = display.offsetHeight;
      const scale = getBuddyOverlayScale({
        containerWidth: containerRect.width,
        containerHeight: containerRect.height,
        rightInset: BUDDY_RIGHT_INSET,
        bottomOffset,
        overlayWidth,
        overlayHeight,
      });

      setOverlayMetrics((current) => {
        if (
          current.bottomOffset === bottomOffset &&
          Math.abs(current.scale - scale) < 0.001
        ) {
          return current;
        }
        return { bottomOffset, scale };
      });
    };

    measure();

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            measure();
          })
        : null;

    if (resizeObserver) {
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
        for (const footer of containerRef.current.querySelectorAll("footer")) {
          resizeObserver.observe(footer);
        }
      }
      if (bottomChromeRef.current) {
        resizeObserver.observe(bottomChromeRef.current);
      }
      if (displayRef.current) {
        resizeObserver.observe(displayRef.current);
      }
    } else {
      window.addEventListener("resize", measure);
    }

    return () => {
      resizeObserver?.disconnect();
      if (!resizeObserver) {
        window.removeEventListener("resize", measure);
      }
    };
  }, [buddy.type, bottomChromeRef, containerRef]);

  if (!buddy.type) {
    return null;
  }

  const isHidden = overlayMetrics.scale === 0;
  const overlayStyle = {
    "--terminal-buddy-bottom-offset": `${overlayMetrics.bottomOffset}px`,
    opacity: isHidden ? 0 : 1,
    transform: `scale(${overlayMetrics.scale})`,
    visibility: isHidden ? "hidden" : "visible",
  } as CSSProperties;

  return (
    <div
      className="terminal-buddy-overlay"
      aria-hidden="true"
      data-buddy-hidden={isHidden ? "true" : "false"}
      data-buddy-scale={overlayMetrics.scale.toFixed(3)}
      style={overlayStyle}
    >
      <div ref={displayRef} className="terminal-buddy-overlay-measure">
        <BuddyDisplay
          type={buddy.type}
          isShiny={buddy.isShiny}
          className="terminal-buddy-display"
        />
      </div>
    </div>
  );
}

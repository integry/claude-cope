import type { RefObject } from "react";
import { BuddyDisplay } from "./BuddyDisplay";
import type { GameState } from "../hooks/useGameState";

type BuddyOverlayProps = {
  buddy: GameState["buddy"];
  containerRef: RefObject<HTMLDivElement | null>;
  bottomChromeRef: RefObject<HTMLDivElement | null>;
};

export function BuddyOverlay({
  buddy,
  containerRef: _containerRef,
  bottomChromeRef: _bottomChromeRef,
}: BuddyOverlayProps) {
  if (!buddy.type) {
    return null;
  }

  return (
    <div className="terminal-buddy-overlay" aria-hidden="true">
      <BuddyDisplay
        type={buddy.type}
        isShiny={buddy.isShiny}
        className="terminal-buddy-display"
      />
    </div>
  );
}

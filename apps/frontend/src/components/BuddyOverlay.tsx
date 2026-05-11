import { BuddyDisplay } from "./BuddyDisplay";
import type { GameState } from "../hooks/useGameState";

type BuddyOverlayProps = {
  buddy: GameState["buddy"];
};

export function BuddyOverlay({ buddy }: BuddyOverlayProps) {
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

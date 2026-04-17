import { useEffect, useState } from "react";

/**
 * Tracks whether the user has acknowledged an incoming review ping via any
 * interaction (mouse move, keypress, or touch). While a ping is pending and
 * unacknowledged, the calling component flashes the screen; once acknowledged,
 * flashing stops without resolving the ping itself. Resets on each new ping.
 */
export function usePingAcknowledged(pendingReviewPing: unknown): boolean {
  const [pingAcknowledged, setPingAcknowledged] = useState(false);
  useEffect(() => {
    setPingAcknowledged(false);
    if (!pendingReviewPing) return;
    const acknowledge = () => setPingAcknowledged(true);
    window.addEventListener("mousemove", acknowledge, { passive: true });
    window.addEventListener("keydown", acknowledge);
    window.addEventListener("touchstart", acknowledge, { passive: true });
    return () => {
      window.removeEventListener("mousemove", acknowledge);
      window.removeEventListener("keydown", acknowledge);
      window.removeEventListener("touchstart", acknowledge);
    };
  }, [pendingReviewPing]);
  return pingAcknowledged;
}

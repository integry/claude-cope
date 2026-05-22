import { useLiveTicker } from "../hooks/useLiveTicker";
import TickerDisplay from "./TickerDisplay";

interface TickerProps {
  onExpand?: () => void;
  onSlashCommand: (command: string) => void;
  onlineCount: number;
}

// We isolate the Ticker component to prevent re-renders of the entire Terminal
// when new events arrive. It fetches data independently via the SWR hook.
export default function Ticker({ onExpand, onSlashCommand, onlineCount }: TickerProps) {
  // Switch to the hybrid hook to receive real-time updates via Supabase
  const liveEvents = useLiveTicker();

  if (!liveEvents || liveEvents.length === 0) return null;

  const latestEvent = liveEvents[0]!;
  return <TickerDisplay latestEvent={latestEvent} onExpand={onExpand} onSlashCommand={onSlashCommand} onlineCount={onlineCount} />;
}

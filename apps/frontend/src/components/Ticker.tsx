import { useLiveTicker } from "../hooks/useLiveTicker";

interface TickerProps {
  onExpand?: () => void;
  onSlashCommand?: (command: string) => void;
  onlineCount: number;
}

// We isolate the Ticker component to prevent re-renders of the entire Terminal
// when new events arrive. It fetches data independently via the SWR hook.
export default function Ticker({ onExpand, onSlashCommand, onlineCount }: TickerProps) {
  // Switch to the hybrid hook to receive real-time updates via Supabase
  const liveEvents = useLiveTicker();

  if (!liveEvents || liveEvents.length === 0) return null;

  const latestEvent = liveEvents[0]!;
  const handleHeaderCommand = (command: string) => onSlashCommand?.(command);

  return (
    <div
      className="hidden sm:block w-full bg-gray-900 border-b border-gray-700 text-green-400 text-xs py-1 px-2 cursor-pointer hover:bg-gray-800 transition-colors"
      onClick={onExpand}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onExpand?.();
        }
      }}
    >
      <div className="flex items-center justify-between">
        <span className="min-w-0 truncate">
          <strong className="text-yellow-400 bg-yellow-950/30 px-1 rounded">[LIVE]</strong>{" "}
          {latestEvent.message}
        </span>
        <span className="flex-shrink-0 flex items-center gap-0 ml-4 text-gray-400">
          <button
            type="button"
            className="header-link"
            onClick={(event) => {
              event.stopPropagation();
              handleHeaderCommand("/who");
            }}
          >
            <span className="text-gray-400">Online:</span>{" "}
            <span className="text-green-400">{onlineCount}</span>{" "}
            <span>[/who]</span>
          </button>
          <span className="mx-3 text-gray-500" aria-hidden="true">|</span>
          <button
            type="button"
            className="header-link"
            onClick={(event) => {
              event.stopPropagation();
              handleHeaderCommand("/party");
            }}
          >
            Firehose [/party]
          </button>
          <span className="mx-3 text-gray-500" aria-hidden="true">|</span>
          <button
            type="button"
            className="header-link"
            onClick={(event) => {
              event.stopPropagation();
              handleHeaderCommand("/leaderboard");
            }}
          >
            Hall of Blame [/leaderboard]
          </button>
        </span>
      </div>
    </div>
  );
}

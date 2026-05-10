import { useLiveTicker } from "../hooks/useLiveTicker";

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
  const handleHeaderCommand = (command: string) => onSlashCommand(command);

  return (
    <div
      className="hidden sm:block w-full bg-gray-900 border-b border-gray-700 text-green-400 text-xs pt-2 pb-1 px-2 hover:bg-gray-800 transition-colors"
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="min-w-0 flex-1 cursor-pointer truncate border-0 bg-transparent p-0 text-left text-inherit hover:bg-gray-800 transition-colors"
          onClick={onExpand}
        >
          <strong className="text-yellow-400 bg-yellow-950/30 px-1 rounded">[LIVE]</strong>{" "}
          {latestEvent.message}
        </button>
        <div className="ml-4 flex flex-shrink-0 items-center gap-0 text-gray-400">
          <button
            type="button"
            className="ticker-header-link"
            onClick={(e) => {
              e.stopPropagation();
              handleHeaderCommand("/who");
            }}
          >
            <span className="text-gray-400">Online:</span>{" "}
            <span className="text-green-400">{onlineCount}</span>{" "}
            <span className="ticker-header-link-command">[/who]</span>
          </button>
          <span className="mx-3 text-gray-500" aria-hidden="true">|</span>
          <button
            type="button"
            className="ticker-header-link"
            onClick={(e) => {
              e.stopPropagation();
              handleHeaderCommand("/party");
            }}
          >
            <span className="text-gray-400">Firehose</span>{" "}
            <span className="ticker-header-link-command">[/party]</span>
          </button>
          <span className="mx-3 text-gray-500" aria-hidden="true">|</span>
          <button
            type="button"
            className="ticker-header-link"
            onClick={(e) => {
              e.stopPropagation();
              handleHeaderCommand("/leaderboard");
            }}
          >
            <span className="text-gray-400">Hall of Blame</span>{" "}
            <span className="ticker-header-link-command">[/leaderboard]</span>
          </button>
        </div>
      </div>
    </div>
  );
}

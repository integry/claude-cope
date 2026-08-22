import type { GameEvent } from "../hooks/useRecentEvents";

interface TickerDisplayProps {
  latestEvent: GameEvent;
  onExpand?: () => void;
  onSlashCommand: (command: string) => void;
  onlineCount: number;
  showPartyLink?: boolean;
  showHeaderLinks?: boolean;
}

export default function TickerDisplay({ latestEvent, onExpand, onSlashCommand, onlineCount, showPartyLink = true, showHeaderLinks = true }: TickerDisplayProps) {
  const handleHeaderCommand = (command: string) => onSlashCommand(command);

  return (
    <div className="hidden sm:block w-full bg-gray-900 border-b border-gray-700 text-green-400 text-xs pt-2 pb-1 px-2 hover:bg-gray-800 transition-colors">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="min-w-0 flex-1 cursor-pointer truncate border-0 bg-transparent p-0 text-left text-inherit hover:bg-gray-800 transition-colors"
          onClick={onExpand}
        >
          <strong className="text-yellow-400 bg-yellow-950/30 px-1 rounded">[LIVE]</strong>{" "}
          {latestEvent.message}
        </button>
        {showHeaderLinks ? (
          <div className="ml-4 flex flex-shrink-0 items-center gap-1 text-gray-400">
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
            {showPartyLink ? (
              <>
                <span className="mx-3 text-gray-500" aria-hidden="true"> | </span>
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
              </>
            ) : null}
            <span className="mx-3 text-gray-500" aria-hidden="true"> | </span>
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
        ) : null}
      </div>
    </div>
  );
}

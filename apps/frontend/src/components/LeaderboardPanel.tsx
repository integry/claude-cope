import AsciiBox from "./AsciiBox";
import type { CSSProperties, ReactNode } from "react";

export type LeaderboardEntry = {
  id: string;
  username: string;
  country: string;
  corporate_rank: string;
  display_rank?: string | null;
  technical_debt: number;
  created_at: string;
  is_executive_supporter: boolean | number;
};

type LeaderboardPanelProps = {
  entries: LeaderboardEntry[];
  loading?: boolean;
  error?: string | null;
  onClose?: () => void;
  controls?: ReactNode;
  emptyText?: string;
  footerText?: string;
  className?: string;
  style?: CSSProperties;
};

export default function LeaderboardPanel({
  entries,
  loading = false,
  error = null,
  onClose,
  controls,
  emptyText = "[∅] No entries yet. Keep prompting to climb the ranks.",
  footerText,
  className = "",
  style,
}: LeaderboardPanelProps) {
  return (
    <div
      className={`fixed right-0 top-0 h-full w-80 border-l border-gray-700 flex flex-col z-20 ${className}`.trim()}
      style={{ backgroundColor: "var(--color-bg)", ...style }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <span className="text-green-400 font-bold text-sm">
          &gt; cat /var/log/hall_of_blame
        </span>
        {onClose ? (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 text-sm"
          >
            [x]
          </button>
        ) : <span className="text-gray-600 text-sm">[x]</span>}
      </div>

      <div className="px-4 py-2 border-b border-gray-700 text-green-400 text-xs font-bold">
        <AsciiBox lines={["HALL OF BLAME - TOP 50", "technical debt rankings"]} />
      </div>

      {controls ? <div className="px-4 py-2 border-b border-gray-700 flex gap-2">{controls}</div> : null}

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {loading && (
          <div className="text-green-400 text-xs animate-pulse">
            [⚙️] SELECT * FROM hall_of_blame ORDER BY technical_debt DESC LIMIT 50...
          </div>
        )}

        {error && (
          <div className="text-red-400 text-xs">
            [❌] Query failed: {error}
          </div>
        )}

        {!loading && !error && entries.length === 0 && (
          <div className="text-gray-500 text-xs">{emptyText}</div>
        )}

        {!loading && !error && entries.length > 0 && (
          <>
            <div className="text-gray-500 text-xs border-b border-gray-800 pb-1 mb-1 flex justify-between">
              <span>#   NAME</span>
              <span>DEBT</span>
            </div>
            {entries.map((entry, i) => {
              const rank = String(i + 1).padStart(2, " ");
              const countryId = (entry.country && entry.country !== "Unknown") ? entry.country : "\u00A0\u00A0";
              const isExecutiveSupporter = entry.is_executive_supporter === true || entry.is_executive_supporter === 1;
              const hasVanityTitle = Boolean(entry.display_rank);
              const rowClassName = [
                "leaderboard-row",
                i === 0
                  ? "leaderboard-row-podium-1"
                  : i === 1
                    ? "leaderboard-row-podium-2"
                    : i === 2
                      ? "leaderboard-row-podium-3"
                      : "leaderboard-row-standard",
                isExecutiveSupporter ? "leaderboard-row-supporter" : "",
              ].filter(Boolean).join(" ");
              return (
                <div
                  key={entry.id}
                  className={rowClassName}
                >
                  <span className="flex-1 min-w-0 truncate leaderboard-row-main">
                    <span className="text-gray-500 inline-block w-[2ch]">{countryId}</span>{" "}
                    <span>{rank}.</span>{" "}
                    <span className={isExecutiveSupporter ? "leaderboard-supporter-username" : undefined}>{entry.username}</span>{" "}
                    {isExecutiveSupporter && (
                      <span
                        className="leaderboard-supporter-badge"
                        aria-label="Executive Supporter"
                        title="Executive Supporter"
                      >
                        EXEC
                      </span>
                    )}{" "}
                    <span className={hasVanityTitle ? "leaderboard-vanity-rank-chip" : isExecutiveSupporter ? "leaderboard-supporter-rank-chip" : "text-gray-400"}>
                      [{entry.corporate_rank}]
                    </span>
                  </span>
                  <span className="flex-shrink-0 text-right w-24 text-green-400">
                    {entry.technical_debt.toLocaleString()} TD
                  </span>
                </div>
              );
            })}
            <div className="text-gray-600 text-xs mt-2 border-t border-gray-800 pt-2">
              {footerText ?? `[${entries.length} rows returned] — Scores update automatically`}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

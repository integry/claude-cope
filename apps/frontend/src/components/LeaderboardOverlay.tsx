import { useState, useEffect } from "react";
import { API_BASE } from "../config";
import AsciiBox from "./AsciiBox";

type LeaderboardEntry = {
  id: string;
  username: string;
  country: string;
  corporate_rank: string;
  technical_debt: number;
  created_at: string;
};

type LeaderboardOverlayProps = {
  onClose: () => void;
};

function LeaderboardOverlay({ onClose }: LeaderboardOverlayProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/leaderboard`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        return res.json();
      })
      .then((data: LeaderboardEntry[]) => {
        setEntries(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="fixed right-0 top-0 h-full w-80 border-l border-gray-700 flex flex-col z-20" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <span className="text-green-400 font-bold text-sm">
          &gt; cat /var/log/hall_of_blame
        </span>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-300 text-sm"
        >
          [x]
        </button>
      </div>

      <div className="px-4 py-2 border-b border-gray-700 text-green-400 text-xs font-bold">
        <AsciiBox lines={["HALL OF BLAME - TOP 50", "technical debt rankings"]} />
      </div>

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
          <div className="text-gray-500 text-xs">
            [∅] No entries yet. Keep prompting to climb the ranks.
          </div>
        )}

        {!loading && !error && entries.length > 0 && (
          <>
            <div className="text-gray-500 text-xs border-b border-gray-800 pb-1 mb-1 flex justify-between">
              <span>#   NAME</span>
              <span>DEBT</span>
            </div>
            {entries.map((entry, i) => {
              const medal = i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : "  ";
              const rank = String(i + 1).padStart(2, " ");
              return (
                <div
                  key={entry.id}
                  className={`flex justify-between text-xs font-mono py-0.5 ${
                    i === 0
                      ? "text-yellow-300"
                      : i === 1
                        ? "text-gray-300"
                        : i === 2
                          ? "text-amber-600"
                          : "text-gray-500"
                  }`}
                >
                  <span className="flex-1 min-w-0 truncate">
                    {medal} {rank}. {entry.username} [{entry.country}]
                  </span>
                  <span className="flex-shrink-0 text-right w-24 text-green-400">
                    {entry.technical_debt.toLocaleString()} TD
                  </span>
                </div>
              );
            })}
            <div className="text-gray-600 text-xs mt-2 border-t border-gray-800 pt-2">
              [{entries.length} rows returned] — Scores update automatically
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default LeaderboardOverlay;

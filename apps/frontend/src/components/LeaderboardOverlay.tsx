import { useState, useEffect, useRef, type CSSProperties } from "react";
import { API_BASE } from "../config";
import LeaderboardPanel, { type LeaderboardEntry } from "./LeaderboardPanel";

type LeaderboardOverlayProps = {
  onClose: () => void;
};

type TimeframeOption = "all" | "weekly" | "daily";
type CountryOption = string;

const TIMEFRAME_OPTIONS: { value: TimeframeOption; label: string }[] = [
  { value: "all", label: "All Time" },
  { value: "weekly", label: "Weekly" },
  { value: "daily", label: "Daily" },
];

const ALL_COUNTRIES: { code: string; name: string }[] = [
  { code: "AF", name: "Afghanistan" }, { code: "AL", name: "Albania" }, { code: "DZ", name: "Algeria" },
  { code: "AR", name: "Argentina" }, { code: "AU", name: "Australia" }, { code: "AT", name: "Austria" },
  { code: "BD", name: "Bangladesh" }, { code: "BE", name: "Belgium" }, { code: "BR", name: "Brazil" },
  { code: "CA", name: "Canada" }, { code: "CL", name: "Chile" }, { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" }, { code: "HR", name: "Croatia" }, { code: "CZ", name: "Czechia" },
  { code: "DK", name: "Denmark" }, { code: "EG", name: "Egypt" }, { code: "EE", name: "Estonia" },
  { code: "FI", name: "Finland" }, { code: "FR", name: "France" }, { code: "DE", name: "Germany" },
  { code: "GR", name: "Greece" }, { code: "HK", name: "Hong Kong" }, { code: "HU", name: "Hungary" },
  { code: "IN", name: "India" }, { code: "ID", name: "Indonesia" }, { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" }, { code: "IT", name: "Italy" }, { code: "JP", name: "Japan" },
  { code: "KE", name: "Kenya" }, { code: "KR", name: "South Korea" }, { code: "LV", name: "Latvia" },
  { code: "LT", name: "Lithuania" }, { code: "MY", name: "Malaysia" }, { code: "MX", name: "Mexico" },
  { code: "MA", name: "Morocco" }, { code: "NL", name: "Netherlands" }, { code: "NZ", name: "New Zealand" },
  { code: "NG", name: "Nigeria" }, { code: "NO", name: "Norway" }, { code: "PK", name: "Pakistan" },
  { code: "PE", name: "Peru" }, { code: "PH", name: "Philippines" }, { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" }, { code: "RO", name: "Romania" }, { code: "RU", name: "Russia" },
  { code: "SA", name: "Saudi Arabia" }, { code: "RS", name: "Serbia" }, { code: "SG", name: "Singapore" },
  { code: "SK", name: "Slovakia" }, { code: "ZA", name: "South Africa" }, { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" }, { code: "CH", name: "Switzerland" }, { code: "TW", name: "Taiwan" },
  { code: "TH", name: "Thailand" }, { code: "TR", name: "Turkey" }, { code: "UA", name: "Ukraine" },
  { code: "AE", name: "UAE" }, { code: "GB", name: "United Kingdom" }, { code: "US", name: "United States" },
  { code: "VN", name: "Vietnam" },
];

const LEGACY_LEADERBOARD_OVERLAY_WIDTH_REM = 20;
const LEADERBOARD_OVERLAY_WIDTH_REM = LEGACY_LEADERBOARD_OVERLAY_WIDTH_REM * 1.5;
const LEADERBOARD_OVERLAY_MAX_WIDTH = "calc(100vw - 1rem)";
const LEADERBOARD_OVERLAY_STYLE = {
  backgroundColor: "var(--color-bg)",
  width: `${LEADERBOARD_OVERLAY_WIDTH_REM}rem`,
  maxWidth: LEADERBOARD_OVERLAY_MAX_WIDTH,
} satisfies CSSProperties;

function LeaderboardOverlay({ onClose }: LeaderboardOverlayProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<TimeframeOption>("all");
  const [country, setCountry] = useState<CountryOption>("all");
  const [countrySearch, setCountrySearch] = useState("");
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (timeframe !== "all") params.append("timeframe", timeframe);
    if (country !== "all") params.append("country", country);
    const queryString = params.toString();
    const url = `${API_BASE}/api/leaderboard${queryString ? `?${queryString}` : ""}`;

    fetch(url)
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
  }, [timeframe, country]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = ALL_COUNTRIES.filter((c) => {
    const q = countrySearch.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
  });

  const selectedCountryLabel = country === "all" ? "All Countries" : (ALL_COUNTRIES.find((c) => c.code === country)?.name ?? country);

  return (
    <LeaderboardPanel
      entries={entries}
      loading={loading}
      error={error}
      onClose={onClose}
      style={LEADERBOARD_OVERLAY_STYLE}
      controls={
        <>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as TimeframeOption)}
            className="w-24 shrink-0 bg-gray-900 border border-gray-700 text-green-400 text-xs px-2 py-1 rounded focus:outline-none focus:border-green-500"
          >
            {TIMEFRAME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="flex-1 min-w-0 relative" ref={countryRef}>
            <button
              onClick={() => { setCountryDropdownOpen(!countryDropdownOpen); setCountrySearch(""); }}
              className="w-full bg-gray-900 border border-gray-700 text-green-400 text-xs px-2 py-1 rounded focus:outline-none focus:border-green-500 text-left truncate"
            >
              {selectedCountryLabel}
            </button>
            {countryDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded z-30 max-h-48 flex flex-col">
                <input
                  autoFocus
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder="Search country..."
                  className="bg-gray-800 text-green-400 text-xs px-2 py-1 border-b border-gray-700 focus:outline-none"
                />
                <ul className="overflow-y-auto flex-1">
                  <li
                    className={`px-2 py-1 text-xs cursor-pointer hover:bg-gray-700 ${country === "all" ? "text-white bg-gray-700" : "text-gray-400"}`}
                    onClick={() => { setCountry("all"); setCountryDropdownOpen(false); }}
                  >
                    All Countries
                  </li>
                  {filteredCountries.map((c) => (
                    <li
                      key={c.code}
                      className={`px-2 py-1 text-xs cursor-pointer hover:bg-gray-700 ${country === c.code ? "text-white bg-gray-700" : "text-gray-400"}`}
                      onClick={() => { setCountry(c.code); setCountryDropdownOpen(false); }}
                    >
                      {c.code} — {c.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      }
    />
  );
}

export default LeaderboardOverlay;

import { useLiveTicker } from "../hooks/useLiveTicker";

// We isolate the Ticker component to prevent re-renders of the entire Terminal
// when new events arrive. It fetches data independently via the SWR hook.
export default function Ticker() {
  // Switch to the hybrid hook to receive real-time updates via Supabase
  const liveEvents = useLiveTicker();

  if (!liveEvents || liveEvents.length === 0) return null;

  return (
    // The container hides overflow, while the inner div handles the actual movement
    <div className="hidden sm:block w-full bg-gray-900 border-b border-gray-700 text-green-400 text-xs py-1 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap">
        {liveEvents.map((ev, i) => (
          <span key={i} className="mr-10">
            <strong className="text-yellow-400 bg-yellow-950/30 px-1 rounded">[LIVE]</strong> {ev.message}
          </span>
        ))}
      </div>
    </div>
  );
}

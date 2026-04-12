import { useLiveTicker } from "../hooks/useLiveTicker";
import AsciiBox from "./AsciiBox";

type PartyOverlayProps = {
  onClose: () => void;
};

function PartyOverlay({ onClose }: PartyOverlayProps) {
  const liveEvents = useLiveTicker();

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-[#0d1117] border-l border-gray-700 flex flex-col z-20">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <span className="text-green-400 font-bold text-sm">
          &gt; tail -f /var/log/party
        </span>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-300 text-sm"
        >
          [x]
        </button>
      </div>

      <div className="px-4 py-2 border-b border-gray-700 text-green-400 text-xs font-bold">
        <AsciiBox lines={["LIVE FEED", "realtime events"]} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {(!liveEvents || liveEvents.length === 0) && (
          <div className="text-gray-500 text-xs">
            [∅] No live events yet. The party hasn't started.
          </div>
        )}

        {liveEvents && liveEvents.length > 0 && (
          <>
            <div className="text-gray-500 text-xs border-b border-gray-800 pb-1 mb-1">
              <span className="text-yellow-400">[LIVE]</span> {liveEvents.length} event{liveEvents.length !== 1 ? "s" : ""} in feed
            </div>
            {liveEvents.map((event, i) => (
              <div
                key={`${event.created_at}-${i}`}
                className={`text-xs font-mono py-1 border-b border-gray-800/50 ${
                  i === 0 ? "text-green-400" : "text-gray-400"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-gray-600 shrink-0">
                    [{formatTimestamp(event.created_at)}]
                  </span>
                  <span className="break-words">{event.message}</span>
                </div>
              </div>
            ))}
            <div className="text-gray-600 text-xs mt-2 pt-2">
              [streaming] — Events update in realtime
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PartyOverlay;

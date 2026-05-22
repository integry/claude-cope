import { useLiveTicker } from "../hooks/useLiveTicker";
import PartyFeedPanel from "./PartyFeedPanel";

type PartyOverlayProps = {
  onClose: () => void;
};

function PartyOverlay({ onClose }: PartyOverlayProps) {
  const liveEvents = useLiveTicker();
  return <PartyFeedPanel liveEvents={liveEvents} onClose={onClose} />;
}

export default PartyOverlay;

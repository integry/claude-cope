import { useState } from "react";

type SynergizeOverlayProps = {
  onClose: () => void;
};

const AGENDA_ITEMS = [
  {
    title: "Agenda Item 1: Alignment Check",
    buzzwords: ["Synergize", "Circle Back", "Move the Needle"],
    prompt: "Please click through each buzzword to acknowledge alignment.",
  },
  {
    title: "Agenda Item 2: Sprint Velocity Review",
    buzzwords: ["Bandwidth", "Low-Hanging Fruit", "Boil the Ocean"],
    prompt: "Confirm you have capacity for these action items.",
  },
  {
    title: "Agenda Item 3: Cross-Functional Ideation",
    buzzwords: ["Leverage", "Paradigm Shift", "Thought Leadership"],
    prompt: "Validate these synergy vectors to proceed.",
  },
  {
    title: "Agenda Item 4: Closing & Next Steps",
    buzzwords: ["Take Offline", "Run It Up the Flagpole", "Double-Click On That"],
    prompt: "Acknowledge all action items to end this meeting.",
  },
];

function SynergizeOverlay({ onClose }: SynergizeOverlayProps) {
  const [agendaIndex, setAgendaIndex] = useState(0);
  const [clickedBuzzwords, setClickedBuzzwords] = useState<Set<number>>(new Set());

  const currentAgenda = AGENDA_ITEMS[agendaIndex];
  if (!currentAgenda) return null;

  const allClicked = clickedBuzzwords.size === currentAgenda.buzzwords.length;

  const handleBuzzwordClick = (idx: number) => {
    setClickedBuzzwords((prev) => new Set(prev).add(idx));
  };

  const handleNext = () => {
    if (agendaIndex < AGENDA_ITEMS.length - 1) {
      setAgendaIndex((prev) => prev + 1);
      setClickedBuzzwords(new Set());
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#161b22] border border-gray-700 rounded-lg shadow-2xl w-full max-w-lg mx-4 p-6 font-mono">
        {/* Header */}
        <div className="border-b border-gray-700 pb-3 mb-4">
          <div className="text-yellow-400 font-bold text-sm">
            [1-ON-1 MEETING] Mandatory Synergy Session
          </div>
          <div className="text-gray-500 text-xs mt-1">
            Step {agendaIndex + 1} of {AGENDA_ITEMS.length} — This meeting cannot be skipped.
          </div>
        </div>

        {/* Agenda Item */}
        <div className="mb-4">
          <div className="text-green-400 text-sm font-bold mb-2">
            {currentAgenda.title}
          </div>
          <div className="text-gray-400 text-xs mb-3">
            {currentAgenda.prompt}
          </div>
        </div>

        {/* Buzzword Buttons */}
        <div className="space-y-2 mb-6">
          {currentAgenda.buzzwords.map((word, idx) => {
            const isClicked = clickedBuzzwords.has(idx);
            return (
              <button
                key={idx}
                onClick={() => handleBuzzwordClick(idx)}
                disabled={isClicked}
                className={`w-full text-left px-4 py-2 rounded border text-sm transition-colors ${
                  isClicked
                    ? "border-green-700 bg-green-950/40 text-green-400 cursor-default"
                    : "border-yellow-700 bg-yellow-950/30 text-yellow-300 hover:bg-yellow-900/40 cursor-pointer"
                }`}
              >
                {isClicked ? "[x]" : "[ ]"} {word}
              </button>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-800 rounded overflow-hidden mb-4">
          <div
            className="h-full bg-yellow-500 transition-all duration-300 rounded"
            style={{
              width: `${((agendaIndex * 3 + clickedBuzzwords.size) / (AGENDA_ITEMS.length * 3)) * 100}%`,
            }}
          />
        </div>

        {/* Next / End Meeting button */}
        <button
          onClick={handleNext}
          disabled={!allClicked}
          className={`w-full py-2 rounded text-sm font-bold transition-colors ${
            allClicked
              ? "bg-green-700 hover:bg-green-600 text-white cursor-pointer"
              : "bg-gray-800 text-gray-600 cursor-not-allowed"
          }`}
        >
          {!allClicked
            ? "Click all buzzwords to continue..."
            : agendaIndex < AGENDA_ITEMS.length - 1
              ? "Proceed to Next Agenda Item"
              : "End Meeting (finally)"}
        </button>
      </div>
    </div>
  );
}

export default SynergizeOverlay;

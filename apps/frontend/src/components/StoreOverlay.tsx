import { GENERATORS, GROWTH_RATE } from "../game/constants";
import type { GameState } from "../hooks/useGameState";

type StoreOverlayProps = {
  state: GameState;
  buyGenerator: (generatorId: string) => boolean;
  onClose: () => void;
};

function StoreOverlay({ state, buyGenerator, onClose }: StoreOverlayProps) {
  return (
    <div className="absolute right-0 top-0 h-full w-72 bg-[#0d1117] border-l border-gray-700 flex flex-col z-20">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <span className="text-green-400 font-bold text-sm">
          &gt; store --list
        </span>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-300 text-sm"
        >
          [x]
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {GENERATORS.map((gen) => {
          const owned = state.inventory[gen.id] ?? 0;
          const cost = Math.floor(gen.baseCost * Math.pow(GROWTH_RATE, owned));
          const canAfford = state.technicalDebt >= cost;

          return (
            <div
              key={gen.id}
              className={`rounded border p-3 ${
                canAfford
                  ? "border-green-700 bg-green-950/30 text-gray-200"
                  : "border-gray-700 bg-gray-900/50 text-gray-500"
              }`}
            >
              <div className="flex justify-between items-center text-sm font-semibold">
                <span>{gen.name}</span>
                <span className="text-xs text-gray-400">x{owned}</span>
              </div>
              <div className="text-xs mt-1">
                <span className={canAfford ? "text-green-400" : "text-gray-500"}>
                  Cost: {cost} TD
                </span>
                <span className="text-gray-500 ml-2">
                  (+{gen.baseOutput} TD/s)
                </span>
              </div>
              <button
                disabled={!canAfford}
                onClick={() => buyGenerator(gen.id)}
                className={`mt-2 w-full text-xs py-1 rounded ${
                  canAfford
                    ? "bg-green-700 hover:bg-green-600 text-white cursor-pointer"
                    : "bg-gray-800 text-gray-600 cursor-not-allowed"
                }`}
              >
                {canAfford ? "Buy" : "Can't afford"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StoreOverlay;

import { useState } from "react";
import { GENERATORS } from "../game/constants";
import { calcBulkCost } from "../hooks/useGameState";
import type { GameState } from "../hooks/useGameState";

type BuyMultiplier = 1 | 10 | 100;

type StoreOverlayProps = {
  state: GameState;
  buyGenerator: (generatorId: string, amount?: number) => boolean;
  onClose: () => void;
};

function StoreOverlay({ state, buyGenerator, onClose }: StoreOverlayProps) {
  const [buyMultiplier, setBuyMultiplier] = useState<BuyMultiplier>(1);

  return (
    <div className="absolute right-0 top-0 h-full w-72 bg-[#0d1117] border-l border-gray-700 flex flex-col z-20">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <span className="text-green-400 font-bold text-sm">
          &gt; store --list
        </span>
        <div className="flex items-center gap-2">
          <div className="flex text-xs">
            {([1, 10, 100] as BuyMultiplier[]).map((m) => (
              <button
                key={m}
                onClick={() => setBuyMultiplier(m)}
                className={`px-1.5 py-0.5 border ${
                  buyMultiplier === m
                    ? "bg-green-700 border-green-500 text-white"
                    : "bg-gray-800 border-gray-600 text-gray-400 hover:text-gray-200"
                }`}
              >
                {m}x
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 text-sm"
          >
            [x]
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {GENERATORS.map((gen) => {
          const owned = state.inventory[gen.id] ?? 0;
          const cost = calcBulkCost(gen.baseCost, owned, buyMultiplier);
          const canAfford = state.economy.currentTD >= cost;

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
              <p className="text-xs text-gray-400 italic mt-1">
                {gen.description}
              </p>
              <div className="text-xs mt-1">
                <span className={canAfford ? "text-green-400" : "text-gray-500"}>
                  Cost: {cost} TD{buyMultiplier > 1 ? ` (${buyMultiplier}x)` : ""}
                </span>
                <span className="text-gray-500 ml-2">
                  (+{gen.baseOutput} TD/s)
                </span>
              </div>
              <button
                disabled={!canAfford}
                onClick={() => buyGenerator(gen.id, buyMultiplier)}
                className={`mt-2 w-full text-xs py-1 rounded ${
                  canAfford
                    ? "bg-green-700 hover:bg-green-600 text-white cursor-pointer"
                    : "bg-gray-800 text-gray-600 cursor-not-allowed"
                }`}
              >
                {canAfford ? `Buy ${buyMultiplier}x` : "Can't afford"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StoreOverlay;

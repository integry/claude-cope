import { useState } from "react";
import { GENERATORS, UPGRADES, THEMES } from "../game/constants";
import { calcBulkCost } from "../hooks/useGameState";
import type { GameState } from "../hooks/useGameState";
import { isPaidUser } from "../hooks/gameStateUtils";

type BuyMultiplier = 1 | 10 | 100;

type StoreOverlayProps = {
  state: GameState;
  buyGenerator: (generatorId: string, amount?: number) => boolean;
  buyUpgrade: (upgradeId: string) => boolean;
  buyTheme: (themeId: string) => boolean;
  equipTheme: (themeId: string) => void;
  onClose: () => void;
};

function StoreOverlay({ state, buyGenerator, buyUpgrade, buyTheme, equipTheme, onClose }: StoreOverlayProps) {
  const [buyMultiplier, setBuyMultiplier] = useState<BuyMultiplier>(1);

  return (
    <div className="fixed right-0 top-0 h-full w-72 border-l border-gray-700 flex flex-col z-20" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <span className="text-green-400 font-bold text-sm">
          &gt; store --team
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
        {GENERATORS.filter((gen) => state.economy.totalTDEarned >= gen.baseCost * 0.1).map((gen) => {
          const owned = state.inventory[gen.id] ?? 0;
          const cost = calcBulkCost(gen.baseCost, owned, buyMultiplier);
          const canAfford = state.economy.currentTD >= cost;

          return (
            <div
              key={gen.id}
              className={`rounded border px-4 py-3 ${
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
                <span className={`font-bold ${canAfford ? "text-green-400" : "text-red-400"}`}>
                  Cost: {cost} TD{buyMultiplier > 1 ? ` (${buyMultiplier}x)` : ""}
                </span>
                <span className="text-gray-500 ml-2">
                  (+{gen.baseOutput * buyMultiplier}% per prompt)
                </span>
              </div>
              <button
                disabled={!canAfford}
                onClick={() => buyGenerator(gen.id, buyMultiplier)}
                className={`mt-2 w-full text-xs py-1 rounded ${
                  canAfford
                    ? "bg-green-700 hover:bg-green-600 text-white cursor-pointer"
                    : "bg-gray-800 text-gray-400 cursor-not-allowed"
                }`}
              >
                {canAfford ? `Buy ${buyMultiplier}x` : "Can't afford"}
              </button>
            </div>
          );
        })}

        {/* Synergy Upgrades */}
        <div className="border-t border-gray-700 pt-3 mt-3">
          <span className="text-yellow-400 font-bold text-xs">
            &gt; synergy upgrades
          </span>
        </div>
        {UPGRADES.filter((upgrade) => {
          const target = GENERATORS.find((g) => g.id === upgrade.targetGeneratorId);
          const required = GENERATORS.find((g) => g.id === upgrade.requiredGeneratorId);
          return (
            (!target || state.economy.totalTDEarned >= target.baseCost * 0.1) &&
            (!required || state.economy.totalTDEarned >= required.baseCost * 0.1)
          );
        }).map((upgrade) => {
          const owned = state.upgrades.includes(upgrade.id);
          const hasRequired = (state.inventory[upgrade.requiredGeneratorId] ?? 0) > 0;
          const canAfford = !owned && hasRequired && state.economy.currentTD >= upgrade.cost;
          const targetGen = GENERATORS.find((g) => g.id === upgrade.targetGeneratorId);

          return (
            <div
              key={upgrade.id}
              className={`rounded border px-4 py-3 ${
                owned
                  ? "border-yellow-700 bg-yellow-950/20 text-yellow-300"
                  : canAfford
                    ? "border-yellow-700 bg-yellow-950/30 text-gray-200"
                    : "border-gray-700 bg-gray-900/50 text-gray-500"
              }`}
            >
              <div className="flex justify-between items-center text-sm font-semibold">
                <span>{upgrade.name}</span>
                {owned && <span className="text-xs text-yellow-400">OWNED</span>}
              </div>
              <p className="text-xs text-gray-400 italic mt-1">
                {upgrade.description}
              </p>
              <div className="text-xs mt-1">
                <span className={`font-bold ${canAfford ? "text-yellow-400" : "text-red-400"}`}>
                  Cost: {upgrade.cost.toLocaleString()} TD
                </span>
                <span className="text-gray-500 ml-2">
                  ({targetGen?.name}{" "}
                  {upgrade.synergyPercent != null
                    ? `x${(1 + ((state.inventory[upgrade.requiredGeneratorId] ?? 0) * upgrade.synergyPercent) / 100).toFixed(2)} — +${upgrade.synergyPercent}%/ea`
                    : `x${upgrade.multiplier}`})
                </span>
              </div>
              {!owned && (
                <button
                  disabled={!canAfford}
                  onClick={() => buyUpgrade(upgrade.id)}
                  className={`mt-2 w-full text-xs py-1 rounded ${
                    canAfford
                      ? "bg-yellow-700 hover:bg-yellow-600 text-white cursor-pointer"
                      : "bg-gray-800 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {!hasRequired
                    ? "Requires " + (GENERATORS.find((g) => g.id === upgrade.requiredGeneratorId)?.name ?? "???")
                    : canAfford
                      ? "Buy Upgrade"
                      : "Can't afford"}
                </button>
              )}
            </div>
          );
        })}

        {/* Cosmetic Themes */}
        <div className="border-t border-gray-700 pt-3 mt-3">
          <div className="flex items-center gap-2">
            <span className="text-purple-400 font-bold text-xs">
              &gt; cosmetic themes
            </span>
            <span className="text-xs px-1.5 py-0.5 bg-purple-900 text-purple-300 rounded font-bold">
              MAX ONLY
            </span>
          </div>
          {!state.proKey && (
            <p className="text-xs text-gray-500 mt-1 italic">
              Subscribe to Max to unlock premium themes
            </p>
          )}
        </div>
        {THEMES.filter((theme) => theme.id !== "default").map((theme) => {
          const isUnlocked = state.unlockedThemes.includes(theme.id);
          const isEquipped = state.activeTheme === theme.id;
          const canAfford = state.economy.currentTD >= theme.cost;
          const hasPro = isPaidUser(state);
          const canBuy = hasPro && !isUnlocked && canAfford;

          return (
            <div
              key={theme.id}
              className={`rounded border px-4 py-3 ${
                isEquipped
                  ? "border-purple-500 bg-purple-950/30 text-purple-300"
                  : isUnlocked
                    ? "border-purple-700 bg-purple-950/20 text-gray-200"
                    : canBuy
                      ? "border-purple-700 bg-purple-950/30 text-gray-200"
                      : "border-gray-700 bg-gray-900/50 text-gray-500"
              }`}
            >
              <div className="flex justify-between items-center text-sm font-semibold">
                <span>{theme.name}</span>
                {isEquipped && <span className="text-xs text-purple-400">EQUIPPED</span>}
                {isUnlocked && !isEquipped && <span className="text-xs text-purple-500">OWNED</span>}
              </div>
              <div className="text-xs mt-1">
                <span className={`font-bold ${isUnlocked ? "text-gray-500" : canBuy ? "text-purple-400" : "text-red-400"}`}>
                  {isUnlocked ? "Unlocked" : `Cost: ${theme.cost.toLocaleString()} TD`}
                </span>
              </div>
              {isUnlocked ? (
                !isEquipped && (
                  <button
                    onClick={() => equipTheme(theme.id)}
                    className="mt-2 w-full text-xs py-1 rounded bg-purple-700 hover:bg-purple-600 text-white cursor-pointer"
                  >
                    Equip Theme
                  </button>
                )
              ) : (
                <button
                  disabled={!canBuy}
                  onClick={() => buyTheme(theme.id)}
                  className={`mt-2 w-full text-xs py-1 rounded ${
                    canBuy
                      ? "bg-purple-700 hover:bg-purple-600 text-white cursor-pointer"
                      : "bg-gray-800 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {!hasPro ? "Max Required" : canAfford ? "Buy Theme" : "Can't afford"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StoreOverlay;

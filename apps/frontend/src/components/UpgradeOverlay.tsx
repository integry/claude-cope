import AsciiBox from "./AsciiBox";
import { UPGRADE_CHECKOUT_SINGLE, UPGRADE_CHECKOUT_MULTI, PRO_QUOTA_LIMIT } from "../config";

type UpgradeOverlayProps = {
  isUpgraded: boolean;
  onClose: () => void;
};

function UpgradeOverlay({ isUpgraded, onClose }: UpgradeOverlayProps) {
  const singleAvailable = !!UPGRADE_CHECKOUT_SINGLE;
  const multiAvailable = !!UPGRADE_CHECKOUT_MULTI;

  return (
    <div className="fixed right-0 top-0 h-full w-80 border-l border-gray-700 flex flex-col z-20" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <span className="text-green-400 font-bold text-sm">
          &gt; cat /proc/upgrade
        </span>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-300 text-sm"
        >
          [x]
        </button>
      </div>

      <div className="px-4 py-2 border-b border-gray-700 text-green-400 text-xs font-bold">
        <AsciiBox lines={isUpgraded ? ["MANAGE YOUR LICENSES", "OR BUY MORE SEATS"] : ["UPGRADE TO MAX", "UNLOCK PREMIUM SUFFERING"]} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        <div className="border border-gray-700 rounded px-3 py-2 text-xs">
          <div className="font-bold text-yellow-300 mb-1">
            {isUpgraded ? "[CURRENT STATUS]" : "[FREE TIER]"}
          </div>
          <div className="text-gray-400">
            {isUpgraded
              ? "You are on the Max tier. Purchase additional licenses below to spread the suffering across your team."
              : `You are on the free tier. Upgrade to Max for ${PRO_QUOTA_LIMIT} credits, premium models, and the privilege of paying for your own exploitation.`}
          </div>
        </div>

        {/* Single license option */}
        <div className="border border-gray-700 rounded px-3 py-2 text-xs">
          <div className="font-bold text-yellow-300 mb-2">
            [OPTION 1: SINGLE LICENSE]
          </div>
          <div className="text-gray-400 mb-3">
            One seat. One soul. {PRO_QUOTA_LIMIT} credits of technical debt generation for a single developer who has given up on work-life balance.
          </div>
          {singleAvailable ? (
            <a
              href={UPGRADE_CHECKOUT_SINGLE}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center border border-green-500 text-green-400 hover:bg-green-500 hover:text-black px-3 py-2 rounded text-xs font-bold transition-colors"
            >
              {isUpgraded ? "[ BUY ANOTHER SEAT ]" : "[ UPGRADE — SINGLE ]"}
            </a>
          ) : (
            <div className="text-red-400 border border-red-800 rounded px-2 py-1 text-center">
              [ERR] CHECKOUT_URL_SINGLE not configured. Contact your operator.
            </div>
          )}
        </div>

        {/* Multi license pack option */}
        <div className="border border-gray-700 rounded px-3 py-2 text-xs">
          <div className="font-bold text-yellow-300 mb-2">
            [OPTION 2: MULTI-LICENSE PACK — 5 LICENSES]
          </div>
          <div className="text-gray-400 mb-3">
            Five seats for the whole team. Because misery loves company, and your manager wants everyone on the same page of suffering.
          </div>
          {multiAvailable ? (
            <a
              href={UPGRADE_CHECKOUT_MULTI}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black px-3 py-2 rounded text-xs font-bold transition-colors"
            >
              {isUpgraded ? "[ BUY MORE SEATS ]" : "[ UPGRADE — TEAM PACK ]"}
            </a>
          ) : (
            <div className="text-red-400 border border-red-800 rounded px-2 py-1 text-center">
              [ERR] CHECKOUT_URL_MULTI not configured. Contact your operator.
            </div>
          )}
        </div>

        <div className="border border-gray-700 rounded px-3 py-2 text-xs">
          <div className="font-bold text-yellow-300 mb-1">
            [WHAT YOU GET]
          </div>
          <div className="text-gray-400 whitespace-pre-line">
            {`• ${PRO_QUOTA_LIMIT} API credits per license (fewer 429s)
• Access to premium models
• Priority queue for suffering
• A warm feeling of corporate compliance
• The mass right to mass-produce technical debt`}
          </div>
        </div>
      </div>

      <div className="px-4 py-2 border-t border-gray-700 text-gray-600 text-xs">
        [tip: all purchases are final. just like your career choices]
      </div>
    </div>
  );
}

export default UpgradeOverlay;

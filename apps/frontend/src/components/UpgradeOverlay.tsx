import { UPGRADE_CHECKOUT_SINGLE, UPGRADE_CHECKOUT_MULTI, PRO_QUOTA_LIMIT } from "../config";

type UpgradeOverlayProps = {
  isUpgraded: boolean;
  onClose: () => void;
};

function UpgradeOverlay({ isUpgraded, onClose }: UpgradeOverlayProps) {
  const singleAvailable = !!UPGRADE_CHECKOUT_SINGLE;
  const multiAvailable = !!UPGRADE_CHECKOUT_MULTI;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Dimmed backdrop */}
      <div className="absolute inset-0 bg-black opacity-50" />

      {/* Modal box */}
      <div
        className="relative z-10 w-full max-w-2xl mx-4"
        style={{ backgroundColor: 'var(--color-bg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <pre className="text-green-400 text-xs leading-relaxed p-0 m-0 whitespace-pre">
{`+=================================================================+
|                       [ SYSTEM OVERRIDE ]                       |
+=================================================================+`}
        </pre>

        <div className="border-l border-r border-gray-600 px-6 py-4 space-y-4" style={{ borderColor: '#4a5568' }}>
          {/* Title */}
          <div className="text-center">
            <div className="text-green-400 font-bold text-sm mb-1">
              {isUpgraded ? "MANAGE YOUR LICENSES" : "UPGRADE TO MAX"}
            </div>
            <div className="text-gray-400 text-xs">
              {isUpgraded
                ? "Purchase additional licenses to spread the suffering across your team."
                : "Unlock Premium Suffering."}
            </div>
          </div>

          {/* Current status */}
          <div className="text-xs">
            <div className="font-bold text-yellow-300 mb-1">
              {isUpgraded ? "  [CURRENT STATUS]" : "  [FREE TIER]"}
            </div>
            <div className="text-gray-400 pl-2">
              {isUpgraded
                ? "  You are on the Max tier. Your suffering is premium-grade."
                : `  You are on the free tier. Upgrade to Max for ${PRO_QUOTA_LIMIT} credits,`}
            </div>
            {!isUpgraded && (
              <div className="text-gray-400 pl-2">
                {"  premium models, and the privilege of paying for your own exploitation."}
              </div>
            )}
          </div>

          {/* Option 1: Single license */}
          <div className="text-xs">
            <div className="font-bold text-yellow-300 mb-1">
              {"  [OPTION 1: SINGLE LICENSE]"}
            </div>
            <div className="text-gray-400 pl-2 mb-2">
              {"  One seat. One soul. "}{PRO_QUOTA_LIMIT}{" credits of technical debt"}
              <br />
              {"  generation for a single developer who has given up."}
            </div>
            <div className="pl-2">
              {singleAvailable ? (
                <a
                  href={UPGRADE_CHECKOUT_SINGLE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block border border-green-500 text-green-400 hover:bg-green-500 hover:text-black px-4 py-2 text-xs font-bold transition-colors"
                >
                  {"  > "}{isUpgraded ? "[ BUY ANOTHER SEAT ]" : "[ PURCHASE SINGLE ]"}
                </a>
              ) : (
                <div className="text-red-400 text-xs">
                  {"  [ERR] CHECKOUT_URL_SINGLE not configured. Contact your operator."}
                </div>
              )}
            </div>
          </div>

          {/* Option 2: Multi license pack */}
          <div className="text-xs">
            <div className="font-bold text-yellow-300 mb-1">
              {"  [OPTION 2: MULTI-LICENSE PACK — 5 LICENSES]"}
            </div>
            <div className="text-gray-400 pl-2 mb-2">
              {"  Five seats for the whole team. Because misery loves company,"}
              <br />
              {"  and your manager wants everyone on the same page of suffering."}
            </div>
            <div className="pl-2">
              {multiAvailable ? (
                <a
                  href={UPGRADE_CHECKOUT_MULTI}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black px-4 py-2 text-xs font-bold transition-colors"
                >
                  {"  > "}{isUpgraded ? "[ BUY MORE SEATS ]" : "[ PURCHASE TEAM PACK ]"}
                </a>
              ) : (
                <div className="text-red-400 text-xs">
                  {"  [ERR] CHECKOUT_URL_MULTI not configured. Contact your operator."}
                </div>
              )}
            </div>
          </div>

          {/* What you get */}
          <div className="text-xs">
            <div className="font-bold text-yellow-300 mb-1">
              {"  [WHAT YOU GET]"}
            </div>
            <div className="text-gray-400 pl-2 whitespace-pre-line">
{`  • ${PRO_QUOTA_LIMIT} API credits per license (fewer 429s)
  • Access to premium models
  • Priority queue for suffering
  • A warm feeling of corporate compliance
  • The mass right to mass-produce technical debt`}
            </div>
          </div>
        </div>

        <pre className="text-green-400 text-xs leading-relaxed p-0 m-0 whitespace-pre">
{`+=================================================================+
|            [Press ESC to return to mediocrity]                   |
+=================================================================+`}
        </pre>
      </div>
    </div>
  );
}

export default UpgradeOverlay;

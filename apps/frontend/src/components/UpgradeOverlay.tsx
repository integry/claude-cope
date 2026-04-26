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
      <div className="absolute inset-0 bg-black opacity-70" />

      {/* Modal box — Red Alert: dark terminal bg with hard border & blocky shadow */}
      <div
        className="relative z-10 w-full max-w-2xl mx-4"
        style={{
          backgroundColor: '#1e232b',
          border: '1px solid #ff5555',
          boxShadow: '12px 12px 0px rgba(0, 0, 0, 0.9)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="text-center py-3 font-bold text-sm tracking-[0.3em]"
          style={{ color: '#ff5555', borderBottom: '1px solid #ff5555' }}
        >
          [ S Y S T E M &nbsp;&nbsp; O V E R R I D E ]
        </div>

        <div className="px-6 py-6 space-y-4">
          {/* Title */}
          <div className="text-center">
            <div className="font-bold text-sm mb-1" style={{ color: '#ffff55' }}>
              {isUpgraded ? "MANAGE YOUR LICENSES" : "UPGRADE TO MAX"}
            </div>
            <div className="text-xs" style={{ color: '#ffffff' }}>
              {isUpgraded
                ? "Purchase additional licenses to spread the suffering across your team."
                : "Unlock Premium Suffering."}
            </div>
          </div>

          {/* Current status */}
          <div className="text-xs">
            <div className="font-bold mb-1" style={{ color: '#ffff55' }}>
              {isUpgraded ? "  [CURRENT STATUS]" : "  [FREE TIER]"}
            </div>
            <div className="pl-2" style={{ color: '#ffffff' }}>
              {isUpgraded
                ? "  You are on the Max tier. Your suffering is premium-grade."
                : `  You are on the free tier. Upgrade to Max for ${PRO_QUOTA_LIMIT} credits,`}
            </div>
            {!isUpgraded && (
              <div className="pl-2" style={{ color: '#ffffff' }}>
                {"  premium models, and the privilege of paying for your own exploitation."}
              </div>
            )}
          </div>

          {/* Option 1: Single license */}
          <div className="text-xs">
            <div className="font-bold mb-1" style={{ color: '#ffff55' }}>
              {"  [OPTION 1: SINGLE LICENSE]"}
            </div>
            <div className="pl-2 mb-2" style={{ color: '#ffffff' }}>
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
                  className="inline-block text-xs font-bold transition-colors"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#4ade80',
                    border: '1px solid #4ade80',
                    padding: '4px 12px',
                    marginTop: '8px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#4ade80';
                    e.currentTarget.style.color = '#000000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#4ade80';
                  }}
                >
                  {isUpgraded ? "[ BUY ANOTHER SEAT ]" : "[ PURCHASE SINGLE ]"}
                </a>
              ) : (
                <div className="text-xs" style={{ color: '#ff5555' }}>
                  {"  [ERR] CHECKOUT_URL_SINGLE not configured. Contact your operator."}
                </div>
              )}
            </div>
          </div>

          {/* Option 2: Multi license pack */}
          <div className="text-xs">
            <div className="font-bold mb-1" style={{ color: '#ffff55' }}>
              {"  [OPTION 2: MULTI-LICENSE PACK — 5 LICENSES]"}
            </div>
            <div className="pl-2 mb-2" style={{ color: '#ffffff' }}>
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
                  className="inline-block text-xs font-bold transition-colors"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#4ade80',
                    border: '1px solid #4ade80',
                    padding: '4px 12px',
                    marginTop: '8px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#4ade80';
                    e.currentTarget.style.color = '#000000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#4ade80';
                  }}
                >
                  {isUpgraded ? "[ BUY MORE SEATS ]" : "[ PURCHASE TEAM PACK ]"}
                </a>
              ) : (
                <div className="text-xs" style={{ color: '#ff5555' }}>
                  {"  [ERR] CHECKOUT_URL_MULTI not configured. Contact your operator."}
                </div>
              )}
            </div>
          </div>

          {/* What you get */}
          <div className="text-xs">
            <div className="font-bold mb-1" style={{ color: '#ffff55' }}>
              {"  [WHAT YOU GET]"}
            </div>
            <div className="pl-2 whitespace-pre-line" style={{ color: '#ffffff' }}>
{`  • ${PRO_QUOTA_LIMIT} API credits per license (fewer 429s)
  • Access to premium models
  • Priority queue for suffering
  • A warm feeling of corporate compliance
  • The mass right to mass-produce technical debt`}
            </div>
          </div>
        </div>

        <div
          className="text-center py-3 text-xs font-bold"
          style={{ color: '#aaaaaa', borderTop: '1px solid #ff5555' }}
        >
          [Press ESC to return to mediocrity]
        </div>
      </div>
    </div>
  );
}

export default UpgradeOverlay;

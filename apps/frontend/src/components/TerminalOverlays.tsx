import type { Dispatch, SetStateAction } from "react";
import StoreOverlay from "./StoreOverlay";
import LeaderboardOverlay from "./LeaderboardOverlay";
import AchievementOverlay from "./AchievementOverlay";
import SynergizeOverlay from "./SynergizeOverlay";
import HelpOverlay from "./HelpOverlay";
import AboutOverlay from "./AboutOverlay";
import PrivacyOverlay from "./PrivacyOverlay";
import TermsOverlay from "./TermsOverlay";
import ContactOverlay from "./ContactOverlay";
import UserProfileOverlay from "./UserProfileOverlay";
import PartyOverlay from "./PartyOverlay";
import UpgradeOverlay from "./UpgradeOverlay";
import type { GameState, Message } from "../hooks/useGameState";
import { FREE_QUOTA_LIMIT, PRO_QUOTA_LIMIT } from "../config";

export function TerminalOverlays({
  showStore,
  showLeaderboard,
  showAchievements,
  showHelp,
  showAbout,
  showPrivacy,
  showTerms,
  showContact,
  showProfile,
  showParty,
  showSynergize,
  showUpgrade,
  state,
  buyGenerator,
  buyUpgrade,
  buyTheme,
  setActiveTheme,
  setShowStore,
  setShowLeaderboard,
  setShowAchievements,
  setShowHelp,
  setShowAbout,
  setShowPrivacy,
  setShowTerms,
  setShowContact,
  setShowProfile,
  setShowParty,
  setShowSynergize,
  setIsProcessing,
  setHistory,
  onUpgradeDismiss,
}: {
  showStore: boolean;
  showLeaderboard: boolean;
  showAchievements: boolean;
  showHelp: boolean;
  showAbout: boolean;
  showPrivacy: boolean;
  showTerms: boolean;
  showContact: boolean;
  showProfile: boolean;
  showParty: boolean;
  showSynergize: boolean;
  showUpgrade: boolean;
  state: GameState;
  buyGenerator: (generatorId: string, amount?: number) => boolean;
  buyUpgrade: (upgradeId: string) => boolean;
  buyTheme: (themeId: string) => boolean;
  setActiveTheme: (id: string) => void;
  setShowStore: Dispatch<SetStateAction<boolean>>;
  setShowLeaderboard: Dispatch<SetStateAction<boolean>>;
  setShowAchievements: Dispatch<SetStateAction<boolean>>;
  setShowHelp: Dispatch<SetStateAction<boolean>>;
  setShowAbout: Dispatch<SetStateAction<boolean>>;
  setShowPrivacy: Dispatch<SetStateAction<boolean>>;
  setShowTerms: Dispatch<SetStateAction<boolean>>;
  setShowContact: Dispatch<SetStateAction<boolean>>;
  setShowProfile: Dispatch<SetStateAction<boolean>>;
  setShowParty: Dispatch<SetStateAction<boolean>>;
  setShowSynergize: Dispatch<SetStateAction<boolean>>;
  setIsProcessing: Dispatch<SetStateAction<boolean>>;
  setHistory: Dispatch<SetStateAction<Message[]>>;
  onUpgradeDismiss: () => void;
}) {
  return (
    <>
      {showStore && (
        <StoreOverlay
          state={state}
          buyGenerator={buyGenerator}
          buyUpgrade={buyUpgrade}
          buyTheme={buyTheme}
          equipTheme={setActiveTheme}
          onClose={() => setShowStore(false)}
        />
      )}
      {showLeaderboard && <LeaderboardOverlay onClose={() => setShowLeaderboard(false)} />}
      {showAchievements && <AchievementOverlay unlockedIds={state.achievements} onClose={() => setShowAchievements(false)} />}
      {showHelp && (
        <HelpOverlay
          onClose={() => {
            setShowHelp(false);
            window.history.pushState(null, "", "/");
          }}
        />
      )}
      {showAbout && (
        <AboutOverlay
          onClose={() => {
            setShowAbout(false);
            window.history.pushState(null, "", "/");
          }}
        />
      )}
      {showPrivacy && (
        <PrivacyOverlay
          onClose={() => {
            setShowPrivacy(false);
            window.history.pushState(null, "", "/");
          }}
        />
      )}
      {showTerms && (
        <TermsOverlay
          onClose={() => {
            setShowTerms(false);
            window.history.pushState(null, "", "/");
          }}
        />
      )}
      {showContact && (
        <ContactOverlay
          onClose={() => {
            setShowContact(false);
            window.history.pushState(null, "", "/");
          }}
        />
      )}
      {showProfile && (
        <UserProfileOverlay
          state={state}
          onClose={() => {
            setShowProfile(false);
            if (window.location.pathname.startsWith("/user/")) window.history.pushState(null, "", "/");
          }}
        />
      )}
      {showParty && <PartyOverlay onClose={() => setShowParty(false)} />}
      {showSynergize && (
        <SynergizeOverlay
          onClose={() => {
            setShowSynergize(false);
            setIsProcessing(false);
            setHistory((prev) =>
              [
                ...prev,
                { role: "system", content: "[✓] Survived a simulated 15-minute meeting of corporate synergy. No action items assigned." },
              ]
            );
          }}
        />
      )}
      {showUpgrade && (
        <UpgradeOverlay
          quotaPercent={state.economy.quotaPercent}
          totalQuota={state.proKey || state.proKeyHash ? PRO_QUOTA_LIMIT : FREE_QUOTA_LIMIT}
          onDismiss={onUpgradeDismiss}
        />
      )}
    </>
  );
}

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
import type { GameState } from "../hooks/useGameState";
import type { Message } from "../hooks/useGameState";

interface TerminalOverlaysProps {
  state: GameState;
  showStore: boolean;
  showLeaderboard: boolean;
  showAchievements: boolean;
  showSynergize: boolean;
  showHelp: boolean;
  showAbout: boolean;
  showPrivacy: boolean;
  showTerms: boolean;
  showContact: boolean;
  showProfile: boolean;
  showParty: boolean;
  showUpgrade: boolean;
  setShowStore: Dispatch<SetStateAction<boolean>>;
  setShowLeaderboard: Dispatch<SetStateAction<boolean>>;
  setShowAchievements: Dispatch<SetStateAction<boolean>>;
  setShowSynergize: Dispatch<SetStateAction<boolean>>;
  setShowHelp: Dispatch<SetStateAction<boolean>>;
  setShowAbout: Dispatch<SetStateAction<boolean>>;
  setShowPrivacy: Dispatch<SetStateAction<boolean>>;
  setShowTerms: Dispatch<SetStateAction<boolean>>;
  setShowContact: Dispatch<SetStateAction<boolean>>;
  setShowProfile: Dispatch<SetStateAction<boolean>>;
  setShowParty: Dispatch<SetStateAction<boolean>>;
  setShowUpgrade: Dispatch<SetStateAction<boolean>>;
  setIsProcessing: Dispatch<SetStateAction<boolean>>;
  setHistory: Dispatch<SetStateAction<Message[]>>;
  buyGenerator: (id: string) => boolean;
  buyUpgrade: (id: string) => boolean;
  buyTheme: (id: string) => boolean;
  setActiveTheme: (id: string) => void;
}

export default function TerminalOverlays({ state, showStore, showLeaderboard, showAchievements, showSynergize, showHelp, showAbout, showPrivacy, showTerms, showContact, showProfile, showParty, showUpgrade, setShowStore, setShowLeaderboard, setShowAchievements, setShowSynergize, setShowHelp, setShowAbout, setShowPrivacy, setShowTerms, setShowContact, setShowProfile, setShowParty, setShowUpgrade, setIsProcessing, setHistory, buyGenerator, buyUpgrade, buyTheme, setActiveTheme }: TerminalOverlaysProps) {
  return (<>
    {showStore && <StoreOverlay state={state} buyGenerator={buyGenerator} buyUpgrade={buyUpgrade} buyTheme={buyTheme} equipTheme={setActiveTheme} onClose={() => setShowStore(false)} />}
    {showLeaderboard && <LeaderboardOverlay onClose={() => setShowLeaderboard(false)} />}
    {showAchievements && <AchievementOverlay unlockedIds={state.achievements} onClose={() => setShowAchievements(false)} />}
    {showHelp && <HelpOverlay onClose={() => { setShowHelp(false); window.history.pushState(null, "", "/"); }} />}
    {showAbout && <AboutOverlay onClose={() => { setShowAbout(false); window.history.pushState(null, "", "/"); }} />}
    {showPrivacy && <PrivacyOverlay onClose={() => { setShowPrivacy(false); window.history.pushState(null, "", "/"); }} />}
    {showTerms && <TermsOverlay onClose={() => { setShowTerms(false); window.history.pushState(null, "", "/"); }} />}
    {showContact && <ContactOverlay onClose={() => { setShowContact(false); window.history.pushState(null, "", "/"); }} />}
    {showProfile && <UserProfileOverlay state={state} onClose={() => { setShowProfile(false); if (window.location.pathname.startsWith("/user/")) window.history.pushState(null, "", "/"); }} />}
    {showParty && <PartyOverlay onClose={() => setShowParty(false)} />}
    {showSynergize && <SynergizeOverlay onClose={() => { setShowSynergize(false); setIsProcessing(false); setHistory((prev) => [...prev, { role: "system", content: "[✓] Survived a simulated 15-minute meeting of corporate synergy. No action items assigned." }]); }} />}
    {showUpgrade && <UpgradeOverlay isUpgraded={!!state.proKey || !!state.proKeyHash} quotaPercent={state.economy.quotaPercent} onClose={() => { setShowUpgrade(false); if (window.location.pathname === "/upgrade") window.history.pushState(null, "", "/"); }} />}
  </>);
}

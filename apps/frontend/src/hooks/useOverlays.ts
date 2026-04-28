import { useState, useEffect, useCallback, type Dispatch, type SetStateAction } from "react";

export interface OverlayState {
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
}

export interface OverlayActions {
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
  closeAllOverlays: () => void;
}

export function useOverlays(): OverlayState & OverlayActions {
  const [showStore, setShowStore] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showSynergize, setShowSynergize] = useState(false);
  const [showHelp, setShowHelp] = useState(() => window.location.pathname === "/help");
  const [showAbout, setShowAbout] = useState(() => window.location.pathname === "/about");
  const [showPrivacy, setShowPrivacy] = useState(() => window.location.pathname === "/privacy");
  const [showTerms, setShowTerms] = useState(() => window.location.pathname === "/terms");
  const [showContact, setShowContact] = useState(() => window.location.pathname === "/contact");
  const [showProfile, setShowProfile] = useState(() => window.location.pathname.startsWith("/user/"));
  const [showParty, setShowParty] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(() => window.location.pathname === "/upgrade");

  const closeAllOverlays = useCallback(() => {
    setShowStore(false);
    setShowLeaderboard(false);
    setShowAchievements(false);
    setShowSynergize(false);
    setShowHelp(false);
    setShowAbout(false);
    setShowPrivacy(false);
    setShowTerms(false);
    setShowContact(false);
    setShowProfile(false);
    setShowParty(false);
    setShowUpgrade(false);
    // NOTE: URL cleanup is intentionally NOT done here. Individual overlay
    // close handlers (in TerminalOverlays) already pushState("/") on close,
    // and callers that open a new overlay immediately after closing all
    // overlays will pushState the new route. Doing a replaceState("/") here
    // would erase the current route-backed overlay from history, breaking
    // the Back button when navigating between overlays (e.g. /privacy → /terms).
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setShowHelp(window.location.pathname === "/help");
      setShowAbout(window.location.pathname === "/about");
      setShowPrivacy(window.location.pathname === "/privacy");
      setShowTerms(window.location.pathname === "/terms");
      setShowContact(window.location.pathname === "/contact");
      setShowProfile(window.location.pathname.startsWith("/user/"));
      setShowUpgrade(window.location.pathname === "/upgrade");
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return {
    showStore, showLeaderboard, showAchievements, showSynergize,
    showHelp, showAbout, showPrivacy, showTerms, showContact,
    showProfile, showParty, showUpgrade,
    setShowStore, setShowLeaderboard, setShowAchievements, setShowSynergize,
    setShowHelp, setShowAbout, setShowPrivacy, setShowTerms, setShowContact,
    setShowProfile, setShowParty, setShowUpgrade,
    closeAllOverlays,
  };
}

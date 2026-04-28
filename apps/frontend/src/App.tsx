import { useState, useCallback } from "react";
import Terminal from "./components/Terminal";
import SplashScreen from "./components/SplashScreen";
import LegalTermsPage from "./components/LegalTermsPage";
import LegalPrivacyPage from "./components/LegalPrivacyPage";
import TurnstileWidget from "./components/TurnstileWidget";

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isHumanVerified, setIsHumanVerified] = useState(false);
  const handleSplashComplete = useCallback(() => setShowSplash(false), []);
  const handleHumanVerified = useCallback(() => setIsHumanVerified(true), []);

  const path = window.location.pathname;
  if (path === "/legal/terms") return <LegalTermsPage />;
  if (path === "/legal/privacy") return <LegalPrivacyPage />;
  const showBlockingSplash = showSplash || !isHumanVerified;

  return (
    <>
      <TurnstileWidget onVerified={handleHumanVerified} />
      {!showBlockingSplash && <Terminal />}
      {showBlockingSplash && <SplashScreen onComplete={handleSplashComplete} />}
    </>
  );
}

export default App;

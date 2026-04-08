import { useState, useCallback } from "react";
import Terminal from "./components/Terminal";
import SplashScreen from "./components/SplashScreen";
import LegalTermsPage from "./components/LegalTermsPage";
import LegalPrivacyPage from "./components/LegalPrivacyPage";

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashComplete = useCallback(() => setShowSplash(false), []);

  const path = window.location.pathname;
  if (path === "/legal/terms") return <LegalTermsPage />;
  if (path === "/legal/privacy") return <LegalPrivacyPage />;

  return (
    <>
      <Terminal />
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
    </>
  );
}

export default App;

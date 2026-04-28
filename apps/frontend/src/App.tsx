import { useState, useCallback, useEffect } from "react";
import Terminal from "./components/Terminal";
import SplashScreen from "./components/SplashScreen";
import LegalTermsPage from "./components/LegalTermsPage";
import LegalPrivacyPage from "./components/LegalPrivacyPage";
import TurnstileWidget from "./components/TurnstileWidget";

const PUBLIC_APP_ROUTES = new Set([
  "/help",
  "/about",
  "/privacy",
  "/terms",
  "/contact",
  "/upgrade",
]);

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isHumanVerified, setIsHumanVerified] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationNonce, setVerificationNonce] = useState(0);
  const handleSplashComplete = useCallback(() => setShowSplash(false), []);
  const handleHumanVerified = useCallback(() => {
    setVerificationError(null);
    setIsHumanVerified(true);
  }, []);
  const handleVerificationError = useCallback((message: string) => {
    setIsHumanVerified(false);
    setVerificationError(message);
  }, []);
  const retryVerification = useCallback(() => {
    setVerificationError(null);
    setVerificationNonce((n) => n + 1);
  }, []);

  useEffect(() => {
    const onVerificationRequired = () => {
      setIsHumanVerified(false);
      setVerificationError(null);
      setVerificationNonce((n) => n + 1);
    };
    window.addEventListener("turnstile:required", onVerificationRequired);
    return () => window.removeEventListener("turnstile:required", onVerificationRequired);
  }, []);

  const path = window.location.pathname;
  if (path === "/legal/terms") return <LegalTermsPage />;
  if (path === "/legal/privacy") return <LegalPrivacyPage />;
  const isPublicAppRoute = PUBLIC_APP_ROUTES.has(path) || path.startsWith("/user/");
  const showBlockingSplash = showSplash || (!isHumanVerified && !isPublicAppRoute);
  const showVerificationError = !showSplash && !isHumanVerified && !isPublicAppRoute && verificationError;

  return (
    <>
      <TurnstileWidget
        onVerified={handleHumanVerified}
        onError={handleVerificationError}
        verificationNonce={verificationNonce}
      />
      {!showBlockingSplash && <Terminal />}
      {showBlockingSplash && !showVerificationError && <SplashScreen onComplete={handleSplashComplete} />}
      {showVerificationError && (
        <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center p-6">
          <div className="max-w-xl border border-red-500/70 bg-zinc-950 p-5">
            <p className="text-red-400 mb-3">[HUMAN VERIFICATION FAILED]</p>
            <p className="text-sm text-zinc-200 mb-4">{verificationError}</p>
            <button
              onClick={retryVerification}
              className="border border-zinc-500 px-3 py-1 text-sm hover:border-white"
            >
              Retry verification
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;

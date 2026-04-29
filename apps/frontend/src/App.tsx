import { useState, useCallback, useEffect } from "react";
import Terminal from "./components/Terminal";
import SplashScreen from "./components/SplashScreen";
import LegalTermsPage from "./components/LegalTermsPage";
import LegalPrivacyPage from "./components/LegalPrivacyPage";
import TurnstileWidget from "./components/TurnstileWidget";
import { TURNSTILE_REQUIRED_EVENT } from "./turnstileEvents";

type VerificationPhase = "boot" | "idle" | "required" | "retrying";

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isHumanVerified, setIsHumanVerified] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationNonce, setVerificationNonce] = useState(0);
  const [verificationPhase, setVerificationPhase] = useState<VerificationPhase>("boot");
  const handleSplashComplete = useCallback(() => setShowSplash(false), []);
  const handleHumanVerified = useCallback(() => {
    setVerificationError(null);
    setIsHumanVerified(true);
    setVerificationPhase("idle");
  }, []);
  const handleVerificationError = useCallback((message: string) => {
    setIsHumanVerified(false);
    setVerificationError(message);
    setVerificationPhase("required");
  }, []);
  const retryVerification = useCallback(() => {
    setVerificationError(null);
    setVerificationPhase("retrying");
    setVerificationNonce((n) => n + 1);
  }, []);

  useEffect(() => {
    const onVerificationRequired = () => {
      setIsHumanVerified(false);
      setVerificationError(null);
      setVerificationPhase("required");
      setVerificationNonce((n) => n + 1);
    };
    window.addEventListener(TURNSTILE_REQUIRED_EVENT, onVerificationRequired);
    return () => window.removeEventListener(TURNSTILE_REQUIRED_EVENT, onVerificationRequired);
  }, []);

  const path = window.location.pathname;
  if (path === "/legal/terms") return <LegalTermsPage />;
  if (path === "/legal/privacy") return <LegalPrivacyPage />;
  const showSplashScreen = showSplash || (!isHumanVerified && verificationPhase === "boot");
  const showVerificationGate = !showSplash && !isHumanVerified && (verificationPhase === "required" || verificationPhase === "retrying");

  return (
    <>
      <TurnstileWidget
        onVerified={handleHumanVerified}
        onError={handleVerificationError}
        verificationNonce={verificationNonce}
      />
      {!showSplashScreen && !showVerificationGate && <Terminal />}
      {showSplashScreen && <SplashScreen onComplete={handleSplashComplete} />}
      {showVerificationGate && (
        <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center p-6">
          <div className="max-w-xl border border-red-500/70 bg-zinc-950 p-5">
            <p className="text-red-400 mb-3">
              {verificationPhase === "retrying" ? "[RETRYING HUMAN VERIFICATION]" : "[HUMAN VERIFICATION FAILED]"}
            </p>
            <p className="text-sm text-zinc-200 mb-4">
              {verificationPhase === "retrying"
                ? "Retrying human verification..."
                : verificationError}
            </p>
            {verificationPhase !== "retrying" && (
              <button
                onClick={retryVerification}
                className="border border-zinc-500 px-3 py-1 text-sm hover:border-white"
              >
                Retry verification
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default App;

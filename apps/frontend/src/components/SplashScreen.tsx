import { useState, useEffect } from "react";
import { ACTIVE_SPLASH_VARIANT } from "../logoRotation";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 2000);
    const removeTimer = setTimeout(() => onComplete(), 2800);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-700 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <picture className="flex h-full w-full items-center justify-center p-4 sm:p-8">
        <source media="(min-width: 640px)" srcSet={ACTIVE_SPLASH_VARIANT.splashDesktop} />
        <img
          src={ACTIVE_SPLASH_VARIANT.splashMobile}
          alt="Claude Cope"
          className="max-h-full max-w-full object-contain"
          decoding="async"
          fetchPriority="high"
        />
      </picture>
    </div>
  );
}

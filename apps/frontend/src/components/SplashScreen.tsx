import { useState, useEffect } from "react";

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
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#0d1117] transition-opacity duration-700 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <picture>
        <source media="(min-width: 640px)" srcSet="/media/logo-800-transparent.png" />
        <img
          src="/media/logo-400-transparent.png"
          alt="Claude Cope"
          className="max-w-[280px] px-6 sm:max-w-lg sm:px-0 md:max-w-xl lg:max-w-2xl"
        />
      </picture>
    </div>
  );
}

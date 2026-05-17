import { useEffect, useState } from "react";

export function useIsMobileViewport(breakpointPx = 767): boolean {
  const [isMobileViewport, setIsMobileViewport] = useState(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false;
    }
    return window.matchMedia(`(max-width: ${breakpointPx}px)`).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia(`(max-width: ${breakpointPx}px)`);
    const updateMatch = (event?: MediaQueryListEvent) => {
      setIsMobileViewport(event ? event.matches : mediaQuery.matches);
    };

    updateMatch();
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateMatch);
      return () => mediaQuery.removeEventListener("change", updateMatch);
    }

    mediaQuery.addListener(updateMatch);
    return () => mediaQuery.removeListener(updateMatch);
  }, [breakpointPx]);

  return isMobileViewport;
}

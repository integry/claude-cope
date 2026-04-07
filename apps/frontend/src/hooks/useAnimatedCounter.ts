import { useState, useEffect, useRef } from "react";

/**
 * Animates a numeric value from its current displayed value to a target,
 * using requestAnimationFrame for smooth interpolation.
 */
export function useAnimatedCounter(target: number, duration = 600): number {
  const [display, setDisplay] = useState(target);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef({ value: target, time: 0 });

  useEffect(() => {
    const from = display;
    const delta = target - from;

    if (delta === 0) return;

    startRef.current = { value: from, time: performance.now() };

    const animate = (now: number) => {
      const elapsed = now - startRef.current.time;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic for a snappy-then-smooth feel
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startRef.current.value + delta * eased;

      setDisplay(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(target);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return display;
}

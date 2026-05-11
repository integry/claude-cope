import { useState, useEffect, useRef } from "react";

interface UseAnimatedCounterOptions {
  duration?: number;
  animateDecreases?: boolean;
  resetKey?: string | number | null | undefined;
}

/**
 * Animates a numeric value from its current displayed value to a target,
 * using requestAnimationFrame for smooth interpolation.
 */
export function useAnimatedCounter(target: number, durationOrOptions: number | UseAnimatedCounterOptions = 600): number {
  const options = typeof durationOrOptions === "number" ? { duration: durationOrOptions } : durationOrOptions;
  const duration = options.duration ?? 600;
  const animateDecreases = options.animateDecreases ?? true;
  const resetKey = options.resetKey;
  const [display, setDisplay] = useState(target);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef({ value: target, time: 0 });
  const displayRef = useRef(target);
  const previousResetKeyRef = useRef(resetKey);

  useEffect(() => {
    displayRef.current = display;
  }, [display]);

  useEffect(() => {
    const resetKeyChanged = previousResetKeyRef.current !== resetKey;
    previousResetKeyRef.current = resetKey;

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (resetKeyChanged) {
      displayRef.current = target;
      setDisplay(target);
      return;
    }

    const from = displayRef.current;
    const delta = target - from;

    if (delta === 0) return;
    if (!animateDecreases && delta < 0) {
      displayRef.current = target;
      setDisplay(target);
      return;
    }
    if (duration <= 0) {
      displayRef.current = target;
      setDisplay(target);
      return;
    }

    startRef.current = { value: from, time: performance.now() };

    const animate = (now: number) => {
      const elapsed = now - startRef.current.time;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic for a snappy-then-smooth feel
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startRef.current.value + delta * eased;

      displayRef.current = current;
      setDisplay(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        displayRef.current = target;
        setDisplay(target);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target, duration, animateDecreases, resetKey]);

  return display;
}

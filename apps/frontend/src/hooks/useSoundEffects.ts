import { useRef, useCallback, useEffect } from "react";

/** Audio file paths for retro terminal sound effects */
const AUDIO_PATHS = {
  error: "/media/sounds/error.wav",
  chime: "/media/sounds/chime.wav",
} as const;

interface SoundEffects {
  playError: () => void;
  playChime: () => void;
}

/**
 * Custom hook for retro terminal sound effects.
 * Manages HTML5 Audio objects for errors and achievements.
 *
 * @param soundEnabled - Master toggle to enable/disable all sounds
 * @returns Object with playError and playChime functions
 */
export function useSoundEffects(soundEnabled: boolean): SoundEffects {
  const errorAudioRef = useRef<HTMLAudioElement | null>(null);
  const chimeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Track initialization state
  const initializedRef = useRef(false);

  // Initialize audio objects on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Create error sound
    errorAudioRef.current = new Audio(AUDIO_PATHS.error);
    errorAudioRef.current.preload = "auto";
    errorAudioRef.current.volume = 0.5;

    // Create chime sound
    chimeAudioRef.current = new Audio(AUDIO_PATHS.chime);
    chimeAudioRef.current.preload = "auto";
    chimeAudioRef.current.volume = 0.6;

    // Cleanup on unmount
    return () => {
      if (errorAudioRef.current) {
        errorAudioRef.current.pause();
        errorAudioRef.current.src = "";
        errorAudioRef.current = null;
      }

      if (chimeAudioRef.current) {
        chimeAudioRef.current.pause();
        chimeAudioRef.current.src = "";
        chimeAudioRef.current = null;
      }

      initializedRef.current = false;
    };
  }, []);

  /**
   * Play an error/beep sound for invalid actions or warnings.
   */
  const playError = useCallback(() => {
    if (!soundEnabled) return;
    if (!errorAudioRef.current) return;

    errorAudioRef.current.currentTime = 0;
    errorAudioRef.current.play().catch(() => {
      // Ignore autoplay restrictions
    });
  }, [soundEnabled]);

  /**
   * Play a chime sound for achievements or positive feedback.
   */
  const playChime = useCallback(() => {
    if (!soundEnabled) return;
    if (!chimeAudioRef.current) return;

    chimeAudioRef.current.currentTime = 0;
    chimeAudioRef.current.play().catch(() => {
      // Ignore autoplay restrictions
    });
  }, [soundEnabled]);

  return { playError, playChime };
}

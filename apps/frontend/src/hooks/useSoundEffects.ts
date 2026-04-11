import { useRef, useCallback, useEffect } from "react";

/** Audio file paths for retro terminal sound effects */
const AUDIO_PATHS = {
  type: "/media/sounds/type.mp3",
  error: "/media/sounds/error.mp3",
  chime: "/media/sounds/chime.mp3",
} as const;

/** Number of Audio objects in the typing pool to prevent clipping during rapid input */
const TYPE_POOL_SIZE = 8;

interface SoundEffects {
  playType: () => void;
  playError: () => void;
  playChime: () => void;
}

/**
 * Custom hook for retro terminal sound effects.
 * Manages HTML5 Audio objects for keystrokes, errors, and achievements.
 * Uses an audio pool for typing sounds to prevent clipping during rapid input.
 *
 * @param soundEnabled - Master toggle to enable/disable all sounds
 * @returns Object with playType, playError, and playChime functions
 */
export function useSoundEffects(soundEnabled: boolean): SoundEffects {
  // Pool of Audio objects for typing sounds (prevents clipping during rapid typing)
  const typePoolRef = useRef<HTMLAudioElement[]>([]);
  const typePoolIndexRef = useRef(0);

  // Single Audio objects for less frequent sounds
  const errorAudioRef = useRef<HTMLAudioElement | null>(null);
  const chimeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Track initialization state
  const initializedRef = useRef(false);

  // Initialize audio objects on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Create typing sound pool
    typePoolRef.current = Array.from({ length: TYPE_POOL_SIZE }, () => {
      const audio = new Audio(AUDIO_PATHS.type);
      audio.preload = "auto";
      audio.volume = 0.3; // Lower volume for typing sounds
      return audio;
    });

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
      typePoolRef.current.forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
      typePoolRef.current = [];

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
   * Play a typing/keystroke sound.
   * Uses a round-robin pool to allow rapid successive plays without clipping.
   */
  const playType = useCallback(() => {
    if (!soundEnabled) return;
    if (typePoolRef.current.length === 0) return;

    const audio = typePoolRef.current[typePoolIndexRef.current];
    if (audio) {
      // Reset to start and play
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Ignore autoplay restrictions — user interaction required
      });
    }

    // Advance to next audio object in the pool
    typePoolIndexRef.current = (typePoolIndexRef.current + 1) % TYPE_POOL_SIZE;
  }, [soundEnabled]);

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

  return { playType, playError, playChime };
}

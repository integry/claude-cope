import { describe, it, expect, vi } from "vitest";

/**
 * Tests for the useSoundEffects hook logic.
 *
 * The hook provides two sound functions:
 * - playError(): Plays an error/beep sound
 * - playChime(): Plays a chime for achievements, task acceptance, and task completion
 *
 * All functions respect the soundEnabled master toggle.
 */

/* ------------------------------------------------------------------ */
/*  Mock Audio class                                                   */
/* ------------------------------------------------------------------ */

class MockAudio {
  src = "";
  preload = "";
  volume = 1;
  currentTime = 0;
  playCalled = false;
  pauseCalled = false;

  play = vi.fn().mockImplementation(() => {
    this.playCalled = true;
    return Promise.resolve();
  });

  pause = vi.fn().mockImplementation(() => {
    this.pauseCalled = true;
  });

  constructor(src?: string) {
    if (src) {
      this.src = src;
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Helper: replicate behavior from useSoundEffects                    */
/* ------------------------------------------------------------------ */

interface AudioPool {
  errorAudio: MockAudio;
  chimeAudio: MockAudio;
}

function createAudioPool(): AudioPool {
  return {
    errorAudio: (() => {
      const audio = new MockAudio("/media/sounds/error.wav");
      audio.volume = 0.5;
      audio.preload = "auto";
      return audio;
    })(),
    chimeAudio: (() => {
      const audio = new MockAudio("/media/sounds/chime.wav");
      audio.volume = 0.6;
      audio.preload = "auto";
      return audio;
    })(),
  };
}

function playError(pool: AudioPool, soundEnabled: boolean): void {
  if (!soundEnabled) return;
  pool.errorAudio.currentTime = 0;
  pool.errorAudio.play();
}

function playChime(pool: AudioPool, soundEnabled: boolean): void {
  if (!soundEnabled) return;
  pool.chimeAudio.currentTime = 0;
  pool.chimeAudio.play();
}

/* ------------------------------------------------------------------ */
/*  Audio pool initialization tests                                    */
/* ------------------------------------------------------------------ */

describe("useSoundEffects audio initialization", () => {
  it("sets error sound volume to 0.5", () => {
    const pool = createAudioPool();
    expect(pool.errorAudio.volume).toBe(0.5);
  });

  it("sets chime sound volume to 0.6", () => {
    const pool = createAudioPool();
    expect(pool.chimeAudio.volume).toBe(0.6);
  });

  it("sets preload to auto for all audio objects", () => {
    const pool = createAudioPool();
    expect(pool.errorAudio.preload).toBe("auto");
    expect(pool.chimeAudio.preload).toBe("auto");
  });

  it("uses correct file paths", () => {
    const pool = createAudioPool();
    expect(pool.errorAudio.src).toBe("/media/sounds/error.wav");
    expect(pool.chimeAudio.src).toBe("/media/sounds/chime.wav");
  });
});

/* ------------------------------------------------------------------ */
/*  playError tests                                                    */
/* ------------------------------------------------------------------ */

describe("playError", () => {
  it("plays error sound when soundEnabled is true", () => {
    const pool = createAudioPool();
    playError(pool, true);
    expect(pool.errorAudio.play).toHaveBeenCalledTimes(1);
  });

  it("does not play error sound when soundEnabled is false", () => {
    const pool = createAudioPool();
    playError(pool, false);
    expect(pool.errorAudio.play).not.toHaveBeenCalled();
  });

  it("resets currentTime before playing", () => {
    const pool = createAudioPool();
    pool.errorAudio.currentTime = 0.5;

    playError(pool, true);

    expect(pool.errorAudio.currentTime).toBe(0);
  });

  it("can be called multiple times", () => {
    const pool = createAudioPool();

    playError(pool, true);
    playError(pool, true);
    playError(pool, true);

    expect(pool.errorAudio.play).toHaveBeenCalledTimes(3);
  });
});

/* ------------------------------------------------------------------ */
/*  playChime tests                                                    */
/* ------------------------------------------------------------------ */

describe("playChime", () => {
  it("plays chime sound when soundEnabled is true", () => {
    const pool = createAudioPool();
    playChime(pool, true);
    expect(pool.chimeAudio.play).toHaveBeenCalledTimes(1);
  });

  it("does not play chime sound when soundEnabled is false", () => {
    const pool = createAudioPool();
    playChime(pool, false);
    expect(pool.chimeAudio.play).not.toHaveBeenCalled();
  });

  it("resets currentTime before playing", () => {
    const pool = createAudioPool();
    pool.chimeAudio.currentTime = 0.5;

    playChime(pool, true);

    expect(pool.chimeAudio.currentTime).toBe(0);
  });

  it("can be called multiple times", () => {
    const pool = createAudioPool();

    playChime(pool, true);
    playChime(pool, true);

    expect(pool.chimeAudio.play).toHaveBeenCalledTimes(2);
  });
});

/* ------------------------------------------------------------------ */
/*  soundEnabled toggle tests                                          */
/* ------------------------------------------------------------------ */

describe("soundEnabled toggle", () => {
  it("all play functions respect soundEnabled = false", () => {
    const pool = createAudioPool();

    playError(pool, false);
    playChime(pool, false);

    expect(pool.errorAudio.play).not.toHaveBeenCalled();
    expect(pool.chimeAudio.play).not.toHaveBeenCalled();
  });

  it("all play functions work when soundEnabled = true", () => {
    const pool = createAudioPool();

    playError(pool, true);
    playChime(pool, true);

    expect(pool.errorAudio.play).toHaveBeenCalledTimes(1);
    expect(pool.chimeAudio.play).toHaveBeenCalledTimes(1);
  });
});

import { describe, it, expect, vi } from "vitest";

/**
 * Tests for the useSoundEffects hook logic.
 *
 * The hook provides three sound functions:
 * - playType(): Uses a round-robin pool of 8 Audio objects for rapid typing
 * - playError(): Plays an error/beep sound
 * - playChime(): Plays a chime for achievements
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
/*  Helper: replicate pool behavior from useSoundEffects               */
/* ------------------------------------------------------------------ */

const TYPE_POOL_SIZE = 8;

interface AudioPool {
  typePool: MockAudio[];
  typePoolIndex: number;
  errorAudio: MockAudio;
  chimeAudio: MockAudio;
}

function createAudioPool(): AudioPool {
  return {
    typePool: Array.from({ length: TYPE_POOL_SIZE }, () => {
      const audio = new MockAudio("/media/sounds/type.wav");
      audio.volume = 0.3;
      audio.preload = "auto";
      return audio;
    }),
    typePoolIndex: 0,
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

function playType(pool: AudioPool, soundEnabled: boolean): AudioPool {
  if (!soundEnabled) return pool;
  if (pool.typePool.length === 0) return pool;

  const audio = pool.typePool[pool.typePoolIndex];
  if (audio) {
    audio.currentTime = 0;
    audio.play();
  }

  return {
    ...pool,
    typePoolIndex: (pool.typePoolIndex + 1) % TYPE_POOL_SIZE,
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

describe("useSoundEffects audio pool initialization", () => {
  it("creates a pool of 8 typing sounds", () => {
    const pool = createAudioPool();
    expect(pool.typePool.length).toBe(8);
  });

  it("sets typing sound volume to 0.3", () => {
    const pool = createAudioPool();
    pool.typePool.forEach((audio) => {
      expect(audio.volume).toBe(0.3);
    });
  });

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
    pool.typePool.forEach((audio) => {
      expect(audio.preload).toBe("auto");
    });
    expect(pool.errorAudio.preload).toBe("auto");
    expect(pool.chimeAudio.preload).toBe("auto");
  });

  it("uses correct file paths", () => {
    const pool = createAudioPool();
    pool.typePool.forEach((audio) => {
      expect(audio.src).toBe("/media/sounds/type.wav");
    });
    expect(pool.errorAudio.src).toBe("/media/sounds/error.wav");
    expect(pool.chimeAudio.src).toBe("/media/sounds/chime.wav");
  });
});

/* ------------------------------------------------------------------ */
/*  playType tests                                                     */
/* ------------------------------------------------------------------ */

describe("playType", () => {
  it("plays typing sound when soundEnabled is true", () => {
    const pool = createAudioPool();
    playType(pool, true);
    expect(pool.typePool[0]?.play).toHaveBeenCalledTimes(1);
  });

  it("does not play typing sound when soundEnabled is false", () => {
    const pool = createAudioPool();
    playType(pool, false);
    pool.typePool.forEach((audio) => {
      expect(audio.play).not.toHaveBeenCalled();
    });
  });

  it("cycles through the audio pool (round-robin)", () => {
    let pool = createAudioPool();

    // Play 10 times
    for (let i = 0; i < 10; i++) {
      pool = playType(pool, true);
    }

    // First two sounds should have been played twice (indices 0, 1 wrap around)
    expect(pool.typePool[0]?.play).toHaveBeenCalledTimes(2);
    expect(pool.typePool[1]?.play).toHaveBeenCalledTimes(2);
    // Index 2-7 should have been played once
    for (let i = 2; i < 8; i++) {
      expect(pool.typePool[i]?.play).toHaveBeenCalledTimes(1);
    }
  });

  it("advances pool index correctly", () => {
    let pool = createAudioPool();
    expect(pool.typePoolIndex).toBe(0);

    pool = playType(pool, true);
    expect(pool.typePoolIndex).toBe(1);

    pool = playType(pool, true);
    expect(pool.typePoolIndex).toBe(2);
  });

  it("wraps pool index at TYPE_POOL_SIZE", () => {
    let pool = createAudioPool();

    // Play 8 times to reach the wrap point
    for (let i = 0; i < 8; i++) {
      pool = playType(pool, true);
    }
    expect(pool.typePoolIndex).toBe(0);
  });

  it("resets currentTime before playing", () => {
    const pool = createAudioPool();
    pool.typePool[0]!.currentTime = 0.5;

    playType(pool, true);

    expect(pool.typePool[0]?.currentTime).toBe(0);
  });

  it("does not advance pool index when soundEnabled is false", () => {
    let pool = createAudioPool();
    expect(pool.typePoolIndex).toBe(0);

    pool = playType(pool, false);
    expect(pool.typePoolIndex).toBe(0);
  });

  it("prevents clipping during rapid input by using different audio objects", () => {
    let pool = createAudioPool();

    // Rapid fire 5 typing sounds
    for (let i = 0; i < 5; i++) {
      pool = playType(pool, true);
    }

    // Each of the first 5 audio objects should have been used once
    for (let i = 0; i < 5; i++) {
      expect(pool.typePool[i]?.play).toHaveBeenCalledTimes(1);
    }

    // No audio object should have been used twice yet
    const maxCalls = Math.max(...pool.typePool.map((a) => a.play.mock.calls.length));
    expect(maxCalls).toBe(1);
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

    playType(pool, false);
    playError(pool, false);
    playChime(pool, false);

    // No audio should have been played
    pool.typePool.forEach((audio) => {
      expect(audio.play).not.toHaveBeenCalled();
    });
    expect(pool.errorAudio.play).not.toHaveBeenCalled();
    expect(pool.chimeAudio.play).not.toHaveBeenCalled();
  });

  it("all play functions work when soundEnabled = true", () => {
    let pool = createAudioPool();

    pool = playType(pool, true);
    playError(pool, true);
    playChime(pool, true);

    expect(pool.typePool[0]?.play).toHaveBeenCalledTimes(1);
    expect(pool.errorAudio.play).toHaveBeenCalledTimes(1);
    expect(pool.chimeAudio.play).toHaveBeenCalledTimes(1);
  });

  it("toggling soundEnabled affects subsequent calls", () => {
    let pool = createAudioPool();

    // Enable: should play
    pool = playType(pool, true);
    expect(pool.typePool[0]?.play).toHaveBeenCalledTimes(1);

    // Disable: should not play
    pool = playType(pool, false);
    expect(pool.typePool[1]?.play).not.toHaveBeenCalled();

    // Enable again: should play
    pool = playType(pool, true);
    expect(pool.typePool[1]?.play).toHaveBeenCalledTimes(1);
  });
});

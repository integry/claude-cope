// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGameState } from "../useGameState";
import { createServerProfile } from "../../test/createServerProfile";
import type { GameState } from "../gameStateUtils";
import { STORAGE_KEY } from "../storageKey";

vi.mock("../../analytics", () => ({
  track: vi.fn(),
  identify: vi.fn(),
}));

vi.mock("../../supabaseClient", () => ({
  supabase: null,
}));

vi.mock("../useGameEffects", () => ({
  useScoreSync: vi.fn(),
  useAchievementChecker: vi.fn(),
}));

vi.mock("../../api/profileApi", () => ({
  buyGeneratorServer: vi.fn(),
  buyUpgradeServer: vi.fn(),
  buyThemeServer: vi.fn(),
  unlockAchievementServer: vi.fn(),
  updateTicketServer: vi.fn(),
  fetchSessionProfile: vi.fn().mockResolvedValue({ found: false }),
  updateThemeServer: vi.fn(),
}));

import { updateThemeServer } from "../../api/profileApi";

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    version: "1.0",
    username: "alice",
    lastLogin: 0,
    economy: {
      currentTD: 6000,
      totalTDEarned: 6000,
      currentRank: "Junior Code Monkey",
      quotaPercent: 100,
      quotaLockouts: 0,
      tdMultiplier: 1,
    },
    inventory: {},
    upgrades: [],
    achievements: [],
    buddy: {
      type: null,
      isShiny: false,
      promptsSinceLastInterjection: 0,
    },
    chatHistory: [],
    commandUsage: {},
    modes: { fast: false, voice: false },
    activeTicket: null,
    hasSeenTicketPrompt: false,
    activeTheme: "default",
    unlockedThemes: ["default", "amber", "midnight"],
    soundEnabled: true,
    pendingCompletedTaskIds: [],
    isPro: true,
    hasSessionPro: true,
    ...overrides,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function HookHarness(props: { onRender: (hook: ReturnType<typeof useGameState>) => void }) {
  props.onRender(useGameState());
  return null;
}

describe("useGameState theme persistence", () => {
  let container!: HTMLDivElement;
  let root!: ReturnType<typeof createRoot>;
  let hookState!: ReturnType<typeof useGameState>;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(makeState()));
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    act(() => {
      root.render(createElement(HookHarness, {
        onRender: (value) => {
          hookState = value;
        },
      }));
    });
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("ignores stale update-theme responses so older selections do not overwrite the latest theme", async () => {
    const firstRequest = deferred<{ success: boolean; profile: ReturnType<typeof createServerProfile> }>();
    const secondRequest = deferred<{ success: boolean; profile: ReturnType<typeof createServerProfile> }>();
    vi.mocked(updateThemeServer)
      .mockReturnValueOnce(firstRequest.promise)
      .mockReturnValueOnce(secondRequest.promise);

    act(() => {
      hookState.setActiveTheme("amber");
    });
    act(() => {
      hookState.setActiveTheme("midnight");
    });

    expect(hookState.state.activeTheme).toBe("midnight");

    await act(async () => {
      secondRequest.resolve({
        success: true,
        profile: createServerProfile({ active_theme: "midnight", unlocked_themes: ["default", "amber", "midnight"] }),
      });
      await Promise.resolve();
    });

    expect(hookState.state.activeTheme).toBe("midnight");

    await act(async () => {
      firstRequest.resolve({
        success: true,
        profile: createServerProfile({ active_theme: "amber", unlocked_themes: ["default", "amber", "midnight"] }),
      });
      await Promise.resolve();
    });

    expect(hookState.state.activeTheme).toBe("midnight");
  });

  it("rolls back to the last confirmed theme and surfaces update-theme failures", async () => {
    const confirmedRequest = deferred<{
      success: true;
      profile: ReturnType<typeof createServerProfile>;
    }>();
    const request = deferred<{
      success: false;
      error: string;
      errorCode: "session_auth_required";
    }>();
    vi.mocked(updateThemeServer)
      .mockReturnValueOnce(confirmedRequest.promise)
      .mockReturnValueOnce(request.promise);

    act(() => {
      hookState.setActiveTheme("midnight");
    });

    await act(async () => {
      confirmedRequest.resolve({
        success: true,
        profile: createServerProfile({ active_theme: "midnight", unlocked_themes: ["default", "amber", "midnight"] }),
      });
      await confirmedRequest.promise;
    });

    act(() => {
      hookState.setActiveTheme("amber");
    });

    expect(hookState.state.activeTheme).toBe("amber");

    await act(async () => {
      request.resolve({
        success: false,
        error: "Session authentication is required for this purchase",
        errorCode: "session_auth_required",
      });
      await request.promise;
    });

    expect(hookState.state.activeTheme).toBe("midnight");
    expect(hookState.state.hasSessionPro).toBeUndefined();
    expect(hookState.state.chatHistory[hookState.state.chatHistory.length - 1]).toMatchObject({
      role: "error",
      content: "[❌ Error] Session authentication is required for this purchase",
    });
  });
});

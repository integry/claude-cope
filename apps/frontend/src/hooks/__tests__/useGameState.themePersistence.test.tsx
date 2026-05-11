// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGameState } from "../useGameState";
import { createServerProfile } from "../../test/createServerProfile";
import { ALL_ACHIEVEMENTS } from "../../game/achievements";
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

import { buyGeneratorServer, buyThemeServer, buyUpgradeServer, fetchSessionProfile, unlockAchievementServer, updateThemeServer, updateTicketServer } from "../../api/profileApi";

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

  function remountWithState(state: GameState) {
    act(() => {
      root.unmount();
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    act(() => {
      root = createRoot(container);
      root.render(createElement(HookHarness, { onRender: (value) => { hookState = value; } }));
    });
  }

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
      await secondRequest.promise;
    });
    await vi.waitFor(() => expect(hookState.state.activeTheme).toBe("midnight"));
    await act(async () => {
      firstRequest.resolve({
        success: true,
        profile: createServerProfile({ active_theme: "amber", unlocked_themes: ["default", "amber", "midnight"] }),
      });
      await firstRequest.promise;
    });

    await vi.waitFor(() => expect(hookState.state.activeTheme).toBe("midnight"));
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
        error: "Session authentication is required for theme updates",
        errorCode: "session_auth_required",
      });
      await request.promise;
    });

    await vi.waitFor(() => expect(hookState.state.activeTheme).toBe("midnight"));
    await vi.waitFor(() => expect(hookState.state.hasSessionPro).toBeUndefined());
    await vi.waitFor(() => expect(hookState.state.chatHistory[hookState.state.chatHistory.length - 1]).toMatchObject({
      role: "error",
      content: "[❌ Error] Session authentication is required for theme updates",
    }));
  });

  it("restores the server active theme for existing paid sessions with non-fresh local state", async () => {
    vi.mocked(fetchSessionProfile).mockResolvedValueOnce({
      found: true,
      isPro: true,
      username: "alice",
      profile: createServerProfile({
        active_theme: "midnight",
        unlocked_themes: ["default", "amber", "midnight"],
      }),
    });
    remountWithState(makeState({
      activeTheme: "default",
      unlockedThemes: ["default", "amber", "midnight"],
      chatHistory: [{ id: 1, role: "user", content: "hello" }],
    }));

    await vi.waitFor(() => expect(hookState.state.activeTheme).toBe("midnight"));
  });

  it("rolls back to the validated server theme when update-theme fails after non-fresh /me restoration", async () => {
    vi.mocked(fetchSessionProfile).mockResolvedValueOnce({
      found: true,
      isPro: true,
      username: "alice",
      profile: createServerProfile({
        active_theme: "midnight",
        unlocked_themes: ["default", "amber", "midnight"],
      }),
    });
    remountWithState(makeState({
      activeTheme: "default",
      unlockedThemes: ["default", "amber", "midnight"],
      chatHistory: [{ id: 1, role: "user", content: "hello" }],
    }));

    await vi.waitFor(() => expect(hookState.state.activeTheme).toBe("midnight"));

    const request = deferred<{
      success: false;
      error: string;
      errorCode: "session_auth_required";
    }>();
    vi.mocked(updateThemeServer).mockReturnValueOnce(request.promise);

    act(() => {
      hookState.setActiveTheme("amber");
    });

    expect(hookState.state.activeTheme).toBe("amber");

    await act(async () => {
      request.resolve({
        success: false,
        error: "Session authentication is required for theme updates",
        errorCode: "session_auth_required",
      });
      await request.promise;
    });

    await vi.waitFor(() => expect(hookState.state.activeTheme).toBe("midnight"));
  });

  it("clears stale session-backed paid state when /me no longer finds the session profile", async () => {
    vi.mocked(fetchSessionProfile).mockResolvedValueOnce({ found: false });
    remountWithState(makeState({
      isPro: true,
      hasSessionPro: true,
      proKey: undefined,
      proKeyHash: undefined,
    }));

    await vi.waitFor(() => expect(hookState.state.isPro).toBeUndefined());
    await vi.waitFor(() => expect(hookState.state.hasSessionPro).toBeUndefined());
  });

  it("preserves local license-backed paid state when /me no longer finds the session profile", async () => {
    vi.mocked(fetchSessionProfile).mockResolvedValueOnce({ found: false });
    remountWithState(makeState({
      isPro: true,
      hasSessionPro: true,
      proKey: "pro-key",
      proKeyHash: "pro-hash",
    }));

    await vi.waitFor(() => expect(hookState.state.proKeyHash).toBe("pro-hash"));
    await vi.waitFor(() => expect(hookState.state.isPro).toBe(true));
    await vi.waitFor(() => expect(hookState.state.hasSessionPro).toBeUndefined());
  });

  it("restores the full server-authoritative profile for paid sessions during /me reconciliation", async () => {
    vi.mocked(fetchSessionProfile).mockResolvedValueOnce({
      found: true,
      isPro: true,
      username: "alice",
      profile: createServerProfile({
        total_td: 1500,
        current_td: 900,
        corporate_rank: "Staff Engineer",
        inventory: { coffee: 3 },
        upgrades: ["ci_cd"],
        achievements: ["ship_it"],
        buddy_type: "cat",
        buddy_is_shiny: true,
        active_ticket: { id: "T-1", title: "Ship it", sprintProgress: 1, sprintGoal: 3 },
        active_theme: "midnight",
        unlocked_themes: ["default", "amber", "midnight"],
      }),
    });
    remountWithState(makeState({
      activeTheme: "default",
      inventory: { tea: 2 },
      upgrades: [],
      achievements: [],
      buddy: {
        type: null,
        isShiny: false,
        promptsSinceLastInterjection: 0,
      },
      activeTicket: null,
      chatHistory: [{ id: 1, role: "user", content: "hello" }],
    }));

    await vi.waitFor(() => expect(hookState.state.activeTheme).toBe("midnight"));
    await vi.waitFor(() => expect(hookState.state.inventory).toEqual({ coffee: 3 }));
    await vi.waitFor(() => expect(hookState.state.upgrades).toEqual(["ci_cd"]));
    await vi.waitFor(() => expect(hookState.state.achievements).toEqual(["ship_it"]));
    await vi.waitFor(() => expect(hookState.state.buddy.type).toBe("cat"));
    await vi.waitFor(() => expect(hookState.state.buddy.isShiny).toBe(true));
    await vi.waitFor(() => expect(hookState.state.activeTicket).toMatchObject({ id: "T-1" }));
  });

  it("does not let buy-theme overwrite a newer optimistic equip selection", async () => {
    remountWithState(makeState({
      activeTheme: "default",
      economy: {
        currentTD: 12000,
        totalTDEarned: 12000,
        currentRank: "Junior Code Monkey",
        quotaPercent: 100,
        quotaLockouts: 0,
        tdMultiplier: 1,
      },
      unlockedThemes: ["default", "amber"],
    }));

    const buyRequest = deferred<{ success: boolean; profile: ReturnType<typeof createServerProfile> }>();
    const updateRequest = deferred<{ success: boolean; profile: ReturnType<typeof createServerProfile> }>();
    vi.mocked(buyThemeServer).mockReturnValueOnce(buyRequest.promise);
    vi.mocked(updateThemeServer).mockReturnValueOnce(updateRequest.promise);

    act(() => {
      hookState.buyTheme("matrix");
    });
    act(() => {
      hookState.setActiveTheme("matrix");
    });

    expect(hookState.state.activeTheme).toBe("matrix");

    await act(async () => {
      buyRequest.resolve({
        success: true,
        profile: createServerProfile({
          active_theme: "default",
          unlocked_themes: ["default", "amber", "matrix"],
        }),
      });
      await buyRequest.promise;
    });

    expect(hookState.state.activeTheme).toBe("matrix");

    await act(async () => {
      updateRequest.resolve({
        success: true,
        profile: createServerProfile({
          active_theme: "matrix",
          unlocked_themes: ["default", "amber", "matrix"],
        }),
      });
      await updateRequest.promise;
    });

    expect(hookState.state.activeTheme).toBe("matrix");
  });

  it("persists generator purchases through the paid session path without proKeyHash", async () => {
    const request = deferred<{
      success: boolean;
      profile: ReturnType<typeof createServerProfile>;
    }>();
    vi.mocked(buyGeneratorServer).mockReturnValueOnce(request.promise);

    act(() => {
      expect(hookState.buyGenerator("intern", 1)).toBe(true);
    });

    expect(buyGeneratorServer).toHaveBeenCalledWith("alice", "intern", 1, undefined);
    expect(hookState.state.inventory.intern).toBe(1);
    expect(hookState.state.economy.currentTD).toBe(5900);

    await act(async () => {
      request.resolve({
        success: true,
        profile: createServerProfile({
          current_td: 5900,
          total_td: 6000,
          inventory: { intern: 1 },
        }),
      });
      await request.promise;
    });

    await vi.waitFor(() => expect(hookState.state.inventory).toEqual({ intern: 1 }));
    await vi.waitFor(() => expect(hookState.state.economy.currentTD).toBe(5900));
  });

  it("persists upgrade purchases through the paid session path without proKeyHash", async () => {
    remountWithState(makeState({
      inventory: { intern: 1 },
      upgrades: [],
    }));
    const request = deferred<{
      success: boolean;
      profile: ReturnType<typeof createServerProfile>;
    }>();
    vi.mocked(buyUpgradeServer).mockReturnValueOnce(request.promise);

    act(() => {
      expect(hookState.buyUpgrade("intern-boost-copypaster")).toBe(true);
    });

    expect(buyUpgradeServer).toHaveBeenCalledWith("alice", "intern-boost-copypaster", undefined);

    await act(async () => {
      request.resolve({
        success: true,
        profile: createServerProfile({
          current_td: 5000,
          total_td: 6000,
          inventory: { intern: 1 },
          upgrades: ["intern-boost-copypaster"],
        }),
      });
      await request.promise;
    });

    await vi.waitFor(() => expect(hookState.state.upgrades).toEqual(["intern-boost-copypaster"]));
    await vi.waitFor(() => expect(hookState.state.economy.currentTD).toBe(5000));
  });

  it("persists achievement unlocks through the paid session path without proKeyHash", () => {
    const achievementId = ALL_ACHIEVEMENTS[0]?.id ?? "the_leaker";
    vi.mocked(unlockAchievementServer).mockResolvedValueOnce({ success: true });

    act(() => {
      expect(hookState.unlockAchievement(achievementId)).toBe(true);
    });

    expect(unlockAchievementServer).toHaveBeenCalledWith("alice", achievementId, undefined);
    expect(hookState.state.achievements).toContain(achievementId);
  });

  it("persists ticket progress updates through the paid session path without proKeyHash", () => {
    vi.mocked(updateTicketServer).mockResolvedValueOnce({ success: true });
    remountWithState(makeState({
      activeTicket: { id: "T-1", title: "Ship it", sprintProgress: 1, sprintGoal: 3 },
    }));

    act(() => {
      hookState.updateTicketProgress(1);
    });

    expect(updateTicketServer).toHaveBeenCalledWith("alice", {
      id: "T-1",
      title: "Ship it",
      sprintProgress: 2,
      sprintGoal: 3,
    }, undefined);
    expect(hookState.state.activeTicket).toMatchObject({ sprintProgress: 2 });
  });
});

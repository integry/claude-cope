// @vitest-environment jsdom
import { act } from "react";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import StoreOverlay from "../StoreOverlay";
import { GENERATORS, UPGRADES } from "../../game/constants";
import type { GameState } from "../../hooks/useGameState";

function createInventory(overrides: Record<string, number> = {}): Record<string, number> {
  return GENERATORS.reduce<Record<string, number>>((inventory, generator) => {
    inventory[generator.id] = overrides[generator.id] ?? 0;
    return inventory;
  }, {});
}

function createState(overrides: Partial<GameState> = {}): GameState {
  return {
    version: "test",
    username: "alice",
    lastLogin: 0,
    economy: {
      currentTD: 2_000,
      totalTDEarned: 2_000,
      currentRank: "Junior Code Monkey",
      quotaPercent: 100,
      quotaLockouts: 0,
      tdMultiplier: 1,
    },
    inventory: createInventory(),
    upgrades: [],
    achievements: [],
    buddy: {
      type: null,
      isShiny: false,
      promptsSinceLastInterjection: 0,
    },
    chatHistory: [],
    suggestedReply: null,
    commandUsage: {},
    modes: { fast: false, voice: false },
    activeTicket: null,
    hasSeenTicketPrompt: false,
    activeTheme: "default",
    unlockedThemes: ["default"],
    soundEnabled: true,
    pendingCompletedTaskIds: [],
    pendingCompletedTaskRewards: {},
    authoritativeProfileFloor: null,
    isExecutiveSupporter: false,
    displayRank: null,
    ...overrides,
  };
}

const defaultProps = {
  state: createState(),
  buyGenerator: vi.fn(() => false),
  buyUpgrade: vi.fn(() => false),
  buyTheme: vi.fn(() => false),
  equipTheme: vi.fn(),
  onClose: vi.fn(),
} satisfies Parameters<typeof StoreOverlay>[0];

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

function renderOverlay(props: Partial<typeof defaultProps> = {}) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root.render(createElement(StoreOverlay, { ...defaultProps, ...props }));
  });
  return container;
}

function cleanup() {
  if (root) act(() => root.unmount());
  if (container?.parentNode) container.parentNode.removeChild(container);
}

function text() {
  return container.textContent ?? "";
}

describe("StoreOverlay", () => {
  afterEach(() => {
    cleanup();
  });

  it("replaces the ambiguous x0 ownership badge with explicit zero-owned copy", () => {
    renderOverlay({
      state: createState({
        inventory: createInventory({
          [GENERATORS[0]!.id]: 0,
        }),
      }),
    });

    expect(text()).toContain("Owned: 0");
    expect(text()).not.toContain("x0");

    const drawer = container.firstElementChild;
    const ownedLabel = Array.from(container.querySelectorAll("span")).find(
      (element) => element.textContent === "Owned: 0",
    );

    expect(drawer?.className).toContain("md:w-[27rem]");
    expect(ownedLabel?.className).toContain("pl-3");
  });

  it("renders explicit ownership labels for non-zero generator counts", () => {
    renderOverlay({
      state: createState({
        inventory: createInventory({
          [GENERATORS[1]!.id]: 3,
        }),
      }),
    });

    expect(text()).toContain("Owned: 3");
  });

  it("labels upgrade multipliers as boosts instead of bare inventory-like values", () => {
    renderOverlay({
      state: createState({
        inventory: createInventory({
          [UPGRADES[0]!.requiredGeneratorId]: 1,
        }),
      }),
    });

    expect(text()).toContain("Boost: StackOverflow Copy-Paster x2");
  });
});

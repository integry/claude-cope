import { GENERATORS, CORPORATE_RANKS, GROWTH_RATE, UPGRADES } from "../game/constants";

const STORAGE_KEY = "claudeCopeState";
const STATE_VERSION = "1.0";

const USERNAME_ADJECTIVES = [
  "Agile", "Async", "Binary", "Blazing", "Caffeinated", "Concurrent", "Cranky",
  "Cursed", "Dangling", "Deployed", "Distributed", "Eager", "Encrypted", "Ephemeral",
  "Flaky", "Floating", "Fuzzy", "Ghostly", "Glitchy", "Hardcoded", "Headless",
  "Idle", "Infinite", "Jittery", "Lazy", "Legacy", "Lurking", "Memoized",
  "Minified", "Mutable", "Nested", "Nocturnal", "Obfuscated", "Orphaned",
  "Parallel", "Patched", "Phantom", "Pixelated", "Quantum", "Reactive",
  "Recursive", "Refactored", "Rogue", "Rusty", "Shadowy", "Silent", "Spinning",
  "Stale", "Static", "Stealth", "Stubborn", "Tangled", "Turbo", "Uncached",
  "Undefined", "Unmerged", "Untested", "Verbose", "Virtual", "Volatile",
];

const USERNAME_NOUNS = [
  "Allocator", "Artifact", "Backup", "Bitmap", "Bot", "Buffer", "Bug",
  "Buildbot", "Cache", "Clipboard", "Compiler", "Container", "Cron",
  "Daemon", "Debugger", "Deployer", "Endpoint", "Exception", "Firewall",
  "Fork", "Gremlin", "Handler", "Hashmap", "Heap", "Instance", "Iterator",
  "Kernel", "Linter", "Logger", "Loop", "Mainframe", "Malloc", "Mutex",
  "Nibble", "Node", "Packet", "Parser", "Pipeline", "Pixel", "Pointer",
  "Process", "Prompt", "Proxy", "Queue", "Rebase", "Router", "Runtime",
  "Script", "Servlet", "Shader", "Shard", "Snippet", "Socket", "Sprocket",
  "Stack", "Subnet", "Thread", "Token", "Transpiler", "Widget", "Zombie",
];

function generateUsername(): string {
  const adj = USERNAME_ADJECTIVES[Math.floor(Math.random() * USERNAME_ADJECTIVES.length)]!;
  const noun = USERNAME_NOUNS[Math.floor(Math.random() * USERNAME_NOUNS.length)]!;
  const num = Math.floor(Math.random() * 10000);
  return `${adj}${noun}${num}`;
}

export type Message = {
  role: "user" | "system" | "loading" | "warning" | "error";
  content: string;
};

export interface BuddyState {
  type: string | null;
  isShiny: boolean;
  promptsSinceLastInterjection: number;
}

export interface EconomyState {
  currentTD: number;
  totalTDEarned: number;
  currentRank: string;
  quotaPercent: number;
  quotaLockouts: number;
  tdMultiplier: number;
}

export interface ModesState {
  fast: boolean;
  voice: boolean;
}

export interface ActiveTicket {
  id: string;
  title: string;
  sprintProgress: number;
  sprintGoal: number;
}

export interface GameState {
  version: string;
  username: string;
  lastLogin: number;
  economy: EconomyState;
  inventory: Record<string, number>;
  upgrades: string[];
  achievements: string[];
  buddy: BuddyState;
  chatHistory: Message[];
  commandUsage: Record<string, number>;
  modes: ModesState;
  activeTicket: ActiveTicket | null;
  apiKey?: string;
}

/** Legacy flat state shape used before the economy refactor. */
interface LegacyGameState {
  technicalDebt: number;
  totalTechnicalDebt: number;
  rankIndex: number;
  inventory: Record<string, number>;
  achievements: string[];
  buddy?: BuddyState;
}

function rankTitleFromIndex(index: number): string {
  return CORPORATE_RANKS[index]?.title ?? CORPORATE_RANKS[0]!.title;
}

function rankIndexFromTitle(title: string): number {
  const idx = CORPORATE_RANKS.findIndex((r) => r.title === title);
  return idx >= 0 ? idx : 0;
}

export function resolveRank(totalTDEarned: number, currentRankTitle: string): string {
  let rankIndex = rankIndexFromTitle(currentRankTitle);
  while (
    rankIndex < CORPORATE_RANKS.length - 1 &&
    totalTDEarned >= CORPORATE_RANKS[rankIndex + 1]!.threshold
  ) {
    rankIndex++;
  }
  return rankTitleFromIndex(rankIndex);
}

function createDefaultState(): GameState {
  const inventory: Record<string, number> = {};
  for (const generator of GENERATORS) {
    inventory[generator.id] = 0;
  }
  return {
    version: STATE_VERSION,
    username: generateUsername(),
    lastLogin: Date.now(),
    economy: {
      currentTD: 0,
      totalTDEarned: 0,
      currentRank: CORPORATE_RANKS[0]!.title,
      quotaPercent: 100,
      quotaLockouts: 0,
      tdMultiplier: 1,
    },
    inventory,
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
  };
}

function isLegacyState(obj: Record<string, unknown>): boolean {
  return "technicalDebt" in obj && !("economy" in obj);
}

function migrateLegacyState(legacy: LegacyGameState): GameState {
  const buddy: BuddyState = legacy.buddy ?? {
    type: null,
    isShiny: false,
    promptsSinceLastInterjection: 0,
  };

  return {
    version: STATE_VERSION,
    username: generateUsername(),
    lastLogin: Date.now(),
    economy: {
      currentTD: legacy.technicalDebt,
      totalTDEarned: legacy.totalTechnicalDebt,
      currentRank: rankTitleFromIndex(legacy.rankIndex),
      quotaPercent: 100,
      quotaLockouts: 0,
      tdMultiplier: 1,
    },
    inventory: legacy.inventory,
    upgrades: [],
    achievements: Array.isArray(legacy.achievements) ? legacy.achievements : [],
    buddy,
    chatHistory: [],
    commandUsage: {},
    modes: { fast: false, voice: false },
    activeTicket: null,
  };
}

export function loadState(): GameState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Record<string, unknown>;

      // Migrate legacy flat state to new nested structure
      if (isLegacyState(parsed)) {
        return migrateLegacyState(parsed as unknown as LegacyGameState);
      }

      const state = parsed as unknown as GameState;

      // Ensure required fields exist (defensive)
      if (!Array.isArray(state.upgrades)) {
        state.upgrades = [];
      }
      if (!Array.isArray(state.achievements)) {
        state.achievements = [];
      }
      if (!state.buddy) {
        state.buddy = {
          type: null,
          isShiny: false,
          promptsSinceLastInterjection: 0,
        };
      }
      if (!Array.isArray(state.chatHistory)) {
        state.chatHistory = [];
      }
      if (!state.commandUsage || typeof state.commandUsage !== "object") {
        state.commandUsage = {};
      }
      if (!state.modes || typeof state.modes !== "object") {
        state.modes = { fast: false, voice: false };
      }
      if (state.activeTicket === undefined) {
        state.activeTicket = null;
      }
      if (!state.username) {
        state.username = generateUsername();
      }
      if (!state.economy) {
        return createDefaultState();
      }

      // Ensure quotaPercent is initialized for existing saves
      if (!state.economy.quotaPercent) {
        state.economy.quotaPercent = 100;
      }
      // Ensure tdMultiplier is initialized for existing saves
      if (!state.economy.tdMultiplier) {
        state.economy.tdMultiplier = 1;
      }

      // Preserve lastLogin from storage so we can compute offline TD on mount
      state.version = STATE_VERSION;

      return state;
    }
  } catch {
    // Corrupted or inaccessible localStorage — fall through to default
  }
  return createDefaultState();
}

/** Geometric series sum: total cost to buy `amount` generators starting at `owned`. */
export function calcBulkCost(baseCost: number, owned: number, amount: number): number {
  // Sum = baseCost * r^owned * (r^amount - 1) / (r - 1)
  const rOwned = Math.pow(GROWTH_RATE, owned);
  const rAmount = Math.pow(GROWTH_RATE, amount);
  return Math.floor(baseCost * rOwned * (rAmount - 1) / (GROWTH_RATE - 1));
}

export function calculateTDpS(inventory: Record<string, number>, ownedUpgrades: string[] = []): number {
  // Build a multiplier map from owned upgrades
  const multipliers: Record<string, number> = {};
  for (const upgradeId of ownedUpgrades) {
    const upgrade = UPGRADES.find((u) => u.id === upgradeId);
    if (upgrade) {
      // Dynamic synergy: multiplier scales with the count of the required generator
      const effectiveMultiplier =
        upgrade.synergyPercent != null
          ? 1 + ((inventory[upgrade.requiredGeneratorId] ?? 0) * upgrade.synergyPercent) / 100
          : upgrade.multiplier;

      multipliers[upgrade.targetGeneratorId] =
        (multipliers[upgrade.targetGeneratorId] ?? 1) * effectiveMultiplier;
    }
  }

  let tdps = 0;
  for (const generator of GENERATORS) {
    const count = inventory[generator.id] ?? 0;
    const synergy = multipliers[generator.id] ?? 1;
    tdps += count * generator.baseOutput * synergy;
  }
  return tdps;
}

export { STORAGE_KEY };

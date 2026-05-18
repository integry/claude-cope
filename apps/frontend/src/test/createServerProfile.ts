import type { ServerProfile } from "@claude-cope/shared/profile";

export function createServerProfile(overrides: Partial<ServerProfile> = {}): ServerProfile {
  return {
    username: "alice",
    current_td: 0,
    total_td: 0,
    corporate_rank: "Junior Code Monkey",
    display_rank: null,
    is_executive_supporter: false,
    inventory: {},
    upgrades: [],
    achievements: [],
    buddy_type: null,
    buddy_is_shiny: false,
    unlocked_themes: ["default"],
    active_theme: "default",
    active_ticket: null,
    td_multiplier: 1,
    multiplier: 1,
    quota_percent: 100,
    ...overrides,
  };
}

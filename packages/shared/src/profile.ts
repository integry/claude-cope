export interface ServerProfile {
  username: string;
  total_td: number;
  current_td: number;
  corporate_rank: string;
  inventory: Record<string, number>;
  upgrades: string[];
  achievements: string[];
  buddy_type: string | null;
  buddy_is_shiny: boolean;
  unlocked_themes: string[];
  active_theme: string;
  active_ticket: { id: string; title: string; sprintProgress: number; sprintGoal: number } | null;
  td_multiplier: number;
  multiplier: number;
  quota_percent?: number;
}

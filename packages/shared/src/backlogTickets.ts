export interface PlayableBacklogTicket {
  id: string;
  reporter: string | null;
  reporter_name: string | null;
  reporter_title: string | null;
  reporter_description: string | null;
  title: string;
  description: string;
  technical_debt: number;
  kickoff_prompt: string;
  created_at: string;
  category_prefix: string | null;
  category_label: string | null;
  is_locked: false;
  tier: "free" | "premium";
  upgrade_teaser?: undefined;
}

export interface LockedBacklogTeaserTicket {
  id: string;
  title: string;
  category_prefix: string | null;
  category_label: string | null;
  is_locked: true;
  tier: "premium";
  upgrade_teaser: string;
}

export type CommunityBacklogTicket = PlayableBacklogTicket | LockedBacklogTeaserTicket;

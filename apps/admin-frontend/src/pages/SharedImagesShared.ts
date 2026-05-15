export interface TopUser {
  username: string;
  shareCount: number;
}

export interface SharesOverview {
  totals: {
    lastHour: number;
    last24Hours: number;
    last3Days: number;
    lastWeek: number;
    lastMonth: number;
    allTime: number;
  };
  topUsers: {
    lastHour: TopUser[];
    last24Hours: TopUser[];
    lastMonth: TopUser[];
    allTime: TopUser[];
  };
}

export interface ShareFeedItem {
  shareId: string;
  createdAt: string;
  username: string;
  promptPreview: string;
  responsePreview: string;
  imageUrl: string;
  shareUrl: string;
}

export interface PaginatedShareFeed {
  items: ShareFeedItem[];
  total: number;
  limit: number;
  offset: number;
}

export const totalCards: Array<{ key: keyof SharesOverview["totals"]; label: string }> = [
  { key: "lastHour", label: "Last Hour" },
  { key: "last24Hours", label: "Last 24 Hours" },
  { key: "last3Days", label: "Last 3 Days" },
  { key: "lastWeek", label: "Last Week" },
  { key: "lastMonth", label: "Last Month" },
  { key: "allTime", label: "Total" },
];

export const leaderboardSections: Array<{ key: keyof SharesOverview["topUsers"]; label: string }> = [
  { key: "lastHour", label: "Last Hour" },
  { key: "last24Hours", label: "Last 24 Hours" },
  { key: "lastMonth", label: "Last Month" },
  { key: "allTime", label: "Total" },
];

export function formatCount(value: number): string {
  return new Intl.NumberFormat().format(value);
}

export function formatTimestamp(raw: string): string {
  const hasTimezone = /[Zz]$|[+-]\d{2}:\d{2}$/.test(raw);
  const date = new Date(hasTimezone ? raw : `${raw}Z`);
  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  return `${date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })} ${date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function truncateUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url;
  }
}

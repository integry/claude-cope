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

export function isTopUser(value: unknown): value is SharesOverview["topUsers"]["allTime"][number] {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const topUser = value as Record<string, unknown>;
  return typeof topUser.username === "string" && typeof topUser.shareCount === "number";
}

export function isSharesOverview(value: unknown): value is SharesOverview {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const overview = value as Partial<SharesOverview>;
  const totals = overview.totals;
  const topUsers = overview.topUsers;

  return (
    typeof totals?.lastHour === "number" &&
    typeof totals.last24Hours === "number" &&
    typeof totals.last3Days === "number" &&
    typeof totals.lastWeek === "number" &&
    typeof totals.lastMonth === "number" &&
    typeof totals.allTime === "number" &&
    Array.isArray(topUsers?.lastHour) &&
    topUsers.lastHour.every(isTopUser) &&
    Array.isArray(topUsers.last24Hours) &&
    topUsers.last24Hours.every(isTopUser) &&
    Array.isArray(topUsers.lastMonth) &&
    topUsers.lastMonth.every(isTopUser) &&
    Array.isArray(topUsers.allTime) &&
    topUsers.allTime.every(isTopUser)
  );
}

export function isShareFeedItem(value: unknown): value is ShareFeedItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.shareId === "string" &&
    typeof item.createdAt === "string" &&
    typeof item.username === "string" &&
    typeof item.promptPreview === "string" &&
    typeof item.responsePreview === "string" &&
    typeof item.imageUrl === "string" &&
    typeof item.shareUrl === "string"
  );
}

export function isPaginatedShareFeed(value: unknown): value is PaginatedShareFeed {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const feed = value as Partial<PaginatedShareFeed>;
  return (
    Array.isArray(feed.items) &&
    feed.items.every(isShareFeedItem) &&
    typeof feed.total === "number" &&
    typeof feed.limit === "number" &&
    typeof feed.offset === "number"
  );
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

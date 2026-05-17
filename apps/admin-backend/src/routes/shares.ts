import { buildPublicShareUrls } from "@claude-cope/shared/shareCards";
import { Hono } from "hono";

type Env = {
  Bindings: {
    DB: D1Database;
    ALLOWED_ORIGINS?: string;
    SHARE_CARD_BASE_ORIGIN?: string;
  };
};

type ShareCountRow = {
  last_hour: number | string | null;
  last_24_hours: number | string | null;
  last_3_days: number | string | null;
  last_week: number | string | null;
  last_month: number | string | null;
  all_time: number | string | null;
};

type TopUserRow = {
  username: string;
  share_count: number | string;
};

type ShareFeedRow = {
  id: string;
  created_at: string;
  username: string;
  prompt: string;
  response: string;
  total_count: number | string | null;
};

const TOP_USERS_LIMIT = 10;
const PROMPT_PREVIEW_LENGTH = 140;
const RESPONSE_PREVIEW_LENGTH = 220;
const shares = new Hono<Env>();

function normalizeCount(value: number | string | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  return 0;
}

function buildPreview(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  if (maxLength <= 3) return ".".repeat(maxLength);
  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

type SearchFilter =
  | { mode: "fts"; value: string }
  | { mode: "like"; value: string };

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

function buildSearchFilter(query: string | undefined): SearchFilter | null {
  const trimmed = query?.trim();
  if (!trimmed) return null;

  const terms = trimmed
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean)
    .map((term) => `"${term.replaceAll("\"", "\"\"")}"*`);

  if (terms.length > 0 && /[\p{L}\p{N}]/u.test(trimmed)) {
    return { mode: "fts", value: terms.join(" AND ") };
  }

  return { mode: "like", value: `%${escapeLikePattern(trimmed)}%` };
}

async function loadTopUsers(
  db: D1Database,
  whereClause: string,
): Promise<Array<{ username: string; shareCount: number }>> {
  const { results } = await db
    .prepare(
      `SELECT username, COUNT(*) AS share_count
       FROM shared_cards
       ${whereClause}
       GROUP BY username
       ORDER BY share_count DESC, username ASC
       LIMIT ${TOP_USERS_LIMIT}`,
    )
    .all<TopUserRow>();

  return (results ?? []).map((row) => ({
    username: row.username,
    shareCount: normalizeCount(row.share_count),
  }));
}

shares.get("/overview", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  try {
    const totals = await db
      .prepare(
        `SELECT
           COALESCE(SUM(CASE WHEN created_at >= datetime('now', '-1 hour') THEN 1 ELSE 0 END), 0) AS last_hour,
           COALESCE(SUM(CASE WHEN created_at >= datetime('now', '-24 hours') THEN 1 ELSE 0 END), 0) AS last_24_hours,
           COALESCE(SUM(CASE WHEN created_at >= datetime('now', '-3 days') THEN 1 ELSE 0 END), 0) AS last_3_days,
           COALESCE(SUM(CASE WHEN created_at >= datetime('now', '-7 days') THEN 1 ELSE 0 END), 0) AS last_week,
           COALESCE(SUM(CASE WHEN created_at >= datetime('now', '-1 month') THEN 1 ELSE 0 END), 0) AS last_month,
           COUNT(*) AS all_time
         FROM shared_cards`,
      )
      .first<ShareCountRow>();

    const [lastHour, last24Hours, lastMonth, allTime] = await Promise.all([
      loadTopUsers(db, "WHERE created_at >= datetime('now', '-1 hour')"),
      loadTopUsers(db, "WHERE created_at >= datetime('now', '-24 hours')"),
      loadTopUsers(db, "WHERE created_at >= datetime('now', '-1 month')"),
      loadTopUsers(db, ""),
    ]);

    return c.json({
      totals: {
        lastHour: normalizeCount(totals?.last_hour),
        last24Hours: normalizeCount(totals?.last_24_hours),
        last3Days: normalizeCount(totals?.last_3_days),
        lastWeek: normalizeCount(totals?.last_week),
        lastMonth: normalizeCount(totals?.last_month),
        allTime: normalizeCount(totals?.all_time),
      },
      topUsers: {
        lastHour,
        last24Hours,
        lastMonth,
        allTime,
      },
    });
  } catch (error) {
    console.error("Failed to load share overview analytics", error);
    return c.json({ error: "Failed to load share overview analytics" }, 500);
  }
});

shares.get("/", async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: "Database not configured" }, 500);

  try {
    const limit = Math.min(Math.max(parseInt(c.req.query("limit") || "50", 10) || 50, 1), 200);
    const offset = Math.max(parseInt(c.req.query("offset") || "0", 10) || 0, 0);
    const username = c.req.query("username")?.trim();
    const searchFilter = buildSearchFilter(c.req.query("query"));

    const whereParts: string[] = [];
    const whereValues: string[] = [];
    let joinClause = "";

    if (searchFilter?.mode === "fts") {
      joinClause = "INNER JOIN shared_cards_search ON shared_cards_search.rowid = shared_cards.rowid";
      whereParts.push("shared_cards_search MATCH ?");
      whereValues.push(searchFilter.value);
    }

    if (searchFilter?.mode === "like") {
      whereParts.push(
        "(shared_cards.id LIKE ? ESCAPE '\\' OR shared_cards.username LIKE ? ESCAPE '\\' OR shared_cards.prompt LIKE ? ESCAPE '\\' OR shared_cards.response LIKE ? ESCAPE '\\')",
      );
      whereValues.push(searchFilter.value, searchFilter.value, searchFilter.value, searchFilter.value);
    }

    if (username) {
      whereParts.push("shared_cards.username = ?");
      whereValues.push(username);
    }

    const whereClause = whereParts.length > 0
      ? `WHERE ${whereParts.join(" AND ")}`
      : "";

    const { results } = await db
      .prepare(
        `SELECT
           shared_cards.id AS id,
           shared_cards.created_at AS created_at,
           shared_cards.username AS username,
           shared_cards.prompt AS prompt,
           shared_cards.response AS response,
           COUNT(*) OVER() AS total_count
         FROM shared_cards
         ${joinClause}
         ${whereClause}
         ORDER BY shared_cards.created_at DESC, shared_cards.id DESC
         LIMIT ? OFFSET ?`,
      )
      .bind(...whereValues, limit, offset)
      .all<ShareFeedRow>();

    const items = (results ?? []).map((row) => {
      const urls = buildPublicShareUrls(c.req.url, c.env, row.id);
      return {
        shareId: row.id,
        createdAt: row.created_at,
        username: row.username,
        promptPreview: buildPreview(row.prompt, PROMPT_PREVIEW_LENGTH),
        responsePreview: buildPreview(row.response, RESPONSE_PREVIEW_LENGTH),
        imageUrl: urls.imageUrl,
        shareUrl: urls.shareUrl,
      };
    });

    return c.json({
      items,
      total: normalizeCount(results?.[0]?.total_count),
      limit,
      offset,
    });
  } catch (error) {
    console.error("Failed to load shared-image activity", error);
    return c.json({ error: "Failed to load shared-image activity" }, 500);
  }
});

export default shares;

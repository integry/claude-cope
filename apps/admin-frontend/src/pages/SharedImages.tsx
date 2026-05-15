import { useEffect, useMemo, useState } from "react";
import { useAdminApi } from "../hooks/useAdminApi";
import {
  ActivityFeedTable,
  LeaderboardGrid,
  SharePreviewModal,
  SummaryCards,
} from "./SharedImagesParts";
import type { PaginatedShareFeed, ShareFeedItem, SharesOverview } from "./SharedImagesShared";

const PAGE_SIZE = 25;

function isTopUser(value: unknown): value is SharesOverview["topUsers"]["allTime"][number] {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const topUser = value as Record<string, unknown>;
  return typeof topUser.username === "string" && typeof topUser.shareCount === "number";
}

function isSharesOverview(value: unknown): value is SharesOverview {
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

function isShareFeedItem(value: unknown): value is ShareFeedItem {
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

function isPaginatedShareFeed(value: unknown): value is PaginatedShareFeed {
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

export default function SharedImages() {
  const [page, setPage] = useState(0);
  const [usernameFilter, setUsernameFilter] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShare, setSelectedShare] = useState<ShareFeedItem | null>(null);

  const overviewRequest = useAdminApi<SharesOverview>("/api/shares/overview");

  const feedPath = useMemo(() => {
    const params = new URLSearchParams();
    params.set("limit", String(PAGE_SIZE));
    params.set("offset", String(page * PAGE_SIZE));
    if (searchQuery) {
      params.set("query", searchQuery);
    }
    if (usernameFilter) {
      params.set("username", usernameFilter);
    }
    return `/api/shares?${params.toString()}`;
  }, [page, searchQuery, usernameFilter]);

  const feedRequest = useAdminApi<PaginatedShareFeed>(feedPath);
  const overview = isSharesOverview(overviewRequest.data) ? overviewRequest.data : null;
  const feed = isPaginatedShareFeed(feedRequest.data) ? feedRequest.data : null;
  const total = feed?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    const clampedPage = Math.min(page, totalPages - 1);
    if (clampedPage !== page) {
      setPage(clampedPage);
    }
  }, [page, totalPages]);

  useEffect(() => {
    if (!selectedShare || !feed?.items.some((item) => item.shareId === selectedShare.shareId)) {
      return;
    }

    const updatedSelection = feed.items.find((item) => item.shareId === selectedShare.shareId) ?? null;
    setSelectedShare(updatedSelection);
  }, [feed, selectedShare]);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextQuery = String(formData.get("query") ?? "").trim();
    setSearchDraft(nextQuery);
    setSearchQuery(nextQuery);
    setPage(0);
  }

  function clearFilters() {
    setUsernameFilter("");
    setSearchDraft("");
    setSearchQuery("");
    setPage(0);
  }

  function applyUsernameFilter(username: string) {
    setUsernameFilter(username);
    setPage(0);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Shared Images</h1>
        <p className="mt-2 max-w-3xl text-sm text-gray-600">
          Overview metrics for share-card generation and a browsable feed of individual immutable snapshots.
        </p>
      </div>

      <section aria-labelledby="shared-images-summary" className="space-y-4">
        <div>
          <h2 id="shared-images-summary" className="text-lg font-semibold text-gray-900">
            Summary
          </h2>
          <p className="mt-1 text-sm text-gray-500">Generated shared images across key time windows.</p>
        </div>

        {overviewRequest.isLoading ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Loading overview...</p>
          </div>
        ) : overviewRequest.isError || !overview ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
            <p className="text-sm text-red-700">Failed to load shared image analytics.</p>
          </div>
        ) : (
          <>
            <SummaryCards overview={overview} />
            <LeaderboardGrid overview={overview} onUserSelect={applyUsernameFilter} />
          </>
        )}
      </section>

      <section aria-labelledby="shared-images-activity" className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="shared-images-activity" className="text-lg font-semibold text-gray-900">
              Activity Feed
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Inspect generated items with prompt, response, thumbnail, and direct public-share access.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex w-full flex-col gap-3 lg:max-w-3xl lg:flex-row">
            <input
              name="query"
              type="search"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Search by share ID, username, prompt, or response"
              className="min-w-0 flex-1 rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            />
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={usernameFilter}
                onChange={(event) => {
                  setUsernameFilter(event.target.value.trim());
                  setPage(0);
                }}
                placeholder="Filter by username"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none sm:w-52"
              />
              <button
                type="submit"
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Search
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        <div className="flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing {total === 0 ? 0 : page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
          </p>
          {(usernameFilter || searchQuery) && (
            <p>
              Filters: {usernameFilter ? `user "${usernameFilter}"` : "all users"}
              {searchQuery ? ` · search "${searchQuery}"` : ""}
            </p>
          )}
        </div>

        {feedRequest.isLoading ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Loading shared-image activity...</p>
          </div>
        ) : feedRequest.isError || !feed ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
            <p className="text-sm text-red-700">Failed to load shared-image activity.</p>
          </div>
        ) : (
          <>
            <ActivityFeedTable
              items={feed.items}
              onPreview={setSelectedShare}
              onUserSelect={applyUsernameFilter}
            />
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setPage((currentPage) => Math.max(0, currentPage - 1))}
                  disabled={page === 0}
                  className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((currentPage) => Math.min(totalPages - 1, currentPage + 1))}
                  disabled={page >= totalPages - 1}
                  className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {selectedShare && (
        <SharePreviewModal item={selectedShare} onClose={() => setSelectedShare(null)} />
      )}
    </div>
  );
}

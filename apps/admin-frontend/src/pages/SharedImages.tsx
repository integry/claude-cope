import { useEffect, useMemo, useState } from "react";
import { useAdminApi } from "../hooks/useAdminApi";
import {
  ActivityFeedTable,
  LeaderboardGrid,
  SharePreviewModal,
  SummaryCards,
} from "./SharedImagesParts";
import {
  isPaginatedShareFeed,
  isSharesOverview,
  type PaginatedShareFeed,
  type ShareFeedItem,
  type SharesOverview,
} from "./SharedImagesShared";

const PAGE_SIZE = 25;

function buildFeedPath({
  limit,
  offset,
  searchQuery,
  usernameFilter,
}: {
  limit: number;
  offset: number;
  searchQuery: string;
  usernameFilter: string;
}) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  if (searchQuery) {
    params.set("query", searchQuery);
  }
  if (usernameFilter) {
    params.set("username", usernameFilter);
  }
  return `/api/shares?${params.toString()}`;
}

function getPaginationState(feed: PaginatedShareFeed | null, requestedOffset: number) {
  const total = feed?.total ?? 0;
  const effectiveLimit = feed?.limit && feed.limit > 0 ? feed.limit : PAGE_SIZE;
  const effectiveOffset = feed?.offset ?? requestedOffset;
  const totalPages = Math.max(1, Math.ceil(total / effectiveLimit));
  const currentPage = Math.floor(effectiveOffset / effectiveLimit);

  return {
    total,
    effectiveLimit,
    effectiveOffset,
    totalPages,
    currentPage,
    firstVisibleItem: total === 0 ? 0 : effectiveOffset + 1,
    lastVisibleItem: total === 0 ? 0 : Math.min(effectiveOffset + effectiveLimit, total),
    hasPreviousPage: effectiveOffset > 0,
    hasNextPage: effectiveOffset + effectiveLimit < total,
  };
}

export default function SharedImages() {
  const [offset, setOffset] = useState(0);
  const [requestedLimit, setRequestedLimit] = useState(PAGE_SIZE);
  const [usernameDraft, setUsernameDraft] = useState("");
  const [usernameFilter, setUsernameFilter] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShare, setSelectedShare] = useState<ShareFeedItem | null>(null);

  const overviewRequest = useAdminApi<SharesOverview>("/api/shares/overview");

  const feedPath = useMemo(
    () => buildFeedPath({ limit: requestedLimit, offset, searchQuery, usernameFilter }),
    [offset, requestedLimit, searchQuery, usernameFilter],
  );

  const feedRequest = useAdminApi<PaginatedShareFeed>(feedPath);
  const overview = isSharesOverview(overviewRequest.data) ? overviewRequest.data : null;
  const feed = isPaginatedShareFeed(feedRequest.data) ? feedRequest.data : null;
  const {
    total,
    effectiveLimit,
    effectiveOffset,
    totalPages,
    currentPage,
    firstVisibleItem,
    lastVisibleItem,
    hasPreviousPage,
    hasNextPage,
  } = getPaginationState(feed, offset);
  const showOverviewError = overviewRequest.isError || !overview;
  const showFeedError = feedRequest.isError || !feed;
  const showFiltersSummary = Boolean(usernameFilter || searchQuery);

  useEffect(() => {
    if (feed?.limit && feed.limit > 0 && feed.limit !== requestedLimit) {
      setRequestedLimit(feed.limit);
    }
  }, [feed?.limit, requestedLimit]);

  useEffect(() => {
    const maxOffset = Math.max(0, (totalPages - 1) * effectiveLimit);
    const clampedOffset = Math.min(offset, maxOffset);
    if (clampedOffset !== offset) {
      setOffset(clampedOffset);
    }
  }, [effectiveLimit, offset, totalPages]);

  useEffect(() => {
    if (!selectedShare) {
      return;
    }

    if (!feed?.items.some((item) => item.shareId === selectedShare.shareId)) {
      setSelectedShare(null);
      return;
    }

    const updatedSelection = feed.items.find((item) => item.shareId === selectedShare.shareId) ?? null;
    if (updatedSelection !== selectedShare) {
      setSelectedShare(updatedSelection);
    }
  }, [feed, selectedShare]);

  function handleFilterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = searchDraft.trim();
    const nextUsername = usernameDraft.trim();
    setSearchDraft(nextQuery);
    setSearchQuery(nextQuery);
    setUsernameDraft(nextUsername);
    setUsernameFilter(nextUsername);
    setOffset(0);
  }

  function clearFilters() {
    setUsernameDraft("");
    setUsernameFilter("");
    setSearchDraft("");
    setSearchQuery("");
    setOffset(0);
  }

  function applyUsernameFilter(username: string) {
    setUsernameDraft(username);
    setUsernameFilter(username);
    setOffset(0);
  }

  const overviewContent = overviewRequest.isLoading ? (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">Loading overview...</p>
    </div>
  ) : showOverviewError ? (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
      <p className="text-sm text-red-700">Failed to load shared image analytics.</p>
    </div>
  ) : (
    <>
      <SummaryCards overview={overview} />
      <LeaderboardGrid overview={overview} onUserSelect={applyUsernameFilter} />
    </>
  );

  const feedContent = feedRequest.isLoading ? (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">Loading shared-image activity...</p>
    </div>
  ) : showFeedError ? (
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
            onClick={() => setOffset(Math.max(0, effectiveOffset - effectiveLimit))}
            disabled={!hasPreviousPage}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setOffset(effectiveOffset + effectiveLimit)}
            disabled={!hasNextPage}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </>
  );

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

        {overviewContent}
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

          <form onSubmit={handleFilterSubmit} className="flex w-full flex-col gap-3 lg:max-w-3xl lg:flex-row">
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
                value={usernameDraft}
                onChange={(event) => setUsernameDraft(event.target.value)}
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
            Showing {firstVisibleItem}–{lastVisibleItem} of {total}
          </p>
          {showFiltersSummary && (
            <p>
              Filters: {usernameFilter ? `user "${usernameFilter}"` : "all users"}
              {searchQuery ? ` · search "${searchQuery}"` : ""}
            </p>
          )}
        </div>

        {feedContent}
      </section>

      {selectedShare && (
        <SharePreviewModal item={selectedShare} onClose={() => setSelectedShare(null)} />
      )}
    </div>
  );
}

import { useAdminApi } from "../hooks/useAdminApi";

interface TopUser {
  username: string;
  shareCount: number;
}

interface SharesOverview {
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

function isTopUser(value: unknown): value is TopUser {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.username === "string" &&
    typeof value.shareCount === "number"
  );
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

const totalCards: Array<{ key: keyof SharesOverview["totals"]; label: string }> = [
  { key: "lastHour", label: "Last Hour" },
  { key: "last24Hours", label: "Last 24 Hours" },
  { key: "last3Days", label: "Last 3 Days" },
  { key: "lastWeek", label: "Last Week" },
  { key: "lastMonth", label: "Last Month" },
  { key: "allTime", label: "Total" },
];

const leaderboardSections: Array<{ key: keyof SharesOverview["topUsers"]; label: string }> = [
  { key: "lastHour", label: "Last Hour" },
  { key: "last24Hours", label: "Last 24 Hours" },
  { key: "lastMonth", label: "Last Month" },
  { key: "allTime", label: "Total" },
];

function formatCount(value: number): string {
  return new Intl.NumberFormat().format(value);
}

export default function SharedImages() {
  const { data, isLoading, isError } = useAdminApi<SharesOverview>("/api/shares/overview");

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Shared Images</h1>
        <p className="mt-4 text-gray-500">Loading...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Shared Images</h1>
        <p className="mt-4 text-red-600">Failed to load shared image analytics.</p>
      </div>
    );
  }

  if (!isSharesOverview(data)) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Shared Images</h1>
        <p className="mt-4 text-red-600">Failed to load shared image analytics.</p>
      </div>
    );
  }

  const { totals, topUsers } = data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Shared Images</h1>
        <p className="mt-2 max-w-3xl text-sm text-gray-600">
          Overview metrics for share-card generation and the users driving the most activity.
        </p>
      </div>

      <section aria-labelledby="shared-images-summary">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="shared-images-summary" className="text-lg font-semibold text-gray-900">
              Summary
            </h2>
            <p className="mt-1 text-sm text-gray-500">Generated shared images across key time windows.</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {totalCards.map((card) => (
            <div
              key={card.key}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-medium text-gray-500">{card.label}</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {formatCount(totals[card.key])}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="shared-images-leaderboards">
        <div>
          <h2 id="shared-images-leaderboards" className="text-lg font-semibold text-gray-900">
            Most Active Users
          </h2>
          <p className="mt-1 text-sm text-gray-500">Top users by shared images generated in each time window.</p>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
          {leaderboardSections.map((section) => (
            <div
              key={section.key}
              className="rounded-lg border border-gray-200 bg-white shadow-sm"
            >
              <div className="border-b border-gray-100 px-6 py-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                  {section.label}
                </h3>
              </div>
              <div className="px-6 py-3">
                {topUsers[section.key].length > 0 ? (
                  <ol className="divide-y divide-gray-100">
                    {topUsers[section.key].map((user, index) => (
                      <li key={`${section.key}-${user.username}`} className="flex items-center justify-between py-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {index + 1}. {user.username}
                          </p>
                        </div>
                        <p className="ml-4 shrink-0 text-sm text-gray-600">
                          {formatCount(user.shareCount)} shared image{user.shareCount === 1 ? "" : "s"}
                        </p>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="py-6 text-sm text-gray-500">No shared images in this time window yet.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="shared-images-activity"
        className="rounded-lg border border-dashed border-gray-300 bg-white/70 p-6 shadow-sm"
      >
        <h2 id="shared-images-activity" className="text-lg font-semibold text-gray-900">
          Activity Feed
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-gray-500">
          Reserved space for the browsable shared-image activity table in the next task.
        </p>
      </section>
    </div>
  );
}

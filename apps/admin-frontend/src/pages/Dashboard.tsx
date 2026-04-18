import { useAdminApi } from "../hooks/useAdminApi";

interface Stats {
  total_users: number;
  total_td: number;
  recent_events: number;
}

export default function Dashboard() {
  const { data, isLoading, isError } = useAdminApi<Stats>("/api/stats");

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-4 text-gray-500">Loading...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-4 text-red-600">Failed to load dashboard data.</p>
      </div>
    );
  }

  const cards = [
    { label: "Total Users", value: data?.total_users ?? 0 },
    { label: "Total Technical Debt", value: data?.total_td ?? 0 },
    { label: "Recent Events", value: data?.recent_events ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

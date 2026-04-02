import useSWR from "swr";

export interface GameEvent {
  message: string;
  created_at: string;
}

// Use standard fetch API as the fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// We encapsulate the polling logic in this hook to separate data fetching from UI rendering.
// The 10-second refreshInterval ensures we fall back to polling gracefully if WebSockets fail.
export function useRecentEvents() {
  const { data, error, isLoading } = useSWR<GameEvent[]>("/api/recent-events", fetcher, {
    refreshInterval: 10000, // Poll every 10 seconds to align with edge cache
    revalidateOnFocus: true,
  });

  return {
    events: data || [],
    isLoading,
    isError: error,
  };
}

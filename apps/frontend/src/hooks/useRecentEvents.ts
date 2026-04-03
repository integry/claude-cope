import useSWR from "swr";
import { API_BASE } from "../config";

export interface GameEvent {
  message: string;
  created_at: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useRecentEvents() {
  const { data, error, isLoading } = useSWR<GameEvent[]>(`${API_BASE}/api/recent-events`, fetcher, {
    refreshInterval: 10000, // Poll every 10 seconds to align with edge cache
    revalidateOnFocus: true,
  });

  return {
    events: data || [],
    isLoading,
    isError: error,
  };
}

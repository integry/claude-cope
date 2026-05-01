import useSWR from "swr";
import { API_BASE, ADMIN_API_KEY } from "../config";

export function authHeaders(): HeadersInit {
  if (!ADMIN_API_KEY) return {};
  return { Authorization: `Bearer ${ADMIN_API_KEY}` };
}

const fetcher = (url: string) =>
  fetch(url, { headers: authHeaders() }).then((res) => res.json());

export function useAdminApi<T>(path: string) {
  const { data, error, isLoading, mutate } = useSWR<T>(
    `${API_BASE}${path}`,
    fetcher,
    {
      revalidateOnFocus: true,
    },
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  };
}

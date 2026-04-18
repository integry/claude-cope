import useSWR from "swr";
import { API_BASE } from "../config";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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

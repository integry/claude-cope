import useSWR from "swr";
import { API_BASE } from "../config";

const SESSION_KEY = "admin_api_key";

let onAuthRequired: (() => void) | null = null;

export function setAuthRequiredCallback(cb: (() => void) | null) {
  onAuthRequired = cb;
}

export function getAdminApiKey(): string {
  return sessionStorage.getItem(SESSION_KEY) || "";
}

export function setAdminApiKey(key: string): void {
  sessionStorage.setItem(SESSION_KEY, key);
}

export function clearAdminApiKey(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function authHeaders(): HeadersInit {
  const key = getAdminApiKey();
  if (!key) return {};
  return { Authorization: `Bearer ${key}` };
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    if (res.status === 401 && onAuthRequired) onAuthRequired();
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.error || res.statusText, res.status);
  }
  return res.json();
}

const fetcher = async (url: string) => {
  const res = await fetch(url, { headers: authHeaders() });
  return handleResponse(res);
};

export async function adminFetch(url: string, init?: RequestInit): Promise<unknown> {
  const headers: HeadersInit = { ...authHeaders(), ...init?.headers };
  const res = await fetch(url, { ...init, headers });
  return handleResponse(res);
}

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
    isUnauthorized: error instanceof ApiError && error.status === 401,
    mutate,
  };
}

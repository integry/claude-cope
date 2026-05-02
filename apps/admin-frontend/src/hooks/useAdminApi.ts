import useSWR from "swr";
import { API_BASE } from "../config";

const SESSION_KEY = "admin_api_key";

let onAuthRequired: (() => void) | null = null;
let onServerMisconfigured: ((message: string) => void) | null = null;

export function setAuthRequiredCallback(cb: (() => void) | null) {
  onAuthRequired = cb;
}

export function setServerMisconfiguredCallback(cb: ((message: string) => void) | null) {
  onServerMisconfigured = cb;
}

export function getAdminApiKey(): string {
  return sessionStorage.getItem(SESSION_KEY) || "";
}

export function hasStoredApiKey(): boolean {
  return !!sessionStorage.getItem(SESSION_KEY);
}

export function setAdminApiKey(key: string): void {
  sessionStorage.setItem(SESSION_KEY, key);
}

export function clearAdminApiKey(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function authHeaders(): Record<string, string> {
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
    const body = await res.json().catch(() => null);
    if (res.status === 401 && onAuthRequired) onAuthRequired();
    if (res.status === 403 && onServerMisconfigured) {
      onServerMisconfigured(body?.error || "Server returned 403 — check ADMIN_API_KEY configuration");
    }
    throw new ApiError(body?.error || res.statusText, res.status);
  }
  return res.json();
}

const fetcher = async (url: string) => {
  const res = await fetch(url, { headers: authHeaders() });
  return handleResponse(res);
};

export async function adminFetch(url: string, init?: RequestInit): Promise<unknown> {
  const merged = new Headers(authHeaders());
  const extra = init?.headers;
  if (extra) {
    const entries = extra instanceof Headers ? extra.entries()
      : Array.isArray(extra) ? extra
      : Object.entries(extra);
    for (const [k, v] of entries) merged.set(k, v);
  }
  const res = await fetch(url, { ...init, headers: merged });
  return handleResponse(res);
}

export function useAdminApi<T>(path: string) {
  const { data, error, isLoading, mutate } = useSWR<T>(
    hasStoredApiKey() ? `${API_BASE}${path}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
    },
  );

  return {
    data,
    isLoading: hasStoredApiKey() ? isLoading : false,
    isError: error,
    isUnauthorized: error instanceof ApiError && error.status === 401,
    needsAuth: !hasStoredApiKey(),
    mutate,
  };
}

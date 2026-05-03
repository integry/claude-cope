import { createContext, createElement, useContext, useState, type ReactNode } from "react";
import useSWR from "swr";
import { API_BASE } from "../config";

// This bearer token is still readable by any injected script in the admin SPA.
// Keep the admin frontend on a trusted internal origin until it moves to a
// server-issued session/cookie model.
const SESSION_KEY = "admin_api_key";

function isStorageAvailable(): boolean {
  try {
    const testKey = "__storage_test__";
    sessionStorage.setItem(testKey, "1");
    sessionStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

let memoryFallback = "";

export function getAdminApiKey(): string {
  if (!isStorageAvailable()) return memoryFallback;
  return sessionStorage.getItem(SESSION_KEY) || "";
}

export function hasStoredApiKey(): boolean {
  if (!isStorageAvailable()) return !!memoryFallback;
  return !!sessionStorage.getItem(SESSION_KEY);
}

export function setAdminApiKey(key: string): void {
  if (!isStorageAvailable()) {
    memoryFallback = key;
    return;
  }
  sessionStorage.setItem(SESSION_KEY, key);
}

export function clearAdminApiKey(): void {
  if (!isStorageAvailable()) {
    memoryFallback = "";
    return;
  }
  sessionStorage.removeItem(SESSION_KEY);
}

function authHeaders(): Record<string, string> {
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

interface AdminAuthContextValue {
  adminFetch: (url: string, init?: RequestInit) => Promise<unknown>;
  authRequired: boolean;
  authError: boolean;
  serverError: string | null;
  signIn: (key: string) => void;
  signOut: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

async function parseResponseBody(res: Response) {
  return res.json().catch(() => null) as Promise<{ error?: string } | null>;
}

export function AdminApiProvider({ children }: { children: ReactNode }) {
  const [authRequired, setAuthRequired] = useState(!hasStoredApiKey());
  const [authError, setAuthError] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function signOut() {
    clearAdminApiKey();
    setAuthRequired(true);
    setAuthError(false);
    setServerError(null);
  }

  function signIn(key: string) {
    setAdminApiKey(key);
    setAuthRequired(false);
    setAuthError(false);
    setServerError(null);
  }

  async function adminFetch(url: string, init?: RequestInit): Promise<unknown> {
    const merged = new Headers(authHeaders());
    const extra = init?.headers;
    if (extra) {
      const entries = extra instanceof Headers ? extra.entries()
        : Array.isArray(extra) ? extra
        : Object.entries(extra);
      for (const [k, v] of entries) merged.set(k, v);
    }

    const res = await fetch(url, { ...init, headers: merged });
    if (!res.ok) {
      const body = await parseResponseBody(res);
      if (res.status === 401) {
        setAuthError(!!getAdminApiKey());
        setServerError(null);
        clearAdminApiKey();
        setAuthRequired(true);
      }
      if (res.status === 403) {
        setAuthError(false);
        setServerError(body?.error || "Server returned 403 - check ADMIN_API_KEY configuration");
        clearAdminApiKey();
        setAuthRequired(true);
      }
      throw new ApiError(body?.error || res.statusText, res.status);
    }
    return res.json();
  }

  const value: AdminAuthContextValue = {
    adminFetch,
    authRequired,
    authError,
    serverError,
    signIn,
    signOut,
  };

  return createElement(AdminAuthContext.Provider, { value }, children);
}

function useAdminAuthContext(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("AdminApiProvider is required");
  return ctx;
}

export function useAdminAuth() {
  const { authRequired, authError, serverError, signIn, signOut } = useAdminAuthContext();
  return { authRequired, authError, serverError, signIn, signOut };
}

export function useAdminFetch() {
  return useAdminAuthContext().adminFetch;
}

export function useAdminApi<T>(path: string) {
  const adminFetch = useAdminFetch();
  const { data, error, isLoading, mutate } = useSWR<T>(
    hasStoredApiKey() ? `${API_BASE}${path}` : null,
    adminFetch,
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

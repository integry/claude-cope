import { createContext, createElement, useContext, useEffect, useState, type ReactNode } from "react";
import useSWR from "swr";
import { API_BASE } from "../config";

let memoryApiKey = "";

export function getAdminApiKey(): string {
  return memoryApiKey;
}

export function hasStoredApiKey(): boolean {
  return !!memoryApiKey;
}

export function setAdminApiKey(key: string): void {
  memoryApiKey = key;
}

export function clearAdminApiKey(): void {
  memoryApiKey = "";
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
  adminFetch: <T>(url: string, init?: RequestInit) => Promise<T>;
  authChecking: boolean;
  authRequired: boolean;
  authError: boolean;
  serverError: string | null;
  signIn: (key: string) => Promise<boolean>;
  signOut: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

function shouldClearStoredKeyForVerificationFailure(result: { authError: boolean; serverError: string | null }): boolean {
  return result.authError;
}

async function parseResponseBody(res: Response) {
  return res.json().catch(() => null) as Promise<{ error?: string } | null>;
}

export function AdminApiProvider({ children }: { children: ReactNode }) {
  const [authChecking, setAuthChecking] = useState(hasStoredApiKey());
  const [authRequired, setAuthRequired] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function verifyApiKey(key: string): Promise<{ ok: boolean; authError: boolean; serverError: string | null }> {
    const res = await fetch(`${API_BASE}/api/config`, {
      headers: {
        Authorization: `Bearer ${key}`,
      },
    });

    if (res.ok) {
      return { ok: true, authError: false, serverError: null };
    }

    const body = await parseResponseBody(res);
    if (res.status === 401) {
      return { ok: false, authError: true, serverError: null };
    }
    if (res.status === 403) {
      return {
        ok: false,
        authError: false,
        serverError: body?.error || "Server returned 403 - check ADMIN_API_KEY configuration",
      };
    }

    return {
      ok: false,
      authError: false,
      serverError: body?.error || res.statusText || "Failed to verify admin API key.",
    };
  }

  useEffect(() => {
    const storedKey = getAdminApiKey();
    if (!storedKey) {
      setAuthChecking(false);
      setAuthRequired(true);
      return;
    }

    let cancelled = false;
    setAuthChecking(true);

    void verifyApiKey(storedKey)
      .then((result) => {
        if (cancelled) return;
        if (result.ok) {
          setAuthRequired(false);
          setAuthError(false);
          setServerError(null);
          return;
        }

        if (shouldClearStoredKeyForVerificationFailure(result)) {
          clearAdminApiKey();
        }
        setAuthRequired(true);
        setAuthError(result.authError);
        setServerError(result.serverError);
      })
      .catch(() => {
        if (cancelled) return;
        setAuthRequired(true);
        setAuthError(false);
        setServerError("Failed to verify admin API key.");
      })
      .finally(() => {
        if (!cancelled) {
          setAuthChecking(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function signOut() {
    clearAdminApiKey();
    setAuthChecking(false);
    setAuthRequired(true);
    setAuthError(false);
    setServerError(null);
  }

  async function signIn(key: string) {
    setAuthChecking(true);
    setAuthError(false);
    setServerError(null);
    try {
      const result = await verifyApiKey(key);
      if (!result.ok) {
        if (shouldClearStoredKeyForVerificationFailure(result)) {
          clearAdminApiKey();
        }
        setAuthRequired(true);
        setAuthError(result.authError);
        setServerError(result.serverError);
        return false;
      }

      setAdminApiKey(key);
      setAuthRequired(false);
      return true;
    } catch {
      setAuthRequired(true);
      setAuthError(false);
      setServerError("Failed to verify admin API key.");
      return false;
    } finally {
      setAuthChecking(false);
    }
  }

  async function adminFetch<T>(url: string, init?: RequestInit): Promise<T> {
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
      }
      throw new ApiError(body?.error || res.statusText, res.status);
    }
    return res.json() as Promise<T>;
  }

  const value: AdminAuthContextValue = {
    adminFetch,
    authChecking,
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
  const { authChecking, authRequired, authError, serverError, signIn, signOut } = useAdminAuthContext();
  return { authChecking, authRequired, authError, serverError, signIn, signOut };
}

export function useAdminFetch() {
  return useAdminAuthContext().adminFetch;
}

export function useAdminApi<T>(path: string) {
  const adminFetch = useAdminFetch();
  const key = hasStoredApiKey() ? [`${API_BASE}${path}`] as const : null;
  const { data, error, isLoading, mutate } = useSWR<T, ApiError, typeof key>(
    key,
    ([url]) => adminFetch<T>(url),
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

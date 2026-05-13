import { API_BASE } from "../config";

export type CreateShareCardInput = {
  shareClaim: string;
  signal?: AbortSignal;
};

export type CreateShareCardResult = {
  shareId: string;
  imageUrl: string;
  shareUrl: string;
};

export type ShareCardRecord = {
  shareId: string;
  prompt: string;
  response: string;
  username: string;
  theme: string | null;
  rendererVersion: string;
};

export async function createShareCard(input: CreateShareCardInput): Promise<CreateShareCardResult> {
  const { signal, ...payload } = input;
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/share-cards`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    });
  } catch (error) {
    if ((error instanceof Error && error.name === "AbortError") || signal?.aborted) {
      throw error;
    }
    throw new Error("Network error");
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new Error(res.ok ? "Invalid share-card response" : `HTTP ${res.status}`);
  }

  if (!res.ok) {
    const error = typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
      ? data.error
      : `HTTP ${res.status}`;
    throw new Error(error);
  }

  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid share-card response");
  }

  const record = data as Record<string, unknown>;
  if (
    typeof record.shareId !== "string" ||
    typeof record.imageUrl !== "string" ||
    typeof record.shareUrl !== "string"
  ) {
    throw new Error("Invalid share-card response");
  }

  return {
    shareId: record.shareId,
    imageUrl: record.imageUrl,
    shareUrl: record.shareUrl,
  };
}

export async function getShareCard(shareId: string, signal?: AbortSignal): Promise<ShareCardRecord> {
  const res = await fetch(`${API_BASE}/api/share-cards/${encodeURIComponent(shareId)}`, {
    method: "GET",
    credentials: "include",
    signal,
  });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new Error(res.ok ? "Invalid share-card response" : `HTTP ${res.status}`);
  }

  if (!res.ok) {
    const error = typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
      ? data.error
      : `HTTP ${res.status}`;
    throw new Error(error);
  }

  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid share-card response");
  }

  const record = data as Record<string, unknown>;
  if (
    typeof record.shareId !== "string" ||
    typeof record.prompt !== "string" ||
    typeof record.response !== "string" ||
    typeof record.username !== "string" ||
    typeof record.rendererVersion !== "string" ||
    !(typeof record.theme === "string" || record.theme === null)
  ) {
    throw new Error("Invalid share-card response");
  }

  return {
    shareId: record.shareId,
    prompt: record.prompt,
    response: record.response,
    username: record.username,
    theme: record.theme,
    rendererVersion: record.rendererVersion,
  };
}

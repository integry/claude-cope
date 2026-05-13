export const SHARE_CARD_RENDERER_VERSION = "2026-05-13";

export const SHARE_CARD_MAX_PROMPT_LENGTH = 4_000;
export const SHARE_CARD_MAX_RESPONSE_LENGTH = 16_000;
export const SHARE_CARD_MAX_USERNAME_LENGTH = 64;
export const SHARE_CARD_MAX_THEME_LENGTH = 64;

export type ShareCardInput = {
  prompt: string;
  response: string;
  username: string;
  theme?: string;
};

export type NormalizedShareCardPayload = {
  prompt: string;
  response: string;
  username: string;
  theme?: string;
  rendererVersion: string;
};

type ValidationResult =
  | { ok: true; value: NormalizedShareCardPayload }
  | { ok: false; error: string };

function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n?/g, "\n");
}

function normalizeRequiredText(value: string): string {
  return normalizeLineEndings(value).trim();
}

function normalizeOptionalText(value: string): string | undefined {
  const normalized = normalizeLineEndings(value).trim();
  return normalized ? normalized : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function validateAndNormalizeShareCardInput(input: unknown): ValidationResult {
  if (!isRecord(input)) {
    return { ok: false, error: "Request body must be a JSON object" };
  }

  if (typeof input.prompt !== "string") {
    return { ok: false, error: "prompt must be a non-empty string" };
  }
  if (typeof input.response !== "string") {
    return { ok: false, error: "response must be a non-empty string" };
  }
  if (typeof input.username !== "string") {
    return { ok: false, error: "username must be a non-empty string" };
  }
  if (input.theme !== undefined && typeof input.theme !== "string") {
    return { ok: false, error: "theme must be a string when provided" };
  }

  const prompt = normalizeRequiredText(input.prompt);
  const response = normalizeRequiredText(input.response);
  const username = normalizeRequiredText(input.username);
  const theme = input.theme === undefined ? undefined : normalizeOptionalText(input.theme);

  if (!prompt) {
    return { ok: false, error: "prompt must be a non-empty string" };
  }
  if (!response) {
    return { ok: false, error: "response must be a non-empty string" };
  }
  if (!username) {
    return { ok: false, error: "username must be a non-empty string" };
  }
  if (prompt.length > SHARE_CARD_MAX_PROMPT_LENGTH) {
    return { ok: false, error: `prompt exceeds maximum length of ${SHARE_CARD_MAX_PROMPT_LENGTH}` };
  }
  if (response.length > SHARE_CARD_MAX_RESPONSE_LENGTH) {
    return { ok: false, error: `response exceeds maximum length of ${SHARE_CARD_MAX_RESPONSE_LENGTH}` };
  }
  if (username.length > SHARE_CARD_MAX_USERNAME_LENGTH) {
    return { ok: false, error: `username exceeds maximum length of ${SHARE_CARD_MAX_USERNAME_LENGTH}` };
  }
  if (theme && theme.length > SHARE_CARD_MAX_THEME_LENGTH) {
    return { ok: false, error: `theme exceeds maximum length of ${SHARE_CARD_MAX_THEME_LENGTH}` };
  }

  return {
    ok: true,
    value: {
      prompt,
      response,
      username,
      ...(theme ? { theme } : {}),
      rendererVersion: SHARE_CARD_RENDERER_VERSION,
    },
  };
}

export async function computeShareCardContentHash(payload: NormalizedShareCardPayload): Promise<string> {
  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(
      JSON.stringify({
        prompt: payload.prompt,
        response: payload.response,
        username: payload.username,
        theme: payload.theme ?? null,
        rendererVersion: payload.rendererVersion,
      }),
    ),
  );
  return toHex(digest);
}

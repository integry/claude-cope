import { useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import { API_BASE } from "../config";
import type { GameState, Message } from "../hooks/useGameState";

type UseCheckoutLicenseSyncArgs = {
  isBooting: boolean;
  proKeyHash: GameState["proKeyHash"];
  username: GameState["username"];
  setHistory: Dispatch<SetStateAction<Message[]>>;
  runSlashCommand: (command: string) => void;
};

type CheckoutLicenseResponse = {
  licenseKey?: string;
  allKeys?: string[];
  error?: string;
};

type CheckoutLicenseFetchResult = {
  status: number;
  data: CheckoutLicenseResponse;
};

type CheckoutReturnRef =
  | { type: "checkout_id"; value: string }
  | { type: "customer_session_token"; value: string };

const CHECKOUT_RETRY_DELAY_MS = 2000;
const CHECKOUT_MAX_ATTEMPTS = 5;

function stripCheckoutReturnParams(signal: AbortSignal) {
  if (signal.aborted) return;
  const params = new URLSearchParams(window.location.search);
  params.delete("checkout_id");
  params.delete("customer_session_token");
  const queryString = params.toString();
  window.history.replaceState({}, "", window.location.pathname + (queryString ? `?${queryString}` : ""));
}

function appendCheckoutHistory(
  signal: AbortSignal,
  setHistory: Dispatch<SetStateAction<Message[]>>,
  message: Message,
) {
  if (signal.aborted) return;
  setHistory((prev) => [...prev, message]);
}

function waitForRetryDelay(signal: AbortSignal, milliseconds: number) {
  return new Promise<void>((resolve) => {
    const handleAbort = () => {
      window.clearTimeout(timeoutId);
      resolve();
    };
    const timeoutId = window.setTimeout(() => {
      signal.removeEventListener("abort", handleAbort);
      resolve();
    }, milliseconds);
    signal.addEventListener("abort", handleAbort, { once: true });
  });
}

async function fetchCheckoutLicense(
  checkoutRef: CheckoutReturnRef,
  signal: AbortSignal,
): Promise<CheckoutLicenseFetchResult | null> {
  let lastStatus = 0;
  let lastData: CheckoutLicenseResponse = {};

  for (let attempt = 0; attempt < CHECKOUT_MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) {
      await waitForRetryDelay(signal, CHECKOUT_RETRY_DELAY_MS);
    }
    if (signal.aborted) return null;

    const response = await fetchCheckoutLicenseAttempt(checkoutRef, signal, attempt);
    if (response === "retry") continue;
    if (response === null) return null;

    lastStatus = response.status;
    lastData = await response.json() as CheckoutLicenseResponse;
    if (signal.aborted) return null;
    if (response.ok && lastData.licenseKey) {
      return { status: response.status, data: lastData };
    }
    if (response.status !== 409) {
      return { status: response.status, data: lastData };
    }
  }

  return { status: lastStatus, data: lastData };
}

async function fetchCheckoutLicenseAttempt(
  checkoutRef: CheckoutReturnRef,
  signal: AbortSignal,
  attempt: number,
): Promise<Response | "retry" | null> {
  try {
    const response = await fetch(`${API_BASE}/api/account/checkout-license`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(checkoutRef.type === "checkout_id"
        ? { checkoutId: checkoutRef.value }
        : { customerSessionToken: checkoutRef.value }),
      credentials: "include",
      signal,
    });
    if (signal.aborted) return null;
    if (response.status >= 500 && attempt < CHECKOUT_MAX_ATTEMPTS - 1) {
      return "retry";
    }
    return response;
  } catch {
    if (signal.aborted) return null;
    if (attempt < CHECKOUT_MAX_ATTEMPTS - 1) return "retry";
    throw new Error("Network error");
  }
}

function buildManualSyncHint(status: number, data: CheckoutLicenseResponse) {
  if (data.licenseKey) {
    return ` Your key: \`${data.licenseKey}\` — run \`/sync ${data.licenseKey}\` manually.`;
  }
  if (status === 409) return " Refresh the page to retry automatically.";
  return " If your license arrived by email, you can run `/sync <COPE-XXX>` manually.";
}

function getCheckoutSyncUsernameLabel(username: GameState["username"]) {
  const normalizedUsername = username?.trim();
  return normalizedUsername || "this user";
}

function formatTeamPackKeyLine(key: string, index: number, username: GameState["username"]) {
  if (index === 0) {
    return `${index + 1}. ~~${key}~~ [${getCheckoutSyncUsernameLabel(username)}]`;
  }
  return `${index + 1}. \`${key}\``;
}

function handleSuccessfulCheckoutSync({
  alreadyPro,
  data,
  runSlashCommand,
  setHistory,
  signal,
  username,
}: {
  alreadyPro: boolean;
  data: CheckoutLicenseResponse;
  runSlashCommand: (command: string) => void;
  setHistory: Dispatch<SetStateAction<Message[]>>;
  signal: AbortSignal;
  username: GameState["username"];
}) {
  const licenseKey = data.licenseKey;
  if (!licenseKey) return false;

  const keys = data.allKeys ?? [licenseKey];
  if (keys.length > 1) {
    const keyList = keys.map((key, index) => formatTeamPackKeyLine(key, index, username)).join("\n");
    appendCheckoutHistory(signal, setHistory, {
      role: "system",
      content: `[✅ TEAM PACK] Your purchase includes **${keys.length} license keys**:\n\n${keyList}\n\nSyncing the first key now. Share the rest with your team; each person can activate their key by running \`/sync <KEY>\`.`,
    });
    if (!alreadyPro && !signal.aborted) {
      runSlashCommand(`/sync ${licenseKey}`);
    }
    stripCheckoutReturnParams(signal);
    return true;
  }

  if (alreadyPro) {
    appendCheckoutHistory(signal, setHistory, {
      role: "system",
      content: `[✅] License key retrieved: \`${licenseKey}\`. You're already synced — run \`/sync ${licenseKey}\` to switch keys.`,
    });
    stripCheckoutReturnParams(signal);
    return true;
  }

  if (signal.aborted) return true;
  runSlashCommand(`/sync ${licenseKey}`);
  stripCheckoutReturnParams(signal);
  return true;
}

async function syncCheckoutLicense({
  checkoutRef,
  getAlreadyPro,
  getUsername,
  runSlashCommand,
  setHistory,
  signal,
}: {
  checkoutRef: CheckoutReturnRef;
  getAlreadyPro: () => boolean;
  getUsername: () => GameState["username"];
  runSlashCommand: (command: string) => void;
  setHistory: Dispatch<SetStateAction<Message[]>>;
  signal: AbortSignal;
}) {
  appendCheckoutHistory(signal, setHistory, {
    role: "system",
    content: "[💳] Retrieving your license — one sec…",
  });

  try {
    const result = await fetchCheckoutLicense(checkoutRef, signal);
    if (!result || signal.aborted) return;
    if (handleSuccessfulCheckoutSync({ alreadyPro: getAlreadyPro(), data: result.data, runSlashCommand, setHistory, signal, username: getUsername() })) return;
    if (result.status !== 409) stripCheckoutReturnParams(signal);
    appendCheckoutHistory(signal, setHistory, {
      role: "error",
      content: `[❌] License activation failed: ${result.data.error ?? "Unknown error"}.${buildManualSyncHint(result.status, result.data)}`,
    });
  } catch {
    if (signal.aborted) return;
    appendCheckoutHistory(signal, setHistory, {
      role: "error",
      content: "[❌] Network error during license activation. Check your email for the license key and run `/sync <COPE-XXX>` manually.",
    });
  }
}

export function useCheckoutLicenseSync({ isBooting, proKeyHash, username, setHistory, runSlashCommand }: UseCheckoutLicenseSyncArgs) {
  const checkoutHandledRef = useRef<string | null>(null);
  const latestProKeyHashRef = useRef(proKeyHash);
  const latestUsernameRef = useRef(username);
  const latestSetHistoryRef = useRef(setHistory);
  const latestRunSlashCommandRef = useRef(runSlashCommand);

  latestProKeyHashRef.current = proKeyHash;
  latestUsernameRef.current = username;
  latestSetHistoryRef.current = setHistory;
  latestRunSlashCommandRef.current = runSlashCommand;

  useEffect(() => {
    if (isBooting) return;
    const params = new URLSearchParams(window.location.search);
    const checkoutId = params.get("checkout_id");
    const customerSessionToken = params.get("customer_session_token");
    const checkoutRef: CheckoutReturnRef | null = checkoutId
      ? { type: "checkout_id", value: checkoutId }
      : customerSessionToken
        ? { type: "customer_session_token", value: customerSessionToken }
        : null;
    const handledKey = checkoutRef ? `${checkoutRef.type}:${checkoutRef.value}` : null;
    if (!checkoutRef || checkoutHandledRef.current === handledKey) return;
    checkoutHandledRef.current = handledKey;
    const abortController = new AbortController();
    void syncCheckoutLicense({
      checkoutRef,
      getAlreadyPro: () => Boolean(latestProKeyHashRef.current),
      getUsername: () => latestUsernameRef.current,
      runSlashCommand: (command) => latestRunSlashCommandRef.current(command),
      setHistory: (value) => latestSetHistoryRef.current(value),
      signal: abortController.signal,
    });
    return () => {
      abortController.abort();
    };
  }, [isBooting]);
}

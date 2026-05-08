import { useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import { API_BASE } from "../config";
import type { GameState, Message } from "../hooks/useGameState";

type UseCheckoutLicenseSyncArgs = {
  isBooting: boolean;
  proKeyHash: GameState["proKeyHash"];
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

const CHECKOUT_RETRY_DELAY_MS = 2000;
const CHECKOUT_MAX_ATTEMPTS = 5;

function stripCheckoutIdFromLocation(signal: AbortSignal) {
  if (signal.aborted) return;
  const params = new URLSearchParams(window.location.search);
  params.delete("checkout_id");
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
  checkoutId: string,
  signal: AbortSignal,
): Promise<CheckoutLicenseFetchResult | null> {
  let lastStatus = 0;
  let lastData: CheckoutLicenseResponse = {};

  for (let attempt = 0; attempt < CHECKOUT_MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) {
      await waitForRetryDelay(signal, CHECKOUT_RETRY_DELAY_MS);
    }
    if (signal.aborted) return null;

    const response = await fetchCheckoutLicenseAttempt(checkoutId, signal, attempt);
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
  checkoutId: string,
  signal: AbortSignal,
  attempt: number,
): Promise<Response | "retry" | null> {
  try {
    const response = await fetch(`${API_BASE}/api/account/checkout-license`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkoutId }),
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

function handleSuccessfulCheckoutSync({
  alreadyPro,
  data,
  runSlashCommand,
  setHistory,
  signal,
}: {
  alreadyPro: boolean;
  data: CheckoutLicenseResponse;
  runSlashCommand: (command: string) => void;
  setHistory: Dispatch<SetStateAction<Message[]>>;
  signal: AbortSignal;
}) {
  const licenseKey = data.licenseKey;
  if (!licenseKey) return false;

  const keys = data.allKeys ?? [licenseKey];
  if (keys.length > 1) {
    const keyList = keys.map((key, index) => `${index + 1}. \`${key}\``).join("\n");
    appendCheckoutHistory(signal, setHistory, {
      role: "system",
      content: `[✅ TEAM PACK] Your purchase includes **${keys.length} license keys**:\n\n${keyList}\n\nShare these with your team. Each person can activate their key by running \`/sync <KEY>\`.`,
    });
    stripCheckoutIdFromLocation(signal);
    return true;
  }

  if (alreadyPro) {
    appendCheckoutHistory(signal, setHistory, {
      role: "system",
      content: `[✅] License key retrieved: \`${licenseKey}\`. You're already synced — run \`/sync ${licenseKey}\` to switch keys.`,
    });
    stripCheckoutIdFromLocation(signal);
    return true;
  }

  if (signal.aborted) return true;
  runSlashCommand(`/sync ${licenseKey}`);
  stripCheckoutIdFromLocation(signal);
  return true;
}

async function syncCheckoutLicense({
  alreadyPro,
  checkoutId,
  runSlashCommand,
  setHistory,
  signal,
}: {
  alreadyPro: boolean;
  checkoutId: string;
  runSlashCommand: (command: string) => void;
  setHistory: Dispatch<SetStateAction<Message[]>>;
  signal: AbortSignal;
}) {
  appendCheckoutHistory(signal, setHistory, {
    role: "system",
    content: "[💳] Retrieving your license — one sec…",
  });

  try {
    const result = await fetchCheckoutLicense(checkoutId, signal);
    if (!result || signal.aborted) return;
    if (handleSuccessfulCheckoutSync({ alreadyPro, data: result.data, runSlashCommand, setHistory, signal })) return;
    if (result.status !== 409) stripCheckoutIdFromLocation(signal);
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

export function useCheckoutLicenseSync({ isBooting, proKeyHash, setHistory, runSlashCommand }: UseCheckoutLicenseSyncArgs) {
  const checkoutHandledRef = useRef<string | null>(null);

  useEffect(() => {
    if (isBooting) return;
    const checkoutId = new URLSearchParams(window.location.search).get("checkout_id");
    if (!checkoutId || checkoutHandledRef.current === checkoutId) return;
    checkoutHandledRef.current = checkoutId;
    const abortController = new AbortController();
    void syncCheckoutLicense({
      alreadyPro: Boolean(proKeyHash),
      checkoutId,
      runSlashCommand,
      setHistory,
      signal: abortController.signal,
    });
    return () => {
      abortController.abort();
    };
  }, [isBooting, proKeyHash, runSlashCommand, setHistory]);
}

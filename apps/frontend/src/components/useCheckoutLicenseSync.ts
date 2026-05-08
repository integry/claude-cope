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

export function useCheckoutLicenseSync({ isBooting, proKeyHash, setHistory, runSlashCommand }: UseCheckoutLicenseSyncArgs) {
  const checkoutHandledRef = useRef<string | null>(null);

  useEffect(() => {
    if (isBooting) return;
    const checkoutId = new URLSearchParams(window.location.search).get("checkout_id");
    if (!checkoutId || checkoutHandledRef.current === checkoutId) return;
    checkoutHandledRef.current = checkoutId;
    const stripCheckoutId = () => {
      const params = new URLSearchParams(window.location.search);
      params.delete("checkout_id");
      const queryString = params.toString();
      window.history.replaceState({}, "", window.location.pathname + (queryString ? `?${queryString}` : ""));
    };
    const alreadyPro = Boolean(proKeyHash);
    void (async () => {
      setHistory((prev) => [...prev, { role: "system", content: "[💳] Retrieving your license — one sec…" }]);
      try {
        let lastData: { licenseKey?: string; allKeys?: string[]; error?: string } = {};
        let lastStatus = 0;
        for (let attempt = 0; attempt < 5; attempt++) {
          if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, 2000));
          let response: Response;
          try {
            response = await fetch(`${API_BASE}/api/account/checkout-license`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ checkoutId }),
              credentials: "include",
            });
          } catch {
            if (attempt < 4) continue;
            throw new Error("Network error");
          }
          if (response.status >= 500 && attempt < 4) continue;
          lastStatus = response.status;
          lastData = await response.json() as { licenseKey?: string; allKeys?: string[]; error?: string };
          if (response.ok && lastData.licenseKey) {
            const keys = lastData.allKeys ?? [lastData.licenseKey];
            if (keys.length > 1) {
              const keyList = keys.map((key, index) => `${index + 1}. \`${key}\``).join("\n");
              setHistory((prev) => [...prev, { role: "system", content: `[✅ TEAM PACK] Your purchase includes **${keys.length} license keys**:\n\n${keyList}\n\nShare these with your team. Each person can activate their key by running \`/sync <KEY>\`.` }]);
              stripCheckoutId();
              return;
            }
            if (alreadyPro) {
              setHistory((prev) => [...prev, { role: "system", content: `[✅] License key retrieved: \`${lastData.licenseKey}\`. You're already synced — run \`/sync ${lastData.licenseKey}\` to switch keys.` }]);
              stripCheckoutId();
              return;
            }
            runSlashCommand(`/sync ${lastData.licenseKey}`);
            stripCheckoutId();
            return;
          }
          if (response.status !== 409) break;
        }
        if (lastStatus !== 409) stripCheckoutId();
        const manualHint = lastData.licenseKey
          ? ` Your key: \`${lastData.licenseKey}\` — run \`/sync ${lastData.licenseKey}\` manually.`
          : lastStatus === 409
            ? " Refresh the page to retry automatically."
            : " If your license arrived by email, you can run `/sync <COPE-XXX>` manually.";
        setHistory((prev) => [...prev, { role: "error", content: `[❌] License activation failed: ${lastData.error ?? "Unknown error"}.${manualHint}` }]);
      } catch {
        setHistory((prev) => [...prev, { role: "error", content: "[❌] Network error during license activation. Check your email for the license key and run `/sync <COPE-XXX>` manually." }]);
      }
    })();
  }, [isBooting, proKeyHash, runSlashCommand, setHistory]);
}

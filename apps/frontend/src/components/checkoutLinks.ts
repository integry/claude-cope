import { API_BASE } from "../config";

type CheckoutReferenceResponse = {
  referenceId?: string;
};

export async function openBoundCheckoutUrl(checkoutUrl: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/account/checkout-reference`, {
    method: "GET",
    credentials: "include",
  });
  const data = await res.json().catch(() => ({})) as CheckoutReferenceResponse;
  if (!res.ok || typeof data.referenceId !== "string") {
    throw new Error("Unable to bind checkout to this session.");
  }

  const url = new URL(checkoutUrl);
  url.searchParams.set("reference_id", data.referenceId);
  window.location.assign(url.toString());
}

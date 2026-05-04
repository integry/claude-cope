const POLAR_API_BASE = "https://api.polar.sh/v1";

export interface PolarLicenseValidation {
  valid: boolean;
  status: string;
  id?: string;
}

interface PolarLicenseKeyResponse {
  id: string;
  status: "granted" | "activated" | "revoked" | "disabled";
  key: string;
  usage: number;
  limit_usage: number | null;
  validations: number;
  limit_validations: number | null;
  expires_at: string | null;
}

export async function validatePolarKey(
  licenseKey: string,
  accessToken: string,
  organizationId: string,
): Promise<PolarLicenseValidation> {
  const response = await fetch(
    `${POLAR_API_BASE}/customer-portal/license-keys/validate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ key: licenseKey, organization_id: organizationId }),
    },
  );

  if (!response.ok) {
    return { valid: false, status: "invalid" };
  }

  const data = (await response.json()) as PolarLicenseKeyResponse;
  const isActive =
    data.status === "granted" || data.status === "activated";

  return {
    valid: isActive,
    status: data.status,
    id: data.id,
  };
}

/**
 * Mirror the app's usage counter to Polar's `usage` field on a license key.
 * Idempotent setter (last-write-wins) — safe under concurrent chat requests.
 * Fire-and-forget at the call site; failures here don't affect the user.
 *
 * Throws on non-2xx responses so the caller's debounce write only fires on
 * actual success — otherwise a Polar 4xx/5xx would suppress retries for
 * 5 minutes while the dashboard drifts.
 */
export async function syncPolarUsage(
  licenseKeyId: string,
  accessToken: string,
  usage: number,
): Promise<void> {
  const res = await fetch(`${POLAR_API_BASE}/license-keys/${licenseKeyId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ usage }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Polar PATCH /license-keys failed: ${res.status} ${body.slice(0, 200)}`);
  }
}

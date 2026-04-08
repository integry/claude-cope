const POLAR_API_BASE = "https://api.polar.sh/v1";

interface PolarLicenseValidation {
  valid: boolean;
  status: string;
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
): Promise<PolarLicenseValidation> {
  const response = await fetch(
    `${POLAR_API_BASE}/customer-portal/license-keys/validate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ key: licenseKey }),
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
  };
}

/**
 * Standard Webhooks signature verification using crypto.subtle.
 */

const TIMESTAMP_TOLERANCE_SECONDS = 5 * 60; // 5 minutes

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i]! ^ b[i]!;
  }
  return result === 0;
}

export async function verifyWebhookSignature(
  payload: string,
  headers: { "webhook-id": string; "webhook-timestamp": string; "webhook-signature": string },
  secret: string,
): Promise<void> {
  // Strip whsec_ prefix and base64-decode
  const secretBytes = Uint8Array.from(
    atob(secret.startsWith("whsec_") ? secret.slice(6) : secret),
    (c) => c.charCodeAt(0),
  );

  // Validate timestamp (replay protection)
  const timestamp = parseInt(headers["webhook-timestamp"], 10);
  if (isNaN(timestamp)) {
    throw new Error("Invalid webhook timestamp");
  }
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > TIMESTAMP_TOLERANCE_SECONDS) {
    throw new Error("Webhook timestamp outside tolerance");
  }

  // Construct signed content: {id}.{timestamp}.{body}
  const signedContent = `${headers["webhook-id"]}.${headers["webhook-timestamp"]}.${payload}`;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(signedContent));
  const expected = `v1,${btoa(String.fromCharCode(...new Uint8Array(signature)))}`;

  // The header may contain multiple space-separated signatures
  const providedSignatures = headers["webhook-signature"].split(" ");
  const expectedBytes = encoder.encode(expected);

  for (const sig of providedSignatures) {
    const sigBytes = encoder.encode(sig);
    if (constantTimeEqual(expectedBytes, sigBytes)) {
      return; // Valid
    }
  }

  throw new Error("Invalid webhook signature");
}

# Edge Rate-Limit Rollout Runbook

This document describes how to configure the Cloudflare WAF rule, KV-backed
hybrid limiter, and PostHog telemetry that together replace the old
`RATE_LIMITER` unsafe binding on `/api/chat`.

---

## Prerequisites

| Item | Where |
|------|-------|
| Cloudflare dashboard access with WAF edit permissions | dash.cloudflare.com |
| A KV namespace created for rate-limit state | Workers & Pages > KV |
| PostHog project with a server-side API key | posthog.com (or self-hosted) |

---

## 1. Create the KV Namespace

```bash
npx wrangler kv namespace create RATE_LIMIT_KV
```

Copy the returned `id` into `apps/backend/wrangler.toml` under the
`[[kv_namespaces]]` entry for `RATE_LIMIT_KV`, replacing
`placeholder-rate-limit-kv-id`.

For the preview namespace used in `wrangler dev`:

```bash
npx wrangler kv namespace create RATE_LIMIT_KV --preview
```

Add the preview ID as `preview_id` on the same binding block.

---

## 2. Configure PostHog Environment Variables

Set the API key as a Worker secret (not in `wrangler.toml`):

```bash
npx wrangler secret put POSTHOG_API_KEY
```

- `POSTHOG_API_KEY` -- project API key from PostHog Settings > Project.
  This is a secret and must not be committed to the repository.

`POSTHOG_HOST` is not sensitive (it is a public ingest URL) and can be set
as a plain environment variable in `wrangler.toml` or `.env`. It defaults
to `https://app.posthog.com` for PostHog Cloud. Override it with your
self-hosted instance URL (no trailing slash) if applicable.

The Worker uses these to call `POST ${POSTHOG_HOST}/capture` with
server-side events. No client-side JS is involved.

---

## 3. Cloudflare WAF Rule (Manual)

The WAF rule acts as a first line of defence before the Worker KV limiter
runs. It is configured entirely in the Cloudflare dashboard because WAF
rules are managed outside this repository.

### 3.1 Rule Expression

```txt
(http.request.uri.path eq "/api/chat" and http.request.method eq "POST")
```

### 3.2 Action

**Rate Limit** with the following parameters:

| Parameter | Value |
|-----------|-------|
| Counting expression | same as rule expression |
| Period | 60 seconds |
| Requests per period | 120 |
| Mitigation timeout | 60 seconds |
| Action | Block |
| Response type | Default Cloudflare JSON error |

### 3.3 Limiter Bucket Definitions

Requests are bucketed by **IP address** (Cloudflare default for rate-limit
rules). The WAF rule uses a single bucket definition:

| Bucket key | Description |
|------------|-------------|
| `ip.src` | Client IP as seen by Cloudflare after proxy headers are resolved |

The KV-backed limiter inside the Worker adds a second, finer-grained
bucket keyed on the session or user identifier, allowing per-user limits
that the WAF layer cannot enforce.

### 3.4 Lore Mapping

| Concept | Implementation |
|---------|----------------|
| Global burst protection | Cloudflare WAF rate-limit rule (this section) |
| Per-user sustained limit | Worker KV limiter (`RATE_LIMIT_KV`) — advisory; see known limitations below |
| Telemetry / alerting | PostHog server-side capture (`Rate_Limit_Triggered`) |
| Legacy simple limiter | **Removed.** `/api/verify` now uses `RATE_LIMIT_KV` via `checkSimpleRateLimit` (same KV namespace as `/api/chat`). The `unsafe.bindings.RATE_LIMITER` block has been deleted from `wrangler.toml`. |
| Missing `IP_HASH_PEPPER` | **Fail-closed (503)**. If `RATE_LIMIT_KV` is bound but `IP_HASH_PEPPER` is not set, the middleware returns 503 Service Unavailable. This forces operators to fix the misconfiguration before traffic flows. |

### 3.5 Known Limitation: KV Latency on `/api/chat`

Each chat request evaluates up to 5 rate-limit buckets. All 5 KV `get`
calls are issued in parallel (single round-trip), followed by sequential
`put` calls that short-circuit on the first exceeded bucket. Worst case
is 5 parallel reads + 5 sequential writes; best case (first bucket
blocks) is 5 parallel reads + 1 write. Under normal conditions Workers
KV reads are fast (edge-cached), but operators should monitor P99
latency on `/api/chat` after enabling the KV limiter. If latency is
unacceptable, consider reducing the number of active buckets or moving
to Durable Objects for atomic single-call increments.

### 3.6 Known Limitation: KV Counter Race Condition

KV does not support atomic increments. The get→compute→put cycle is not
atomic, so concurrent requests can read the same counter value and
overwrite each other, causing undercounting. This means the KV limiter
is **advisory**: under high concurrency it may allow slightly more
requests than the configured limit before blocking.

The WAF rule (Section 3) is the authoritative enforcement layer and
operates atomically at the Cloudflare edge. The KV limiter provides
finer-grained per-user/per-session limits that the WAF cannot express,
but operators should understand that its counters are best-effort.

If exact enforcement is required in the future, options include:
- Durable Objects (atomic per-key, but higher latency and cost)
- An external counter service with atomic increment support

---

## 4. Validation Steps

Run through these checks after deploying each layer.

### 4.1 KV Binding

```bash
npx wrangler dev
curl -X POST http://localhost:8787/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'
```

Confirm the Worker starts without binding errors. Verify that keys appear in
the KV namespace after a request:

```bash
npx wrangler kv key list --binding RATE_LIMIT_KV
```

### 4.2 PostHog Events

1. Trigger a rate-limit hit (send requests exceeding the per-user threshold).
2. Open PostHog > Activity > Live Events.
3. Confirm `Rate_Limit_Triggered` events appear with the expected
   properties (`limit_type`, `asn`, `country`, `distinct_id`).

### 4.3 WAF Rule

1. In Cloudflare dashboard, navigate to Security > WAF > Rate limiting rules.
2. Confirm the rule from Section 3 is **enabled**.
3. From an external IP, send > 120 POST requests to `/api/chat` within
   60 seconds (e.g. with `hey` or `ab`).
4. Confirm requests beyond the threshold receive a `429` response directly
   from Cloudflare (the Worker is never invoked for blocked requests).

### 4.4 End-to-End

1. Deploy to a staging environment with both the WAF rule and the Worker.
2. Run a realistic traffic pattern: normal usage should pass through; abusive
   bursts should be caught first by the WAF and then by the KV limiter for
   per-user enforcement.
3. Verify PostHog dashboards update in near-real-time.

---

## 5. Rollback

- **WAF rule**: disable or delete the rate-limit rule in the Cloudflare
  dashboard. No deploy required.
- **KV limiter**: deploy a Worker version that skips KV reads (feature-flag
  or revert). Optionally flush the KV namespace:
  ```bash
  npx wrangler kv bulk delete --binding RATE_LIMIT_KV <keys-file>
  ```
- **PostHog**: remove or rotate the `POSTHOG_API_KEY` secret. Events already
  captured remain in PostHog.

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

Set the following in your Worker secrets (not in `wrangler.toml`):

```bash
npx wrangler secret put POSTHOG_API_KEY
npx wrangler secret put POSTHOG_HOST
```

- `POSTHOG_API_KEY` -- project API key from PostHog Settings > Project.
- `POSTHOG_HOST` -- `https://app.posthog.com` for Cloud, or your self-hosted
  URL (no trailing slash).

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
| Per-user sustained limit | Worker KV limiter (`RATE_LIMIT_KV`) |
| Telemetry / alerting | PostHog server-side capture (`rate_limit.hit`, `rate_limit.near_quota`) |
| Legacy simple limiter | **Removed** -- the old `unsafe.bindings.RATE_LIMITER` block has been deleted from `wrangler.toml` |

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
3. Confirm `rate_limit.hit` and/or `rate_limit.near_quota` events appear
   with the expected properties (IP, user/session ID, bucket counts).

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

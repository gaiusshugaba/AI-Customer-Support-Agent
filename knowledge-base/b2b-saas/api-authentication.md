---
doc_id: kb-b2b-002
title: API Authentication
tenant_id: b2b-saas-demo
industry_pack: saas
category: technical
version: 1.2
last_updated: 2026-07-15
source: internal
---

# API Authentication

## Overview

FlowStack's REST API uses API keys for authentication. Every request to the API must include a valid key in the `Authorization` header.

## Generating an API Key

1. Go to **Settings → API Keys** in your FlowStack dashboard.
2. Click **Generate New Key**.
3. Name the key (e.g., "Production Server") and select its scope: `read-only`, `read-write`, or `admin`.
4. Copy the key immediately — for security reasons, the full key is only shown once.

## Using the Key

Include the key in every request as a Bearer token:

```
Authorization: Bearer fs_live_xxxxxxxxxxxxxxxx
```

Keys prefixed `fs_live_` are production keys. Keys prefixed `fs_test_` are sandbox keys and do not affect live workflows or billing.

## Key Rotation

API keys do not expire automatically, but we recommend rotating production keys every 90 days. To rotate a key without downtime, generate a new key, update your integration to use it, confirm requests are succeeding with the new key, then revoke the old key from the API Keys settings page.

## Rate Limits

- Starter and Growth plans: 100 requests/minute per key.
- Enterprise plans: 1,000 requests/minute per key, with the option to request higher limits.

Exceeding the rate limit returns a `429 Too Many Requests` response with a `Retry-After` header indicating how many seconds to wait.

## Common Errors

- `401 Unauthorized` — key is missing, malformed, or revoked.
- `403 Forbidden` — key is valid but lacks scope for the requested action (e.g., a `read-only` key attempting a write).
- `429 Too Many Requests` — rate limit exceeded.

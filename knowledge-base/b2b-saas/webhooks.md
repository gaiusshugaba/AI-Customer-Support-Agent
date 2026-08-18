---
doc_id: kb-b2b-005
title: Webhooks & Event Triggers
tenant_id: b2b-saas-demo
industry_pack: saas
category: technical
version: 1.0
last_updated: 2026-07-30
source: internal
---

# Webhooks & Event Triggers

## Overview

FlowStack workflows can be triggered by an incoming webhook, letting external systems start a workflow by sending an HTTP request. Every workflow with a Webhook trigger gets a unique URL under `https://hooks.flowstack.io/{workflow_id}`.

## Creating a Webhook Trigger

Add a **Webhook** trigger node to any workflow, choose the HTTP method (GET, POST, PUT, DELETE), and save the workflow. The unique URL appears in the trigger node's settings panel. Webhook triggers are inactive until the workflow itself is activated.

## Testing vs Production URLs

Every webhook has two URLs: a **test URL** (only works while you have the workflow open in the editor and click "Listen for Test Event") and a **production URL** (works continuously once the workflow is activated). Sending real traffic to the test URL outside an active editor session will fail silently — this is one of the most common support questions we get.

## Securing a Webhook

By default, webhook URLs are unauthenticated — anyone with the URL can trigger the workflow. To secure one, open the Webhook node's **Authentication** setting and choose either Header Auth (a shared secret header your caller must include) or Basic Auth. We recommend Header Auth for server-to-server integrations.

## Payload Size Limits

Webhook payloads are capped at 5MB on Starter and Growth plans, 25MB on Enterprise. Payloads exceeding the limit return a `413 Payload Too Large` response and the workflow does not execute.

## Retrying Failed Webhook Deliveries

FlowStack does not automatically retry a webhook trigger if your workflow fails partway through — retry logic is the responsibility of whatever system is calling the webhook. If you need guaranteed delivery, have the caller implement retry-with-backoff on non-2xx responses, since a failed workflow execution returns a non-2xx status by default.

## Event Triggers (vs Webhooks)

Event Triggers are different from Webhook triggers — they fire automatically based on changes inside a connected app (e.g., "new row in Airtable," "new deal in Salesforce") rather than an inbound HTTP call you construct yourself. Event Triggers are polling-based on Starter/Growth (checked every 5 minutes) and near-real-time on Enterprise (via native webhooks where the connected app supports them).

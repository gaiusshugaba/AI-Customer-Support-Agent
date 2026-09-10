# FlowStack Product Status and Known Issues

## Document metadata
- Title: Product Status and Known Issues
- Category: product / technical
- Tenant: b2b-saas-demo
- Version: 2.0
- Last updated: 2026-09-10

## How do I check the current FlowStack status?

Visit status.flowstack.com for real-time service status, incident history, and scheduled maintenance. The status page is the only authoritative source for outage information. Support should never claim FlowStack is experiencing an outage unless the status page explicitly says so.

## Are there any ongoing incidents?

Check status.flowstack.com. If there's an active incident, the status page shows the affected services, start time, and current mitigation status. Support may reference the status page but should not speculate about cause or timeline.

## Known issue: long-running requests

Some requests may take longer than expected to complete. A frontend timeout does not necessarily mean the backend execution failed. Before retrying, open Execution History to check whether the original run actually completed — otherwise a retry may create a duplicate action.

## Known issue: integration permission failures

Some integration failures come from expired credentials or insufficient permission scopes rather than from the FlowStack workflow itself. If the error is 401 or 403, check the connected credential under Settings → Integrations before assuming a workflow bug.

## Known issue: webhook delivery delays

Webhook deliveries during peak hours (typically 9–11am and 2–4pm US Eastern on weekdays) may experience up to 30 seconds of delay. This is expected behavior and not a service degradation. FlowStack retries failed webhook deliveries three times over 5 minutes.

## Known issue: execution counter lag

The execution counter on the Usage page may lag up to 5 minutes behind actual execution processing. If you're approaching your plan limit, allow a few minutes for the counter to catch up before assuming you've exceeded it.

## Known issue: attachment upload size limit

File attachments to support chat are limited to 10 MB each and 25 MB total per message. If your attachment exceeds these limits, split it into multiple files or upload it to a shared drive and share the link.

## Known issue: mobile layout on the workflow editor

The workflow editor is optimized for desktop. On mobile, you can view workflows and executions, but editing is not fully supported. Use a desktop browser for creating or modifying workflows.

## Diagnostic rule

When a customer reports a problem, distinguish between:
- Product behavior described in the knowledge base.
- Account-specific state from customer context.
- Execution-specific evidence (IDs, logs, error messages).
- Unsupported assumptions.

If the evidence is insufficient, say what is known and request the smallest useful missing detail, or escalate.

## How do I report a bug?

Go to Help → Report a Bug in the workspace, or email bugs@flowstack.com. Include the workflow name, execution ID (if applicable), steps to reproduce, and any redacted screenshots. Bug reports are acknowledged within 24 hours.

## How do I request a feature?

Go to Help → Request a Feature, or post in the community forum at community.flowstack.com. Feature requests are reviewed weekly. Enterprise customers can request features directly through their account team.

# Examples

Three real request payloads showing the system's core behaviors, with what to expect from each — not full response dumps, since exact wording varies run to run, but the behavior each one is meant to demonstrate.

## `rag-request.json`

A normal, answerable question grounded in the knowledge base.

**Expect:** `intent: technical`, a response grounded in the API Authentication doc's Rate Limits section, a non-zero `retrieval_score`, `decision: respond` (not escalated).

## `escalation-billing-dispute.json`

A billing dispute — deliberately the kind of message that should never get a confidently-generated answer, since no knowledge base article can authorize a specific customer's refund.

**Expect:** `intent: billing`, `risk_flags: ["billing_dispute"]`, `decision: escalate`, a support case created, and a response acknowledging the specific complaint (not a generic "please describe your issue") while asking only for what's genuinely needed to investigate.

## `escalation-follow-up.json`

Sent with the **same `conversation_id`** as the billing dispute above, after it. Simulates the customer replying with the requested details.

**Expect:** the existing case is found and updated — not a new case created. Once required information is present, case state moves to `READY_FOR_AGENT` and the response confirms human handoff.

---

Send any of these to the workflow's webhook the same way (`POST`, `Content-Type: application/json`, body = the file's contents). The two escalation examples only demonstrate the multi-turn case behavior when sent in order with the matching `conversation_id`.

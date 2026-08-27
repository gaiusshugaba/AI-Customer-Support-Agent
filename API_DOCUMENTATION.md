# API Documentation & Contracts

---

## 1. Customer Conversation Webhook

### Request

`POST /webhook/conversation-message`  
`Content-Type: application/json`

```json
{
  "tenant_id": "b2b-saas-demo",
  "customer_id": "cust-99120",
  "conversation_id": "conv-33819",
  "text": "How do I invite additional team members to my workspace?"
}
```

### Responses

#### A. Standard Grounded Response (Direct Answer)

```json
{
  "tenant_id": "b2b-saas-demo",
  "conversation_id": "conv-33819",
  "customer_id": "cust-99120",
  "response_text": "To invite team members, navigate to Settings > Team in your dashboard, click 'Invite Member', and enter their email address. Team members will receive an invite link valid for 48 hours.",
  "decision": "respond",
  "decision_reason": "passed_guardrails",
  "intent": "general",
  "confidence_score": 0.95,
  "retrieval_score": 0.88,
  "risk_flags": [],
  "requires_account_context": false,
  "escalation_reasons": [],
  "case_id": null,
  "escalation_state": null
}
```

#### B. Initial Escalation (Intake in Progress)

```json
{
  "tenant_id": "b2b-saas-demo",
  "conversation_id": "conv-33819",
  "customer_id": "cust-99120",
  "response_text": "I'm sorry to hear that you were charged twice for your subscription. I have opened a support case for our billing team. To help them investigate, could you please provide the dates and amounts of both charges?",
  "decision": "escalate",
  "decision_reason": "risk_flag_detected",
  "intent": "billing",
  "confidence_score": 0.85,
  "retrieval_score": 0.72,
  "risk_flags": ["billing_dispute"],
  "requires_account_context": false,
  "escalation_reasons": ["billing_dispute"],
  "case_id": "d9b23112-70fc-4c0a-8bf7-10f78a22bc11",
  "escalation_state": "AWAITING_CUSTOMER_INFO"
}
```

#### C. Case Ready for Human Agent

```json
{
  "tenant_id": "b2b-saas-demo",
  "conversation_id": "conv-33819",
  "customer_id": "cust-99120",
  "response_text": "Thanks for providing those details. I’ve added them to your case, and it’s now ready for our support team to review. A human support agent will follow up with you.",
  "decision": "respond",
  "decision_reason": "passed_guardrails",
  "intent": "billing",
  "confidence_score": 0.9,
  "retrieval_score": 0.8,
  "risk_flags": [],
  "requires_account_context": false,
  "escalation_reasons": [],
  "case_id": "d9b23112-70fc-4c0a-8bf7-10f78a22bc11",
  "escalation_state": "READY_FOR_AGENT"
}
```

#### D. No-Knowledge Fallback

```json
{
  "tenant_id": "b2b-saas-demo",
  "conversation_id": "conv-33819",
  "customer_id": "cust-99120",
  "response_text": "I don't have information on that topic yet — let me connect you with someone who can help.",
  "decision": "escalate",
  "decision_reason": "retrieval_below_threshold",
  "intent": "general",
  "confidence_score": 0,
  "retrieval_score": 0,
  "risk_flags": [],
  "requires_account_context": false,
  "escalation_reasons": ["low_retrieval_quality"],
  "case_id": "c3319aab-2f11-4e2e-9b91-a1e5b2f2c2e1",
  "escalation_state": "AWAITING_CUSTOMER_INFO"
}
```

---

## 2. Knowledge Ingestion Webhook

### Primary: Multipart File Upload (Frontend)

`POST /webhook/kb-ingest`  
`Content-Type: multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `tenant_id` | String | Yes | Target tenant isolation partition |
| `file` | Binary | Yes | Supported extensions: `.pdf`, `.md`, `.txt`, `.csv` |
| `doc_id` | String | No | Document ID (inferred from content if omitted) |

**Metadata derivation rules (in priority order):**

| Field | Priority 1 | Priority 2 | Priority 3 |
|---|---|---|---|
| `doc_id` | Text header (`Document ID:`) | Request body | Filename (`{tenant}_{docId}_{slug}.pdf`) |
| `tenant_id` | Text header (`Tenant:`) | Request body | Filename prefix |
| `title` | First text line | Request body | Filename slug |
| `category` | Text header (`Category:`) | Request body | `'general'` |
| `version` | Text header (`Version:`) | Request body | `'1.0'` |
| `last_updated` | Text header (`Last Updated:`) | Request body | Ingestion date |
| `file_type` | Explicit field | Binary metadata | Filename extension → MIME type |

**Response:**

```json
{
  "status": "ok",
  "doc_id": "kb-saas-security-001",
  "chunks_indexed": 8
}
```

### Legacy: JSON Body with `file_content`

```json
{
  "doc_id": "kb-b2b-001",
  "tenant_id": "b2b-saas-demo",
  "title": "Product Overview",
  "category": "general",
  "version": "1.0",
  "last_updated": "2026-08-01",
  "file_type": "md",
  "file_content": "# Product Overview\n..."
}
```

This format is still supported for API-first integrations but requires all metadata to be provided explicitly.

---

## 3. Error Response Format (Validation Failure)

```json
{
  "error": "Invalid request",
  "details": "Missing required field: tenant_id, conversation_id, or text"
}
```

---

## 4. Operational Notes

- The customer chat endpoint is **customer-facing**. The admin/ops console must NOT send customer messages to it — it is a monitoring interface.
- The knowledge ingestion endpoint is **admin-facing**. Only the admin application may upload documents here.
- Never expose `request_errors`, `escalation_cases.case_context`, or internal AI scores (confidence/retrieval) to the customer chat UI. These are operational fields.
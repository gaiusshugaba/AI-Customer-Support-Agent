# Testing Guide & Verification Scenarios

Run these tests against the platform to verify ingestion, RAG, deterministic guardrails, and the multi-turn escalation state machine.

---

## Test Suite Summary

| ID | Test Scenario | Input Trigger | Key Verification Point | Expected Output |
|---|---|---|---|---|
| **I-01** | Ingest Markdown via Multipart | `POST /webhook/kb-ingest` (`.md` file) | Binary preservation + routing + metadata parsing | `{"status":"ok", "chunks_indexed": N}` |
| **I-02** | Ingest PDF via Multipart | `POST /webhook/kb-ingest` (`.pdf` file) | PDF extraction + `extracted_text` normalization + `file_type` resolution | `{"status":"ok", "chunks_indexed": N}` |
| **I-03** | Re-Ingestion Deduplication | Same `doc_id` as I-01 | Old vectors deleted before re-index | Vector count unchanged / no duplicates |
| **I-04** | Deliberate Failure (empty `.txt`) | `POST /webhook/kb-ingest` (empty file) | Validation gate still works | Structured error logged, `status: "failed"` |
| **C-01** | Standard Knowledge Question | "What are the rate limits for the API?" | High similarity retrieval, direct grounded answer | `decision: "respond"`, `confidence_score >= 0.85` |
| **C-02** | Missing Knowledge / Fallback | "What is your refund policy for Mars travel?" | Retrieval score = 0, no hallucinated answer | Fallback refusal, `confidence_score: 0` |
| **C-03** | Customer Account Context Awareness | "Can I create more projects on my current plan?" | Uses customer profile plan tier directly | Answers based on `customers.plan_tier` |
| **C-04** | Billing Dispute Escalation Intake | "I was charged twice on August 12 and August 13." | Risk flag raised, case opened in Supabase | `escalation_state: "AWAITING_CUSTOMER_INFO"` |
| **C-05** | Follow-Up Intake & Ticket Completion | "My email is user@example.com and the amounts were $49 each." | Merges info, validates readiness | `escalation_state: "READY_FOR_AGENT"` |
| **C-06** | Case Relevance / Topic Change | "How do I reset my API key?" (active case open) | Classifier detects topic switch | Routes to normal RAG, does not hijack chat |

---

## Ingestion Tests (run in order)

### I-01: Ingest Markdown via Multipart

```bash
curl -X POST https://your-n8n-instance.com/webhook/kb-ingest \
  -F "tenant_id=b2b-saas-demo" \
  -F "file=@/path/to/product-guide.md"
```

**Expected:** `{"status":"ok", "doc_id":"...", "chunks_indexed": N}`  
Confirm: `ingestion_log` row with `status: "success"`; vectors visible in Pinecone under namespace `b2b-saas-demo`.

### I-02: Ingest PDF via Multipart

```bash
curl -X POST https://your-n8n-instance.com/webhook/kb-ingest \
  -F "tenant_id=b2b-saas-demo" \
  -F "file=@/path/to/security-policy.pdf"
```

**Expected:** PDF routes correctly (string-equality fix), `file_type` resolves to `pdf`, metadata headers parsed from text.

### I-03: Re-Ingestion Test

Re-run I-01 with the same source document. **Expected:** `[INGEST] - Delete Existing Vectors` fires before re-indexing; retrieval returns no duplicate chunks afterward.

### I-04: Deliberate Failure (empty `.txt`)

```bash
curl -X POST https://your-n8n-instance.com/webhook/kb-ingest \
  -F "tenant_id=b2b-saas-demo" \
  -F "file=@/path/to/empty.txt"
```

**Expected:** HTTP error response; `ingestion_log` row with `status: "failed"`, `failed_node: "Validate Extracted Text"`, `error_message: "Document contains no extractable text."`

---

## Chat Tests

### C-01: Normal Grounded Question

```bash
curl -X POST https://your-n8n-instance.com/webhook/conversation-message \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "b2b-saas-demo",
    "customer_id": "cust-10293",
    "conversation_id": "conv-test-01",
    "text": "What are the rate limits for API calls?"
  }'
```

**Expected Assertions:**
- `decision` = `"respond"`
- `confidence_score` derived from retrieval quality (not self-reported)
- Response references retrieved documentation only

### C-04: Billing Dispute Escalation Intake

```bash
curl -X POST https://your-n8n-instance.com/webhook/conversation-message \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "b2b-saas-demo",
    "customer_id": "cust-10293",
    "conversation_id": "conv-test-02",
    "text": "I was charged twice for my subscription this month and need a refund."
  }'
```

**Expected Assertions:**
- `decision` = `"escalate"`
- `risk_flags` contains `"billing_dispute"`
- `escalation_state` = `"AWAITING_CUSTOMER_INFO"`
- New record in `escalation_cases` table
- Response does NOT ask for passwords/CVVs/full card numbers
- Response asks for date AND amount of EACH disputed charge (plural-aware)

### C-05: Case Follow-Up Merge

```bash
curl -X POST https://your-n8n-instance.com/webhook/conversation-message \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "b2b-saas-demo",
    "customer_id": "cust-10293",
    "conversation_id": "conv-test-02",
    "text": "My account email is john@example.com. The charges were $49 on Aug 10 and $49 on Aug 11."
  }'
```

**Expected Assertions:**
- `is_case_follow_up` = `true` (via Case Relevance Classifier)
- `escalation_state` = `"READY_FOR_AGENT"`
- Supabase case updated to `status = 'ready_for_agent'`
- `missing_information` no longer contains the reason for dispute or transaction details

### C-06: Topic Change Mid-Escalation

```bash
curl -X POST https://your-n8n-instance.com/webhook/conversation-message \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "b2b-saas-demo",
    "customer_id": "cust-10293",
    "conversation_id": "conv-test-02",
    "text": "Where can I download my monthly invoice PDF?"
  }'
```

**Expected Assertions:**
- `is_case_follow_up` = `false`
- Bypasses case intake update; executes standard RAG query
- Active case remains untouched

---

## Security & Negative Tests

- **Credential leakage:** any escalation response containing "password", "CVV", "full card", "authentication code", or "API key" as a *request* = FAIL.
- **Example anchoring:** send a duplicate-charge complaint with unique details ($73.19 on a specific date); the response must reference those exact details, not hardcoded example values ($49/August 12).
- **Hallucination guard:** ask a question about a policy not in the knowledge base; response must admit lack of knowledge, never invent a policy.
- **Tenant isolation:** query tenant `a` from a vector inserted under tenant `b`; retrieval must return zero results.

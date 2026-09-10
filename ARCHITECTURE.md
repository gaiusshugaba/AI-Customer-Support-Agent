# FlowStack System Architecture

This document describes the architectural framework, data flow pipelines, and decision matrices powering the FlowStack AI Customer Support Platform.

---

## The Three Core Models

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           1. IDENTITY MODEL                             │
│                                                                         │
│  TENANT (Isolation Boundary)                                            │
│  └── CUSTOMER (Persistent Entity: email, plan_tier, custom_fields)      │
│      └── CONVERSATION (Unique Session: conversation_id)                 │
│          └── ESCALATION CASE (Created only when escalation is required) │
│                                                                         │
│  Rule: customer_id ≠ conversation_id ≠ case_id                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                            2. MEMORY MODEL                              │
│                                                                         │
│  CUSTOMER MEMORY        CONVERSATION MEMORY       CASE STATE            │
│  (Supabase: customers)  (conversation_turns)      (escalation_cases)    │
│  • Account Plan Tier    • Chronological Turns     • Missing Info List   │
│  • Account Status       • Intent & AI Scores      • Case Ready Flag     │
│  • Entitlements         • Role (user/assistant)   • Handoff Mode        │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                           3. DECISION MODEL                             │
│                                                                         │
│  Incoming Message ──► Active Case Check ──► Relevant? ──► Follow-Up Flow│
│                              │                                          │
│                              ▼ (No / New Topic)                         │
│  Classify Intent ──► Retrieve Vectors ──► Grounded Generation           │
│                              │                                          │
│                              ▼                                          │
│  Deterministic Guardrails ──► [Score >= Thresh] ──► Respond Directly    │
│                              │                                          │
│                              ▼ [Risk Flag / Low Score]                  │
│                        Escalate & Intake Case                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Ingestion Pipeline Architecture

```
Switch  (string-equality on file extension: 'pdf' / 'docx' / 'md')

    ┌────┬────┬─────┐

    │    │    │     │

   PDF  DOCX  MD   (default)

    │    │    │     │

    ▼    ▼    ▼     ▼

  Extract text via format-specific extractor

    │    │    │     │

    └────┴────┴─────┘

         ▼

[INGEST] - Normalize Document  (parses - Key: Value metadata headers, normalizes extracted_text, resolves file_type, generates clean doc_id)

         │

         ▼

[INGEST] - Check Previous Ingestion  (Supabase: ingestion_log, status=success)

         │

    ┌────┴────────────────────────────┐

    │ Exists                          │ New Document

    ▼                                 ▼

Delete Existing Vectors           (skip deletion)

    │

    ▼

Restore Document Context

    │

    └────────┬────────────────────────┘

             ▼

[INGEST] - Validate Extracted Text  (non-empty gate)

             │

             ▼

[INGEST] - Chunk Document

   ├─ Markdown strategy: split on #/##/###

   ├─ Heuristic strategy: detect headings via short-line / question-word rules

   ├─ Skip sections < MIN_CHARS (100)

   ├─ Skip 'Document metadata' section

   └─ Emit chunk with `text` = "title — heading\n\nbody"

             │

             ▼

[INGEST] - Validate Chunks          (count > 0 gate)

             │

             ▼

[INGEST] - Index Knowledge          (OpenAI text-embedding-3-large, 3072-dim → Pinecone namespace = tenant_id)
```

---

## Live Chat Pipeline

```
[CHAT] - Receive Message (POST /webhook/conversation-message)
       │
       ▼
[CHAT] - Unwrap Request              (extract $json.body)
       │
       ▼
[CHAT] - Validate Message            (tenant_id, customer_id, conversation_id, non-empty text)
       │
       ├────────────────────── Invalid ──► Log + Respond Validation Error
       ▼
[CHAT] - Load Tenant Config ──► Load Customer Context ──► Load Conversation History  (serial chain)
       │
       ▼
[CHAT] - Build Conversation Context  (merge: message + tenant_config + customer_context + history)
       │
       ├──────────────────────────────────────────────┐
       ▼                                              ▼
Write User Turn (Supabase)                [ESCALATION] - Check Active Case
                                                     │
                                                     ▼
                                            [ESCALATION] - Evaluate Active Case
                                                     │
                                                     ▼
                                            [ESCALATION] - Route Active Case Follow-Up
                                            ┌────────────┴────────────┐
                                            │ Active Case Exists      │ No Active Case /
                                            │ & Message Relevant      │ Standard Query
                                            ▼                         ▼
                                  [CASE FOLLOW-UP PATH]      [RAG] - Build Intent Prompt
                                                                        │
                                                                        ▼
                                                               [RAG] - Classify Intent (Structured Output)
                                                                        │
                                                                        ▼
                                                               [RAG] - Extract Intent Signals
                                                                        │
                                                                        ▼
                                                               [RAG] - Retrieve Knowledge (Pinecone, tenant namespace)
                                                                        │
                                                                        ▼
                                                               [RAG] - Build Retrieved Context
                                                                        │
                                                                        ▼
                                                               [RAG] - Validate Retrieval
                                                                ┌───────┴───────┐
                                                                │ Score > 0     │ No Relevant Context
                                                                ▼               ▼
                                                        [RAG] - Build    [RAG] - Handle No
                                                        Response Prompt  Knowledge Found
                                                                │               │
                                                                ▼               │
                                                        [RAG] - Generate        │
                                                        Response                │
                                                                │               │
                                                                ▼               ▼
                                                        [RAG] - Score    [GUARDRAIL] - Prepare
                                                        Response          Decision Context
                                                                │               │
                                                                └───────┬───────┘
                                                                        ▼
                                                               [GUARDRAIL] - Check Risk
                                                                ┌───────┴───────┐
                                                                │ Risk Flags    │ No Risk Flags
                                                                ▼               ▼
                                                        Prepare Risk    [GUARDRAIL] - Check
                                                        Escalation      Account Context
                                                                        ┌───────┴───────┐
                                                                        │ Req Account   │ Normal
                                                                        ▼               ▼
                                                                Check Customer  Check Retrieval
                                                                Context Loaded  Quality
                                                                        │               │
                                                                        └───────┬───────┘
                                                                                ▼
                                                                        [GUARDRAIL] - Build
                                                                        Decision Result
                                                                                │
                                                                 ┌──────────────┴──────────────┐
                                                                 │ Decision == 'escalate'      │ Decision == 'respond'
                                                                 ▼                             ▼
                                                        [ESCALATION INTAKE]           Save Assistant Turn
                                                        ──────────────────            Deliver Customer Response
                                                        Build Case Context
                                                        Build Requirements Prompt
                                                        Analyze Case Requirements
                                                        Extract Requirements
                                                        Save Case (Supabase)
                                                        Generate Customer Response
```

---

## Guardrail Decision Matrix

|Condition|Primary Signal|Outcome|Action / Response Type|
|-|-|-|-|
|**Security Threat**|`risk_flags` contains `"security"`|`ESCALATE`|Intakes account incident safely (no credentials requested)|
|**Billing Dispute**|`risk_flags` contains `"billing_dispute"`|`ESCALATE`|Requests transaction dates, amounts, and invoice references|
|**Legal / Churn**|`risk_flags` contains `"legal"` or `"churn_threat"`|`ESCALATE`|Logs high-priority handoff ticket|
|**Missing Account Info**|`requires_account_context: true` & profile data missing|`ESCALATE`|Intakes account verification details|
|**Low Retrieval Score**|Vector similarity below tenant threshold|`ESCALATE`|Honest fallback; escalates without hallucinating|
|**Standard Policy Query**|High similarity, no risk flags|`RESPOND`|Generates response grounded strictly in retrieved context|

---

## Error Handling & Observability

Every failure path writes a structured record to `request_errors` (or `ingestion_log` for ingestion failures):

```json
{
  "tenant_id": "b2b-saas-demo",
  "error_message": "Document contains no extractable text.",
  "failed_node": "Validate Extracted Text",
  "status": "failed",
  "occurred_at": "2026-08-27T14:32:10.421Z"
}
```

Failure types: invalid request, extraction failure, validation failure, database failure, workflow failure. The workflow's Error Trigger normalizes any unhandled error into the same schema — one place to check when something breaks.

---

## Multi-Tenant Isolation

* **Pinecone:** every vector is inserted/queried within `namespace = tenant_id`. Retrieval is physically scoped at the API layer.
* **Supabase:** all `conversation_turns`, `escalation_cases`, and `ingestion_log` queries filter by `tenant_id`. `customers` and `tenant_config` are keyed by `tenant_id`.
* **Context:** the classifier's allowed category list is derived from `tenant_config.industry_pack` (`saas` vs `ecommerce`), keeping industry vocabulary data-driven rather than hardcoded per vertical.


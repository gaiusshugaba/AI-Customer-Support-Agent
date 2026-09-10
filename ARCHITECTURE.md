# FlowStack System Architecture

This document describes the architectural framework, data flow pipelines, and decision matrices powering the FlowStack AI Customer Support Platform.

\---

## The Three Core Models

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           1. IDENTITY MODEL                             │
│                                                                         │
│  TENANT (Isolation Boundary)                                            │
│  └── CUSTOMER (Persistent Entity: email, plan\_tier, custom\_fields)      │
│      └── CONVERSATION (Unique Session: conversation\_id)                 │
│          └── ESCALATION CASE (Created only when escalation is required) │
│                                                                         │
│  Rule: customer\_id ≠ conversation\_id ≠ case\_id                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                            2. MEMORY MODEL                              │
│                                                                         │
│  CUSTOMER MEMORY        CONVERSATION MEMORY       CASE STATE            │
│  (Supabase: customers)  (conversation\_turns)      (escalation\_cases)    │
│  • Account Plan Tier    • Chronological Turns     • Missing Info List   │
│  • Account Status       • Intent \& AI Scores      • Case Ready Flag     │
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
│  Deterministic Guardrails ──► \[Score >= Thresh] ──► Respond Directly    │
│                              │                                          │
│                              ▼ \[Risk Flag / Low Score]                  │
│                        Escalate \& Intake Case                           │
└─────────────────────────────────────────────────────────────────────────┘
```

\---

## Ingestion Pipeline Architecture

```
Switch  (string-equality on file extension: 'pdf' / 'docx' / 'md')

&#x20;   ┌────┬────┬─────┐

&#x20;   │    │    │     │

&#x20;  PDF  DOCX  MD   (default)

&#x20;   │    │    │     │

&#x20;   ▼    ▼    ▼     ▼

&#x20; Extract text via format-specific extractor

&#x20;   │    │    │     │

&#x20;   └────┴────┴─────┘

&#x20;        ▼

\[INGEST] - Normalize Document  (parses - Key: Value metadata headers, normalizes extracted\_text, resolves file\_type, generates clean doc\_id)

&#x20;        │

&#x20;        ▼

\[INGEST] - Check Previous Ingestion  (Supabase: ingestion\_log, status=success)

&#x20;        │

&#x20;   ┌────┴────────────────────────────┐

&#x20;   │ Exists                          │ New Document

&#x20;   ▼                                 ▼

Delete Existing Vectors           (skip deletion)

&#x20;   │

&#x20;   ▼

Restore Document Context

&#x20;   │

&#x20;   └────────┬────────────────────────┘

&#x20;            ▼

\[INGEST] - Validate Extracted Text  (non-empty gate)

&#x20;            │

&#x20;            ▼

\[INGEST] - Chunk Document

&#x20;  ├─ Markdown strategy: split on #/##/###

&#x20;  ├─ Heuristic strategy: detect headings via short-line / question-word rules

&#x20;  ├─ Skip sections < MIN\_CHARS (100)

&#x20;  ├─ Skip 'Document metadata' section

&#x20;  └─ Emit chunk with `text` = "title — heading\\n\\nbody"

&#x20;            │

&#x20;            ▼

\[INGEST] - Validate Chunks          (count > 0 gate)

&#x20;            │

&#x20;            ▼

\[INGEST] - Index Knowledge          (OpenAI text-embedding-3-large, 3072-dim → Pinecone namespace = tenant\_id)---

## Live Chat Pipeline

```
\[CHAT] - Receive Message (POST /webhook/conversation-message)
       │
       ▼
\[CHAT] - Unwrap Request              (extract $json.body)
       │
       ▼
\[CHAT] - Validate Message            (tenant\_id, customer\_id, conversation\_id, non-empty text)
       │
       ├────────────────────── Invalid ──► Log + Respond Validation Error
       ▼
\[CHAT] - Load Tenant Config ──► Load Customer Context ──► Load Conversation History  (serial chain)
       │
       ▼
\[CHAT] - Build Conversation Context  (merge: message + tenant\_config + customer\_context + history)
       │
       ├──────────────────────────────────────────────┐
       ▼                                              ▼
Write User Turn (Supabase)                \[ESCALATION] - Check Active Case
                                                     │
                                                     ▼
                                            \[ESCALATION] - Evaluate Active Case
                                                     │
                                                     ▼
                                            \[ESCALATION] - Route Active Case Follow-Up
                                            ┌────────────┴────────────┐
                                            │ Active Case Exists      │ No Active Case /
                                            │ \& Message Relevant      │ Standard Query
                                            ▼                         ▼
                                  \[CASE FOLLOW-UP PATH]      \[RAG] - Build Intent Prompt
                                                                        │
                                                                        ▼
                                                               \[RAG] - Classify Intent (Structured Output)
                                                                        │
                                                                        ▼
                                                               \[RAG] - Extract Intent Signals
                                                                        │
                                                                        ▼
                                                               \[RAG] - Retrieve Knowledge (Pinecone, tenant namespace)
                                                                        │
                                                                        ▼
                                                               \[RAG] - Build Retrieved Context
                                                                        │
                                                                        ▼
                                                               \[RAG] - Validate Retrieval
                                                                ┌───────┴───────┐
                                                                │ Score > 0     │ No Relevant Context
                                                                ▼               ▼
                                                        \[RAG] - Build    \[RAG] - Handle No
                                                        Response Prompt  Knowledge Found
                                                                │               │
                                                                ▼               │
                                                        \[RAG] - Generate        │
                                                        Response                │
                                                                │               │
                                                                ▼               ▼
                                                        \[RAG] - Score    \[GUARDRAIL] - Prepare
                                                        Response          Decision Context
                                                                │               │
                                                                └───────┬───────┘
                                                                        ▼
                                                               \[GUARDRAIL] - Check Risk
                                                                ┌───────┴───────┐
                                                                │ Risk Flags    │ No Risk Flags
                                                                ▼               ▼
                                                        Prepare Risk    \[GUARDRAIL] - Check
                                                        Escalation      Account Context
                                                                        ┌───────┴───────┐
                                                                        │ Req Account   │ Normal
                                                                        ▼               ▼
                                                                Check Customer  Check Retrieval
                                                                Context Loaded  Quality
                                                                        │               │
                                                                        └───────┬───────┘
                                                                                ▼
                                                                        \[GUARDRAIL] - Build
                                                                        Decision Result
                                                                                │
                                                                 ┌──────────────┴──────────────┐
                                                                 │ Decision == 'escalate'      │ Decision == 'respond'
                                                                 ▼                             ▼
                                                        \[ESCALATION INTAKE]           Save Assistant Turn
                                                        ──────────────────            Deliver Customer Response
                                                        Build Case Context
                                                        Build Requirements Prompt
                                                        Analyze Case Requirements
                                                        Extract Requirements
                                                        Save Case (Supabase)
                                                        Generate Customer Response
```

\---

## Guardrail Decision Matrix

|Condition|Primary Signal|Outcome|Action / Response Type|
|-|-|-|-|
|**Security Threat**|`risk\_flags` contains `"security"`|`ESCALATE`|Intakes account incident safely (no credentials requested)|
|**Billing Dispute**|`risk\_flags` contains `"billing\_dispute"`|`ESCALATE`|Requests transaction dates, amounts, and invoice references|
|**Legal / Churn**|`risk\_flags` contains `"legal"` or `"churn\_threat"`|`ESCALATE`|Logs high-priority handoff ticket|
|**Missing Account Info**|`requires\_account\_context: true` \& profile data missing|`ESCALATE`|Intakes account verification details|
|**Low Retrieval Score**|Vector similarity below tenant threshold|`ESCALATE`|Honest fallback; escalates without hallucinating|
|**Standard Policy Query**|High similarity, no risk flags|`RESPOND`|Generates response grounded strictly in retrieved context|

\---

## Error Handling \& Observability

Every failure path writes a structured record to `request\_errors` (or `ingestion\_log` for ingestion failures):

```json
{
  "tenant\_id": "b2b-saas-demo",
  "error\_message": "Document contains no extractable text.",
  "failed\_node": "Validate Extracted Text",
  "status": "failed",
  "occurred\_at": "2026-08-27T14:32:10.421Z"
}
```

Failure types: invalid request, extraction failure, validation failure, database failure, workflow failure. The workflow's Error Trigger normalizes any unhandled error into the same schema — one place to check when something breaks.

\---

## Multi-Tenant Isolation

* **Pinecone:** every vector is inserted/queried within `namespace = tenant\_id`. Retrieval is physically scoped at the API layer.
* **Supabase:** all `conversation\_turns`, `escalation\_cases`, and `ingestion\_log` queries filter by `tenant\_id`. `customers` and `tenant\_config` are keyed by `tenant\_id`.
* **Context:** the classifier's allowed category list is derived from `tenant\_config.industry\_pack` (`saas` vs `ecommerce`), keeping industry vocabulary data-driven rather than hardcoded per vertical.


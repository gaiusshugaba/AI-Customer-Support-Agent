# AI Customer Support Platform

An AI customer support agent built end-to-end in n8n: it answers customer questions grounded in real documentation, knows when it doesn't know something, and escalates to a human with full context instead of guessing. Built as a portfolio project to demonstrate real AI automation engineering — discovery, architecture, a working build, and the actual debugging that happened along the way, documented honestly rather than presented as a clean first draft.

## Project Status

🟢 Phase 0 — Discovery & Architecture — Complete
🟢 Phase 1 — Knowledge Ingestion — Complete
🟢 Phase 2 — Core RAG Response — Complete
🟢 Phase 3 — Escalation & Human Handoff — Complete
🟡 Phase 4 — Human Agent Operations — Not started

See `CHANGELOG.md` for the full history of what changed and why, including the real bugs hit and fixed at each stage.

## The problem this solves

Most AI support tools force a choice between cheap, fast-deploy chatbots that can't be trusted with anything nuanced, and enterprise platforms that need a six-figure implementation. This project is built for the gap between them: genuinely configurable across industries via configuration (not per-vertical code), grounded in the company's actual documentation, and honest about its own confidence.

## Architecture

```
Customer Message
       │
       ▼
Input Validation
       │
       ▼
Context Loading (tenant config, customer profile, conversation history)
       │
       ▼
Intent + Risk Classification (structured output, not free text)
       │
       ▼
Tenant-scoped Retrieval (Pinecone, namespaced per tenant)
       │
       ▼
Retrieval Validation ──── nothing relevant found ──→ Honest fallback, no guess
       │
       ▼
Grounded Generation (strictly from retrieved content)
       │
       ▼
Confidence Scoring (computed, not self-reported by the model)
       │
       ▼
Deterministic Guardrail ──── low confidence / risk flag ──→ Escalation
       │                                                          │
       ▼                                                          ▼
  Respond to customer                                    Case intake & tracking
                                                                   │
                                                          Missing-info collection
                                                                   │
                                                          AWAITING_CUSTOMER_INFO
                                                                   │
                                                              (multi-turn)
                                                                   │
                                                          READY_FOR_AGENT → Human handoff
```

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Orchestration | n8n | Real orchestration complexity (routing between AI calls and business systems), visual enough to reason about, self-hosted |
| LLM | Google Gemini | Free tier, deliberately, to prove the architecture before any spend |
| Vector store | Pinecone | Tenant-namespaced retrieval, one index shared across all tenants |
| Database | Supabase (Postgres) | Genuine Postgres, no migration debt later — see "Key Engineering Decisions" |

## Key engineering decisions

**No AI Agent node in Phase 2.** The response pipeline is a fixed sequence — Classify → Retrieve → Generate → Score — not an autonomous reasoning loop. Predictable failure modes matter more here than flexibility: when something breaks, there's exactly one place to look for each step, not an agent's internal tool-selection reasoning to untangle.

**Escalation is deterministic, not AI-decided.** Confidence score, retrieval score, and risk flags are all produced by the AI, but a plain logic gate — not the model — decides whether to escalate. The model doesn't get to grade its own homework and act on the grade.

**Escalation state is maintained separately from response generation.** The AI generates conversation turns; the system independently tracks what was requested, what's been provided, what's missing, and whether a case is ready for a human. This is what makes multi-message case intake possible without losing track of state.

**Confidence is computed, not self-reported.** Asking a model "how confident are you" is circular. Confidence here is derived from retrieval quality, whether risk flags fired, and whether the generated text itself contains refusal language — independent signals, not the model grading itself.

**Conversation memory lives outside the workflow.** n8n webhook executions are stateless between calls, so conversation history is persisted in Supabase and reloaded fresh on every turn, not assumed to persist in-memory.

**Supabase from the start, not Airtable-then-migrate.** Originally planned Airtable-first for MVP speed, reversed mid-build after recognizing every new table built on Airtable was migration debt being deliberately created. Cheaper to absorb that cost once than repeatedly.

**Why 3072-dimensional embeddings, specifically.** Not a design choice — a real Pinecone dimension-mismatch error revealed `gemini-embedding-001` actually outputs 3072 dimensions, contradicting the node's own on-screen advisory text (which described a different model in the same dropdown). The index was provisioned to match reality once it was confirmed, not assumed from documentation.


## Ingestion API Contract

The knowledge-ingestion webhook accepts **two input formats**:

### Primary: Multipart File Upload (Lovable Frontend)
```
POST /webhook/kb-ingest
Content-Type: multipart/form-data

Form fields:
  tenant_id   (text)  — required
  doc_id      (text)  — optional (extracted from file content if present)
  file        (file)  — required: .md, .txt, .csv, or .pdf
```

The workflow derives metadata automatically:
- `doc_id` / `tenant_id` / `category` / `version` / `last_updated` — parsed from document headers (`Document ID`, `Tenant`, `Category`, etc.)
- `title` — parsed from first line of text, or derived from filename
- `file_type` — from binary metadata, filename extension, or MIME type

### Legacy: JSON Body with file_content
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

## Failure handling

This is the part most portfolio projects skip. A few examples of what actually happens when things go wrong, not just the happy path:

```
Invalid request            → validation failure → structured error log
No extractable text        → validation failure → structured error log
Zero chunks produced       → validation failure → structured error log
Nothing relevant retrieved → honest fallback, no generation attempted
Risk flag detected         → escalation, not a generated answer
Missing case information   → AWAITING_CUSTOMER_INFO, asks only for what's missing
Enough information         → READY_FOR_AGENT, human handoff with full context
```

Every failure path logs a structured record — which node, what happened, why — to the same log schema whether it came from an explicit validation check or an unhandled error caught by the workflow's error trigger. No silent failures anywhere in the pipeline.

## What's genuinely still rough

- Prompt content lives directly in Code nodes rather than a queryable `Prompt_Library` table — fine for one tenant, a real limitation if per-tenant prompt overrides become necessary.
- The retrieval-validation step (Phase 2) and the guardrail routing step (Phase 3) have some conceptual overlap that hasn't been fully untangled yet.
- Response quality under real testing surfaced a genuine LLM behavior issue — a structured-output example too similar to a real test case caused the model to anchor on the example instead of the actual input. Fixed once, worth re-auditing other prompts for the same risk.
- Phase 4 (what happens after a human picks up an escalated case) hasn't been designed yet.

## Roadmap

Phase 4 — human agent operations (queue, assignment, resolution tracking) is next.

---

*Built and documented as a portfolio project. `CHANGELOG.md` has the full build history; `docs/` has the deeper design documents (discovery, architecture, data model) this was built from.*

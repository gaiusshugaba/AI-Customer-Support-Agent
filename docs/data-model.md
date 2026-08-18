# Data Model & Database Design

## AI Customer Support Platform

**References (locked):** `product-roadmap-v2.md`, `phase0-discovery.md`, `PRD.md`, `system-architecture.md`

**Design note:** **[REVISED]** Supabase (Postgres) is the operational database from the start, not an eventual migration target — originally planned Airtable-first, reversed after hitting the same "build on X, redo on Y" pattern with Phase 6 file storage (see PRD §7, System Architecture doc). One exception: `Ingestion_Log` (§6 below is `Interaction_Log`, the live-pipeline analytics table — `Ingestion_Log` is Phase 1's separate table, documented in the Phase 1 build docs) was already built and tested against Airtable before this reversal, and still needs migrating. Every table below was already designed Postgres-compatible regardless of which database was "current" at the time (explicit types, no Airtable-only field tricks in primary/foreign key fields) — that discipline is why this reversal costs a reframe, not a redesign.

---

## 0. Tenant / Industry-Pack Config Table — *the schema everything else depends on*

This table is what makes "Configuration Over Customization" real rather than aspirational. Every workflow reads from this table by `tenant_id` before doing anything tenant-specific. No workflow may hardcode a prompt, threshold, or policy that appears here.

### `Tenant_Config`

| Field | Type | Notes |
|---|---|---|
| `tenant_id` | string (PK) | e.g. `b2b-saas-demo`. Also the Pinecone namespace. |
| `tenant_name` | string | Display name |
| `industry_pack` | string (FK → `Industry_Pack`) | e.g. `saas`, `ecommerce` |
| `confidence_threshold` | float (0–1) | Below this → escalate (FR3.2) |
| `similarity_threshold` | float (0–1) | Minimum retrieval score to attempt a grounded answer at all |
| `escalation_policy_id` | string (FK → `Escalation_Policy`) | Which policy set applies |
| `system_prompt_id` | string (FK → `Prompt_Library`) | Base generation prompt |
| `classification_prompt_id` | string (FK → `Prompt_Library`) | Intent classification prompt |
| `quality_gate_prompt_id` | string (FK → `Prompt_Library`) | Validation prompt |
| `active_channels` | multi-select | `chat`, `email`, `slack`, etc. |
| `slack_escalation_webhook` | string | Per-tenant Slack destination |
| `created_at` / `updated_at` | datetime | Standard audit fields |

### `Industry_Pack`

| Field | Type | Notes |
|---|---|---|
| `industry_pack_id` | string (PK) | `saas`, `ecommerce`, `healthcare`, ... |
| `default_categories` | multi-select | e.g. SaaS: `billing`, `technical`, `account`; e-commerce: `orders`, `returns`, `shipping`, `payments` |
| `default_confidence_threshold` | float | Starting point when a new tenant is onboarded to this pack |
| `sample_kb_path` | string | Pointer to the seed knowledge base for demo/onboarding |

### `Prompt_Library`

| Field | Type | Notes |
|---|---|---|
| `prompt_id` | string (PK) | |
| `tenant_id` | string (FK, nullable) | Null = shared default; set = tenant-specific override |
| `prompt_type` | enum | `classification`, `generation`, `quality_gate` |
| `prompt_text` | long text | The actual prompt template |
| `version` | integer | Supports Phase 8 prompt A/B testing |
| `active` | boolean | |

### `Escalation_Policy`

| Field | Type | Notes |
|---|---|---|
| `escalation_policy_id` | string (PK) | |
| `tenant_id` | string (FK) | |
| `risk_categories` | multi-select | e.g. `security`, `billing_dispute`, `legal` — always escalate regardless of confidence |
| `always_escalate_keywords` | long text | Optional keyword override list |
| `slack_channel` | string | |
| `sla_minutes` | integer | Used for `Tickets.sla_due_at` calculation |

**Why this shape:** a new industry pack (Phase 9) is a new `Industry_Pack` row + a new `Tenant_Config` row + new `Prompt_Library`/`Escalation_Policy` rows + a seeded knowledge base. Zero new workflow logic — directly satisfies FR9.1.

---

## 1. Customer Records

### `Customers`

| Field | Type | Notes |
|---|---|---|
| `customer_id` | string (PK) | |
| `tenant_id` | string (FK) | Every query in every workflow filters by this — no table-wide reads (Security by Design) |
| `email` | string | PII — excluded from analytics exports by default |
| `name` | string | PII |
| `plan_tier` | string | e.g. `Starter`, `Growth`, `Enterprise` (SaaS pack) or loyalty tier (e-commerce pack) |
| `account_status` | enum | `active`, `trial`, `past_due`, `cancelled` |
| `created_at` | datetime | |
| `custom_fields` | JSON | Industry-pack-specific fields (e.g. e-commerce: `last_order_id`; SaaS: `api_key_count`) without schema changes per vertical |

---

## 2. Conversation Memory

### `Conversations`

| Field | Type | Notes |
|---|---|---|
| `conversation_id` | string (PK) | |
| `tenant_id` | string (FK) | |
| `customer_id` | string (FK) | |
| `channel` | enum | `chat`, `email`, `slack` |
| `status` | enum | `open`, `resolved_ai`, `escalated`, `closed` |
| `started_at` / `last_activity_at` | datetime | |

### `Conversation_Turns`

| Field | Type | Notes |
|---|---|---|
| `turn_id` | string (PK) | |
| `conversation_id` | string (FK) | |
| `role` | enum | `customer`, `ai`, `agent` |
| `text` | long text | |
| `intent` | string | Set on customer turns after classification |
| `confidence_score` | float | Set on AI turns |
| `retrieval_score` | float | Set on AI turns |
| `quality_gate_passed` | boolean | Set on AI turns |
| `timestamp` | datetime | |

External store per Architecture Principle 2 — read at the start of each workflow execution, appended at the end. This is what FR2.3 requires and what the roadmap v2 pushback on in-workflow state was specifically about.

---

## 3. Ticket Lifecycle

### `Tickets`

| Field | Type | Notes |
|---|---|---|
| `ticket_id` | string (PK) | |
| `tenant_id` | string (FK) | |
| `customer_id` | string (FK) | |
| `conversation_id` | string (FK) | Links back to full AI conversation context (FR3.4) |
| `status` | enum | See lifecycle below |
| `priority` | enum | `low`, `normal`, `high`, `urgent` |
| `escalation_reason` | string | e.g. `low_confidence`, `risk_flag:billing_dispute`, `customer_requested_human` |
| `assigned_agent_id` | string (FK, nullable) | |
| `sla_due_at` | datetime | From `Escalation_Policy.sla_minutes` |
| `created_at` / `resolved_at` | datetime | |
| `agent_notes` | long text | |

**Ticket lifecycle (state machine):**

```
   open ──────────────► in_progress ──────────────► resolved
     │                       │                          │
     │                       ▼                          ▼
     │                  waiting_on_customer          closed
     │                       │                          ▲
     └───────────────────────┴──────────────────────────┘
                    (reopened if customer replies after resolved)
```

- `open`: created by escalation, unassigned.
- `in_progress`: agent (Diego) has claimed it.
- `waiting_on_customer`: agent responded, awaiting reply.
- `resolved`: agent marked done.
- `closed`: resolved + no reply within a defined window, or manually closed.
- Any customer reply to a `resolved` ticket within its reopen window moves it back to `open`.

---

## 4. Pinecone Metadata Schema *(carried from Phase 1 chunking strategy, unchanged, referenced here for completeness)*

```json
{
  "chunk_id": "kb-b2b-002-c3",
  "doc_id": "kb-b2b-002",
  "tenant_id": "b2b-saas-demo",
  "industry_pack": "saas",
  "title": "API Authentication",
  "section_heading": "Rate Limits",
  "category": "technical",
  "version": "1.2",
  "last_updated": "2026-07-15",
  "chunk_index": 3,
  "text": "..."
}
```

- Index: one platform-wide index.
- Namespace: `tenant_id` (matches `Tenant_Config.tenant_id`).
- `category` values are constrained by `Industry_Pack.default_categories` for consistency between retrieval filters and classification output.

---

## 5. Document Formats

| Format | Ingestion Path | Notes |
|---|---|---|
| Markdown (`.md`) | Direct text extraction | Preferred format — front-matter maps directly to chunk metadata fields |
| PDF | Extract-from-file node → text | Loses native heading structure; chunking strategy falls back to sentence-boundary sub-splitting more often on this path (flagged as a risk in Phase 0 risk analysis) |
| Website (future) | HTML → Markdown conversion, then Markdown path | Not in MVP scope; architecture doesn't block adding it later |

Required front-matter / metadata fields on every source document regardless of format: `doc_id`, `title`, `tenant_id`, `industry_pack`, `category`, `version`, `last_updated`. **[NEW]** For Markdown, these live in the file's own front-matter (human-readable, kept for anyone browsing the repo directly) but the automated pipeline trusts the `Documents` table (§5a) or manifest as the source of truth — regex-parsing YAML in an n8n Code node is fragile in a way that reading a plain table row isn't. PDFs can't carry front-matter at all, so they depend on §5a entirely.

### 5a. `Documents` — Phase 6 upload registry *(new: what currently exists, distinct from `Ingestion_Log`)*

This table answers "what documents exist right now and where's the file" — different from `Ingestion_Log`, which is an append-only history of ingestion *runs*. A document has one row here; it may have many rows in `Ingestion_Log` if it's been re-ingested after edits.

| Field | Type | Notes |
|---|---|---|
| `doc_id` | string (PK) | |
| `tenant_id` | string (FK) | |
| `title` | string | |
| `category` | string | Constrained to `Industry_Pack.default_categories` for the tenant |
| `version` | string | |
| `last_updated` | datetime | |
| `file_type` | enum | `md`, `pdf` |
| `storage_url` | string | Supabase Storage URL for the uploaded file |
| `uploaded_by` | string | Admin user who uploaded it (Phase 6) |
| `uploaded_at` | datetime | |

Populated by the Phase 6 upload flow (n8n Form Trigger → Supabase Storage → this table → calls `kb-ingest`) — see System Architecture §2/§3.

---

## 6. Analytics / Interaction Log

### `Interaction_Log`

| Field | Type | Notes |
|---|---|---|
| `log_id` | string (PK) | |
| `tenant_id` | string (FK) | |
| `conversation_id` / `turn_id` | string (FK) | |
| `event_type` | enum | `ingestion`, `classification`, `retrieval`, `generation`, `quality_gate`, `escalation`, `dispatch` |
| `status` | enum | `success`, `failed` |
| `score` | float (nullable) | Confidence or retrieval score, depending on `event_type` |
| `detail` | JSON | Event-specific payload (e.g. rejected quality-gate reason, error message) |
| `timestamp` | datetime | |

No PII fields — this table is designed for safe export to whatever Phase 7 dashboard tool is chosen, without needing a separate anonymization pass.

---

## 7. Entity Relationship Summary

```
Industry_Pack ──< Tenant_Config >── Prompt_Library
                         │
                         ├──< Escalation_Policy
                         │
Tenant_Config ──< Customers ──< Conversations ──< Conversation_Turns
                         │              │
                         │              └──< Tickets
                         │
                         ├──< Interaction_Log  (also referenced by every other table's events)
                         │
                         └──< Documents  (Phase 6 upload registry; feeds Pinecone via kb-ingest)

Pinecone (external) ── namespace = Tenant_Config.tenant_id, category ⊂ Industry_Pack.default_categories
```

---

## 8. Migration Note — the one table not yet moved

`Ingestion_Log` was built and tested against Airtable during Phase 1, before the decision to go Supabase-first from the beginning. Every other table in this document was designed Supabase-first already. Migrating it means: create the equivalent Postgres table in Supabase (same field types as the Airtable version — no redesign needed, since it was already kept Postgres-compatible), then swap the handful of n8n Airtable nodes in the Phase 1 ingestion workflow for Postgres nodes pointing at Supabase. Small, contained, worth doing before Phase 9 multi-vertical scale — not urgent before then.

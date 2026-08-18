# System Architecture Document

## AI Customer Support Platform

**References (locked):** `product-roadmap-v2.md`, `phase0-discovery.md`, `PRD.md`

**[REVISED]** Operational database is **Supabase (Postgres)** from the start, not Airtable-first-then-migrate. See PRD §7 for the reasoning — this reverses an earlier decision after hitting the same "build on X, immediately redo on Y" pattern with Phase 6 file storage, and it's cheaper to absorb that cost once than repeatedly. One exception: `Ingestion_Log` was already built and tested against Airtable during Phase 1, before this reversal — flagged throughout this document as the one piece still needing migration, everything else is Supabase-first by design.

---

## 1. Architectural Principles (enforced, not aspirational)

1. **One workflow per capability, config-driven per tenant.** No per-industry workflow forks. If behavior needs to differ by tenant, it's a config table row, not a new node graph.
2. **Stateless execution, external state.** n8n workflow runs do not persist state between webhook calls. Anything that must survive across turns (conversation memory) or across runs (config, logs) lives in Supabase/Pinecone — never in workflow-internal variables assumed to persist.
3. **Deterministic routing over self-declared AI routing.** The LLM produces structured signals (confidence, risk, intent); a non-AI node (IF/Switch) makes the routing decision. This is a hard boundary, not a style preference.
4. **Log at the source, not after the fact.** Every workflow that makes a decision writes its own log record as part of its own execution — analytics is a read layer over existing logs, not a separate collection effort bolted on in Phase 7.
5. **Grounding is layered, not a single switch.** Prompt-level grounding instruction + retrieval-score threshold + post-generation quality gate are three independent checks, each of which can fail closed (escalate) on its own.

## 2. High-Level Service Map

```
                  AI Customer Support Platform

        ┌────────────────────────────────────────┐
        │         Communication Channels          │
        │ Chat │ Email │ Slack │ WhatsApp │ SMS │
        └────────────────────────────────────────┘
                           │
                           ▼
                     Message Normalizer         n8n sub-workflow
                     → conversation envelope    (Phase 5)
                           │
                           ▼
                  Core RAG Response Workflow    n8n workflow
                  (Phase 2 + 3 combined
                   execution path)
                           │
         ┌─────────────────┼──────────────────┐
         ▼                 ▼                   ▼
  Customer Context   Conversation        Knowledge Retrieval
  Service (Supabase)  Memory Store        (Pinecone, namespaced
                       (Supabase)          by tenant_id)
         │                 │                   │
         └─────────────────┴───────────────────┘
                           ▼
                  AI Decision Engine
                  (LLM: intent + confidence
                   + risk, structured out)
                           ▼
                  IF/Switch — Route Decision    deterministic,
                  (confidence/risk thresholds   reads config table
                   from config table)
                    ┌──────────┴──────────┐
                    ▼                     ▼
          AI Response Engine       Human Escalation
           + Quality Gate           (Ticket + Slack)
                    │                     │
                    └──────────┬──────────┘
                                ▼
                     Response Dispatcher
                                ▼
              Analytics Log (single source of truth)
              Supabase "Interaction Log" table
              — written by EVERY node above,
                not collected after the fact
```

Separately, decoupled from the live pipeline:

```
Admin uploads doc (Phase 6, via n8n Form Trigger)
        │
        ▼
File → Supabase Storage; metadata row → Supabase "Documents" table
        │
        ▼
Knowledge Ingestion & Embedding Workflow (Phase 1)
   → chunk → embed → Pinecone upsert → Ingestion Log
   [MIGRATION FLAG: Ingestion_Log currently in Airtable — the one
    table not yet moved to Supabase, see note above]
```

## 3. Component Responsibilities

| Component | Type | Responsibility | Reads | Writes |
|---|---|---|---|---|
| Message Normalizer | n8n sub-workflow | Convert chat/email/Slack payloads into one conversation envelope schema | Channel webhooks | Passes envelope downstream (no persistence) |
| Customer Context Service | n8n node group (Supabase/Postgres) | Fetch account, plan, order/ticket history by customer identifier | `Customers` table | — (read-only in this path) |
| Conversation Memory Store | Supabase/Postgres table | Persist turn-by-turn history keyed by `conversation_id` | `Conversations` table | `Conversations` table (append each turn) |
| Knowledge Retrieval | Pinecone query node | Vector search within tenant namespace, optional metadata filter by category | Pinecone index (namespace = tenant_id) | — |
| AI Decision Engine | LLM call (structured output) | Classify intent, score confidence, flag risk | Prompt (from config table) + retrieved chunks + context | Structured JSON to next node only |
| Route Decision | IF/Switch node | Deterministic routing based on config thresholds | Config table (`Tenant_Config`) | — |
| Response Quality Gate | LLM/rules validation | Confirm response cites retrieved content; reject if not | Generated response + retrieved chunks | Pass/fail flag |
| Human Escalation | n8n node group | Create ticket, notify Slack, attach full context | `Conversations`, `Customers` | `Tickets` table |
| Response Dispatcher | n8n node group | Send final response back to origin channel | — | Channel API |
| Analytics Log | Supabase/Postgres table | Single queryable record of every decision | Written by every upstream node | `Interaction_Log` table |
| Ingestion & Embedding Workflow | n8n workflow (standalone) | Chunk, embed, upsert documents; decoupled from live conversation path | Uploaded doc | Pinecone, `Ingestion_Log` table **[currently Airtable — migration flagged]** |
| Document Upload (Phase 6) | n8n Form Trigger + Supabase Storage | Give admins a no-code upload UI; store the file and its registry row | Form submission | Supabase Storage (file), `Documents` table (metadata) |

## 4. Data Flow: One Conversation Turn (illustrative)

1. Customer message arrives on any channel → Message Normalizer produces `{conversation_id, tenant_id, customer_id, channel, text, timestamp}`.
2. Core workflow fetches: customer context (Supabase), conversation history (Conversations table), tenant config (Tenant_Config table — prompts, thresholds, industry_pack).
3. AI Decision Engine runs intent classification + retrieves top-k chunks from Pinecone (namespace = tenant_id, optional category filter) + generates a draft response with confidence/retrieval scores.
4. Route Decision node compares scores against tenant's configured thresholds.
   - **Pass** → Quality Gate validates grounding → Response Dispatcher sends reply → log written.
   - **Fail** → Human Escalation creates ticket + Slack notification with full context → log written.
5. Every branch writes to `Interaction_Log` regardless of outcome — this is not optional or deferred.

## 5. Why n8n as the Orchestration Layer

n8n is chosen because the platform's real complexity is orchestration and routing between AI calls and business systems (Supabase, Pinecone, Slack), not custom infrastructure. Trade-offs accepted knowingly:
- **Statelessness between executions** is treated as a design constraint (see Principle 2), not worked around with hacks — hence the external memory store from Phase 2 onward.
- **Workflow proliferation risk** (Principle 1) is the main architectural danger of using a visual orchestrator across multiple industries; the config table is the explicit mitigation.
- **n8n's Postgres node connects to Supabase directly** (Supabase is genuine Postgres, not a proprietary variant) — no special connector or workaround needed, same as connecting to any self-hosted Postgres instance.

## 6. Security & Permissions (Security by Design principle)

- All external credentials (Google Gemini, Pinecone, Supabase, Slack) live in n8n's credential store, referenced by name in workflows — never inlined.
- Customer PII (email, name, order details) is scoped to the `Customers` and `Conversations` tables only; the `Interaction_Log` (analytics) table stores IDs and scores, not raw PII, by default.
- Config table access (thresholds, prompts, escalation policy) is admin-only in the Phase 6 UI (n8n Form Trigger, or Supabase's own table editor for direct access) — support agents can view, not edit.
- Tenant isolation is enforced at the data layer: Pinecone namespace per tenant, `tenant_id` filter required on every Supabase query in every workflow (never a table-wide read). Supabase's native Row Level Security (RLS) is a stronger enforcement option than relying on every n8n query remembering the filter — worth adopting once past MVP, flagged here rather than built now to avoid over-building ahead of actual need.

## 7. Scaling Considerations (flagged, not solved in MVP)

- Supabase's free tier pauses inactive projects after ~1 week and caps at 500MB storage — fine for build/demo, a real constraint before real load. Since it's genuine Postgres, scaling up is a plan upgrade, not a migration, which is the whole point of this decision.
- **`Ingestion_Log` migration (Airtable → Supabase)** is the one concrete piece of technical debt this reversal leaves behind — small in scope (a handful of n8n nodes in one already-tested workflow), but real. Worth doing before Phase 9 multi-vertical scale, not urgent before then.
- Pinecone namespace-per-tenant scales cleanly for the two-vertical MVP; a very large number of low-volume tenants may eventually warrant a different partitioning strategy — out of scope until Phase 9 proves the need.

## 8. Traceability to PRD

Every component above is built to satisfy specific FR numbers in the PRD (§5). The Data Model document defines the exact schemas each table in this diagram requires.

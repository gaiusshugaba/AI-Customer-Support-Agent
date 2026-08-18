# Product Requirements Document (PRD)

## AI Customer Support Platform

**Status:** Locked baseline for build
**Upstream references (locked):** `product-roadmap-v2.md`, `phase0-discovery.md`
**Downstream references:** System Architecture Document, Data Model & Database Design

---

## 1. Purpose

This PRD translates the discovery work (Phase 0) and the phased roadmap (v2) into buildable requirements. It exists so that every subsequent phase can be checked against explicit, testable acceptance criteria rather than the roadmap's narrative descriptions alone. The roadmap says *what phases exist and why*; this PRD says *what "done" means for each one*.

## 2. Problem Statement *(carried from Phase 0, unchanged)*

Mid-market B2B and B2C companies need a support automation platform that is genuinely configurable across industries without custom engineering per vertical, grounds every answer in their own current documentation, and knows — reliably and measurably — when to hand off to a human, without requiring an enterprise budget or a multi-month build.

## 3. Goals / Non-Goals

**Goals (this build):**
- Prove the config-driven architecture works across at least two industry verticals (B2B SaaS, B2C e-commerce) without workflow forks.
- Demonstrate production-grade RAG with measurable grounding (retrieval score, confidence score, quality-gate rejection rate).
- Demonstrate a working guardrail/escalation path, not just a chatbot.
- Build full observability (logging) from Phase 1 onward, not bolted on later.

**Non-Goals (explicitly out of scope for this build):**
- Competing head-to-head with enterprise incumbents (Decagon, Sierra) on scale, voice channel, or white-glove implementation.
- Building a general-purpose no-code workflow builder — this is n8n running our workflows, not a workflow builder product.
- Real payment processing, real customer PII at scale, or SOC2-grade compliance tooling. Security-by-design principles are followed, but full compliance certification is out of scope for a portfolio build.
- Native mobile apps. Channels are chat widget, email, and Slack notifications for MVP (per roadmap Phase 5 MVP scope).

## 4. Users & Roles *(from Phase 0 personas)*

| Role | Persona | Primary Surface |
|---|---|---|
| Support Admin | Maya | Administration Platform (Phase 6) |
| Support Agent | Diego | Escalated ticket view (Phase 4) |
| End Customer | Priya | Chat / Email (Phase 5) |
| Platform Operator (us, building this) | — | n8n workflows, Supabase console, Pinecone console, analytics logs |

## 5. Functional Requirements by Phase

Each requirement below is written so a future test can confirm pass/fail. Phase numbers match roadmap v2.

### Phase 1 — Knowledge Platform
- FR1.1 System MUST accept Markdown and PDF documents via an ingestion trigger and produce indexed chunks in Pinecone within a defined SLA (target: <2 min for a doc under 20 pages).
- FR1.2 Every chunk MUST carry `tenant_id`, `doc_id`, `industry_pack`, `version`, `last_updated` metadata.
- FR1.3 Chunking MUST be header-aware (not blind fixed-length) per the chunking strategy.
- FR1.4 Every ingestion run MUST write a log record (doc_id, tenant_id, chunk_count, timestamp, status) — no silent failures.
- FR1.5 Pinecone MUST be namespaced per `tenant_id`.

### Phase 2 — AI Core
- FR2.1 System MUST classify incoming message intent (e.g., billing, technical, account, general) before retrieval.
- FR2.2 System MUST retrieve customer context (plan, account status, history) keyed by customer identifier before generating a response.
- FR2.3 System MUST maintain conversation memory across turns within a `conversation_id`, persisted externally (not in-workflow state).
- FR2.4 RAG retrieval MUST query the tenant's Pinecone namespace, filtered by intent-derived `category` where confidence allows.
- FR2.5 Prompts MUST be loaded from the config table by `tenant_id`, not hardcoded per workflow.
- FR2.6 Every generated response MUST carry a machine-readable confidence score and a retrieval score.

### Phase 3 — Decision & Guardrails
- FR3.1 A routing decision (respond / escalate) MUST be made by a deterministic node (IF/Switch) reading the LLM's structured output — never by the LLM self-declaring "I'll escalate this."
- FR3.2 Confidence and similarity thresholds MUST be tenant-configurable, not hardcoded.
- FR3.3 A Response Quality Gate MUST reject/flag responses that do not cite retrieved content before dispatch.
- FR3.4 Escalations MUST include full conversation context and reason code when handed to a human.

### Phase 4 — Customer Support Engine
- FR4.1 Every conversation that escalates or that a customer follows up on MUST produce a ticket with a defined lifecycle state.
- FR4.2 Ticket history MUST be retrievable by customer identifier for context on future contacts.

### Phase 5 — Multi-Channel
- FR5.1 Website chat and email MUST both route through the same core pipeline via a shared normalization step — no channel-specific logic downstream of ingestion.
- FR5.2 Slack MUST receive escalation notifications with a link to full context.

### Phase 6 — Administration Platform
- FR6.1 Admin MUST be able to upload/update knowledge without engineering involvement.
- FR6.2 Admin MUST be able to view/edit thresholds and escalation policy per tenant via the config table (UI can be a simple internal tool over the Supabase table for MVP — e.g. Supabase's own table editor, or a lightweight n8n Form, rather than a custom-built admin frontend).

### Phase 7 — Analytics & Observability
- FR7.1 Every phase's logs (ingestion, classification, retrieval, generation, gate, escalation) MUST be queryable from a single source of truth, not scattered per-workflow.

### Phase 8 — Continuous Learning
- FR8.1 A scheduled workflow MUST surface documents unreviewed for >180 days.
- FR8.2 A scheduled workflow MUST surface recurring low-confidence/escalated topics as candidate knowledge gaps.

### Phase 9 — Industry Packs
- FR9.1 Adding a new industry pack MUST require only new config rows and a new knowledge base — zero new workflow logic.

## 6. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Security | API keys and credentials stored in n8n credential store, never in workflow JSON or logs. Customer PII fields flagged in the data model and excluded from analytics exports by default. |
| Reliability | Every workflow that can fail silently (ingestion, generation, escalation) must log a `status: failed` record with error detail, not just succeed/omit. |
| Observability | Every AI decision point (classification, confidence, retrieval score, gate pass/fail) is logged with enough detail to reconstruct *why* a given response was sent or escalated. |
| Configurability | No tenant- or industry-specific value may be hardcoded in a workflow node. If it varies by tenant, it lives in the config table. |
| Latency (target, not hard SLA for portfolio build) | End-to-end response (ingestion excluded) under 5 seconds for a grounded, non-escalated reply. |

## 7. Assumptions & Constraints

- Built on n8n as the orchestration layer, Pinecone as the vector store, and **Supabase (Postgres) as the operational database from the start** — **[REVISED]** originally planned as Airtable-first with a later Supabase migration, but reversed once we hit the same "build on X, immediately redo on Y" pattern with Phase 6 file storage. Building every table on Supabase from day one, including the ones already built (see migration note below), costs less overall than repeated partial migrations as more of the platform gets built. Free tier pauses inactive projects after ~1 week and caps at 500MB storage — acceptable for build/demo, revisit before real load.
- **[MIGRATION NOTE]** `Ingestion_Log` was originally built and tested against Airtable during Phase 1 (before this decision was reversed) — it needs to be swapped to a Supabase Postgres table and its n8n nodes (currently Airtable nodes) rebuilt as Postgres nodes. This is the one piece of already-working, already-tested build that this decision touches; everything else (Phase 6 `Documents` table onward) was designed Supabase-first already.
- **[LOCKED]** LLM provider is **Google Gemini**, building on the free tier first. Two separate APIs are in play: Gemini chat models (classification + generation calls) and Gemini's embedding model (`models/gemini-embedding-001`, accessed in n8n via the dedicated "Embeddings Google Gemini" LangChain sub-node, not the plain Google Gemini app node) for the ingestion pipeline — these are not the same call and both needed explicit node updates wherever OpenAI was previously assumed.
- **Known risk with this choice:** Gemini's free tier has request-per-minute and request-per-day caps that are tighter than paid tiers. This system makes at least 2 LLM calls per conversation turn (classification + generation) plus embedding calls during ingestion — multi-turn conversation testing may hit rate limits before the architecture itself is the bottleneck. Not a blocker, but worth monitoring once Phase 2 is tested end-to-end.
- Two demo verticals only for MVP: B2B SaaS (primary), B2C e-commerce (secondary). Phase 9's other industry packs are configuration exercises, not separate builds, and are out of scope until the two-vertical proof is solid.

## 8. Milestones (maps to roadmap phases)

Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7 → Phase 8 → Phase 9, built sequentially, each phase's acceptance criteria (§5) verified before moving to the next. Foundational docs (this PRD, System Architecture, Data Model) are a gate before any further workflow build.

## 9. Open Questions (to revisit, not blocking)

- ~~Final choice of LLM provider/model for production~~ **RESOLVED:** Google Gemini, free tier for initial build (see §7).
- ~~Postgres provider for eventual migration off Airtable~~ **RESOLVED, then REVISED:** Supabase was originally the eventual migration target; now it's the operational database from the start (see §7). Airtable is no longer part of the architecture going forward — the one exception is `Ingestion_Log`, already built against Airtable, flagged for migration in §7.
- ~~Whether Airtable's row-count/API limits will force the Supabase migration before Phase 9 multi-vertical scale~~ **MOOT** — there's no Airtable to migrate off of anymore, except the one flagged table.
- Voice channel is out of scope for MVP; revisit only if a future phase explicitly adds it (not currently on roadmap v2).
- Exact Gemini rate-limit ceiling on the free tier should be re-checked at Phase 2 testing time, since these change periodically — treat the caveat in §7 as directional, not a fixed number.

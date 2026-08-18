# Changelog

All notable changes to this project are documented here, phase by phase, in the order they actually happened — including the fixes, not just the features. This file is the historical record; `README.md` explains what the system does today.

---

## Phase 3 — Escalation, Case Management & Human Handoff

### Added
- Deterministic guardrail layer: confidence score, retrieval score, and risk flags evaluated against tenant-configured thresholds by explicit logic — the model produces signals, it does not decide its own escalation.
- Escalation case intake: the system determines what a human agent will need to investigate, compares it against what the customer already provided, and asks only for what's genuinely missing.
- Case state machine: `AWAITING_CUSTOMER_INFO` → `READY_FOR_AGENT`, persisted in Supabase and tracked across multiple messages in the same conversation.
- Case continuation: a follow-up message from the customer updates the existing case rather than creating a duplicate.
- Context-aware human handoff response, generated once a case is ready.
- Explicit safety rules in the intake prompt: never request passwords, CVVs, full card numbers, or other authentication credentials; ask for redacted screenshots only.

### Fixed
- Multiple Code nodes downstream of a Supabase write assumed the original business context (customer message, escalation analysis, case data) survived in `$json` — it doesn't reliably. Fixed by having each affected node reach back to the node that actually owns that data, by name, instead of trusting whatever's immediately upstream. This is the same root-cause pattern as the Phase 1 Aggregate node bug, now applied consistently across the escalation subsystem.
- A structured-output schema's JSON example was too similar to a real test case (same billing-dispute scenario, similar wording) — the model was anchoring on the example's values instead of reasoning about the actual customer message, producing a generic response that ignored specifics the customer had already provided. Fixed by making the example deliberately from an unrelated scenario, and adding an explicit instruction not to reuse example values.
- A missing-information list was at risk of being fully overwritten by the model's output on every follow-up turn, which could silently drop previously-identified missing fields if the model's response was incomplete. Fixed by merging against the case's existing missing-information list rather than trusting a full replacement.
- A response-shaping node was positioned before the Supabase write it should have followed, starving that write of required fields (only 6 narrow response fields were available, not the full item). Fixed by correcting node order and having the response node reach back by name to its real data source, rather than relying on chain position.

---

## Phase 2 — Core RAG Response

### Added
- Request validation (`tenant_id`, `conversation_id`, message text) before any processing begins; invalid requests are rejected and logged.
- Tenant configuration, customer context, and conversation history loaded and merged before classification.
- Intent classification with risk-flag detection, enforced via a Structured Output Parser (not free-text parsing).
- Retrieval scoped to the tenant's Pinecone namespace, using the classified intent to filter by category.
- Retrieval validation: if nothing relevant is found, the system does not attempt to generate an answer — it falls back to a fixed "I don't have information on that yet" response with confidence explicitly set to zero.
- Response generation strictly grounded in retrieved content, with explicit instructions against inventing prices, policies, or figures not present in the source material.
- Confidence scoring computed as an explainable heuristic — derived from retrieval quality, whether risk flags were raised, and whether the generated text itself contains refusal-type language — deliberately not self-reported by the model.
- Conversation turn persistence (customer message and AI response both logged).
- Deliberate architectural choice: no AI Agent node. The pipeline is a fixed sequence (Classify → Retrieve → Generate → Score) with routing logic kept outside any autonomous reasoning loop, for debuggability and predictability.

### Fixed
- n8n's Webhook node nests the real POST body under `.body` — every downstream field reference assumed a flat payload. Fixed with a single unwrap step immediately after the trigger, applied proactively in this phase after being discovered the hard way in Phase 1.
- Three parallel Supabase context lookups intermittently failed to execute within a single full-workflow run once "Always Output Data" was enabled, despite each working correctly when run individually — a still not fully root-caused n8n execution-engine quirk. Resolved by rewiring the three lookups from parallel to a serial chain.
- The "Always Output Data" placeholder item (used so an empty query result doesn't halt the chain) has no `role`/`text` fields, which was silently producing `"undefined: undefined"` in the conversation-history string. Fixed by filtering out placeholder items before formatting history.
- Assumed the plain Google Gemini node could run a chat completion the way the Basic LLM Chain node does — switched to Basic LLM Chain specifically because it supports a Structured Output Parser sub-node, removing the need to defensively parse potentially-malformed JSON from a plain text response.

---

## Phase 1 — Knowledge Ingestion & Embedding Pipeline

### Added
- Document ingestion supporting Markdown and PDF, triggered independently of the live conversation pipeline.
- Header-aware chunking (splits on `##`/`###`, sentence-boundary sub-split with overlap for long sections) rather than blind fixed-length splitting.
- Gemini embeddings, Pinecone vector storage, tenant-scoped namespaces.
- Duplicate-ingestion handling: before re-embedding a document, the pipeline checks Supabase for a prior successful ingestion of that `doc_id` and deletes the corresponding vectors from Pinecone (filtered by `doc_id` within the tenant's namespace) before re-ingesting — added after discovering that re-ingesting an updated document was creating duplicate vectors and doubling retrieval results.
- Two validation gates: extracted text is non-empty before chunking begins; at least one chunk was produced before anything touches Pinecone. Both failure paths log a structured error with the exact failing node and reason.
- Retry logic with backoff on the embedding and Pinecone nodes, given real-world rate-limit exposure on Gemini's free tier.
- A dedicated Error Trigger workflow that normalizes any unhandled workflow-level failure into the same log schema as a validation failure — one place to check when something breaks, not several.

### Fixed
- Assumed the Google Gemini app node had a dedicated embedding action. It doesn't — confirmed by checking the node's actual Actions list. Embeddings are only reachable through a separate LangChain-style sub-node.
- Assumed Pinecone's node accepted a raw vector array directly. The installed node is the LangChain-style Vector Store node, which pulls embeddings and document content from two connected sub-node ports instead.
- The Default Data Loader's only text-splitting options were "Simple" (which would have re-fragmented text already chunked upstream) or "Custom" — solved with a deliberately oversized custom splitter that never actually triggers, since nothing produced by the chunker is large enough to hit its threshold.
- A Pinecone dimension-mismatch error revealed the real embedding output is 3072-dimensional, not the 768 implied by the node's own on-screen advisory text, which turned out to describe a different model in the same dropdown. The Pinecone index was re-provisioned to match.
- An aggregation node was losing `doc_id`/`tenant_id`/`title` because a Vector Store node's own output doesn't reliably pass through custom fields from its input — fixed by having the aggregation step reach back to the chunking node by name instead of trusting its immediate input.
- Logging moved from Airtable to Supabase mid-build, after recognizing that continuing to build new tables on Airtable was creating migration debt that would just have to be paid down later anyway.

---

## Phase 0 — Discovery & Product Strategy

### Added
- Market and competitor research (positioning: the gap between fast-deploy/shallow AI support tools and expensive, bespoke enterprise platforms).
- Personas, customer journey maps, problem statement, and risk analysis.
- Product Requirements Document with numbered, testable functional requirements per phase.
- System Architecture Document defining five enforced principles: config-driven modularity (no per-industry workflow forks), stateless execution with external state, deterministic routing over AI self-routing, logging at the source, and layered (not single-switch) grounding.
- Data Model covering the tenant/industry-pack configuration schema, customer and conversation records, ticket lifecycle, and Pinecone metadata schema — designed Postgres-compatible from the start, which is why the later Airtable-to-Supabase reversal cost a reframe rather than a redesign.

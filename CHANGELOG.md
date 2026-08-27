# Changelog

All notable changes, bug fixes, and architectural decisions across each phase of the project. This file is the historical record — it documents the real bugs hit and fixed, not just the features.

---

## Phase 3 — Escalation, Case Management & Human Handoff

### Added
- **Case Relevance Classifier (`[ESCALATION] - Evaluate Message Against Active Case`):** Determines whether a customer's message continues an existing `awaiting_customer_info` case or represents a new support inquiry. Prevents active cases from trapping unrelated customer questions.
- **Deterministic Multi-Stage Guardrail Router:**
  1. Risk flag evaluation (`security`, `billing_dispute`, `legal`, `churn_threat`)
  2. Account-context requirement check
  3. Customer-context availability check
  4. Vector retrieval quality check against tenant thresholds
- **Escalation case intake:** the system determines what a human agent will need to investigate, compares it against what the customer already provided, and asks only for what's genuinely missing.
- **Case state machine:** `AWAITING_CUSTOMER_INFO` → `READY_FOR_AGENT`, persisted in Supabase and tracked across multiple messages in the same conversation.
- **Case continuation:** a follow-up message from the customer updates the existing case rather than creating a duplicate.
- **Dynamic Case Follow-Up Merging:** incoming evidence is merged against existing missing items rather than completely overwriting previously collected data.
- **Context-aware human handoff response**, generated once a case is ready.
- **Deterministic Ready Response Node:** generates consistent customer-facing confirmations when tickets reach `READY_FOR_AGENT`.
- **Explicit safety rules in the intake prompt:** never request passwords, CVVs, full card numbers, or other authentication credentials; ask for redacted screenshots only.

### Fixed
- **Downstream Context Starvation:** Code nodes downstream of Supabase writes lost the original business context (customer message, escalation analysis, case data). Fixed by having each affected node reach back to the node that actually owns that data, by name, instead of trusting whatever's immediately upstream.
- **Example-Value Anchoring:** A structured-output schema's JSON example was too similar to a real test case — the model anchored on the example's values, producing a generic response. Fixed by making the example deliberately from an unrelated scenario and adding an explicit instruction not to reuse example values.
- **Missing-Information Overwrite Risk:** A follow-up's missing-information list could be fully overwritten by the model's output. Fixed by merging against the case's existing list rather than trusting a full replacement.
- **Node-Order Bug:** A response-shaping node was positioned before the Supabase write it should have followed, starving that write of required fields. Fixed by correcting node order and reaching back by name to the real data source.
- **Case ID Loss on Follow-Ups:** Replaced loose variable lookups with strict fallbacks across `intake_context`, `active_escalation_case`, and parent JSON scopes.

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
- n8n's Webhook node nests the real POST body under `.body` — every downstream field reference assumed a flat payload. Fixed with a single unwrap step immediately after the trigger.
- Three parallel Supabase context lookups intermittently failed to execute within a single full-workflow run once "Always Output Data" was enabled. Resolved by rewiring the three lookups from parallel to a serial chain.
- The "Always Output Data" placeholder item has no `role`/`text` fields, silently producing `"undefined: undefined"` in the conversation-history string. Fixed by filtering out placeholder items before formatting history.
- Switched from the plain Google Gemini node to Basic LLM Chain specifically because it supports a Structured Output Parser sub-node, removing the need to defensively parse potentially-malformed JSON from plain text responses.

---

## Phase 1 — Knowledge Ingestion & Embedding Pipeline

### Added
- Document ingestion supporting Markdown and PDF, triggered independently of the live conversation pipeline.
- Header-aware chunking (splits on `##`/`###`, sentence-boundary sub-split with overlap for long sections) rather than blind fixed-length splitting.
- Gemini embeddings, Pinecone vector storage, tenant-scoped namespaces.
- Duplicate-ingestion handling: before re-embedding a document, the pipeline checks Supabase for a prior successful ingestion of that `doc_id` and deletes the corresponding vectors from Pinecone (filtered by `doc_id` within the tenant's namespace) before re-ingesting.
- Two validation gates: extracted text is non-empty before chunking begins; at least one chunk was produced before anything touches Pinecone. Both failure paths log a structured error with the exact failing node and reason.
- Retry logic with backoff on the embedding and Pinecone nodes, given real-world rate-limit exposure on Gemini's free tier.
- A dedicated Error Trigger workflow that normalizes any unhandled workflow-level failure into the same log schema as a validation failure.

### Fixed
- The Google Gemini app node has no dedicated embedding action — embeddings are only reachable through a separate LangChain-style sub-node.
- The installed Pinecone node is the LangChain-style Vector Store node, which pulls embeddings and document content from two connected sub-node ports instead of accepting a raw vector array.
- The Default Data Loader's only text-splitting options were "Simple" (which would have re-fragmented text already chunked upstream) or "Custom" — solved with a deliberately oversized custom splitter that never actually triggers.
- A Pinecone dimension-mismatch error revealed the real embedding output is 3072-dimensional, not the 768 implied by the node's on-screen advisory text. The Pinecone index was re-provisioned to match.
- An aggregation node was losing `doc_id`/`tenant_id`/`title` because a Vector Store node's output doesn't reliably pass through custom fields from its input — fixed by having the aggregation step reach back to the chunking node by name.
- Logging moved from Airtable to Supabase mid-build, after recognizing that continuing to build new tables on Airtable was creating migration debt.

### Fixed (Frontend Integration — Lovable Multipart Upload)
- `[INGEST] - Unwrap Request` was discarding the uploaded file binary, assuming a JSON payload with `file_content`. Fixed to preserve `$binary` so multipart/form-data uploads flow through correctly.
- `[INGEST] - Route File Type` had a `=={{` typo in its condition expression, causing the boolean check to resolve to a string (`"=true"`) rather than a real boolean. PDFs were silently misrouted. Fixed by switching to a string-equality comparison.
- `[INGEST] - Extract PDF Text` (n8n's built-in Extract From File node) outputs extracted text to `$json.text`, but `[INGEST] - Validate Extracted Text` checks `$json.extracted_text`. Fixed by having `[INGEST] - Normalize Document` normalize both fields into `extracted_text`.
- `[INGEST] - Normalize Document` was not parsing document metadata embedded in the text content (e.g., `Document ID`, `Tenant`, `Category`, `Version`, `Last Updated` headers inside PDFs/Markdown). It also failed to derive `file_type` when `$binary.file.fileExtension` was empty after extraction. Fixed with a hybrid resolver: text metadata > request body > filename parsing > MIME type inference.
- `[INGEST] - Respond` had the same `=={{` typo in its Response Body, causing n8n's JSON parser to fail. Fixed by correcting to `={{` and wrapping the expression in `JSON.stringify()` to guarantee valid JSON output.
- `[INGEST] - Download PDF` was fully orphaned after the routing fix rerouted PDF uploads directly to Extract PDF Text. Removed from the active path (safe to delete from the canvas).

---

## Phase 0 — Discovery & Product Strategy

### Added
- Market and competitor research (positioning: the gap between fast-deploy/shallow AI support tools and expensive, bespoke enterprise platforms).
- Personas, customer journey maps, problem statement, and risk analysis.
- Product Requirements Document with numbered, testable functional requirements per phase.
- System Architecture Document defining five enforced principles: config-driven modularity (no per-industry workflow forks), stateless execution with external state, deterministic routing over AI self-routing, logging at the source, and layered (not single-switch) grounding.
- Data Model covering the tenant/industry-pack configuration schema, customer and conversation records, ticket lifecycle, and Pinecone metadata schema — designed Postgres-compatible from the start.

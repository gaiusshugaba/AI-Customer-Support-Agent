# Phase 1 Test Log

Real issues hit while testing the Knowledge Ingestion & Embedding Pipeline against a live, self-hosted n8n instance — not theoretical edge cases, actual execution errors with root cause and fix. Kept in date order.

---

### 1. Embedding node assumption was wrong

**Symptom:** Design assumed the Google Gemini app node had an "Embedding" resource/action.
**Root cause:** Confirmed via the node's actual Actions list (screenshot) — the app node only exposes Audio, Document, File Search, Image, Media, Text, and Video actions. No Embedding action exists on it. Embeddings are only reachable through Gemini's dedicated LangChain sub-node or raw REST API.
**Fix:** Rebuilt the embedding step around the `Embeddings Google Gemini` LangChain node, connected to the Pinecone Vector Store node's Embedding sub-node port — not the plain app node, and not a manual HTTP Request workaround (an earlier intermediate fix that was itself superseded once the real Pinecone node type was confirmed).

### 2. Pinecone node was a different node type than assumed

**Symptom:** Original design assumed a flat insert/upsert Pinecone node accepting a raw vector array.
**Root cause:** Confirmed via screenshot — the installed node is `Pinecone Vector Store` (LangChain-style), with 5 actions (Get ranked documents, Add documents, Retrieve for Chain/Tool, Retrieve for AI Agent, Update documents). It doesn't take a raw vector; it pulls embeddings and document content from two connected sub-nodes (Embedding port, Document port).
**Fix:** Rebuilt around `Pinecone Vector Store` (Insert Documents operation) with `Embeddings Google Gemini` feeding the Embedding port and `Default Data Loader` (+ a `Character Text Splitter` sub-node) feeding the Document port.

### 3. Text Splitting would have silently undone the chunking strategy

**Symptom:** `Default Data Loader`'s only splitting options are "Simple" (blind 1000-char/200-overlap split) or "Custom" (connect your own splitter) — no "None."
**Root cause:** Documents were already header-aware chunked by a Code node upstream. "Simple" would re-fragment those chunks, destroying the one-heading-per-chunk design.
**Fix:** Used "Custom" with a `Character Text Splitter` deliberately oversized (4000 char chunk size, 0 overlap) relative to anything the chunker produces (~2000 char max) — it technically "splits," but nothing is ever large enough to trigger an actual split.

### 4. Embedding dimension mismatch

**Symptom:** `Vector dimension 3072 does not match the dimension of the index 768`
**Root cause:** The Embeddings Google Gemini node's on-screen advisory text ("default model is using 768-dimensional embeddings") was describing a different model in the dropdown — not `models/gemini-embedding-001`, the model actually selected. Live execution proved the real output is 3072-dimensional.
**Fix:** Recreated the Pinecone index at 3072 dimensions. Documented everywhere the wrong number had propagated (chunking strategy doc, PRD, workflow notes) so it wouldn't resurface. Lesson: trust the execution error over the UI's advisory text when they conflict.

### 5. Aggregate node output was missing doc_id/tenant_id/title

**Symptom:** `Aggregate Ingestion Result`'s output only showed `chunk_count`, `embedding_model`, `ingested_at`, `status` — the fields sourced from `first.doc_id` etc. were silently absent (not null — `undefined` values are dropped entirely when n8n serializes JSON, which is what made this non-obvious at first).
**Root cause:** The node read `$input.all()` — items arriving directly from `Pinecone - Insert Documents`. That node's "Insert Documents" output doesn't reliably pass through custom fields from the input.
**Fix:** Changed to `$('Chunk Document (header-aware)').all()` — reaching back to the node that actually created the metadata, rather than trusting whatever the intermediate vector store node happened to preserve.

### 6. Stale hardcoded model strings (found twice)

**Symptom:** `Ingestion_Log` rows showed `embedding_model` values that didn't match the real model — first `text-embedding-3-small` (the original OpenAI-era placeholder, never updated), then later `text-embedding-001` (a different wrong value introduced during manual iteration).
**Root cause:** A hardcoded string in a Code node, edited independently of the actual node configuration elsewhere in the workflow — classic drift between two places that should have one source of truth.
**Fix:** Corrected to `models/gemini-embedding-001` in both the Aggregate node's code and everywhere it was referenced in project docs.

### 7. Airtable Single Select field rejected a valid value

**Symptom:** `Invalid input for 'embedding_model' ... expects one of: [OpenAI, Cohere, PaLM, Other, ...]`
**Root cause:** The `Ingestion_Log` table's `embedding_model` column was a Single Select field with a fixed preset dropdown (likely Airtable's autodetected default), which silently rejects any value not already in the list — including the correct one.
**Fix:** Changed the field type to Single line text. Also proactively checked and fixed the `status` column for the same risk, since it would have broken the first time a real `failed` row tried to write.

### 8. Webhook body nesting

**Symptom:** `Wrong type: '[object Object]' is an object but was expecting a string` on the very first branch node (`Branch by file type`).
**Root cause:** n8n's Webhook node nests the actual POST body under `.body` — every expression in the workflow (`{{$json.file_type}}`, `{{$json.doc_id}}`, etc.) assumed a flat payload. Only surfaced on a real HTTP call via Postman; pinned/manual test data had bypassed this entirely.
**Fix:** Added one `Unwrap Webhook Body` Code node (`return [{ json: $json.body }];`) directly after the trigger, so every downstream node stays untouched.

### 9. Shared log node broke on failure paths

**Symptom:** `An expression references this node, but the node is unexecuted` — `Pinecone - Insert Documents hasn't been executed`, thrown from `Airtable - Log Ingestion Run`.
**Root cause:** `Airtable - Log Ingestion Run` is a shared sink fed by three different paths (success, empty-text failure, no-chunks failure), but its field mapping hard-referenced `Pinecone - Insert Documents` by name — a node that only executes on the success path. The moment a failure branch fired, that reference had nothing to resolve.
**Fix:** Made the node read its **immediate** `$json` input instead of hard-referencing an upstream node by name. Combined with fix #5, all three paths now produce a consistent field shape before reaching this node, so it's genuinely path-agnostic.

---

## What this log is for

Every AI-assisted build produces a first draft that looks complete and isn't. The value of this file isn't that everything above got fixed — it's the pattern across all nine: trust what the system actually returns (execution errors, real screenshots, live output) over what documentation, on-screen advisory text, or an initial design assumed. That's the same discipline the platform's own Response Quality Gate (Phase 3) exists to enforce for the AI itself — grounded in what's actually retrieved, not what sounds right.

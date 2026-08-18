# n8n Build Guide — AI Customer Support Platform

This is the reference for *how* we build in n8n, not just *what* we build. Every phase from here follows the same three-part structure: **What to do → Why → How in n8n.** Read the general practices below once — they apply to every phase and are what keeps a multi-workflow n8n build from turning into an unmaintainable mess.

---

## General n8n Practices (apply to every phase)

### 1. Environments & credentials — never hardcode
- Create n8n **Credentials** for every external service (Pinecone, Airtable, Google Gemini, Slack) once, named clearly (`Pinecone - Prod`, `Airtable - Support Platform Base`). Never paste keys into node parameters or Code nodes.
- Use n8n **Variables** (Settings → Variables, available on paid/self-hosted tiers) for things that aren't secrets but shouldn't be hardcoded per workflow: your Airtable base ID, your Pinecone index name. This is what makes the placeholder `appXXXXXXXXXXXXXX` in the JSON I gave you a *one-time* fix instead of a find-and-replace across every workflow.
- If you're on a tier without Variables, the fallback is a small "Config" Set node at the start of each workflow holding these values — still one place to edit, not scattered across nodes.

### 2. Naming conventions
- Node names describe **what happens**, not the node type: `Airtable - Get Customer Context`, not `Airtable1`. You'll thank yourself in six months.
- Workflow names are prefixed by phase: `[Phase 1] Knowledge Ingestion`, `[Phase 2] Core RAG Response`. Makes them sortable and searchable in the n8n workflow list.
- Use **tags** (n8n has native workflow tagging) — tag everything `customer-support-platform` plus a phase tag. This is what search/filter actually uses at scale, not the name string.

### 3. Sub-workflows over duplication
- Anything used by more than one workflow becomes its own workflow, called via the **Execute Workflow** node. The Message Normalizer (Phase 5) is the clearest example — chat, email, and Slack triggers all call the same sub-workflow rather than duplicating normalization logic three times.
- This is the n8n-native way to enforce the roadmap's "config-driven modularity" principle at the workflow level, not just the data level.

### 4. Document on the canvas, not just in a separate file
- Use **Sticky Note** nodes directly on the canvas at the start of each workflow and above any non-obvious logic (e.g., the header-aware chunking Code node). A new person opening the workflow should understand its purpose without leaving n8n.
- Keep the written docs (like `phase2-workflow-documentation.md`) as the deeper "why" — the sticky notes are the in-context summary.

### 5. Error handling — don't let failures go silent
- Every workflow gets an **Error Trigger** workflow attached (Workflow Settings → Error Workflow) that logs the failure to the `Interaction_Log` table with `status: failed` and notifies Slack. This is what makes FR1.4 and the "no silent failures" reliability requirement real, not aspirational.
- On individual nodes prone to external failure (HTTP requests, LLM calls), set **Retry On Fail** (2–3 retries, small backoff) before deciding a node has truly failed.

### 6. Testing before you wire it live
- Build and test with a **Manual Trigger** or by pinning sample data (right-click a node → **Pin Data**) before switching to the real Webhook/trigger. This lets you iterate on the Code nodes and prompts without needing a live external call every time.
- Once a workflow works end-to-end on pinned data, switch to the real trigger and test with one real request before considering the phase "done."

### 7. Version control
- Use n8n's **source control** feature if you're on a plan that supports it (git-backed workflow sync) — this is the professional standard and it's what makes "who changed what" answerable.
- If not available on your tier: export each workflow (⋮ → Download) after every meaningful change and commit the JSON to a git repo yourself, in the same folder structure I've been using (`phase1/n8n-workflows/`, etc.). Treat the JSON exports as the source of truth, same as code.

---

## Phase 1 — Knowledge Ingestion & Embedding Pipeline

### What to do
Build a standalone n8n workflow that takes an uploaded document (Markdown or PDF), splits it into header-aware chunks, embeds each chunk, and stores it in Pinecone under the correct tenant namespace — with every run logged.

### Why
This has to be its own workflow, decoupled from the live conversation path, because ingestion is comparatively slow (chunking + embedding many pieces) and has completely different failure modes than a live chat response. Bundling them would mean a slow document upload could block or delay live customer conversations, and a failed ingestion run would be much harder to isolate and retry. Logging from this first workflow, rather than waiting for Phase 7, is what proves the "Observable AI" principle is real from day one rather than retrofitted.

### How in n8n, step by step

1. **Create the workflow**, name it `[Phase 1] Knowledge Ingestion`, tag it `customer-support-platform`, `phase-1`.

2. **Trigger:** Add a **Webhook** node, method POST, path `kb-ingest`. Set Response Mode to "Using Respond to Webhook Node" (not immediate) since we want to respond only after the full pipeline finishes and can report chunk count back to the admin UI.

3. **Branch by file type:** Add an **IF** node checking `{{$json.file_type}} equals "pdf"`. This is the first real "why n8n, not custom code" moment — a visual branch here is instantly readable by anyone maintaining this later, versus a nested if/else buried in a script.
   - True branch: **HTTP Request** node to download the file, then n8n's built-in **Extract From File** node (operation: PDF) to get raw text.
   - False branch: a small **Code** node that just passes `file_content` through as `extracted_text` — Markdown arrives as text already, no extraction needed.

4. **Merge both branches:** Both paths feed into one **Code** node (`Normalize Document`) that produces a consistent shape regardless of source format: `{ doc_id, tenant_id, industry_pack, title, category, version, last_updated, extracted_text }`. This merge point is deliberate — everything downstream of it never needs to know or care whether the source was a PDF or Markdown file. That's the pattern to reuse anytime you have multiple input formats feeding one pipeline.

5. **Chunking:** One **Code** node implementing the header-aware chunking strategy (splits on `##`/`###`, sub-splits long sections with sentence-boundary overlap). This stays a Code node rather than several visual nodes because the logic (regex matching, overlap math) is genuinely easier to read and modify as JS than as a chain of 8 n8n nodes trying to do the same thing — know when *not* to over-decompose into "pure" no-code.

6–7. **Embedding + vector storage:** originally written here as two separate steps (a Google Gemini embedding node, then a flat Pinecone insert node) — **corrected after live testing against your actual n8n install.** The real shape: a **Pinecone Vector Store** node (Operation Mode: Insert Documents) sits in the main chain after chunking, but it doesn't take embeddings or document text directly — it pulls them from two connected sub-nodes: **Embeddings Google Gemini** (model `models/gemini-embedding-001`, confirmed 3072-dimensional output by an actual Pinecone error, not by the node's own advisory text) feeding its Embedding port, and a **Default Data Loader** (with a Character Text Splitter attached, deliberately oversized so it doesn't re-fragment our already-chunked text) feeding its Document port. Namespace (`{{$json.tenant_id}}`) lives under that node's Options, not as a top-level field. Full field-by-field detail is in `phase1-clickbyclick-walkthrough.md` — this summary exists just to keep this doc from actively misleading anyone who reads it without the click-by-click one.

8. **Aggregate for logging:** A **Code** node that collapses all the individual chunk items back into a single summary record (doc_id, chunk_count, timestamp) — you don't want one log row per chunk, you want one row per ingestion run.

9. **Log + respond:** **Airtable** node appending to `Ingestion_Log`, then **Respond to Webhook** returning `{ status, doc_id, chunks_indexed }` to whatever triggered it (the Phase 6 admin UI, eventually).

10. **Attach the Error Workflow** (Workflow Settings → Error Workflow) so a failed PDF extraction or a Pinecone timeout doesn't fail silently.

11. **Test:** Pin a sample Markdown payload (use one of the `b2b-saas` knowledge base docs), run manually node-by-node first, confirm chunk output looks right in the Chunk Document node's output pane before letting it hit real embeddings/Pinecone calls (which cost quota).

---

## Phase 2 — Core RAG Response Workflow (AI Core)

### What to do
Build one n8n workflow that takes an incoming customer message, pulls context (customer record + conversation history + tenant config), classifies intent, retrieves relevant knowledge from Pinecone, generates a grounded response, and logs everything — without making any escalation decision itself.

### Why
This is deliberately **one** workflow rather than three separate "classification workflow / retrieval workflow / response workflow" workflows, even though the roadmap lists those as three deliverables. In n8n terms, splitting them into separate workflows would mean three separate webhook endpoints, three sets of Execute Workflow calls to wire together, and three places conversation context has to be re-fetched or passed across a workflow boundary — pure overhead with no real benefit, since these three things always happen together in sequence for a single message. The roadmap's "deliverable" language describes *stages*, not *deployables* — recognizing that distinction is what keeps you from over-fragmenting a build in the name of following a doc literally.

The one hard boundary that *is* respected: this workflow does not decide escalation. That's a genuinely separate concern (Phase 3 reads this workflow's output against tenant thresholds), and keeping it out of this workflow means you can fully test response quality before any guardrail logic is layered on top.

### How in n8n, step by step

1. **Create the workflow**, name it `[Phase 2] Core RAG Response`, tag `customer-support-platform`, `phase-2`.

2. **Trigger:** **Webhook** node, POST, path `conversation-message`, Response Mode "Using Respond to Webhook Node". This receives the normalized envelope from the Phase 5 Message Normalizer sub-workflow (or, for now, from your manual test payload).

3. **Fetch context in parallel, not sequence:** From the Webhook node, connect **three separate Airtable nodes** side by side — `Get Tenant Config`, `Get Customer Context`, `Get Conversation History` — all reading from the same trigger data. n8n runs parallel branches concurrently, so this is meaningfully faster than chaining three lookups one after another, and it visually communicates "these three things are independent reads" to anyone looking at the canvas.

4. **Merge:** A **Code** node (`Merge Context`) that pulls from all three parallel branches using n8n's `$('Node Name').first().json` syntax and produces one combined item. This is the standard n8n pattern for recombining parallel branches — don't reach for a Merge node here, since you're combining *different* data per branch, not rows of the same type.

5. **Classification prompt:** An **Airtable** node fetching the tenant's `classification_prompt_id` record from `Prompt_Library`, then a **Code** node filling the template's `{{placeholders}}` with real values (allowed categories, conversation history, the message itself). Keeping prompt *storage* in Airtable and prompt *filling* in a Code node — rather than hardcoding the filled prompt as a node parameter — is what makes FR2.5 ("prompts loaded from config, never hardcoded") actually true in the running workflow, not just true on paper.

6. **Classify:** A **Google Gemini** node (resource: text, `gemini-1.5-flash`, JSON response mode) running the filled prompt, then a **Code** node parsing the structured JSON response into `intent`, `risk_flags`, `requires_account_context`.

7. **Retrieve:** A **Pinecone** node (operation: query/load), namespace `{{$json.tenant_id}}`, metadata filter on `category` = the classified intent, top-K 5. Filtering by the *classified* intent here — not doing an unfiltered search — is what keeps retrieval precise instead of just "similar to the whole knowledge base."

8. **Score retrieval:** A **Code** node pulling the top match's similarity score into `retrieval_score` and formatting the retrieved chunks into readable text for the next prompt. This score is computed here, independently, deliberately — not asked of the LLM later — so Phase 3 has two genuinely independent signals (retrieval score + the LLM's self-reported confidence) to check against each other, not one number asked twice in different words.

9. **Generation prompt:** Same pattern as step 5 — Airtable fetch of the generation prompt template, Code node to fill it with the retrieved chunks, customer context, history, and message.

10. **Generate:** A **Google Gemini** node (`gemini-1.5-pro` — chosen over flash here because grounding quality matters more than latency on this specific call), JSON response mode, producing `response_text`, `cited_chunk_ids`, `confidence_score`, `grounded`.

11. **Parse + shape final output:** A **Code** node that assembles the final response object — including `tenant_config_thresholds` passed through for Phase 3 to read, even though this workflow doesn't act on them.

12. **Log in parallel:** From the parse node, two parallel branches — **Airtable append** to `Conversation_Turns` (the AI's turn, for memory continuity) and **Airtable append** to `Interaction_Log` (the analytics event). Parallel, not sequential, for the same reason as step 3 — they're independent writes.

13. **Respond:** **Respond to Webhook**, returning the response text plus both scores and the risk flags — this is the contract Phase 3 will build against.

14. **Attach the Error Workflow**, and specifically set **Retry On Fail** on both Gemini nodes (2 retries) given the free-tier rate-limit caveat we already flagged — a transient 429 shouldn't kill the whole conversation turn.

15. **Test:** Pin the sample payload from `phase2-workflow-documentation.md` (the "rate limit on Growth plan" question), run through node-by-node, confirm the intent classifies as `technical`, retrieval pulls from the API Authentication doc, and the final response is actually grounded — before wiring this to a real channel.

---

## Going Forward

Every phase from Phase 3 onward gets this same treatment: **what** the workflow needs to accomplish, **why** it's structured that way (including any n8n-specific trade-offs like the "one workflow, not three" call above), and a **step-by-step canvas build** you can follow node-by-node rather than just importing a finished file.

Ready to build Phase 3 — Decision & Guardrails — this way whenever you are.

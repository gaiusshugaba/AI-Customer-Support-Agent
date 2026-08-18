# Phase 1 Build Walkthrough — Click-by-Click

## Knowledge Ingestion & Embedding Pipeline in n8n

This expands the Phase 1 section of `n8n-build-guide-phase1-2.md` into an exact, field-by-field walkthrough. Follow it top to bottom in a real n8n canvas. Exact menu wording can shift slightly between n8n versions — if a label doesn't match exactly, look for the closest equivalent; the structure below is accurate for current n8n Cloud and self-hosted UI.

---

## Part A — One-time setup (before this or any workflow)

### A1. Create the Pinecone credential
1. Click your **profile icon** (bottom-left) → **Settings** → **Credentials**.
2. Click **Add Credential** (top-right).
3. Search **Pinecone** in the credential type list, select it.
4. Field **API Key**: paste your Pinecone API key (from the Pinecone console → API Keys).
5. Click **Save**. Name it `Pinecone - Prod` in the **Name** field at the top of the credential modal before saving.

### A2. Create the Google Gemini credential
1. Same **Add Credential** screen → search **Google Gemini (PaLM) API** (or "Google AI"), select it.
2. Field **API Key**: paste your Gemini API key (from Google AI Studio → Get API Key). This is what runs on the free tier.
3. Save, name it `Google Gemini - Free Tier`.

### A3. Create the Airtable credential
1. **Add Credential** → search **Airtable Token API** (or "Airtable Personal Access Token"), select it.
2. Field **Access Token**: paste a Personal Access Token generated from your Airtable account (airtable.com/create/tokens) with `data.records:read`, `data.records:write`, and `schema.bases:read` scopes, and access to your base.
3. Save, name it `Airtable - Support Platform Base`.

You only do Part A once — every workflow going forward references these three credentials by name.

---

## Part B — Create and name the workflow

1. From the n8n home screen, click **+ Add workflow** (top-right).
2. Click the workflow title at the top (defaults to "My workflow") and rename it to `[Phase 1] Knowledge Ingestion`.
3. Click the **tag icon** next to the title → type `customer-support-platform` → press Enter to create/apply it → type `phase-1` → press Enter again.
4. Click the **Save** button (top-right) once, so the workflow exists before you start adding nodes.

---

## Part C — Build the nodes in order

### Node 1 — Webhook (trigger)
1. On the empty canvas, click the big **+** in the center (or click the small **+** at top-left if the canvas already has content).
2. In the node search box, type `Webhook`, click the **Webhook** node (the core n8n one, not a third-party one).
3. In the node panel that opens on the right:
   - **HTTP Method**: click the dropdown, select `POST`.
   - **Path**: type `kb-ingest`.
   - **Respond**: click the dropdown, select `Using 'Respond to Webhook' Node`.
4. Click the node's title bar and rename it (double-click the name at the top of the panel, or use the canvas node's label) to `Webhook - New/Updated Document`.
5. Close the panel (X top-right of panel, or click empty canvas).

### Node 2 — IF (branch on file type)
1. Click the small **+** on the output side of the Webhook node.
2. Search `If`, select the **If** node.
3. In the panel:
   - Under **Conditions**, click **Add Condition**.
   - **Value 1** field: click it, type (or select from the expression picker) `{{$json.file_type}}`.
   - **Operation** dropdown: select `is equal to` (String).
   - **Value 2** field: type `pdf`.
4. Rename the node to `IF - Is PDF`.

You'll now see two output dots on the IF node: top = **true**, bottom = **false**.

### Node 3 (true branch) — HTTP Request (download PDF)
1. Click the **+** coming off the **true** (top) output of `IF - Is PDF`.
2. Search `HTTP Request`, select it.
3. In the panel:
   - **Method**: `GET` (default is fine).
   - **URL** field: click it, enter expression `{{$json.file_url}}` (click the little expression/fx icon next to the field first if it isn't already in expression mode).
   - Scroll down, expand **Options** → **Response** → set **Response Format** to `File`.
4. Rename to `Download PDF`.

### Node 4 (true branch continued) — Extract From File
1. Click **+** off `Download PDF`'s output.
2. Search `Extract from File`, select it.
3. In the panel:
   - **Operation** dropdown: select `Extract from PDF` (or `PDF` depending on version).
   - **Binary Property**: leave as `data` (the default field the HTTP Request node populates).
4. Rename to `Extract Text From PDF`.

### Node 5 (false branch) — Code (pass through Markdown)
1. Click the **+** coming off the **false** (bottom) output of `IF - Is PDF`.
2. Search `Code`, select it (JavaScript, default language is fine).
3. In the code editor panel, delete the placeholder code and paste:
   ```js
   return [{ json: { ...$json, extracted_text: $json.file_content } }];
   ```
4. Rename to `Pass Through Markdown Text`.

### Node 6 — Code (merge point: Normalize Document)
This node has **two incoming connections** — from `Extract Text From PDF` and from `Pass Through Markdown Text`.
1. Click the **+** off `Extract Text From PDF`'s output, search `Code`, add it.
2. Rename it to `Normalize Document`.
3. Paste this code:
   ```js
   const item = $json;
   const metadata = {
     doc_id: item.doc_id,
     tenant_id: item.tenant_id,
     industry_pack: item.industry_pack,
     title: item.title,
     category: item.category,
     version: item.version,
     last_updated: item.last_updated || new Date().toISOString().slice(0,10)
   };
   return [{ json: { ...metadata, extracted_text: item.extracted_text || item.text } }];
   ```
4. Now connect the **second** input: drag from the small output dot on `Pass Through Markdown Text` to the **left edge (input side)** of the `Normalize Document` node. n8n will show the connection snap into place — this is what merges both branches into one node.

### Node 7 — Code (header-aware chunking)
1. Click **+** off `Normalize Document`'s output.
2. Add a `Code` node, rename to `Chunk Document (header-aware)`.
3. Paste the chunking logic (this is the same logic from the workflow JSON I gave you earlier — copy it from `knowledge-ingestion-pipeline.json`, the node named `Chunk Document (header-aware)`, into this Code node's editor). It:
   - Splits `extracted_text` on `##`/`###` headings.
   - Sub-splits any section over ~2000 characters at sentence boundaries with overlap.
   - Returns one n8n item per chunk, each carrying `chunk_id`, `doc_id`, `tenant_id`, metadata, `embed_text`, and `text`.

### Node 8 — Pinecone Vector Store (confirmed: LangChain-style node with sub-node ports)
**Why this changed again from the previous version:** your screenshots confirmed the installed Pinecone node is the LangChain-style "Pinecone Vector Store" node — 5 actions (Get ranked documents, Add documents to vector store, Retrieve for Chain/Tool, Retrieve for AI Agent as Tool, Update documents), not the flat insert/upsert node I originally assumed. This node doesn't take a raw vector field directly — it has two special **sub-node ports** at the bottom of the node (Embedding* and Document*, both required) that you connect other nodes to, separately from the normal left-to-right main chain. This replaces the HTTP Request + Extract Embedding Values approach entirely — it's simpler and more maintainable, so this is a genuine improvement, not just a fix.

1. Click **+** off the chunking node's (`Chunk Document (header-aware)`) output.
2. Search `Pinecone Vector Store`, select it.
3. In the panel:
   - **Credential**: click **Set up credential** (or select your existing one if already created) → this is the same `Pinecone - Prod` credential from Part A1.
   - **Operation Mode**: dropdown, select `Insert Documents`.
   - **Pinecone Index**: click **Choose...**, select `customer-support-kb` from the list (create it first in the Pinecone console if it isn't there yet — dimension **3072**, metric `cosine`, matching `models/gemini-embedding-001`'s actual output — confirmed by a real execution error, not by the node's advisory text; see the note on the next node below).
   - **Embedding Batch Size**: leave at `200` for now, but consider lowering it (e.g. `10`) once you're testing with real documents — Gemini's free tier rate limits mean a batch of 200 embedding calls fired at once is more likely to get throttled.
   - Click **+ Add Option** → select **Pinecone Namespace** → a new field appears → enter expression `{{$json.tenant_id}}`. This is the tenant-isolation field we needed and it was hidden under Options, not a top-level field.
4. Rename to `Pinecone - Insert Documents`.
5. **Do not connect its main output/input the normal way for the two ports below it** — those are the Embedding and Document connections, built in the next two nodes.

### Node 8a — Embeddings Google Gemini (connects to the Embedding* port)
1. On the canvas, click the small connector icon under **Embedding*** at the bottom of the Pinecone Vector Store node (not the regular + on its side — this is the special sub-node port).
2. Search `Embeddings Google Gemini`, select it.
3. In the panel:
   - **Credential**: select your existing Gemini credential from Part A2 (`Google Gemini - Free Tier`) — don't create a second credential for this node, reuse the same one so you're not managing two credentials for one API key.
   - **Model**: leave as the default `models/gemini-embedding-001`. **Correction:** the node's on-screen text about "768-dimensional embeddings" describes a different model in that dropdown, not this one — running this node for real produced a `Vector dimension 3072 does not match the dimension of the index 768` error, meaning `gemini-embedding-001` actually outputs **3072** dimensions. Provision your Pinecone index at 3072, not 768. If you want to check whether this node exposes an output-dimensionality override (Gemini's API supports truncating to 768/1536), look for it under an Options/Add Option button — but don't assume it's there without checking, since that exact assumption is what caused this error the first time.
4. This node has no further configuration — it's purely a capability provider for the Vector Store node, it doesn't sit in the main data chain.

### Node 8b — Character Text Splitter (connects to the Default Data Loader's Text Splitting port)
**Why this node exists:** the Default Data Loader (next node) only offers two Text Splitting modes — "Simple" (blindly splits every 1000 characters with 200 overlap) or "Custom" (connect your own splitter). Since we already did header-aware chunking ourselves in the Code node, letting "Simple" run again would re-fragment our carefully-built chunks. We use Custom with a splitter configured to never actually trigger a split, since none of our chunks approach its threshold.

1. Search `Character Text Splitter`, add it to the canvas (don't connect it yet).
2. In the panel:
   - **Chunk Size**: `4000` (comfortably larger than the largest chunk our Code node ever produces — the chunker caps sections at ~2000 characters before sub-splitting).
   - **Chunk Overlap**: `0`.
3. Leave this node floating for a moment — you'll connect it in the next step.

### Node 9 — Default Data Loader (connects to the Document* port)
1. Click the connector icon under **Document*** at the bottom of the Pinecone Vector Store node.
2. Search `Default Data Loader`, select it.
3. In the panel:
   - **Type of Data**: `JSON` (already the default).
   - **Mode**: `Load All Input Data` (already the default).
   - **Text Splitting**: change the dropdown from `Simple` to `Custom`. A new connector port appears on this node once you do.
   - Drag a connection from the `Character Text Splitter` node (built in Node 8b) into this new port.
   - Click **Options → + Add Option → Metadata**, then click **+ Add property** once per field, entering each as a Name/Value pair:
     - `doc_id` → `{{$json.doc_id}}`
     - `chunk_id` → `{{$json.chunk_id}}`
     - `tenant_id` → `{{$json.tenant_id}}`
     - `title` → `{{$json.title}}`
     - `section_heading` → `{{$json.section_heading}}`
     - `category` → `{{$json.category}}`
     - `industry_pack` → `{{$json.industry_pack}}`
     - `version` → `{{$json.version}}`
     - `last_updated` → `{{$json.last_updated}}`
     - `chunk_index` → `{{$json.chunk_index}}`
4. **One thing left genuinely unconfirmed:** neither screenshot showed an explicit field telling the loader which incoming field is the actual document text (versus metadata). It most likely defaults to whatever field is named `text` — which conveniently matches what our chunking Code node already calls it — but verify this by testing (next section) rather than assuming. If the output shows the wrong field as the document body, come back and we'll adjust.

**Wiring recap for this whole section:** `Chunk Document (header-aware)` → main chain → `Pinecone - Insert Documents`. Separately: `Embeddings Google Gemini` → Embedding port → `Pinecone - Insert Documents`. Separately: `Character Text Splitter` → Text Splitting port → `Default Data Loader` → Document port → `Pinecone - Insert Documents`. Three distinct connection types feeding one node — this is normal for LangChain-style n8n nodes, not a mistake if your canvas looks more tangled than the rest of the workflow.


1. Click **+** off the `Pinecone - Insert Documents` node's main output.
2. Add a `Code` node, rename to `Aggregate Ingestion Result`.
3. Paste:
   ```js
   const chunkItems = $('Chunk Document (header-aware)').all();
   const first = chunkItems[0]?.json || {};
   return [{
     json: {
       doc_id: first.doc_id,
       tenant_id: first.tenant_id,
       title: first.title,
       chunk_count: chunkItems.length,
       embedding_model: 'models/gemini-embedding-001',
       ingested_at: new Date().toISOString(),
       status: 'success'
     }
   }];
   ```
   **Corrected after live testing:** the original version read `$input.all()` — the items arriving directly from `Pinecone - Insert Documents`. In practice, that node's "Insert Documents" output doesn't reliably carry your custom fields through (doc_id/tenant_id/title came back as `undefined`, and since `undefined` values are silently dropped when n8n serializes JSON, those keys just vanished from the output entirely rather than showing up empty — which is exactly what made this bug non-obvious). The fix reaches back to `$('Chunk Document (header-aware)').all()` — pulling the item list directly from the node that actually created them, bypassing whatever the Pinecone node did or didn't preserve. This is a generally useful pattern: when a node in the middle of a chain might reshape or drop fields, reference the node you know has the data you need by name, rather than trusting whatever's immediately upstream.

### Node 11 — Airtable (log the run)
1. Click **+** off `Aggregate Ingestion Result`.
2. Search `Airtable`, select it.
3. In the panel:
   - **Credential to connect with**: select `Airtable - Support Platform Base`.
   - **Operation**: select `Append` (or `Create`).
   - **Base**: click the field, select your base from the dropdown (or paste the base ID).
   - **Table**: select `Ingestion_Log` from the dropdown (create this table in Airtable first with columns: `doc_id`, `tenant_id`, `title`, `chunk_count`, `embedding_model`, `ingested_at`, `status`). **Field type matters here, confirmed by a real error:** set `embedding_model` and `status` to **Single line text**, not Single Select. Airtable will sometimes auto-suggest Single Select with a preset dropdown (e.g. `embedding_model` defaulting to options like OpenAI/Cohere/PaLM/Other) — any value you send that isn't already in that preset list gets rejected outright, including the correct Gemini model string, and `status` would break the same way the first time a real `failed` row tries to write. These are log fields meant to record whatever string is true at the time, not a constrained category — free text avoids having to remember to update a dropdown every time the model or a new status value changes.
   - **Mapping Mode**: `Map Each Column Manually` (or "Map Automatically" if your Airtable column names exactly match the JSON keys).
   - For each field, click the value box and enter the matching expression: `{{$json.doc_id}}`, `{{$json.tenant_id}}`, `{{$json.title}}`, `{{$json.chunk_count}}`, `{{$json.embedding_model}}`, `{{$json.ingested_at}}`, `{{$json.status}}`.
4. Rename to `Airtable - Log Ingestion Run`.

### Node 12 — Respond to Webhook
1. Click **+** off the Airtable node.
2. Search `Respond to Webhook`, select it.
3. In the panel:
   - **Respond With**: select `JSON`.
   - **Response Body**: click the field, enter expression:
     ```
     {{ { status: 'ok', doc_id: $json.doc_id, chunks_indexed: $json.chunk_count } }}
     ```
4. Rename to `Respond to Webhook`.

---

## Part D — Workflow-level settings

1. Click the **⋮ (three dots)** menu at the top-right of the canvas → **Settings**.
2. **Error Workflow** dropdown: select (or first build, then select) a small separate workflow that logs failures to `Interaction_Log` with `status: failed` and posts to Slack. If you haven't built that yet, skip this for now and come back to it — don't let it block your first test run.
3. **Save** the settings.

## Part E — Set retries on failure-prone nodes

1. Click the `Download PDF` node (or any HTTP/API-calling node) → in the panel, find **Settings** tab (gear icon within the node panel) → toggle **Retry On Fail** on → set **Max Tries** to `3`.
2. Repeat for `Embeddings Google Gemini` and `Pinecone - Insert Documents` — these are the two nodes most likely to hit a transient rate limit or network blip.

## Part F — Test before going live

1. Click the `Webhook - New/Updated Document` node → note the **Test URL** shown in the panel (n8n gives you a temporary test webhook URL).
2. Instead of calling that URL yet, right-click the same node → **Pin Data**, and paste a sample payload matching one of the B2B SaaS docs, e.g.:
   ```json
   {
     "doc_id": "kb-b2b-002",
     "tenant_id": "b2b-saas-demo",
     "industry_pack": "saas",
     "title": "API Authentication",
     "category": "technical",
     "version": "1.2",
     "last_updated": "2026-07-15",
     "file_type": "md",
     "file_content": "## Rate Limits\nStarter and Growth plans: 100 requests/minute...\n\n## Key Rotation\nWe recommend rotating keys every 90 days..."
   }
   ```
3. Click **Save** on the pin, then click **Execute Workflow** (bottom of canvas) or the play button on the Webhook node.
4. Step through: click each node after execution to inspect its **Output** tab. Specifically check `Chunk Document (header-aware)`'s output — you should see multiple items, one per heading section, each with `chunk_id`, `embed_text`, etc. filled in correctly.
5. Once the chunk output looks right, unpin the data (right-click node → **Unpin Data**), click **Activate** (top-right toggle) to make the real webhook live, and send one real POST request to the production webhook URL (shown in the Webhook node panel once active) using a tool like Postman or `curl`.
6. Confirm a new row appears in your `Ingestion_Log` Airtable table and the chunks appear in your Pinecone index (Pinecone console → your index → check vector count increased).

---

## You're done with Phase 1 when:
- A test document produces the expected number of chunks, each correctly tagged with `tenant_id` and `category`.
- Pinecone shows the new vectors under the right namespace.
- `Ingestion_Log` has a new row with `status: success`.
- Feeding it a deliberately broken payload (missing `tenant_id`, for example) produces a **visible failure** somewhere (Error Workflow log or a failed execution in n8n's Executions tab) — not a silent nothing.

Next: Phase 2 (Core RAG Response Workflow) gets this same click-by-click treatment whenever you're ready.

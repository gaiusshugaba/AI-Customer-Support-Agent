# Chunking Strategy — Phase 1

## Goal

Split source documents into chunks that are small enough for precise retrieval, large enough to preserve meaning, and tagged with enough metadata that the AI Response Engine can cite them and the Quality Gate can verify grounding.

## Method: Header-aware chunking with overlap

Rather than naive fixed-length splitting, chunks are split primarily on Markdown headers (`##`, `###`), then sub-split by size if a section is still too long. This keeps each chunk topically coherent (e.g., "Rate Limits" stays its own chunk, not merged with "Key Rotation").

**Rules:**
1. Split document into sections at each `##`/`###` heading.
2. If a section is ≤ 500 tokens, it becomes one chunk.
3. If a section is > 500 tokens, split further at paragraph boundaries into ~400-token chunks with a 50-token overlap between consecutive chunks (so context isn't lost at a cut point).
4. Never split mid-sentence.
5. Every chunk inherits the document's front-matter metadata (`doc_id`, `title`, `tenant_id`, `industry_pack`, `category`, `version`, `last_updated`), plus its own `chunk_id`, `section_heading`, and `chunk_index`.

## Why header-aware over fixed-length

- Fixed-length (e.g., blind 500-char windows) frequently cuts a procedure or table in half, producing chunks that are ungrounded or misleading on their own.
- Header-aware chunking aligns with how these docs are actually written (one heading = one self-contained topic), which matches how a support question maps to "the answer lives in one section."
- Overlap on the fallback sub-split path prevents losing a sentence that spans a chunk boundary in genuinely long sections.

## Chunk metadata schema

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

`tenant_id` and `industry_pack` are what make Pinecone namespacing and config-driven retrieval possible (Phase 9) — every chunk is filterable by tenant without separate indexes per industry.

## Embedding model

- Model: `models/gemini-embedding-001` (Gemini, **3072 dims — confirmed by actual execution error, not the node's advisory text**) for MVP, per the locked PRD decision to build on Gemini's free tier — this is the exact model string used by n8n's "Embeddings Google Gemini" node, confirmed against the node's real parameter panel. **Note:** the node's on-screen advisory text mentioned "768-dimensional embeddings," which turned out to describe a different default model in that dropdown, not `gemini-embedding-001` itself — a real Pinecone insert attempt returned `Vector dimension 3072 does not match the dimension of the index 768`, which is the actual ground truth. The Pinecone index must be created with **3072** dims to match. If Gemini's API-level output-dimensionality truncation option turns out to be exposed in the n8n node (unconfirmed), 768 could still be used deliberately — but do not assume it without checking, since assuming it here is exactly what caused this error.
- Chunk text is embedded as-is; `section_heading` and `title` are prepended to the embedded text (not just stored as metadata) so the embedding itself captures topical context — this measurably improves retrieval for short chunks like FAQ answers.

## Pinecone indexing

- One Pinecone **index** for the platform; one **namespace per tenant_id** (not per industry — a tenant could theoretically span more than one pack in a multi-brand account).
- Metadata filters (`category`, `industry_pack`) are used at query time to narrow retrieval within a tenant's namespace when the Intent Classification step has high confidence about topic (e.g., filter to `category: billing` for billing questions).

## Freshness monitoring (hook for Phase 8)

Every chunk carries `last_updated`. A scheduled workflow (Phase 8) can flag any document not updated in >180 days for review, and cross-reference `doc_id`s that show up disproportionately in low-confidence/escalated conversations as knowledge gaps.

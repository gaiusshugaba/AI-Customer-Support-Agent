# Build Update Summary — Ingestion Pipeline Fixes

## Files Updated

| File | What Changed |
|------|-------------|
| `[Core] AI Customer Support Platform.json` | 3 critical node fixes applied |
| `CHANGELOG.md` | Added Phase 1 Frontend Integration fixes section |
| `README.md` | Added Ingestion API Contract documentation |
| `Phase1-Ingestion-Tests.postman_collection.json` | Added 4 multipart/form-data test requests |

---

## Fix 1: [INGEST] - Route File Type

**Problem:** `=={{` typo caused the boolean condition to resolve to a string (`"=true"`), breaking PDF vs Markdown routing.

**Before:**
```
leftValue:  =={{ ($binary.file?.fileExtension || '').toLowerCase() === 'pdf' }}
operator:   boolean / is true
rightValue: pdf
```

**After:**
```
leftValue:  ={{ ($binary.file?.fileExtension || '').toLowerCase() }}
operator:   string / equals
rightValue: pdf
```

---

## Fix 2: [INGEST] - Normalize Document

**Problems:**
1. PDF extraction outputs `$json.text`, but validation checks `$json.extracted_text`
2. Document metadata (Document ID, Tenant, Category, etc.) inside the text was ignored
3. `file_type` was empty when binary metadata was stripped after extraction

**Before:** Simple field passthrough with filename-based title fallback only.

**After:** Hybrid resolver that:
- Normalizes `extracted_text` from both `text` (PDF) and `extracted_text` (Markdown)
- Parses metadata headers from document content: `Document ID`, `Tenant`, `Category`, `Version`, `Last Updated`
- Derives `title` from first text line > request body > filename
- Resolves `file_type` from: explicit field > binary metadata > filename extension > MIME type inference
- Derives `doc_id` and `tenant_id` from text content > request body > filename

---

## Fix 3: [INGEST] - Respond

**Problem:** `=={{` typo plus unquoted object keys caused n8n JSON validation to fail.

**Before:**
```
=={{
  {
    status: 'ok',
    doc_id: ...,
    chunks_indexed: ...
  }
}}
```

**After:**
```
={{ JSON.stringify({ status: "ok", doc_id: ..., chunks_indexed: ... }) }}
```

---

## Test Sequence (run in order)

1. **Ingest - Markdown via Multipart** — confirms binary preservation + routing
2. **Ingest - PDF via Multipart** — confirms PDF extraction + metadata parsing + file_type resolution
3. **Ingest - Re-ingestion Test** — confirms duplicate handling (old vectors deleted)
4. **Ingest - Deliberate Failure (empty .txt)** — confirms validation gate still works

Then run the legacy JSON tests if you need backward compatibility verification.

---

## Architecture After Fixes

```
Lovable Frontend
       │
       ▼
multipart/form-data POST
       │
       ▼
[INGEST] - Receive Document
       │
       ▼
[INGEST] - Unwrap Request  (preserves binary)
       │
       ▼
[INGEST] - Route File Type  (fixed: string comparison)
    ┌────┴────┐
    │         │
   PDF        MD/TXT
    │         │
    ▼         ▼
Extract    Extract
    │         │
    └────┬────┘
         ▼
[INGEST] - Normalize Document  (NEW: parses text metadata, normalizes fields)
         │
         ▼
[INGEST] - Check Previous Ingestion
         │
         ▼
   ... rest of pipeline ...
```

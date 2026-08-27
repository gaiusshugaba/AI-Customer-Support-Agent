# Roadmap

## Project Status

| Phase | Scope | Status |
|---|---|---|
| Phase 0 | Discovery & Architecture | ✅ Complete |
| Phase 1 | Knowledge Ingestion & Vector Indexing | ✅ Complete |
| Phase 2 | Core Grounded RAG Response | ✅ Complete |
| Phase 3 | Escalation & Human Handoff | ✅ Complete |
| Phase 4 | Human Agent Operations | 🟡 Not started |
| Phase 5 | Advanced Analytics & Optimization | 🔵 Planned |

---

## Phase 4 — Human Agent Operations

The system currently hands off to a human agent with full context (case ID, customer, conversation, collected evidence, recommended next action). Phase 4 is the operational layer that comes *after* a human receives the case.

**Planned capabilities:**
- Agent queue with priority sorting (risk flags, escalation type, wait time)
- Case assignment (manual + round-robin auto-assign)
- Internal agent notes and case timeline
- Resolution workflow (`in_progress` → `resolved`) with customer notification
- SLA tracking (time-to-first-response, time-to-resolution)
- Re-open ticket support (customer reply after resolution)

**Backend implications:**
- `escalation_cases.status` already supports `in_progress` and `resolved` in the schema — the workflow needs the state transitions.
- New `agent_actions` table for audit trail (assignment, notes, status changes).
- New `POST /webhook/case-response` webhook for agent-side case updates.

---

## Phase 5 — Advanced Analytics & Optimization

**Planned capabilities:**
- Conversation analytics (volume, intent distribution, escalation rate per tenant)
- Retrieval quality dashboard (score distributions, zero-hit queries, knowledge gaps)
- Confidence heatmaps — identify which intents/categories the model handles poorly
- Customer sentiment extraction on escalated conversations
- Auto-resolution metrics (percentage of chats that never needed a human)

**Backend implications:**
- Add `metadata` to `conversation_turns` for richer analytics joins.
- Materialized views or scheduled aggregation jobs in Supabase.

---

## Known Limitations & Cleanup

- **Prompt source-of-truth:** prompt content lives in Code nodes rather than a queryable `Prompt_Library` table. Fine for one tenant; a real limitation if per-tenant prompt overrides become necessary.
- **Retrieval-validation vs guardrail overlap:** `[RAG] - Validate Retrieval` (Phase 2) and `[GUARDRAIL] - Check Retrieval Quality` (Phase 3) have conceptual overlap not yet fully untangled.
- **Example-anchoring risk:** one structured-output example was too similar to a real test case and caused the model to anchor. Fixed once; worth re-auditing other prompts for the same risk.
- **Industry pack vocabulary:** `allowedCategories` is computed in code with a ternary. Should eventually move into `Tenant_Config`/`Industry_Pack` as data rather than code.
- **Conversation history format:** prompts receive history as a flat string. If a future phase needs reasoning about *when* something was said, this needs to become structured turns.

---

## Portfolio Presentation Notes

- Add the n8n workflow export (`[Core] AI Customer Support Platform.json`) to the repo root.
- Add screenshots: architecture diagram, ingestion flow, escalation flow.
- Consider recording a short demo walkthrough: ingest a PDF → ask a grounded question → trigger billing escalation → complete the intake → show the handoff.
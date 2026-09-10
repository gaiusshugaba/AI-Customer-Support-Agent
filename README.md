# FlowStack — AI Customer Support Platform & Operations Engine

A multi-tenant, production-oriented AI customer support platform built in **n8n**, backed by **Google Gemini**, **Pinecone**, and **Supabase (PostgreSQL)**.

The system answers customer questions grounded in tenant documentation, incorporates account-level customer context, validates its own retrieval quality, and deterministically escalates complex or sensitive issues to humans while managing multi-turn case intake state.

![Workflow Status](https://img.shields.io/badge/Workflow-Active-emerald)
![Architecture](https://img.shields.io/badge/Architecture-Stateless%20Orchestration-blue)
![Database](https://img.shields.io/badge/Database-PostgreSQL%20(Supabase)-3ECF8E)
![Vector Store](https://img.shields.io/badge/Vectors-Pinecone%20(Namespaced)-000000)
![Embeddings](https://img.shields.io/badge/Embeddings-OpenAI%20text--embedding--3--large-412991)

---

## Core Engineering Principles

1. **Deterministic Guardrails over Autonomous AI Agents**  
The response pipeline follows a predictable sequence: `Classify` → `Retrieve` → `Generate` → `Score` → `Guardrail Route`. The LLM generates candidate text and classification signals, but explicit logical conditions decide whether to answer or escalate. The model does not grade its own homework or decide its own escalation.
2. **Context-Aware Grounding (Knowledge + Customer Data)**  
Retrieval is split across two authoritative sources: tenant knowledge bases (general policies, guides) and customer account state (plan tier, account status, entitlements). The AI never asks the customer for information already present in their profile.
3. **Multi-Turn Escalation State Machine with Case Relevance**  
Escalation cases are tracked separately from conversation turns. When an active case exists, incoming messages are checked by a **Case Relevance Classifier**:

   * If the user provides requested details for the case → merges information into the existing ticket (`AWAITING_CUSTOMER_INFO` → `READY_FOR_AGENT`).
   * If the user switches topics → automatically routes back to standard RAG without hijacking the conversation.
4. **Tenant Namespace Isolation**  
All Pinecone vectors and Supabase records are partitioned by `tenant_id`. Cross-tenant retrieval leakage is physically impossible at the query layer.
5. **No Silent Failures & Zero Fabricated Data**  
Every validation failure, extraction error, and database issue writes a structured error record to Supabase. Fallbacks explicitly state when knowledge is missing ($confidence = 0$).

---

## High-Level Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │               Customer Message               │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │       Input Validation & Context Merge       │
                    │  (Tenant Config + Customer Profile + History)│
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │     Active Case Check & Relevance Routing    │
                    └───────┬──────────────────────────────┬───────┘
                            │                              │
          Existing Case &   │                              │ New Question /
          Message Matches   │                              │ Unrelated Topic
                            ▼                              ▼
             ┌─────────────────────────────┐┌──────────────────────────────┐
             │    Escalation Intake &      ││   Intent & Risk Classifier   │
             │   Follow-Up State Merge     ││  (Structured JSON Output)    │
             └──────────────┬──────────────┘└──────────────┬───────────────┘
                            │                              │
                            ▼                              ▼
             ┌─────────────────────────────┐┌──────────────────────────────┐
             │ Update Case in Supabase     ││ Tenant-Scoped Vector Search  │
             │ (Awaiting Info vs Ready)    ││   (Pinecone 3072-dim)        │
             └──────────────┬──────────────┘└──────────────┬───────────────┘
                            │                              │
                            │                              ▼
                            │               ┌──────────────────────────────┐
                            │               │ Grounded Response Generator  │
                            │               │ + Confidence Heuristic Score │
                            │               └──────────────┬───────────────┘
                            │                              │
                            │                              ▼
                            │               ┌──────────────────────────────┐
                            │               │   Deterministic Guardrails   │
                            │               │(Risk / Account Req / Scores) │
                            │               └──────┬───────────────┬───────┘
                            │                      │               │
                            │             Pass     │               │ Risk / Low
                            │          Guardrails  │               │ Retrieval
                            │                      ▼               ▼
                            │         ┌─────────────────┐ ┌────────────────┐
                            │         │ Deliver RAG     │ │ Create Case &  │
                            │         │ Direct Answer   │ │ Intake Request │
                            │         └────────┬────────┘ └────────┬───────┘
                            │                  │                   │
                            └──────────────────┴─────────┬─────────┘
                                                         │
                                                         ▼
                                            ┌──────────────────────────────┐
                                            │ Persist Turns to Supabase &  │
                                            │  Deliver Webhook JSON Body   │
                                            └──────────────────────────────┘
```

---

## Capability Breakdown by Phase

### Phase 1 — Knowledge Ingestion & Vector Indexing

* Ingests Markdown, TXT, CSV, and PDF documents via multipart form uploads or JSON payloads.
* **Header-Aware Chunking:** splits on `##` and `###` headers; long sections are sub-split into ~400-token segments with sentence-boundary awareness and ~50-token overlap.
* **Deduplication Engine:** checks for prior successful ingestions of the document ID. If found, automatically clears out previous Pinecone vectors under the tenant namespace before indexing new embeddings.

- Generates 3072-dimensional vector embeddings using OpenAI `text-embedding-3-large`, routed via OpenRouter. Same model is used for both document ingestion and query embeddings, ensuring retrieval works.

- **Multi-format chunking:** Markdown files use literal heading splits; PDFs and DOCX files use a heuristic heading detector tuned for prose extracted from those formats.

Phase 2 — Core Grounded RAG & Heuristic Scoring

* Merges tenant configuration, customer profile data, and conversation history.
* Classifies user intent into allowed tenant categories and extracts risk signals (`security`, `billing_dispute`, `legal`, `churn_threat`).
* Executes Pinecone similarity search restricted to the tenant namespace.
* Validates retrieval output: if no vectors are retrieved or score is below threshold, routes to an honest no-knowledge fallback without hallucinating.
* Response scoring evaluates retrieval confidence and penalizes refusal indicators deterministically.

### Phase 3 — Escalation Management & Multi-Turn Intake

* **Deterministic Guardrail Layer:** checks risk flags, required account data, customer profile availability, and similarity scores.
* **Intake Requirements Engine:** analyzes what the customer provided vs. what a human support agent needs, requesting only missing details.
* **State Machine:** transitions cases between `AWAITING_CUSTOMER_INFO` and `READY_FOR_AGENT`.
* **Case Relevance Engine:** evaluates whether follow-ups belong to existing tickets or represent new queries.

### Phase 4 / Admin Ops — FlowStack AI Support Ops Console

* Dedicated administrator monitoring console for tracking conversations, cases, knowledge documents, and system health.
* Real-time visibility into AI confidence scores, retrieval rankings, risk flags, and escalation state transitions.

### Ingestion Robustness & Latency Optimization

- **Multi-format chunker** supporting Markdown, PDF, DOCX, TXT, and CSV with per-format heading detection.

- **Fast-path classifier** that skips the LLM entirely for greetings, thanks, and acknowledgements.

- **Parallel context loading** — tenant config, customer profile, and conversation history are now fetched concurrently rather than in series.

- **Isolated error workflow** that captures unhandled failures from the main platform only, tagged with the originating tenant ID.

- **RLS-hardened admin console** — `ingestion_log` and `request_errors` are readable by the public anon key while remaining write-restricted to the service role.

---

## Tech Stack & Infrastructure

|Layer|Component|Implementation Details|
|-|-|-|
|**Orchestration**|n8n|Stateless workflows with structured webhook routing and sub-nodes|
|**LLM & Embeddings**|Google Gemini 3.7 Flash (via OpenRouter) & OpenAI text-embedding-3-large (via OpenRouter)|High-throughput structured JSON parsing for classification, generation, and escalation. 3072-dim embeddings for both ingestion and query, consistent vector space|
|**Vector Store**|Pinecone|Single index (`customer-support-kb`), tenant-isolated namespaces|
|**Primary Database**|Supabase (PostgreSQL)|Stores tenant configs, customer records, turns, cases, and logs|
|**Admin Frontend**|React / Tailwind (FlowStack Ops)|Operations dashboard for monitoring chats, cases, and ingestion|

---

## Webhook Endpoints

### 1. Conversation Message Endpoint

* **URL:** `POST /webhook/conversation-message`
* **Payload:**

```json
{
  "tenant_id": "b2b-saas-demo",
  "customer_id": "cust-10293",
  "conversation_id": "conv-88491",
  "text": "I was billed twice for my subscription this month."
}
```

### 2. Knowledge Ingestion Endpoint

* **URL:** `POST /webhook/kb-ingest`
* **Content-Type:** `multipart/form-data`
* **Fields:**

  * `file`: File upload (`.pdf`, `.md`, `.txt`, `.csv`)
  * `tenant_id`: Tenant identifier string
  * `doc_id` *(Optional)*: Auto-inferred from document header or filename if omitted

---

## Repository Structure

```
├── README.md                                    # Project overview & system architecture
├── CHANGELOG.md                                 # Historical record of all updates & fixes
├── ARCHITECTURE.md                              # Detailed component design & data flows
├── DATABASE_SCHEMA.md                           # Supabase Postgres & Pinecone schemas
├── API_DOCUMENTATION.md                         # Webhook endpoints & payload contracts
├── TESTING.md                                   # Comprehensive test suite & validation runs
├── ROADMAP.md                                   # Future phases (Agent tooling, Analytics)
├── [Core] AI Customer Support Platform.json     # Production n8n workflow export
└── docs/
    └── prompt-library.md                        # Production system prompts
```


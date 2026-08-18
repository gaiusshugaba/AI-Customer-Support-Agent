# Product Roadmap — AI Customer Support Platform (v2)

> Revision note: v2 integrates automation-engineering pushbacks on modularity, memory, quality gating, and observability. Changes from v1 are marked with **[REVISED]**.

## Product Vision

Build a production-ready AI Customer Support Platform that enables businesses to automate repetitive customer support, retrieve trusted information from their knowledge base, personalize responses using customer context, and intelligently escalate complex conversations to human agents.

The platform should be industry-agnostic, allowing organizations to deploy it across B2B and B2C environments by connecting different knowledge bases, business rules, and integrations.

## Product Mission

Empower businesses to deliver faster, more accurate, and more consistent customer support without sacrificing trust, transparency, or human oversight.

## Product Goals

**Business Goals**
- Reduce repetitive support workload
- Improve customer response times
- Improve support consistency
- Reduce support costs
- Increase customer satisfaction
- Continuously improve documentation using customer interactions

**Technical Goals**
- Build a modular AI platform
- Demonstrate production-grade RAG
- Implement safe AI guardrails
- Support multiple communication channels
- Enable reusable integrations
- Measure AI performance using analytics

## Product Principles

Every feature must follow these principles:

1. **Grounded Responses** – AI answers only from approved knowledge.
2. **Human Oversight** – Escalate instead of guessing.
3. **Configuration Over Customization** – Adapt to industries through configuration, not code changes. **[REVISED: this is now an enforced architectural rule, not aspirational — see "Config-Driven Modularity" below.]**
4. **Security by Design** – Protect customer data and respect permissions.
5. **Continuous Learning** – Improve from every interaction.
6. **Observable AI** – Every decision should be measurable and traceable. **[REVISED: logging is now a build-order requirement, not a Phase 7 feature — every workflow logs from day one.]**

## Platform Architecture

```
                  AI Customer Support Platform

        ┌────────────────────────────────────────┐
        │         Communication Channels          │
        │ Chat │ Email │ Slack │ WhatsApp │ SMS │
        └────────────────────────────────────────┘
                           │
                           ▼
                  Message Ingestion Layer
                    (normalized envelope)
                           │
                           ▼
                Customer Context Service
                           │
                           ▼
                  Intent Classification
                           │
                           ▼
                    AI Decision Engine
       (LLM scores confidence/risk — IF/Switch node
        routes, not the LLM itself) [REVISED]
                           │
         ┌─────────────────┴──────────────────┐
         │                                    │
         ▼                                    ▼
  Knowledge Retrieval                 Human Escalation
         │                                    │
         ▼                                    ▼
   AI Response Engine                 Support Agent
         │
         ▼
  Response Quality Gate
   (separate validation LLM/rules pass,
    checks grounding + hallucination markers) [REVISED]
         │
         ▼
   Response Dispatcher
         │
         ▼
 Analytics & Continuous Learning
   (every node above logs to this from day one) [REVISED]
```

### [REVISED] Config-Driven Modularity

Phase 9 ("Industry Packs") only works if this is true from Phase 1 onward:

- Prompts, confidence thresholds, escalation policies, and knowledge-base pointers live in a **config table** (Airtable/Postgres), keyed by `tenant_id` / `industry_pack_id`.
- There is **one** ingestion workflow, **one** RAG response workflow, **one** escalation workflow. Industry packs swap config rows, not workflow logic.
- Anti-pattern to avoid: duplicating workflows per industry ("SaaS RAG workflow", "E-commerce RAG workflow"). If we're duplicating workflows, config-over-customization has failed.

### [REVISED] Conversation Memory

n8n executions are stateless between webhook calls, so conversation memory cannot live inside a single workflow run. Memory is an **external store** (Postgres table keyed by `conversation_id`, or Redis for short-TTL context), read at the start of each execution and written at the end. This is called out explicitly because it's the part most likely to be under-built if left implicit.

### [REVISED] Response Quality Gate — clarified

Hallucination prevention is **not a single feature/switch**. It's an emergent property of three things working together, each built as a distinct, testable step:
1. Strict grounding in the generation prompt (answer only from retrieved chunks, cite them)
2. A retrieval-score threshold (don't generate if nothing relevant was retrieved)
3. A separate, cheaper validation pass (LLM or rules) that checks the response actually cites retrieved content before it's allowed to dispatch

## Roadmap

### Phase 0 — Discovery & Product Strategy
*(unchanged from v1 — industry research, market analysis, competitor analysis, personas, journey maps, problem statement, vision, roadmap, PRD, success metrics, risk analysis)*

**Outcome:** A validated product strategy.

---

### Phase 1 — Knowledge Platform

**Objective:** Create the foundation that powers every AI response.

**Features**
- Knowledge repository (Markdown, PDF, website ingestion)
- Metadata schema (tenant_id, industry_pack_id, source, version, last_updated)
- Version control
- Document chunking
- Embedding pipeline
- Vector database integration (Pinecone)
- Knowledge indexing
- Knowledge freshness monitoring
- **[REVISED] Ingestion runs as its own standalone n8n workflow**, decoupled from the live conversation flow — triggered on upload/update, not on every chat message.
- **[REVISED] Every ingestion run logs to the Analytics store** (doc id, chunk count, embedding model, timestamp, tenant_id) from the first build, not deferred to Phase 7.

**Deliverables**
- Sample B2B SaaS knowledge base
- Sample B2C e-commerce knowledge base
- Chunking strategy doc
- Embedding workflow (n8n, importable JSON)
- Pinecone index (config-driven namespace per tenant)

**Outcome:** A production-ready knowledge platform.

---

### Phase 2 — AI Core
*(unchanged features, with the addition below)*

**Features**
- Intent classification
- Customer context retrieval
- Conversation memory — **[REVISED] via external Postgres/Redis store, not in-workflow state**
- RAG retrieval
- Prompt orchestration — **[REVISED] prompts pulled from config table by tenant_id**
- AI response generation
- Confidence scoring
- Retrieval scoring

**Outcome:** An AI capable of generating grounded responses.

---

### Phase 3 — Decision & Guardrails

**Features**
- Risk detection, complaint detection, billing detection, security detection
- Confidence thresholds, similarity thresholds — **[REVISED] thresholds live in config table, tunable per tenant without code changes**
- Hallucination prevention — **[REVISED] see clarified 3-part definition above**
- Policy enforcement
- Human escalation routing
- **[REVISED] Routing decision made by IF/Switch node reading the LLM's structured confidence/risk output — the LLM never self-routes.**

**Outcome:** A trustworthy AI system.

---

### Phase 4 — Customer Support Engine
*(unchanged — ticket creation, lifecycle, conversation history, agent notes, customer history, status tracking, priority handling, SLA timers)*

**Outcome:** A functioning customer support platform.

---

### Phase 5 — Multi-Channel Communication
*(unchanged — MVP: website chat, email. Future: Slack, WhatsApp, SMS, Teams, Discord)*

**[REVISED]** All channel triggers feed a shared **Message Normalizer** sub-workflow before entering the core pipeline, so downstream logic is channel-agnostic.

**Outcome:** One AI across multiple communication channels.

---

### Phase 6 — Administration Platform
*(unchanged — upload documentation, manage knowledge sources, user/role management, prompt management, escalation policies, analytics dashboard)*

**[REVISED]** This is effectively the UI layer over the config table introduced in Phase 1 — not a separate data model.

**Outcome:** An operational admin experience.

---

### Phase 7 — Analytics & Observability

**[REVISED]** Logging itself is no longer built here — it's been live since Phase 1. Phase 7 builds the **dashboard/reporting layer** over logs that already exist.

*(AI Metrics, Business Metrics, Platform Metrics — unchanged from v1)*

**Outcome:** A measurable AI platform.

---

### Phase 8 — Continuous Learning
*(unchanged — knowledge gap detection, missing documentation reports, weekly analytics, prompt A/B testing, retrieval evaluation, knowledge freshness alerts, feedback loop)*

**Outcome:** A self-improving support platform.

---

### Phase 9 — Industry Packs

The core platform remains the same. Only the configuration changes — **[REVISED] enforced, not aspirational,** because Phases 1–3 were built config-driven from the start.

**B2B:** SaaS, CRM, HR, Workflow Automation, FinTech, Accounting
**B2C:** E-commerce, Healthcare, Education, Travel, Logistics, Telecommunications

Each industry pack includes: knowledge base, sample customers, sample tickets, escalation policies, AI prompts, analytics examples — **all as config rows, not workflow forks.**

---

## MVP (Portfolio Version)
*(unchanged from v1)*

- Knowledge ingestion (Markdown + PDF)
- Pinecone vector database
- AI-powered RAG responses
- Customer context retrieval (Airtable)
- Intent classification
- Confidence-based escalation
- Website chat interface
- Email support
- Slack notifications
- Ticket lifecycle management
- Analytics logging
- Weekly knowledge gap report

Demonstrated using: **B2B SaaS** (primary demo) and **B2C E-commerce** (secondary demo).

## Beyond the Roadmap

Before writing code:
1. Product Requirements Document (PRD)
2. System Architecture Document
3. Data Model & Database Design (Airtable schema, Pinecone metadata, document formats, ticket lifecycle, customer records) — **[REVISED] must include the tenant/industry-pack config table schema, since everything else depends on it.**

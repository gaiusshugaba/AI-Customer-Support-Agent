# Phase 0 — Discovery & Product Strategy

## AI Customer Support Platform

---

## 1. Industry Research

AI-powered customer support has moved from experimental chatbots to a mainstream operational layer. Gartner projects that 80% of routine customer interactions will be fully handled by AI in 2026, and conversational AI deployments are expected to reduce contact-center labor costs by $80 billion globally. Adoption is already broad but shallow: 88% of contact centers are using some form of AI, yet only 25% have fully integrated it — meaning adoption without integration is currently limiting results industry-wide.

This "adoption without integration" gap is the central industry insight that should shape our build order: most platforms in the market can *generate* a plausible-sounding answer; far fewer can reliably *ground* that answer in a business's actual, current policy and *know when to stop* and hand off to a human. That distinction — not raw chat quality — is where the roadmap's guardrail and quality-gate phases earn their keep.

**Cost economics reinforce the case for automation, with a caveat.** Gartner benchmarks self-service at $1.84 per contact versus $13.50 for agent-assisted contact, but notes only 14% of self-service interactions fully resolve — the gap between AI-assisted and AI-resolved is the most important open story in the industry right now. This is exactly why the roadmap treats "confidence-based escalation" as a core guardrail rather than a nice-to-have: a platform optimized purely for deflection rate, without a genuine confidence gate, produces cheap but unreliable resolutions — the opposite of the "Grounded Responses / Human Oversight" principles this platform is built on.

**Adoption varies sharply by industry**, which validates the roadmap's Phase 9 industry-pack strategy rather than a one-size-fits-all vertical bet: telecom and banking lead adoption, while retail/e-commerce holds the largest share of conversational AI deployments specifically — a useful signal for why B2B SaaS and B2C e-commerce were chosen as the two MVP demo verticals.

---

## 2. Market Analysis

**Market size and growth.** The global AI customer service market reached $15.12 billion in 2026, up from $12.06 billion in 2024, growing at a 25.8% CAGR toward $47.82 billion by 2030. Estimates vary by research firm and scope (some report figures as high as $83.85B by 2033 or $117B+ when the broader AI-in-CX market is included), but every major source agrees on the direction: sustained 20%+ CAGR growth through the end of the decade.

**Sizing this project's addressable slice (illustrative, portfolio-scale):**

| Layer | Definition | Estimate |
|---|---|---|
| TAM | Global AI customer service market | ~$15B (2026), growing to ~$48B by 2030 |
| SAM | Mid-market B2B SaaS + B2C e-commerce companies needing configurable, RAG-grounded support automation (not enterprise-only, not DIY-chatbot-only) | A meaningful, underserved middle — most incumbent platforms cluster at either the low-cost/low-configurability end or the high-cost/custom-build end (see §3) |
| SOM (portfolio target) | A working, demonstrable product covering 2 industry verticals, proving the config-driven architecture | N/A — this phase is about proving the architecture, not capturing revenue |

**Investment signal.** According to Intercom's 2026 Customer Transformation Report, 87% of senior leaders plan to invest in AI for customer service this year. At the same time, Forrester has cautioned that 2026 will be characterized by "gritty, foundational work" rather than dazzling transformation — which matches this roadmap's own emphasis on getting ingestion, chunking, and logging right in Phase 1 before any conversational polish.

---

## 3. Competitor Analysis

The market has split into three clear tiers. Understanding where this platform sits relative to them justifies several of the roadmap's architectural decisions (config-over-customization, observable AI, human escalation as a first-class path).

| Tier | Representative Players | Positioning | Relevant Trade-off |
|---|---|---|---|
| **Fast-deploy, usage-priced** | Intercom Fin, Zendesk AI Agents, Gorgias (e-commerce) | Polished, native to one helpdesk ecosystem, priced per resolution | Fin leads independent benchmarks at a 76% average resolution rate with $0.99-per-outcome pricing, but you're locked into their helpdesk and their model of what counts as a "resolution." |
| **Configurable mid-market/enterprise** | Decagon, Zendesk AI (mature ops) | Decagon is positioned as the best fit for mid-market and enterprise support teams that want a highly configurable AI agent with strong analytics. | Configurability comes at enterprise pricing and a build-heavy onboarding — a poor fit for anyone who isn't a high-volume brand ready for a custom build and a six-figure commitment. |
| **Bespoke enterprise builds** | Sierra, Ada | Sierra wins on bespoke, deeply branded enterprise builds with a vendor-led, multi-month implementation. | Highest quality ceiling, highest cost and time floor. Not accessible to mid-market. |

**Where this platform is positioned:** deliberately in the gap between tiers one and two — config-driven like Decagon (so it can genuinely serve multiple industries without rebuilding), but architected to be owned and inspected rather than a black-box per-resolution meter. A recurring failure mode across the market is that an agent answers confidently with a policy that's been retired, or can't complete an action because it was never wired into the customer's actual systems — this is precisely the risk the roadmap's Response Quality Gate and Knowledge Freshness Monitoring are designed to catch, and it's the single strongest argument for building this system rather than treating it as a "solved, buy don't build" problem.

**Pricing reference points**, useful for eventual business-model decisions: Intercom Fin starts around $29 per seat per month, while Decagon and Sierra use custom pricing typically above $1,000 per month. Usage-priced challengers range from roughly $0.40 to $0.99 per resolved conversation depending on the vendor and billing unit (per-conversation, per-resolution, or per-action).

---

## 4. User Personas

### Persona 1 — Maya, Head of Support (Buyer / Admin)
- **Role:** Runs a 12-person support team at a mid-market B2B SaaS company (the Phase 1 demo vertical).
- **Goals:** Cut first-response time without hiring, keep CSAT stable, prove AI ROI to leadership, avoid a rip-and-replace of the existing helpdesk.
- **Frustrations:** Existing chatbot tools either can't be trusted with billing/account questions, or require a developer to update every time a policy changes.
- **What she needs from this platform:** The Administration Platform (Phase 6) — she must be able to update knowledge and escalation policy herself, without waiting on engineering, and see (Phase 7 analytics) where the AI is guessing versus grounded.

### Persona 2 — Diego, Support Agent (Human-in-the-loop)
- **Role:** Front-line agent who receives AI-escalated conversations.
- **Goals:** Get full context on arrival — not "start from scratch" — when a conversation is handed to him.
- **Frustrations (industry-wide pattern):** Agents frequently inherit AI escalations with no useful context, forcing them to restart the conversation from zero.
- **What he needs from this platform:** Conversation Memory (Phase 2) and Ticket/Conversation History (Phase 4) must travel with the escalation, not reset at handoff.

### Persona 3 — Priya, End Customer (Requester)
- **Role:** A customer of Maya's company, asking a support question via chat or email.
- **Goals:** A fast, correct answer — or a fast, honest "let me get you a human" if the AI isn't sure.
- **Frustrations:** 79% of people still prefer talking to a human for support — often because they've been burned by AI that answers confidently but wrong.
- **What she needs from this platform:** The trust built by Human Oversight and Grounded Responses as *product principles*, not just backend safeguards — she should be able to tell, implicitly, that the system knows its own limits.

---

## 5. Customer Journey Maps

### 5a. Priya's journey — billing question, B2B SaaS

| Stage | Action | Current Pain (industry baseline) | This Platform's Design Response |
|---|---|---|---|
| Trigger | Notices an unexpected charge | Anxiety, opens support chat | Website Chat (Phase 5) is the first-touch channel |
| Ask | Types the question | Generic bots ask for account info the company already has | Customer Context Service pulls account/plan data automatically |
| AI Response | Bot answers | Risk: answer is fluent but wrong/outdated | RAG retrieval + Response Quality Gate (Phase 2/3) ground the answer in the current Billing FAQ doc |
| Uncertainty | Question turns out to be account-specific (e.g., a disputed charge) | Bot loops or gives a non-answer | Confidence/risk scoring triggers Human Escalation (Phase 3) *before* a wrong answer is sent |
| Handoff | Routed to Diego | Context lost, has to re-explain | Full conversation history and context travel with the ticket (Phase 4) |
| Resolution | Diego resolves it | — | Interaction logged for analytics + potential knowledge-gap signal (Phase 7/8) |

### 5b. Maya's journey — updating a policy after a compliance change

| Stage | Action | Current Pain | This Platform's Design Response |
|---|---|---|---|
| Trigger | Legal updates the refund policy | Engineering ticket required in most DIY chatbot tools | Admin uploads updated Markdown/PDF via Phase 6 UI |
| Ingestion | Doc is re-embedded | Manual re-indexing, easy to forget | Standalone ingestion workflow (Phase 1) triggers automatically on upload |
| Verification | Wants to confirm the AI is using the new policy | No visibility in most tools | Analytics dashboard shows retrieval source + doc version per conversation (Phase 7, Observable AI principle) |
| Ongoing | Wants to know if customers are still asking questions the docs don't cover | Usually invisible until CSAT drops | Weekly knowledge-gap report (Phase 8) surfaces it proactively |

---

## 6. Problem Statement

Mid-market businesses face a forced choice they shouldn't have to make: **cheap, fast-deploy AI support tools that can't be trusted with nuanced or account-specific questions**, or **configurable/bespoke enterprise platforms that require six-figure commitments and multi-month implementations** (§3). Both paths share a deeper flaw the industry data confirms — AI adoption has outpaced AI integration, with the majority of self-service interactions still failing to fully resolve the customer's issue — because grounding, confidence-gating, and human-handoff are treated as afterthoughts rather than architecture.

**Problem statement:** Mid-market B2B and B2C companies need a support automation platform that is genuinely configurable across industries without custom engineering per vertical, grounds every answer in their own current documentation, and knows — reliably and measurably — when to hand off to a human, without requiring an enterprise budget or a multi-month build.

---

## 7. Product Vision *(carried forward, unchanged)*

Build a production-ready AI Customer Support Platform that enables businesses to automate repetitive customer support, retrieve trusted information from their knowledge base, personalize responses using customer context, and intelligently escalate complex conversations to human agents — industry-agnostic by configuration, not by code change. *(See `product-roadmap-v2.md` for the full vision, mission, and principles.)*

---

## 8. Success Metrics

Aligned to the roadmap's three metric categories (Phase 7), with north-star and guardrail metrics called out:

**North Star:** Deflection rate *at a held confidence threshold* — i.e., resolutions that pass the Quality Gate, not raw AI-touched volume. This is a deliberate choice: optimizing for raw deflection alone is the exact trap that produces the industry's gap between AI-assisted and AI-resolved interactions.

| Category | Metric | Why it matters here |
|---|---|---|
| AI Quality | Retrieval relevance (top-k precision) | Directly measures whether Phase 1's chunking strategy is working |
| AI Quality | Hallucination rate (Quality Gate rejections / total responses) | Direct measure of the "Grounded Responses" principle |
| AI Quality | Confidence distribution | Detects a mis-tuned threshold before it causes bad escalation calls |
| Business | Deflection rate (post-gate) | North star, as above |
| Business | Escalation accuracy (did the right conversations get escalated?) | Prevents optimizing deflection at the cost of trust |
| Business | CSAT, split by AI-only vs. AI-then-human conversations | Confirms the handoff, not just the bot, is working |
| Business | Knowledge gap count (Phase 8 report) | Measures Continuous Learning principle in practice |
| Platform | Ingestion success rate / embedding pipeline latency | Operational health of Phase 1 foundation |
| Platform | API/workflow failure rate | Observable AI principle, platform layer |

---

## 9. Risk Analysis

| Risk | Category | Likelihood | Impact | Mitigation (roadmap phase) |
|---|---|---|---|---|
| AI gives a confident but outdated/wrong answer (industry-wide failure mode per §3) | Product/Trust | High if unaddressed | High — directly damages CSAT and trust | Response Quality Gate + retrieval-score threshold + Knowledge Freshness Monitoring (Phase 1, 3, 8) |
| Config-driven modularity erodes over time into per-industry workflow forks | Technical/Architectural | Medium | High — undermines Phase 9 entirely | Enforce config-table-only customization from Phase 1; code review discipline against workflow duplication |
| Conversation memory implemented as in-workflow state, breaks under real (stateless) execution model | Technical | Medium (common n8n anti-pattern) | Medium | External Postgres/Redis store from Phase 2, called out explicitly in roadmap v2 |
| Escalation under- or over-triggers (annoys customers either way) | Product | Medium | Medium | Confidence/risk thresholds tunable per tenant via config, monitored via Phase 7 confidence distribution metric |
| Knowledge base goes stale, no one notices until CSAT drops | Operational | High (industry-common) | Medium | Knowledge freshness monitoring (Phase 1) + weekly gap report (Phase 8), not left to manual review |
| Market risk: competing against well-funded incumbents (Decagon, Sierra, Fin) with enterprise sales motions | Market | N/A (portfolio project, not commercial launch) | Low for this phase | Positioning is intentionally the underserved middle tier (§3), not head-to-head enterprise competition |
| PDF/website ingestion produces poor chunking on non-Markdown sources | Technical | Medium | Medium | Chunking strategy explicitly handles PDF extraction path (Phase 1); should be validated against real PDFs before Phase 9 scale-out |

---

## Next Steps

Per the roadmap's "Beyond the Roadmap" section, the next deliverables before further build work are:
1. **Product Requirements Document (PRD)** — translates this discovery work into buildable requirements per phase.
2. **System Architecture Document** — formalizes the platform diagram into service boundaries and data contracts.
3. **Data Model & Database Design** — Airtable schema, Pinecone metadata, ticket lifecycle, and critically, the tenant/industry-pack config table schema referenced throughout this document.

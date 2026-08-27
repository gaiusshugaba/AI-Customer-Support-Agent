# Database Schema & Data Models

The FlowStack platform uses **Supabase (PostgreSQL)** for relational data and **Pinecone** for high-dimensional vector search.

---

## PostgreSQL Tables (Supabase)

### 1. `tenant_config`

Stores tenant settings, vertical industry packs, and guardrail thresholds.

```sql
CREATE TABLE tenant_config (
    tenant_id VARCHAR(64) PRIMARY KEY,
    tenant_name VARCHAR(255) NOT NULL,
    industry_pack VARCHAR(32) NOT NULL DEFAULT 'saas', -- 'saas', 'ecommerce'
    confidence_threshold NUMERIC(3,2) DEFAULT 0.70,
    similarity_threshold NUMERIC(3,2) DEFAULT 0.75,
    active_channels JSONB DEFAULT '["chat"]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. `customers`

Stores persistent customer identities, subscription tiers, and account context.

```sql
CREATE TABLE customers (
    customer_id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenant_config(tenant_id),
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    plan_tier VARCHAR(64) NOT NULL, -- 'free', 'pro', 'enterprise'
    account_status VARCHAR(32) NOT NULL, -- 'active', 'delinquent', 'suspended'
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. `conversation_turns`

Stores the complete chronological message log across customer sessions.

```sql
CREATE TABLE conversation_turns (
    turn_id BIGSERIAL PRIMARY KEY,
    conversation_id VARCHAR(64) NOT NULL,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenant_config(tenant_id),
    role VARCHAR(16) NOT NULL, -- 'user', 'assistant'
    text TEXT NOT NULL,
    intent VARCHAR(64),
    confidence_score NUMERIC(3,2),
    retrieval_score NUMERIC(3,2),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_turns_lookup
ON conversation_turns(tenant_id, conversation_id, timestamp ASC);
```

### 4. `escalation_cases`

Maintains lifecycle state for escalated tickets and multi-turn intake sessions.

```sql
CREATE TABLE escalation_cases (
    case_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenant_config(tenant_id),
    conversation_id VARCHAR(64) NOT NULL,
    customer_id VARCHAR(64) NOT NULL REFERENCES customers(customer_id),
    escalation_type VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL, -- 'awaiting_customer_info', 'ready_for_agent', 'in_progress', 'resolved'
    handoff_mode VARCHAR(32) NOT NULL DEFAULT 'ticket', -- 'ticket', 'live_chat'
    required_information JSONB DEFAULT '[]'::jsonb,
    provided_information JSONB DEFAULT '[]'::jsonb,
    missing_information JSONB DEFAULT '[]'::jsonb,
    latest_customer_message TEXT,
    case_context JSONB DEFAULT '{}'::jsonb,
    intake_attempts INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cases_active
ON escalation_cases(tenant_id, conversation_id, status);
```

### 5. `ingestion_log`

Tracks document indexing operations and chunk validation results.

```sql
CREATE TABLE ingestion_log (
    log_id BIGSERIAL PRIMARY KEY,
    doc_id VARCHAR(128) NOT NULL,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenant_config(tenant_id),
    title VARCHAR(255),
    chunk_count INT,
    embedding_model VARCHAR(128),
    status VARCHAR(32) NOT NULL, -- 'success', 'failed'
    error_message TEXT,
    failed_node VARCHAR(128),
    ingested_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6. `request_errors`

Unified error log capturing validation failures and unhandled workflow errors.

```sql
CREATE TABLE request_errors (
    error_id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(64),
    error_message TEXT NOT NULL,
    failed_node VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL,
    occurred_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Vector Database Index (Pinecone)

- **Index Name:** `customer-support-kb`
- **Metric:** Cosine
- **Dimensions:** 3072 (matches `gemini-embedding-001`)
- **Namespace Isolation:** `namespace = tenant_id`

### Vector Metadata Schema

```json
{
  "doc_id": "kb-b2b-001",
  "chunk_id": "kb-b2b-001-c1",
  "tenant_id": "b2b-saas-demo",
  "title": "API Rate Limits & Authentication",
  "section_heading": "Generating API Keys",
  "category": "technical",
  "industry_pack": "saas",
  "version": "1.2",
  "last_updated": "2026-08-15",
  "chunk_index": 1
}
```

---

## Identity Relationships

```
TENANT (tenant_id)                          ← isolation boundary
 └── CUSTOMER (customer_id)                 ← persistent across conversations
      └── CONVERSATION (conversation_id)    ← unique per chat session
           └── ESCALATION CASE (case_id)    ← created only when escalation is required

customer_id ≠ conversation_id ≠ case_id
```

- Customer identity is persistent.
- Conversation identity changes when the customer starts a new chat.
- Case identity exists only when a conversation is escalated.
- Not every conversation has a case; not every customer has one conversation.

# Database Schema \& Data Models

The FlowStack platform uses **Supabase (PostgreSQL)** for relational data and **Pinecone** for high-dimensional vector search.

\---

## PostgreSQL Tables (Supabase)

### 1\. `tenant\_config`

Stores tenant settings, vertical industry packs, and guardrail thresholds.

```sql
CREATE TABLE tenant\_config (
    tenant\_id VARCHAR(64) PRIMARY KEY,
    tenant\_name VARCHAR(255) NOT NULL,
    industry\_pack VARCHAR(32) NOT NULL DEFAULT 'saas', -- 'saas', 'ecommerce'
    confidence\_threshold NUMERIC(3,2) DEFAULT 0.70,
    similarity\_threshold NUMERIC(3,2) DEFAULT 0.75,
    active\_channels JSONB DEFAULT '\["chat"]'::jsonb,
    created\_at TIMESTAMPTZ DEFAULT NOW(),
    updated\_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2\. `customers`

Stores persistent customer identities, subscription tiers, and account context.

```sql
CREATE TABLE customers (
    customer\_id VARCHAR(64) PRIMARY KEY,
    tenant\_id VARCHAR(64) NOT NULL REFERENCES tenant\_config(tenant\_id),
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    plan\_tier VARCHAR(64) NOT NULL, -- 'free', 'pro', 'enterprise'
    account\_status VARCHAR(32) NOT NULL, -- 'active', 'delinquent', 'suspended'
    custom\_fields JSONB DEFAULT '{}'::jsonb,
    created\_at TIMESTAMPTZ DEFAULT NOW(),
    updated\_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3\. `conversation\_turns`

Stores the complete chronological message log across customer sessions.

```sql
CREATE TABLE conversation\_turns (
    turn\_id BIGSERIAL PRIMARY KEY,
    conversation\_id VARCHAR(64) NOT NULL,
    tenant\_id VARCHAR(64) NOT NULL REFERENCES tenant\_config(tenant\_id),
    role VARCHAR(16) NOT NULL, -- 'user', 'assistant'
    text TEXT NOT NULL,
    intent VARCHAR(64),
    confidence\_score NUMERIC(3,2),
    retrieval\_score NUMERIC(3,2),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx\_turns\_lookup
ON conversation\_turns(tenant\_id, conversation\_id, timestamp ASC);
```

### 4\. `escalation\_cases`

Maintains lifecycle state for escalated tickets and multi-turn intake sessions.

```sql
CREATE TABLE escalation\_cases (
    case\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),
    tenant\_id VARCHAR(64) NOT NULL REFERENCES tenant\_config(tenant\_id),
    conversation\_id VARCHAR(64) NOT NULL,
    customer\_id VARCHAR(64) NOT NULL REFERENCES customers(customer\_id),
    escalation\_type VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL, -- 'awaiting\_customer\_info', 'ready\_for\_agent', 'in\_progress', 'resolved'
    handoff\_mode VARCHAR(32) NOT NULL DEFAULT 'ticket', -- 'ticket', 'live\_chat'
    required\_information JSONB DEFAULT '\[]'::jsonb,
    provided\_information JSONB DEFAULT '\[]'::jsonb,
    missing\_information JSONB DEFAULT '\[]'::jsonb,
    latest\_customer\_message TEXT,
    case\_context JSONB DEFAULT '{}'::jsonb,
    intake\_attempts INT DEFAULT 1,
    created\_at TIMESTAMPTZ DEFAULT NOW(),
    updated\_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx\_cases\_active
ON escalation\_cases(tenant\_id, conversation\_id, status);
```

### 5\. `ingestion\_log`

Tracks document indexing operations and chunk validation results.

```sql
CREATE TABLE ingestion\_log (
    log\_id BIGSERIAL PRIMARY KEY,
    doc\_id VARCHAR(128) NOT NULL,
    tenant\_id VARCHAR(64) NOT NULL REFERENCES tenant\_config(tenant\_id),
    title VARCHAR(255),
    chunk\_count INT,
    embedding\_model VARCHAR(128),
    status VARCHAR(32) NOT NULL, -- 'success', 'failed'
    error\_message TEXT,
    failed\_node VARCHAR(128),
    ingested\_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6\. `request\_errors`

Unified error log capturing validation failures and unhandled workflow errors.

```sql
CREATE TABLE request\_errors (
    error\_id BIGSERIAL PRIMARY KEY,
    tenant\_id VARCHAR(64),
    error\_message TEXT NOT NULL,
    failed\_node VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL,
    occurred\_at TIMESTAMPTZ DEFAULT NOW()
);
```\*\*Note:\*\* Every `request\_errors` row should have a non-null `tenant\_id`. Rows with `null` or `'unknown'` tenant IDs are invisible to the tenant-scoped admin console and should be considered a bug in the writer.

\---

## Vector Database Index (Pinecone)

* **Index Name:** `customer-support-kb`
* **Metric:** Cosine
* **Dimensions:** 3072 (matches OpenAI `text-embedding-3-large`)
* **Namespace Isolation:** `namespace = tenant\_id`

### Vector Metadata Schema

```json
{
  "doc\_id": "kb-b2b-001",
  "chunk\_id": "kb-b2b-001-c1",
  "tenant\_id": "b2b-saas-demo",
  "title": "API Rate Limits \& Authentication",
  "section\_heading": "Generating API Keys",
  "category": "technical",
  "industry\_pack": "saas",
  "version": "1.2",
  "last\_updated": "2026-08-15",
  "chunk\_index": 1
}
```### Embedding Model Consistency



The same embedding model must be used for both \*\*ingestion\*\* and \*\*query\*\* embedding. Mixing models (e.g., ingesting with OpenAI and querying with Gemini) produces vectors in incompatible spaces — Pinecone will return semantically meaningless matches with seemingly-high similarity scores.



Current configuration:

\- \*\*Ingestion:\*\* `openai/text-embedding-3-large` via OpenRouter

\- \*\*Query:\*\* `openai/text-embedding-3-large` via OpenRouter

\---

## Identity Relationships

```
TENANT (tenant\_id)                          ← isolation boundary
 └── CUSTOMER (customer\_id)                 ← persistent across conversations
      └── CONVERSATION (conversation\_id)    ← unique per chat session
           └── ESCALATION CASE (case\_id)    ← created only when escalation is required

customer\_id ≠ conversation\_id ≠ case\_id
```

* Customer identity is persistent.
* Conversation identity changes when the customer starts a new chat.
* Case identity exists only when a conversation is escalated.
* Not every conversation has a case; not every customer has one conversation.


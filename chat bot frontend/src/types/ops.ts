export type ConversationTurn = {
  turn_id: number;
  conversation_id: string;
  tenant_id: string;
  role: string;
  text: string | null;
  intent: string | null;
  confidence_score: number | null;
  retrieval_score: number | null;
  quality_gate_passed: boolean | null;
  timestamp: string;
};

export type EscalationCase = {
  case_id: string;
  tenant_id: string;
  conversation_id: string;
  customer_id: string | null;
  escalation_type: string;
  status: string;
  handoff_mode: string;
  required_information: unknown;
  provided_information: unknown;
  missing_information: unknown;
  latest_customer_message: string | null;
  case_context: Record<string, unknown> | null;
  intake_attempts: number;
  created_at: string;
  updated_at: string;
};

export type IngestionLogRow = {
  id: number;
  doc_id: string | null;
  tenant_id: string | null;
  title: string | null;
  chunk_count: number | null;
  embedding_model: string | null;
  status: string;
  error_message: string | null;
  failed_node: string | null;
  ingested_at: string;
};

export type RequestErrorRow = {
  id: string;
  tenant_id: string | null;
  error_message: string | null;
  failed_node: string | null;
  status: string | null;
  occurred_at: string | null;
};

export type TenantConfig = {
  tenant_id: string;
  tenant_name: string | null;
  industry_pack: string | null;
  confidence_threshold: number | null;
  similarity_threshold: number | null;
  classification_prompt_id: string | null;
  system_prompt_id: string | null;
  active_channels: string[] | null;
};

export type CustomerRecord = {
  customer_id: string;
  tenant_id: string;
  email: string | null;
  name: string | null;
  plan_tier: string | null;
  account_status: string | null;
  custom_fields: Record<string, unknown> | null;
};

/** A conversation summary derived from turns (+ escalation case when one exists). */
export type ConversationSummary = {
  conversation_id: string;
  customer_id: string | null;
  turn_count: number;
  created_at: string;
  last_activity: string;
  intent: string | null;
  confidence_score: number | null;
  case_id: string | null;
  case_status: string | null;
  escalated: boolean;
  /** Operational status derived only from backend data. */
  status: ConversationStatus;
};

export type ConversationStatus =
  | "AI handling"
  | "Awaiting customer"
  | "Escalated"
  | "Ready for agent"
  | "Resolved";

export type ActivityEvent = {
  id: string;
  timestamp: string;
  type:
    | "conversation_message"
    | "ai_response"
    | "escalation_created"
    | "escalation_updated"
    | "document_ingested"
    | "ingestion_failed"
    | "workflow_error";
  title: string;
  description: string | null;
  relatedLabel: string | null;
  href: string | null;
};

/** Grouped document view derived from the ingestion log. */
export type KnowledgeDocument = {
  doc_id: string;
  title: string | null;
  tenant_id: string | null;
  status: string;
  chunk_count: number | null;
  embedding_model: string | null;
  last_ingested: string;
  history: IngestionLogRow[];
};

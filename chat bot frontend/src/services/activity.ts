import { queryOptions } from "@tanstack/react-query";

import { TENANT_ID } from "@/lib/constants";
import type { ActivityEvent } from "@/types/ops";
import { fetchTurns } from "./conversations";
import { fetchEscalationCases } from "./escalations";
import { fetchIngestionLog } from "./documents";
import { fetchRequestErrors } from "./errors";

function truncate(value: string | null, max = 140) {
  if (!value) return null;
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

/** Builds a unified timeline strictly from rows the backend has written. */
export async function fetchActivity(): Promise<ActivityEvent[]> {
  const [turns, cases, ingestion, errors] = await Promise.all([
    fetchTurns(400),
    fetchEscalationCases(),
    fetchIngestionLog(100),
    fetchRequestErrors(100),
  ]);

  const events: ActivityEvent[] = [];

  for (const t of turns) {
    const isCustomer = t.role.toLowerCase() === "user" || t.role.toLowerCase() === "customer";
    events.push({
      id: `turn-${t.turn_id}`,
      timestamp: t.timestamp,
      type: isCustomer ? "conversation_message" : "ai_response",
      title: isCustomer ? "Customer message received" : "AI response generated",
      description: truncate(t.text),
      relatedLabel: `Conversation ${t.conversation_id.slice(0, 8)}`,
      href: `/conversations/${t.conversation_id}`,
    });
  }

  for (const c of cases) {
    events.push({
      id: `case-created-${c.case_id}`,
      timestamp: c.created_at,
      type: "escalation_created",
      title: `Escalation created — ${c.escalation_type}`,
      description: truncate(c.latest_customer_message),
      relatedLabel: `Case ${c.case_id.slice(0, 8)}`,
      href: `/escalations/${c.case_id}`,
    });
    if (c.updated_at !== c.created_at) {
      events.push({
        id: `case-updated-${c.case_id}`,
        timestamp: c.updated_at,
        type: "escalation_updated",
        title: `Case updated — status ${c.status}`,
        description: null,
        relatedLabel: `Case ${c.case_id.slice(0, 8)}`,
        href: `/escalations/${c.case_id}`,
      });
    }
  }

  for (const row of ingestion) {
    const failed = row.status.toLowerCase() === "failed" || row.status.toLowerCase() === "error";
    events.push({
      id: `ingest-${row.id}`,
      timestamp: row.ingested_at,
      type: failed ? "ingestion_failed" : "document_ingested",
      title: failed ? "Document ingestion failed" : "Document ingested",
      description: failed
        ? (row.error_message ?? "Ingestion failed")
        : row.chunk_count != null
          ? `${row.chunk_count} chunks indexed`
          : null,
      relatedLabel: row.title ?? row.doc_id ?? "Document",
      href: "/ingestion",
    });
  }

  for (const e of errors) {
    if (!e.occurred_at) continue;
    events.push({
      id: `error-${e.id}`,
      timestamp: e.occurred_at,
      type: "workflow_error",
      title: "Workflow error",
      description: e.error_message ?? null,
      relatedLabel: e.failed_node ?? null,
      href: "/errors",
    });
  }

  return events.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export const activityQuery = () =>
  queryOptions({
    queryKey: ["activity", TENANT_ID],
    queryFn: fetchActivity,
    staleTime: 15_000,
  });

import { queryOptions } from "@tanstack/react-query";

import { TENANT_ID } from "@/lib/constants";
import { fetchConversationSummaries } from "./conversations";
import { fetchEscalationCases } from "./escalations";
import { fetchDocuments } from "./documents";
import { fetchRequestErrors, type HealthIndicator } from "./errors";

const DAY_MS = 24 * 60 * 60 * 1000;

export type OverviewMetrics = {
  activeConversations: number;
  totalConversations: number;
  openEscalations: number;
  readyForAgent: number;
  documents: number;
  failedIngestions: number;
  recentErrors: number;
  totalErrors: number;
  health: HealthIndicator[];
};

const OPEN_STATUSES = new Set(["awaiting_customer_info", "ready_for_agent", "in_progress"]);

export async function fetchOverview(): Promise<OverviewMetrics> {
  const [conversations, cases, documents, errors] = await Promise.all([
    fetchConversationSummaries(),
    fetchEscalationCases(),
    fetchDocuments(),
    fetchRequestErrors(200),
  ]);

  const since = Date.now() - DAY_MS;
  const recentErrors = errors.filter(
    (e) => e.occurred_at && new Date(e.occurred_at).getTime() >= since,
  );
  const failedIngestions = documents.filter((d) => d.status.toLowerCase() === "failed").length;

  const health: HealthIndicator[] = [
    {
      area: "Chat API",
      state: recentErrors.length === 0 ? (conversations.length > 0 ? "healthy" : "unknown") : "degraded",
      detail:
        recentErrors.length > 0
          ? `${recentErrors.length} workflow error(s) in the last 24h`
          : conversations.length > 0
            ? "Conversation turns written, no errors logged in 24h"
            : "No conversation turns recorded yet",
    },
    {
      area: "Knowledge ingestion",
      state: documents.length === 0 ? "unknown" : failedIngestions > 0 ? "degraded" : "healthy",
      detail:
        documents.length === 0
          ? "No ingestion runs recorded"
          : failedIngestions > 0
            ? `${failedIngestions} document(s) failed ingestion`
            : `${documents.length} document(s) ingested successfully`,
    },
    {
      area: "Database",
      state: "healthy",
      detail: "Operational tables readable from this console",
    },
    {
      area: "Vector search",
      state: "unknown",
      detail: "No health signal exposed by the backend",
    },
  ];

  return {
    activeConversations: conversations.filter(
      (c) => new Date(c.last_activity).getTime() >= since,
    ).length,
    totalConversations: conversations.length,
    openEscalations: cases.filter((c) => OPEN_STATUSES.has(c.status.toLowerCase())).length,
    readyForAgent: cases.filter((c) => c.status.toLowerCase() === "ready_for_agent").length,
    documents: documents.length,
    failedIngestions,
    recentErrors: recentErrors.length,
    totalErrors: errors.length,
    health,
  };
}

export const overviewQuery = () =>
  queryOptions({
    queryKey: ["overview", TENANT_ID],
    queryFn: fetchOverview,
    staleTime: 15_000,
  });

import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { TENANT_ID } from "@/lib/constants";
import type { RequestErrorRow } from "@/types/ops";

export async function fetchRequestErrors(limit = 200): Promise<RequestErrorRow[]> {
  const { data, error } = await supabase
    .from("request_errors")
    .select("id, tenant_id, error_message, failed_node, status, occurred_at")
    .eq("tenant_id", TENANT_ID)
    .order("occurred_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as RequestErrorRow[];
}

export const requestErrorsQuery = () =>
  queryOptions({
    queryKey: ["request-errors", TENANT_ID],
    queryFn: () => fetchRequestErrors(),
    staleTime: 10_000,
  });

/**
 * Health is derived only from real backend signals: recent failures in the
 * ingestion log / error log, and whether the tables can be read at all.
 * Anything we cannot observe is reported as unknown rather than "Operational".
 */
export type HealthState = "healthy" | "degraded" | "unknown";

export type HealthIndicator = {
  area: string;
  state: HealthState;
  detail: string;
};

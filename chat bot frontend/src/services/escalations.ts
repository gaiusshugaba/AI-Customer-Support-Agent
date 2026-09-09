import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { TENANT_ID } from "@/lib/constants";
import type { EscalationCase } from "@/types/ops";

export async function fetchEscalationCases(): Promise<EscalationCase[]> {
  const { data, error } = await supabase
    .from("escalation_cases")
    .select("*")
    .eq("tenant_id", TENANT_ID)
    .order("updated_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return (data ?? []) as EscalationCase[];
}

export async function fetchEscalationCase(caseId: string): Promise<EscalationCase | null> {
  const { data, error } = await supabase
    .from("escalation_cases")
    .select("*")
    .eq("case_id", caseId)
    .limit(1);
  if (error) throw new Error(error.message);
  return ((data ?? [])[0] ?? null) as EscalationCase | null;
}

export const escalationsQuery = () =>
  queryOptions({
    queryKey: ["escalations", TENANT_ID],
    queryFn: fetchEscalationCases,
    staleTime: 15_000,
  });

export const escalationCaseQuery = (caseId: string) =>
  queryOptions({
    queryKey: ["escalation", caseId],
    queryFn: () => fetchEscalationCase(caseId),
    staleTime: 10_000,
  });

/** Normalises the JSONB information arrays the backend stores on a case. */
export function infoList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const rec = item as Record<string, unknown>;
          const label = rec["label"] ?? rec["name"] ?? rec["field"] ?? rec["key"];
          if (typeof label === "string") return label;
        }
        return null;
      })
      .filter((v): v is string => Boolean(v));
  }
  return [];
}

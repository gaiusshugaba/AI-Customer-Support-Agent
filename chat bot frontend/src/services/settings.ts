import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { TENANT_ID } from "@/lib/constants";
import type { TenantConfig } from "@/types/ops";

export async function fetchTenantConfig(): Promise<TenantConfig | null> {
  const { data, error } = await supabase
    .from("tenant_config")
    .select("*")
    .eq("tenant_id", TENANT_ID)
    .limit(1);
  if (error) throw new Error(error.message);
  return ((data ?? [])[0] ?? null) as TenantConfig | null;
}

export const tenantConfigQuery = () =>
  queryOptions({
    queryKey: ["tenant-config", TENANT_ID],
    queryFn: fetchTenantConfig,
    staleTime: 300_000,
  });

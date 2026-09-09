import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { CustomerRecord } from "@/types/ops";

/**
 * Customer account context. The backend may not expose this table to the
 * console's read role — in that case we resolve to null and the UI shows an
 * explicit "unavailable" state instead of inventing customer data.
 */
export async function fetchCustomer(customerId: string): Promise<CustomerRecord | null> {
  const { data, error } = await supabase
    .from("customers")
    .select("customer_id, tenant_id, email, name, plan_tier, account_status, custom_fields")
    .eq("customer_id", customerId)
    .limit(1);
  if (error) return null;
  return ((data ?? [])[0] ?? null) as CustomerRecord | null;
}

export const customerQuery = (customerId: string | null) =>
  queryOptions({
    queryKey: ["customer", customerId],
    queryFn: () => (customerId ? fetchCustomer(customerId) : Promise.resolve(null)),
    enabled: Boolean(customerId),
    staleTime: 60_000,
  });

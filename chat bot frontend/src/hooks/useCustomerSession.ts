import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import { resolveTenantId } from "@/lib/constants";
import { customerProfileQuery } from "@/services/customer-chat";

/**
 * AUTH SESSION → CUSTOMER PROFILE → TENANT.
 * The Supabase session is the single source of truth for customer identity;
 * `customer_id` is always the authenticated user's ID.
 */
export function useCustomerSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next ?? null);
      setReady(true);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const userId = session?.user?.id ?? null;
  const email = session?.user?.email ?? null;
  const profile = useQuery(customerProfileQuery(userId, email));

  return {
    ready,
    session,
    userId,
    email,
    customer: profile.data ?? null,
    profileLoading: profile.isLoading,
    profileError: profile.isError ? (profile.error as Error).message : null,
    tenantId: resolveTenantId(profile.data?.tenant_id ?? null),
  };
}

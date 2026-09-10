import { f as supabase } from "./client-CjaA9JUL.mjs";
import { n as queryOptions } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/customers-KXWArV0J.js
/**
* Customer account context. The backend may not expose this table to the
* console's read role — in that case we resolve to null and the UI shows an
* explicit "unavailable" state instead of inventing customer data.
*/
async function fetchCustomer(customerId) {
	const { data, error } = await supabase.from("customers").select("customer_id, tenant_id, email, name, plan_tier, account_status, custom_fields").eq("customer_id", customerId).limit(1);
	if (error) return null;
	return (data ?? [])[0] ?? null;
}
var customerQuery = (customerId) => queryOptions({
	queryKey: ["customer", customerId],
	queryFn: () => customerId ? fetchCustomer(customerId) : Promise.resolve(null),
	enabled: Boolean(customerId),
	staleTime: 6e4
});
//#endregion
export { customerQuery as t };

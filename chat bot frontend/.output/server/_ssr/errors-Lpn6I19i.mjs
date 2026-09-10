import { a as TENANT_ID, f as supabase } from "./client-CjaA9JUL.mjs";
import { n as queryOptions } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/errors-Lpn6I19i.js
async function fetchRequestErrors(limit = 200) {
	const { data, error } = await supabase.from("request_errors").select("id, tenant_id, error_message, failed_node, status, occurred_at").eq("tenant_id", TENANT_ID).order("occurred_at", { ascending: false }).limit(limit);
	if (error) throw new Error(error.message);
	return data ?? [];
}
var requestErrorsQuery = () => queryOptions({
	queryKey: ["request-errors", TENANT_ID],
	queryFn: () => fetchRequestErrors(),
	staleTime: 1e4
});
//#endregion
export { requestErrorsQuery as n, fetchRequestErrors as t };

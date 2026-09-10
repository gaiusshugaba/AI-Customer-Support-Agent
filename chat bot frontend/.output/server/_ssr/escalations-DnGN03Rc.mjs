import { a as TENANT_ID, f as supabase } from "./client-CjaA9JUL.mjs";
import { n as queryOptions } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/escalations-DnGN03Rc.js
async function fetchEscalationCases() {
	const { data, error } = await supabase.from("escalation_cases").select("*").eq("tenant_id", TENANT_ID).order("updated_at", { ascending: false }).limit(200);
	if (error) throw new Error(error.message);
	return data ?? [];
}
async function fetchEscalationCase(caseId) {
	const { data, error } = await supabase.from("escalation_cases").select("*").eq("case_id", caseId).limit(1);
	if (error) throw new Error(error.message);
	return (data ?? [])[0] ?? null;
}
var escalationsQuery = () => queryOptions({
	queryKey: ["escalations", TENANT_ID],
	queryFn: fetchEscalationCases,
	staleTime: 15e3
});
var escalationCaseQuery = (caseId) => queryOptions({
	queryKey: ["escalation", caseId],
	queryFn: () => fetchEscalationCase(caseId),
	staleTime: 1e4
});
/** Normalises the JSONB information arrays the backend stores on a case. */
function infoList(value) {
	if (Array.isArray(value)) return value.map((item) => {
		if (typeof item === "string") return item;
		if (item && typeof item === "object") {
			const rec = item;
			const label = rec["label"] ?? rec["name"] ?? rec["field"] ?? rec["key"];
			if (typeof label === "string") return label;
		}
		return null;
	}).filter((v) => Boolean(v));
	return [];
}
//#endregion
export { infoList as i, escalationsQuery as n, fetchEscalationCases as r, escalationCaseQuery as t };

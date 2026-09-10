import { a as TENANT_ID, f as supabase } from "./client-CjaA9JUL.mjs";
import { n as queryOptions } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/conversations-BmcuG-c7.js
var TURN_COLUMNS = "turn_id, conversation_id, tenant_id, role, text, intent, confidence_score, retrieval_score, quality_gate_passed, timestamp";
function caseStatusToConversationStatus(status) {
	switch (status.toLowerCase()) {
		case "awaiting_customer_info": return "Awaiting customer";
		case "ready_for_agent": return "Ready for agent";
		case "resolved":
		case "closed": return "Resolved";
		default: return "Escalated";
	}
}
async function fetchTurns(limit = 1e3) {
	const { data, error } = await supabase.from("conversation_turns").select(TURN_COLUMNS).eq("tenant_id", TENANT_ID).order("timestamp", { ascending: false }).limit(limit);
	if (error) throw new Error(error.message);
	return data ?? [];
}
async function fetchConversationSummaries() {
	const [turns, casesResult] = await Promise.all([fetchTurns(), supabase.from("escalation_cases").select("*").eq("tenant_id", TENANT_ID).order("updated_at", { ascending: false })]);
	if (casesResult.error) throw new Error(casesResult.error.message);
	const cases = casesResult.data ?? [];
	const caseByConversation = /* @__PURE__ */ new Map();
	for (const c of cases) if (!caseByConversation.has(c.conversation_id)) caseByConversation.set(c.conversation_id, c);
	const grouped = /* @__PURE__ */ new Map();
	for (const t of turns) {
		const list = grouped.get(t.conversation_id);
		if (list) list.push(t);
		else grouped.set(t.conversation_id, [t]);
	}
	const summaries = [];
	for (const [conversation_id, list] of grouped) {
		const ordered = [...list].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
		const first = ordered[0];
		const last = ordered[ordered.length - 1];
		const withIntent = [...ordered].reverse().find((t) => t.intent);
		const kase = caseByConversation.get(conversation_id) ?? null;
		summaries.push({
			conversation_id,
			customer_id: kase?.customer_id ?? null,
			turn_count: ordered.length,
			created_at: first.timestamp,
			last_activity: last.timestamp,
			intent: withIntent?.intent ?? null,
			confidence_score: withIntent?.confidence_score ?? null,
			case_id: kase?.case_id ?? null,
			case_status: kase?.status ?? null,
			escalated: Boolean(kase),
			status: kase ? caseStatusToConversationStatus(kase.status) : "AI handling"
		});
	}
	for (const c of cases) {
		if (grouped.has(c.conversation_id)) continue;
		summaries.push({
			conversation_id: c.conversation_id,
			customer_id: c.customer_id,
			turn_count: 0,
			created_at: c.created_at,
			last_activity: c.updated_at,
			intent: null,
			confidence_score: null,
			case_id: c.case_id,
			case_status: c.status,
			escalated: true,
			status: caseStatusToConversationStatus(c.status)
		});
	}
	return summaries.sort((a, b) => b.last_activity.localeCompare(a.last_activity));
}
async function fetchConversationDetail(conversationId) {
	const [turnsResult, caseResult] = await Promise.all([supabase.from("conversation_turns").select(TURN_COLUMNS).eq("conversation_id", conversationId).order("timestamp", { ascending: true }), supabase.from("escalation_cases").select("*").eq("conversation_id", conversationId).order("updated_at", { ascending: false }).limit(1)]);
	if (turnsResult.error) throw new Error(turnsResult.error.message);
	if (caseResult.error) throw new Error(caseResult.error.message);
	return {
		turns: turnsResult.data ?? [],
		escalationCase: (caseResult.data ?? [])[0] ?? null
	};
}
var conversationsQuery = () => queryOptions({
	queryKey: ["conversations", TENANT_ID],
	queryFn: fetchConversationSummaries,
	staleTime: 15e3
});
var liveConversationsQuery = () => queryOptions({
	queryKey: [
		"conversations",
		TENANT_ID,
		"live"
	],
	queryFn: fetchConversationSummaries,
	staleTime: 5e3,
	refetchInterval: 15e3
});
var conversationDetailQuery = (conversationId) => queryOptions({
	queryKey: ["conversation", conversationId],
	queryFn: () => fetchConversationDetail(conversationId),
	staleTime: 5e3
});
//#endregion
export { liveConversationsQuery as a, fetchTurns as i, conversationsQuery as n, fetchConversationSummaries as r, conversationDetailQuery as t };

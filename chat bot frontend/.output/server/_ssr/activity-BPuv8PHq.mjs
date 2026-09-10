import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as formatRelative, r as formatDateTime } from "./format-Dd0mwkMk.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { D as FileCheckCorner, T as FileXCorner, _ as MessageSquare, c as ShieldCheck, i as TriangleAlert, l as ShieldAlert, z as Bot } from "../_libs/lucide-react.mjs";
import { a as TENANT_ID } from "./client-CjaA9JUL.mjs";
import { n as queryOptions } from "../_libs/tanstack__react-query.mjs";
import { i as fetchTurns } from "./conversations-BmcuG-c7.mjs";
import { r as fetchEscalationCases } from "./escalations-DnGN03Rc.mjs";
import { r as fetchIngestionLog } from "./documents-lEEtZsWI.mjs";
import { t as fetchRequestErrors } from "./errors-Lpn6I19i.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/activity-BPuv8PHq.js
var import_jsx_runtime = require_jsx_runtime();
var ICONS = {
	conversation_message: MessageSquare,
	ai_response: Bot,
	escalation_created: ShieldAlert,
	escalation_updated: ShieldCheck,
	document_ingested: FileCheckCorner,
	ingestion_failed: FileXCorner,
	workflow_error: TriangleAlert
};
var TONE = {
	conversation_message: "text-muted-foreground",
	ai_response: "text-primary",
	escalation_created: "text-warning",
	escalation_updated: "text-info",
	document_ingested: "text-success",
	ingestion_failed: "text-destructive",
	workflow_error: "text-destructive"
};
function ActivityTimeline({ events }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
		className: "divide-y divide-border",
		children: events.map((e) => {
			const Icon = ICONS[e.type];
			const body = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 items-start gap-3 px-4 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						className: `mt-0.5 h-4 w-4 shrink-0 ${TONE[e.type]}`,
						"aria-hidden": true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-baseline gap-x-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: e.title
							}), e.relatedLabel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[11px] text-muted-foreground",
								children: e.relatedLabel
							})]
						}), e.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 line-clamp-2 text-sm text-muted-foreground",
							children: e.description
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {
						dateTime: e.timestamp,
						title: formatDateTime(e.timestamp),
						className: "shrink-0 text-xs whitespace-nowrap text-muted-foreground",
						children: formatRelative(e.timestamp)
					})
				]
			});
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: e.href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: e.href,
				className: "block transition-colors hover:bg-accent/50",
				children: body
			}) : body }, e.id);
		})
	});
}
function truncate(value, max = 140) {
	if (!value) return null;
	return value.length > max ? `${value.slice(0, max)}…` : value;
}
/** Builds a unified timeline strictly from rows the backend has written. */
async function fetchActivity() {
	const [turns, cases, ingestion, errors] = await Promise.all([
		fetchTurns(400),
		fetchEscalationCases(),
		fetchIngestionLog(100),
		fetchRequestErrors(100)
	]);
	const events = [];
	for (const t of turns) {
		const isCustomer = t.role.toLowerCase() === "user" || t.role.toLowerCase() === "customer";
		events.push({
			id: `turn-${t.turn_id}`,
			timestamp: t.timestamp,
			type: isCustomer ? "conversation_message" : "ai_response",
			title: isCustomer ? "Customer message received" : "AI response generated",
			description: truncate(t.text),
			relatedLabel: `Conversation ${t.conversation_id.slice(0, 8)}`,
			href: `/conversations/${t.conversation_id}`
		});
	}
	for (const c of cases) {
		events.push({
			id: `case-created-${c.case_id}`,
			timestamp: c.created_at,
			type: "escalation_created",
			title: `Escalation created — ${c.escalation_type}`,
			description: truncate(c.latest_customer_message),
			relatedLabel: `Case ${c.case_id.slice(0, 8)}`,
			href: `/escalations/${c.case_id}`
		});
		if (c.updated_at !== c.created_at) events.push({
			id: `case-updated-${c.case_id}`,
			timestamp: c.updated_at,
			type: "escalation_updated",
			title: `Case updated — status ${c.status}`,
			description: null,
			relatedLabel: `Case ${c.case_id.slice(0, 8)}`,
			href: `/escalations/${c.case_id}`
		});
	}
	for (const row of ingestion) {
		const failed = row.status.toLowerCase() === "failed" || row.status.toLowerCase() === "error";
		events.push({
			id: `ingest-${row.id}`,
			timestamp: row.ingested_at,
			type: failed ? "ingestion_failed" : "document_ingested",
			title: failed ? "Document ingestion failed" : "Document ingested",
			description: failed ? row.error_message ?? "Ingestion failed" : row.chunk_count != null ? `${row.chunk_count} chunks indexed` : null,
			relatedLabel: row.title ?? row.doc_id ?? "Document",
			href: "/ingestion"
		});
	}
	for (const e of errors) {
		if (!e.occurred_at) continue;
		events.push({
			id: `error-${e.id}`,
			timestamp: e.occurred_at,
			type: "workflow_error",
			title: "Workflow error",
			description: e.error_message ?? null,
			relatedLabel: e.failed_node ?? null,
			href: "/errors"
		});
	}
	return events.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}
var activityQuery = () => queryOptions({
	queryKey: ["activity", TENANT_ID],
	queryFn: fetchActivity,
	staleTime: 15e3
});
//#endregion
export { activityQuery as n, ActivityTimeline as t };

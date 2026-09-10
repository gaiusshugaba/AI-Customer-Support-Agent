import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { N as CircleQuestionMark, P as CircleCheck, i as TriangleAlert } from "../_libs/lucide-react.mjs";
import { t as Card } from "./Primitives-CaxSyH9b.mjs";
import { a as TENANT_ID } from "./client-CjaA9JUL.mjs";
import { n as queryOptions } from "../_libs/tanstack__react-query.mjs";
import { r as fetchConversationSummaries } from "./conversations-BmcuG-c7.mjs";
import { r as fetchEscalationCases } from "./escalations-DnGN03Rc.mjs";
import { n as fetchDocuments } from "./documents-lEEtZsWI.mjs";
import { t as fetchRequestErrors } from "./errors-Lpn6I19i.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/overview-2oEmZITZ.js
var import_jsx_runtime = require_jsx_runtime();
var CONFIG = {
	healthy: {
		Icon: CircleCheck,
		label: "Healthy",
		className: "text-success"
	},
	degraded: {
		Icon: TriangleAlert,
		label: "Degraded",
		className: "text-destructive"
	},
	unknown: {
		Icon: CircleQuestionMark,
		label: "No signal",
		className: "text-muted-foreground"
	}
};
var AREA_LINKS = {
	"Chat API": "/live-chats",
	"Knowledge ingestion": "/ingestion",
	Database: "/errors",
	"Vector search": "/documents"
};
function HealthList({ indicators }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
		children: indicators.map((h) => {
			const { Icon, label, className } = CONFIG[h.state];
			const to = AREA_LINKS[h.area];
			const card = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "h-full gap-1 p-4 transition-colors hover:border-primary/40 hover:bg-accent/40",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							className: `h-4 w-4 ${className}`,
							"aria-hidden": true
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: h.area
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `text-xs font-semibold uppercase tracking-wide ${className}`,
						children: label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: h.detail
					})
				]
			});
			return to ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to,
				className: "block rounded-xl",
				children: card
			}, h.area) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: card }, h.area);
		})
	});
}
var DAY_MS = 864e5;
var OPEN_STATUSES = /* @__PURE__ */ new Set([
	"awaiting_customer_info",
	"ready_for_agent",
	"in_progress"
]);
async function fetchOverview() {
	const [conversations, cases, documents, errors] = await Promise.all([
		fetchConversationSummaries(),
		fetchEscalationCases(),
		fetchDocuments(),
		fetchRequestErrors(200)
	]);
	const since = Date.now() - DAY_MS;
	const recentErrors = errors.filter((e) => e.occurred_at && new Date(e.occurred_at).getTime() >= since);
	const failedIngestions = documents.filter((d) => d.status.toLowerCase() === "failed").length;
	const health = [
		{
			area: "Chat API",
			state: recentErrors.length === 0 ? conversations.length > 0 ? "healthy" : "unknown" : "degraded",
			detail: recentErrors.length > 0 ? `${recentErrors.length} workflow error(s) in the last 24h` : conversations.length > 0 ? "Conversation turns written, no errors logged in 24h" : "No conversation turns recorded yet"
		},
		{
			area: "Knowledge ingestion",
			state: documents.length === 0 ? "unknown" : failedIngestions > 0 ? "degraded" : "healthy",
			detail: documents.length === 0 ? "No ingestion runs recorded" : failedIngestions > 0 ? `${failedIngestions} document(s) failed ingestion` : `${documents.length} document(s) ingested successfully`
		},
		{
			area: "Database",
			state: "healthy",
			detail: "Operational tables readable from this console"
		},
		{
			area: "Vector search",
			state: "unknown",
			detail: "No health signal exposed by the backend"
		}
	];
	return {
		activeConversations: conversations.filter((c) => new Date(c.last_activity).getTime() >= since).length,
		totalConversations: conversations.length,
		openEscalations: cases.filter((c) => OPEN_STATUSES.has(c.status.toLowerCase())).length,
		readyForAgent: cases.filter((c) => c.status.toLowerCase() === "ready_for_agent").length,
		documents: documents.length,
		failedIngestions,
		recentErrors: recentErrors.length,
		totalErrors: errors.length,
		health
	};
}
var overviewQuery = () => queryOptions({
	queryKey: ["overview", TENANT_ID],
	queryFn: fetchOverview,
	staleTime: 15e3
});
//#endregion
export { overviewQuery as n, HealthList as t };

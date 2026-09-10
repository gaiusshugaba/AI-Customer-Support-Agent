import { n as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { s as PageHeader } from "./Primitives-CaxSyH9b.mjs";
import { t as AdminShell } from "./AdminShell-CON-VFuj.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as conversationsQuery } from "./conversations-BmcuG-c7.mjs";
import { i as SelectFilter, n as FilterBar, r as SearchFilter, t as ALL } from "./Filters-D3xjA51g.mjs";
import { t as ConversationTable } from "./live-chats-BZmg40bL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/conversations-DpRN26Kb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var RANGES = {
	"Last 24 hours": 864e5,
	"Last 7 days": 6048e5,
	"Last 30 days": 2592e6
};
function ConversationsPage() {
	const query = useQuery(conversationsQuery());
	const [search, setSearch] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)(ALL);
	const [intent, setIntent] = (0, import_react.useState)(ALL);
	const [escalated, setEscalated] = (0, import_react.useState)(ALL);
	const [range, setRange] = (0, import_react.useState)(ALL);
	const rows = query.data ?? [];
	const intents = (0, import_react.useMemo)(() => [...new Set(rows.map((r) => r.intent).filter((v) => Boolean(v)))], [rows]);
	const statuses = (0, import_react.useMemo)(() => [...new Set(rows.map((r) => r.status))], [rows]);
	const filtered = (0, import_react.useMemo)(() => {
		const cutoff = range === "__all__" ? null : RANGES[range];
		return rows.filter((r) => {
			if (cutoff && Date.now() - new Date(r.created_at).getTime() > cutoff) return false;
			if (status !== "__all__" && r.status !== status) return false;
			if (intent !== "__all__" && r.intent !== intent) return false;
			if (escalated === "Escalated" && !r.escalated) return false;
			if (escalated === "Not escalated" && r.escalated) return false;
			if (search) {
				if (!`${r.conversation_id} ${r.customer_id ?? ""} ${r.case_id ?? ""} ${r.intent ?? ""}`.toLowerCase().includes(search)) return false;
			}
			return true;
		});
	}, [
		rows,
		search,
		status,
		intent,
		escalated,
		range
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4 p-4 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Conversations",
				subtitle: "Search and review conversations handled by the support assistant."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FilterBar, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchFilter, {
					label: "Search",
					placeholder: "Conversation, customer or case ID…",
					onChange: setSearch
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectFilter, {
					label: "Date range",
					value: range,
					onChange: setRange,
					options: Object.keys(RANGES),
					allLabel: "All time"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectFilter, {
					label: "Intent",
					value: intent,
					onChange: setIntent,
					options: intents
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectFilter, {
					label: "Status",
					value: status,
					onChange: setStatus,
					options: statuses
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectFilter, {
					label: "Escalated",
					value: escalated,
					onChange: setEscalated,
					options: ["Escalated", "Not escalated"]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConversationTable, {
				rows: filtered,
				loading: query.isLoading,
				error: query.isError ? query.error.message : null,
				onRetry: () => query.refetch(),
				showCreated: true,
				emptyTitle: "No conversations found",
				emptyDescription: "Conversations recorded by the support workflows will appear here."
			})
		]
	}) });
}
//#endregion
export { ConversationsPage as component };

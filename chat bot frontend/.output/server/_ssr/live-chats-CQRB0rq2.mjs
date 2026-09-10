import { n as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as formatRelative, o as humanize, s as shortId } from "./format-Dd0mwkMk.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as TableSkeleton, f as Th, n as EmptyState, o as Mono, r as ErrorState, s as PageHeader, u as TableShell } from "./Primitives-CaxSyH9b.mjs";
import { t as AdminShell } from "./AdminShell-CON-VFuj.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as liveConversationsQuery } from "./conversations-BmcuG-c7.mjs";
import { i as SelectFilter, n as FilterBar, r as SearchFilter, t as ALL } from "./Filters-D3xjA51g.mjs";
import { t as StatusBadge } from "./StatusBadge-C60_2PoF.mjs";
import { t as Badge } from "./badge-CvJ3zOG3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/live-chats-CQRB0rq2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TIME_WINDOWS = {
	"Last hour": 36e5,
	"Last 24 hours": 864e5,
	"Last 7 days": 6048e5
};
function LiveChatsPage() {
	const query = useQuery(liveConversationsQuery());
	const [search, setSearch] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)(ALL);
	const [intent, setIntent] = (0, import_react.useState)(ALL);
	const [escalation, setEscalation] = (0, import_react.useState)(ALL);
	const [window, setWindow] = (0, import_react.useState)("Last 24 hours");
	const rows = query.data ?? [];
	const intents = (0, import_react.useMemo)(() => [...new Set(rows.map((r) => r.intent).filter((v) => Boolean(v)))], [rows]);
	const statuses = (0, import_react.useMemo)(() => [...new Set(rows.map((r) => r.status))], [rows]);
	const filtered = (0, import_react.useMemo)(() => {
		const cutoff = TIME_WINDOWS[window];
		return rows.filter((r) => {
			if (cutoff && Date.now() - new Date(r.last_activity).getTime() > cutoff) return false;
			if (status !== "__all__" && r.status !== status) return false;
			if (intent !== "__all__" && r.intent !== intent) return false;
			if (escalation === "Escalated" && !r.escalated) return false;
			if (escalation === "Not escalated" && r.escalated) return false;
			if (search) {
				if (!`${r.conversation_id} ${r.customer_id ?? ""} ${r.intent ?? ""}`.toLowerCase().includes(search)) return false;
			}
			return true;
		});
	}, [
		rows,
		search,
		status,
		intent,
		escalation,
		window
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4 p-4 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Live Chats",
				subtitle: "Monitor conversations currently being handled by the AI support assistant."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FilterBar, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchFilter, {
					label: "Customer / conversation",
					placeholder: "Search by ID or intent…",
					onChange: setSearch
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectFilter, {
					label: "Status",
					value: status,
					onChange: setStatus,
					options: statuses
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectFilter, {
					label: "Intent",
					value: intent,
					onChange: setIntent,
					options: intents
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectFilter, {
					label: "Escalation",
					value: escalation,
					onChange: setEscalation,
					options: ["Escalated", "Not escalated"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectFilter, {
					label: "Time",
					value: window,
					onChange: setWindow,
					options: Object.keys(TIME_WINDOWS),
					allLabel: "Any time"
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConversationTable, {
				rows: filtered,
				loading: query.isLoading,
				error: query.isError ? query.error.message : null,
				onRetry: () => query.refetch(),
				emptyTitle: "No live conversations in this window",
				emptyDescription: "Conversations appear here as soon as the AI support workflow records a turn."
			})
		]
	}) });
}
function ConversationTable({ rows, loading, error, onRetry, emptyTitle, emptyDescription, showCreated }) {
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
		message: error,
		onRetry
	}) }) }) }) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
		className: "bg-muted/50",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Customer" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Conversation" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Intent" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Status" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Last activity" }),
			showCreated && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Created" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Escalation" })
		] })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableSkeleton, { cols: showCreated ? 7 : 6 }) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
		className: "border-t border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
			colSpan: showCreated ? 7 : 6,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: emptyTitle,
				description: emptyDescription
			})
		})
	}) : rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
		className: "border-t border-border hover:bg-accent/40",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "px-4 py-2.5",
				children: r.customer_id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, { children: shortId(r.customer_id, 12) }) : "—"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
				className: "px-4 py-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/conversations/$conversationId",
					params: { conversationId: r.conversation_id },
					className: "font-mono text-xs text-primary hover:underline",
					children: shortId(r.conversation_id, 12)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "ml-2 text-xs text-muted-foreground",
					children: [r.turn_count, " turns"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "px-4 py-2.5",
				children: humanize(r.intent)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "px-4 py-2.5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: r.status })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "px-4 py-2.5 whitespace-nowrap text-muted-foreground",
				children: formatRelative(r.last_activity)
			}),
			showCreated && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "px-4 py-2.5 whitespace-nowrap text-muted-foreground",
				children: formatRelative(r.created_at)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "px-4 py-2.5",
				children: r.case_id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/escalations/$caseId",
					params: { caseId: r.case_id },
					className: "inline-flex",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						className: "cursor-pointer",
						children: ["Case ", shortId(r.case_id)]
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-muted-foreground",
					children: "No case"
				})
			})
		]
	}, r.conversation_id)) })] });
}
//#endregion
export { ConversationTable, LiveChatsPage as component };

import { n as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as formatRelative, o as humanize, s as shortId } from "./format-Dd0mwkMk.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as TableSkeleton, f as Th, n as EmptyState, o as Mono, r as ErrorState, s as PageHeader, u as TableShell } from "./Primitives-CaxSyH9b.mjs";
import { t as AdminShell } from "./AdminShell-CON-VFuj.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { i as infoList, n as escalationsQuery } from "./escalations-DnGN03Rc.mjs";
import { i as SelectFilter, n as FilterBar, r as SearchFilter, t as ALL } from "./Filters-D3xjA51g.mjs";
import { t as StatusBadge } from "./StatusBadge-C60_2PoF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/escalations-DS3Mjf5s.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function EscalationsPage() {
	const query = useQuery(escalationsQuery());
	const [search, setSearch] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)(ALL);
	const [type, setType] = (0, import_react.useState)(ALL);
	const [mode, setMode] = (0, import_react.useState)(ALL);
	const rows = query.data ?? [];
	const statuses = (0, import_react.useMemo)(() => [...new Set(rows.map((r) => r.status))], [rows]);
	const types = (0, import_react.useMemo)(() => [...new Set(rows.map((r) => r.escalation_type))], [rows]);
	const modes = (0, import_react.useMemo)(() => [...new Set(rows.map((r) => r.handoff_mode))], [rows]);
	const filtered = (0, import_react.useMemo)(() => rows.filter((r) => {
		if (status !== "__all__" && r.status !== status) return false;
		if (type !== "__all__" && r.escalation_type !== type) return false;
		if (mode !== "__all__" && r.handoff_mode !== mode) return false;
		if (search) {
			if (!`${r.case_id} ${r.conversation_id} ${r.customer_id ?? ""} ${r.latest_customer_message ?? ""}`.toLowerCase().includes(search)) return false;
		}
		return true;
	}), [
		rows,
		search,
		status,
		type,
		mode
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4 p-4 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Escalations",
				subtitle: "Cases the assistant handed off, with intake progress and missing information."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FilterBar, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchFilter, {
					label: "Search",
					placeholder: "Case, conversation or customer…",
					onChange: setSearch
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectFilter, {
					label: "Status",
					value: status,
					onChange: setStatus,
					options: statuses
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectFilter, {
					label: "Type",
					value: type,
					onChange: setType,
					options: types
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectFilter, {
					label: "Handoff mode",
					value: mode,
					onChange: setMode,
					options: modes
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "bg-muted/50",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Case" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Type" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Status" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Customer" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Missing info" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Attempts" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Updated" })
				] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: query.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				colSpan: 7,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
					message: query.error.message,
					onRetry: () => query.refetch()
				})
			}) }) : query.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableSkeleton, { cols: 7 }) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
				className: "border-t border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					colSpan: 7,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						title: "No escalation cases",
						description: "Cases appear here when the assistant escalates a conversation."
					})
				})
			}) : filtered.map((r) => {
				const missing = infoList(r.missing_information);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-border hover:bg-accent/40",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/escalations/$caseId",
								params: { caseId: r.case_id },
								className: "font-mono text-xs text-primary hover:underline",
								children: shortId(r.case_id, 12)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/conversations/$conversationId",
								params: { conversationId: r.conversation_id },
								className: "mt-0.5 block text-[11px] text-muted-foreground hover:text-foreground hover:underline",
								children: "View conversation"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-2.5",
							children: humanize(r.escalation_type)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-2.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: r.status })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-2.5",
							children: r.customer_id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, { children: shortId(r.customer_id, 12) }) : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-2.5 text-muted-foreground",
							children: missing.length === 0 ? "None" : `${missing.length} item(s)`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-2.5 tabular-nums",
							children: r.intake_attempts
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-2.5 whitespace-nowrap text-muted-foreground",
							children: formatRelative(r.updated_at)
						})
					]
				}, r.case_id);
			}) })] })
		]
	}) });
}
//#endregion
export { EscalationsPage as component };

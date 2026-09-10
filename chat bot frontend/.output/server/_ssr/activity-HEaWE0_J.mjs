import { n as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { o as humanize } from "./format-Dd0mwkMk.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as Skeleton, n as EmptyState, r as ErrorState, s as PageHeader, t as Card } from "./Primitives-CaxSyH9b.mjs";
import { t as AdminShell } from "./AdminShell-CON-VFuj.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as activityQuery, t as ActivityTimeline } from "./activity-BPuv8PHq.mjs";
import { i as SelectFilter, n as FilterBar, r as SearchFilter, t as ALL } from "./Filters-D3xjA51g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/activity-HEaWE0_J.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TYPES = [
	"conversation_message",
	"ai_response",
	"escalation_created",
	"escalation_updated",
	"document_ingested",
	"ingestion_failed",
	"workflow_error"
];
function ActivityPage() {
	const query = useQuery(activityQuery());
	const [search, setSearch] = (0, import_react.useState)("");
	const [type, setType] = (0, import_react.useState)(ALL);
	const events = query.data ?? [];
	const filtered = (0, import_react.useMemo)(() => events.filter((e) => {
		if (type !== "__all__" && e.type !== type) return false;
		if (search) {
			if (!`${e.title} ${e.description ?? ""} ${e.relatedLabel ?? ""}`.toLowerCase().includes(search)) return false;
		}
		return true;
	}), [
		events,
		search,
		type
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4 p-4 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/overview",
					className: "text-sm font-medium text-primary hover:underline",
					children: "Overview"
				}),
				title: "System Activity",
				subtitle: "Every event recorded by the AI support backend, newest first."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FilterBar, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchFilter, {
				label: "Search",
				placeholder: "Event text or ID…",
				onChange: setSearch
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectFilter, {
				label: "Event type",
				value: type,
				onChange: setType,
				options: TYPES,
				allLabel: "All events"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "p-0",
				children: query.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
					message: query.error.message,
					onRetry: () => query.refetch()
				}) : query.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3 p-4",
					children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full" }, i))
				}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "No activity recorded",
					description: "Events appear here once the support workflows write to the backend."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivityTimeline, { events: filtered })
			}),
			filtered.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: [
					"Showing ",
					filtered.length,
					" of ",
					events.length,
					" events",
					type !== "__all__" ? ` · ${humanize(type)}` : ""
				]
			})
		]
	}) });
}
//#endregion
export { ActivityPage as component };

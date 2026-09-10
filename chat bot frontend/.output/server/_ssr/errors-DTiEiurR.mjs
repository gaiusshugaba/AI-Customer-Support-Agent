import { n as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { r as formatDateTime } from "./format-Dd0mwkMk.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as SectionTitle, d as TableSkeleton, f as Th, l as Skeleton, n as EmptyState, r as ErrorState, s as PageHeader, u as TableShell } from "./Primitives-CaxSyH9b.mjs";
import { t as AdminShell } from "./AdminShell-CON-VFuj.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as requestErrorsQuery } from "./errors-Lpn6I19i.mjs";
import { i as SelectFilter, n as FilterBar, r as SearchFilter, t as ALL } from "./Filters-D3xjA51g.mjs";
import { t as StatusBadge } from "./StatusBadge-C60_2PoF.mjs";
import { n as overviewQuery, t as HealthList } from "./overview-2oEmZITZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/errors-DTiEiurR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ErrorsPage() {
	const query = useQuery(requestErrorsQuery());
	const metrics = useQuery(overviewQuery());
	const [search, setSearch] = (0, import_react.useState)("");
	const [node, setNode] = (0, import_react.useState)(ALL);
	const rows = query.data ?? [];
	const nodes = (0, import_react.useMemo)(() => [...new Set(rows.map((r) => r.failed_node).filter((v) => Boolean(v)))], [rows]);
	const filtered = (0, import_react.useMemo)(() => rows.filter((r) => {
		if (node !== "__all__" && r.failed_node !== node) return false;
		if (search) {
			if (!`${r.error_message ?? ""} ${r.failed_node ?? ""} ${r.status ?? ""}`.toLowerCase().includes(search)) return false;
		}
		return true;
	}), [
		rows,
		search,
		node
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/activity",
					className: "text-sm font-medium text-primary hover:underline",
					children: "Activity feed"
				}),
				title: "Errors & Health",
				subtitle: "Failures reported by the support workflows, with health derived from real signals."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { children: "System health" }), metrics.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HealthList, { indicators: metrics.data.health }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-full rounded-xl" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FilterBar, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchFilter, {
				label: "Search",
				placeholder: "Error message or node…",
				onChange: setSearch
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectFilter, {
				label: "Failed node",
				value: node,
				onChange: setNode,
				options: nodes
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "bg-muted/50",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Occurred at" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Status" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Failed node" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Error message" })
				] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: query.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				colSpan: 4,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
					message: query.error.message,
					onRetry: () => query.refetch()
				})
			}) }) : query.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableSkeleton, { cols: 4 }) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
				className: "border-t border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					colSpan: 4,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						title: "No errors logged",
						description: "Workflow failures recorded by the backend will appear here."
					})
				})
			}) : filtered.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-t border-border hover:bg-accent/40",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-4 py-2.5 whitespace-nowrap text-muted-foreground",
						children: formatDateTime(r.occurred_at)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-4 py-2.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: r.status })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-4 py-2.5",
						children: r.failed_node ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "max-w-[32rem] px-4 py-2.5 text-muted-foreground",
						children: r.error_message ?? "—"
					})
				]
			}, r.id)) })] })
		]
	}) });
}
//#endregion
export { ErrorsPage as component };

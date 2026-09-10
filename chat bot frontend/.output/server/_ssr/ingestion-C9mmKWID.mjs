import { n as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { r as formatDateTime } from "./format-Dd0mwkMk.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as TableSkeleton, f as Th, n as EmptyState, o as Mono, r as ErrorState, s as PageHeader, u as TableShell } from "./Primitives-CaxSyH9b.mjs";
import { t as AdminShell } from "./AdminShell-CON-VFuj.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as ingestionLogQuery } from "./documents-lEEtZsWI.mjs";
import { i as SelectFilter, n as FilterBar, r as SearchFilter, t as ALL } from "./Filters-D3xjA51g.mjs";
import { t as StatusBadge } from "./StatusBadge-C60_2PoF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ingestion-C9mmKWID.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function IngestionPage() {
	const query = useQuery(ingestionLogQuery());
	const [search, setSearch] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)(ALL);
	const rows = query.data ?? [];
	const statuses = (0, import_react.useMemo)(() => [...new Set(rows.map((r) => r.status))], [rows]);
	const filtered = (0, import_react.useMemo)(() => rows.filter((r) => {
		if (status !== "__all__" && r.status !== status) return false;
		if (search) {
			if (!`${r.doc_id ?? ""} ${r.title ?? ""} ${r.error_message ?? ""} ${r.failed_node ?? ""}`.toLowerCase().includes(search)) return false;
		}
		return true;
	}), [
		rows,
		search,
		status
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4 p-4 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/documents",
					className: "text-sm font-medium text-primary hover:underline",
					children: "Knowledge documents"
				}),
				title: "Ingestion Activity",
				subtitle: "Ingestion runs reported by the knowledge base workflow."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FilterBar, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchFilter, {
				label: "Search",
				placeholder: "Document, node or error text…",
				onChange: setSearch
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectFilter, {
				label: "Status",
				value: status,
				onChange: setStatus,
				options: statuses
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "bg-muted/50",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Ingested at" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Document" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Status" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Chunks" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Failed node" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Error" })
				] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: query.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				colSpan: 6,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
					message: query.error.message,
					onRetry: () => query.refetch()
				})
			}) }) : query.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableSkeleton, { cols: 6 }) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
				className: "border-t border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					colSpan: 6,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						title: "No ingestion runs recorded",
						description: "Runs appear here once the ingestion workflow logs activity."
					})
				})
			}) : filtered.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-t border-border hover:bg-accent/40",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-4 py-2.5 whitespace-nowrap text-muted-foreground",
						children: formatDateTime(r.ingested_at)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						className: "px-4 py-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: r.title ?? "Untitled"
						}), r.doc_id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, { children: r.doc_id })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-4 py-2.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: r.status })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-4 py-2.5 tabular-nums",
						children: r.chunk_count ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-4 py-2.5 text-muted-foreground",
						children: r.failed_node ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "max-w-[26rem] px-4 py-2.5 text-muted-foreground",
						children: r.error_message ?? "—"
					})
				]
			}, r.id)) })] })
		]
	}) });
}
//#endregion
export { IngestionPage as component };

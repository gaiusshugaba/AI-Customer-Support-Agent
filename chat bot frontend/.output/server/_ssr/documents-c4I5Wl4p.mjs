import { n as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { o as humanize, r as formatDateTime, t as Button } from "./format-Dd0mwkMk.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { j as CloudUpload } from "../_libs/lucide-react.mjs";
import { d as TableSkeleton, f as Th, n as EmptyState, o as Mono, r as ErrorState, s as PageHeader, t as Card, u as TableShell } from "./Primitives-CaxSyH9b.mjs";
import { t as AdminShell } from "./AdminShell-CON-VFuj.mjs";
import { a as useQueryClient, r as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { i as ingestDocument, t as documentsQuery } from "./documents-lEEtZsWI.mjs";
import { i as SelectFilter, n as FilterBar, r as SearchFilter, t as ALL } from "./Filters-D3xjA51g.mjs";
import { t as StatusBadge } from "./StatusBadge-C60_2PoF.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/documents-c4I5Wl4p.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DocumentsPage() {
	const query = useQuery(documentsQuery());
	const queryClient = useQueryClient();
	const inputRef = (0, import_react.useRef)(null);
	const [search, setSearch] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)(ALL);
	const upload = useMutation({
		mutationFn: ingestDocument,
		onSuccess: (data) => {
			const chunks = data.chunks_indexed ?? data.chunk_count;
			toast.success("Document ingested", { description: chunks ? `${chunks} chunks indexed.` : void 0 });
			queryClient.invalidateQueries({ queryKey: ["documents"] });
			queryClient.invalidateQueries({ queryKey: ["ingestion-log"] });
		},
		onError: (error) => toast.error("Ingestion failed", { description: error.message })
	});
	const rows = query.data ?? [];
	const statuses = (0, import_react.useMemo)(() => [...new Set(rows.map((r) => r.status))], [rows]);
	const filtered = (0, import_react.useMemo)(() => rows.filter((r) => {
		if (status !== "__all__" && r.status !== status) return false;
		if (search) {
			if (!`${r.doc_id} ${r.title ?? ""}`.toLowerCase().includes(search)) return false;
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
				title: "Knowledge Documents",
				subtitle: "Documents indexed for retrieval by the AI support assistant.",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/ingestion",
						className: "text-sm font-medium text-primary hover:underline",
						children: "Ingestion runs"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: inputRef,
						type: "file",
						className: "hidden",
						accept: ".pdf,.txt,.md,.docx,.csv,.json",
						onChange: (e) => {
							const file = e.target.files?.[0];
							if (file) upload.mutate(file);
							e.target.value = "";
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => inputRef.current?.click(),
						disabled: upload.isPending,
						size: "sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, { className: "h-4 w-4" }), upload.isPending ? "Uploading…" : "Upload document"]
					})
				] })
			}),
			upload.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "p-3 text-sm text-muted-foreground",
				children: "Sending the document to the ingestion workflow — this can take a moment."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FilterBar, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchFilter, {
				label: "Search",
				placeholder: "Title or document ID…",
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Title" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Document ID" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Status" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Chunks" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Embedding model" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Last ingested" })
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
						title: "No documents indexed",
						description: "Upload a document to send it through the ingestion workflow."
					})
				})
			}) : filtered.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-t border-border hover:bg-accent/40",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-4 py-2.5 font-medium",
						children: d.title ?? "Untitled"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-4 py-2.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, { children: d.doc_id })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-4 py-2.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: d.status })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-4 py-2.5 tabular-nums",
						children: d.chunk_count ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-4 py-2.5 text-muted-foreground",
						children: humanize(d.embedding_model)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-4 py-2.5 whitespace-nowrap text-muted-foreground",
						children: formatDateTime(d.last_ingested)
					})
				]
			}, d.doc_id)) })] })
		]
	}) });
}
//#endregion
export { DocumentsPage as component };

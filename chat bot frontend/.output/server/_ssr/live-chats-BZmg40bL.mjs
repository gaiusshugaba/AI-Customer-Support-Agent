import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as formatRelative, o as humanize, s as shortId } from "./format-Dd0mwkMk.mjs";
import { g as Link, m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as TableSkeleton, f as Th, n as EmptyState, o as Mono, r as ErrorState, u as TableShell } from "./Primitives-CaxSyH9b.mjs";
import { t as StatusBadge } from "./StatusBadge-C60_2PoF.mjs";
import { t as Badge } from "./badge-CvJ3zOG3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/live-chats-BZmg40bL.js
var import_jsx_runtime = require_jsx_runtime();
var $$splitComponentImporter = () => import("./live-chats-CQRB0rq2.mjs");
var Route = createFileRoute("/live-chats")({
	head: () => ({ meta: [
		{ title: "Live Chats — FlowStack Ops" },
		{
			name: "description",
			content: "Near real-time view of conversations currently handled by the FlowStack AI support assistant."
		},
		{
			property: "og:title",
			content: "Live Chats — FlowStack Ops"
		},
		{
			property: "og:description",
			content: "Monitor active AI support conversations, intents and escalations."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
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
export { Route as n, ConversationTable as t };

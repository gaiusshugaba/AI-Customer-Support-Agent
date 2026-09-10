import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as MetricCard, c as SectionTitle, l as Skeleton, n as EmptyState, r as ErrorState, s as PageHeader, t as Card } from "./Primitives-CaxSyH9b.mjs";
import { t as AdminShell } from "./AdminShell-CON-VFuj.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as activityQuery, t as ActivityTimeline } from "./activity-BPuv8PHq.mjs";
import { n as overviewQuery, t as HealthList } from "./overview-2oEmZITZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/overview-Vjbg-tr6.js
var import_jsx_runtime = require_jsx_runtime();
function OverviewPage() {
	const metrics = useQuery(overviewQuery());
	const activity = useQuery(activityQuery());
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 p-4 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "AI Support Operations",
				subtitle: "Monitor conversations, escalations, knowledge, and system health."
			}),
			metrics.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
				message: metrics.error.message,
				onRetry: () => metrics.refetch()
			}) }) : metrics.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-[104px] w-full rounded-xl" }, i))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
						label: "Active conversations",
						to: "/live-chats",
						value: metrics.data?.activeConversations ?? 0,
						hint: `${metrics.data?.totalConversations ?? 0} total recorded`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
						label: "Open escalations",
						to: "/escalations",
						value: metrics.data?.openEscalations ?? 0,
						hint: `${metrics.data?.readyForAgent ?? 0} ready for agent`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
						label: "Documents",
						to: "/documents",
						value: metrics.data?.documents ?? 0,
						hint: `${metrics.data?.failedIngestions ?? 0} failed ingestion(s)`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
						label: "Recent errors",
						to: "/errors",
						value: metrics.data?.recentErrors ?? 0,
						hint: `last 24h · ${metrics.data?.totalErrors ?? 0} logged total`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { children: "System health" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/errors",
						className: "text-xs font-medium text-primary hover:underline",
						children: "Errors & health"
					})]
				}), metrics.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HealthList, { indicators: metrics.data.health }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-full rounded-xl" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { children: "Recent activity" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/activity",
						className: "text-xs font-medium text-primary hover:underline",
						children: "View all activity"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "p-0",
					children: activity.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
						message: activity.error.message,
						onRetry: () => activity.refetch()
					}) : activity.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3 p-4",
						children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full" }, i))
					}) : activity.data.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						title: "No activity recorded yet",
						description: "Events appear here once the support workflows write conversations, cases, ingestion runs or errors."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivityTimeline, { events: activity.data.slice(0, 12) })
				})]
			})
		]
	}) });
}
//#endregion
export { OverviewPage as component };

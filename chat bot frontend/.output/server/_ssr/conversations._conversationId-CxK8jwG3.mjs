import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as formatScore, n as cn, o as humanize, r as formatDateTime, s as shortId } from "./format-Dd0mwkMk.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { B as ArrowLeft } from "../_libs/lucide-react.mjs";
import { c as SectionTitle, i as Field, l as Skeleton, n as EmptyState, o as Mono, r as ErrorState, s as PageHeader, t as Card } from "./Primitives-CaxSyH9b.mjs";
import { t as AdminShell } from "./AdminShell-CON-VFuj.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as conversationDetailQuery } from "./conversations-BmcuG-c7.mjs";
import { t as StatusBadge } from "./StatusBadge-C60_2PoF.mjs";
import { t as Badge } from "./badge-CvJ3zOG3.mjs";
import { t as Route } from "./conversations._conversationId-5-c_bhl_.mjs";
import { t as customerQuery } from "./customers-KXWArV0J.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/conversations._conversationId-CxK8jwG3.js
var import_jsx_runtime = require_jsx_runtime();
function ConversationDetailPage() {
	const { conversationId } = Route.useParams();
	const detail = useQuery(conversationDetailQuery(conversationId));
	const customerId = detail.data?.escalationCase?.customer_id ?? null;
	const customer = useQuery(customerQuery(customerId));
	const turns = detail.data?.turns ?? [];
	const escalation = detail.data?.escalationCase ?? null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/conversations",
				className: "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Back to conversations"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Conversation transcript",
				subtitle: conversationId,
				actions: escalation ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/escalations/$caseId",
					params: { caseId: escalation.case_id },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						children: ["Case ", shortId(escalation.case_id)]
					})
				}) : void 0
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "p-0",
					children: detail.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
						message: detail.error.message,
						onRetry: () => detail.refetch()
					}) : detail.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3 p-4",
						children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 w-full" }, i))
					}) : turns.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						title: "No turns recorded",
						description: "This conversation has no messages stored in the backend."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "divide-y divide-border",
						children: turns.map((t) => {
							const isUser = t.role === "user" || t.role === "customer";
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: cn("rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", isUser ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"),
												children: t.role
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {
												dateTime: t.timestamp,
												className: "text-xs text-muted-foreground",
												children: formatDateTime(t.timestamp)
											}),
											t.intent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "secondary",
												className: "text-[11px]",
												children: humanize(t.intent)
											}),
											t.quality_gate_passed !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: cn("text-[11px]", t.quality_gate_passed ? "text-success" : "text-destructive"),
												children: t.quality_gate_passed ? "Quality gate passed" : "Quality gate failed"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm whitespace-pre-wrap",
										children: t.text ?? "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground tabular-nums",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Confidence ", formatScore(t.confidence_score)] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Retrieval ", formatScore(t.retrieval_score)] })]
									})
								]
							}, t.turn_id);
						})
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "gap-3 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { children: "Customer context" }), customerId === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No customer is linked to this conversation in the backend."
						}) : customer.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 w-full" }) : customer.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "grid gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Name",
									value: customer.data.name ?? "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Email",
									value: customer.data.email ?? "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Plan",
									value: humanize(customer.data.plan_tier)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Account status",
									value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: customer.data.account_status })
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Customer ID",
								value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, { children: customerId })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Customer profile data is unavailable to this console."
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "gap-3 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { children: "Escalation" }), escalation ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "grid gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Type",
									value: humanize(escalation.escalation_type)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Status",
									value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: escalation.status })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Handoff mode",
									value: humanize(escalation.handoff_mode)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Intake attempts",
									value: escalation.intake_attempts
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Updated",
									value: formatDateTime(escalation.updated_at)
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "This conversation has not been escalated."
						})]
					})]
				})]
			})
		]
	}) });
}
//#endregion
export { ConversationDetailPage as component };

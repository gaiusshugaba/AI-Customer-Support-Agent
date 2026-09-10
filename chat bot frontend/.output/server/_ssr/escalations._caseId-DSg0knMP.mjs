import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { o as humanize, r as formatDateTime, s as shortId } from "./format-Dd0mwkMk.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { B as ArrowLeft, M as Circle, R as Check } from "../_libs/lucide-react.mjs";
import { c as SectionTitle, i as Field, l as Skeleton, n as EmptyState, o as Mono, r as ErrorState, s as PageHeader, t as Card } from "./Primitives-CaxSyH9b.mjs";
import { t as AdminShell } from "./AdminShell-CON-VFuj.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { i as infoList, t as escalationCaseQuery } from "./escalations-DnGN03Rc.mjs";
import { t as StatusBadge } from "./StatusBadge-C60_2PoF.mjs";
import { t as customerQuery } from "./customers-KXWArV0J.mjs";
import { t as Route } from "./escalations._caseId-v2lPZ7w5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/escalations._caseId-DSg0knMP.js
var import_jsx_runtime = require_jsx_runtime();
function Checklist({ items, provided }) {
	if (items.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "No intake requirements recorded."
	});
	const providedSet = new Set(provided.map((p) => p.toLowerCase()));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "space-y-2",
		children: items.map((item) => {
			const done = providedSet.has(item.toLowerCase());
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-start gap-2 text-sm",
				children: [done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
					className: "mt-0.5 h-4 w-4 shrink-0 text-success",
					"aria-hidden": true
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, {
					className: "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground",
					"aria-hidden": true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: done ? "text-muted-foreground line-through" : void 0,
					children: humanize(item)
				})]
			}, item);
		})
	});
}
function EscalationCasePage() {
	const { caseId } = Route.useParams();
	const query = useQuery(escalationCaseQuery(caseId));
	const kase = query.data ?? null;
	const customer = useQuery(customerQuery(kase?.customer_id ?? null));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/escalations",
				className: "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Back to escalations"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Escalation case",
				subtitle: caseId
			}),
			query.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
				message: query.error.message,
				onRetry: () => query.refetch()
			}) }) : query.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64 w-full rounded-xl" }) : !kase ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "Case not found",
				description: "This case is not present in the backend."
			}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "gap-4 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { children: "Case summary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "grid gap-3 sm:grid-cols-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Type",
										value: humanize(kase.escalation_type)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Status",
										value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: kase.status })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Handoff mode",
										value: humanize(kase.handoff_mode)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Intake attempts",
										value: kase.intake_attempts
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Created",
										value: formatDateTime(kase.created_at)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Updated",
										value: formatDateTime(kase.updated_at)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Conversation",
										value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/conversations/$conversationId",
											params: { conversationId: kase.conversation_id },
											className: "font-mono text-xs text-primary hover:underline",
											children: shortId(kase.conversation_id, 14)
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Customer ID",
										value: kase.customer_id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, { children: kase.customer_id }) : "—"
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "gap-3 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { children: "Latest customer message" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm whitespace-pre-wrap",
								children: kase.latest_customer_message ?? "No message recorded."
							})]
						}),
						kase.case_context && Object.keys(kase.case_context).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "gap-3 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { children: "Case context" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
								className: "overflow-x-auto rounded-md bg-muted p-3 text-xs",
								children: JSON.stringify(kase.case_context, null, 2)
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "gap-3 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { children: "Required information" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checklist, {
								items: infoList(kase.required_information),
								provided: infoList(kase.provided_information)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "gap-3 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { children: "Still missing" }), infoList(kase.missing_information).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Nothing outstanding."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "list-inside list-disc space-y-1 text-sm",
								children: infoList(kase.missing_information).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: humanize(m) }, m))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "gap-3 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { children: "Customer context" }), !kase.customer_id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "No customer linked to this case."
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
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Customer profile data is unavailable to this console."
							})]
						})
					]
				})]
			})
		]
	}) });
}
//#endregion
export { EscalationCasePage as component };

import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as formatScore, o as humanize } from "./format-Dd0mwkMk.mjs";
import { c as SectionTitle, i as Field, l as Skeleton, n as EmptyState, o as Mono, r as ErrorState, s as PageHeader, t as Card } from "./Primitives-CaxSyH9b.mjs";
import { a as TENANT_ID, f as supabase } from "./client-CjaA9JUL.mjs";
import { t as AdminShell } from "./AdminShell-CON-VFuj.mjs";
import { n as queryOptions, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as Badge } from "./badge-CvJ3zOG3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-cVmYhsfK.js
var import_jsx_runtime = require_jsx_runtime();
async function fetchTenantConfig() {
	const { data, error } = await supabase.from("tenant_config").select("*").eq("tenant_id", TENANT_ID).limit(1);
	if (error) throw new Error(error.message);
	return (data ?? [])[0] ?? null;
}
var tenantConfigQuery = () => queryOptions({
	queryKey: ["tenant-config", TENANT_ID],
	queryFn: fetchTenantConfig,
	staleTime: 3e5
});
function SettingsPage() {
	const query = useQuery(tenantConfigQuery());
	const config = query.data ?? null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 p-4 md:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Settings",
			subtitle: "Configuration is owned by the backend workflows — this console displays it read-only."
		}), query.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
			message: query.error.message,
			onRetry: () => query.refetch()
		}) }) : query.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64 w-full rounded-xl" }) : !config ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "No tenant configuration found",
			description: `No configuration row exists for tenant ${TENANT_ID}.`
		}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "gap-4 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { children: "Tenant" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Tenant name",
								value: config.tenant_name ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Tenant ID",
								value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, { children: config.tenant_id })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Industry pack",
								value: humanize(config.industry_pack)
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "gap-4 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { children: "AI thresholds" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Confidence threshold",
								value: formatScore(config.confidence_threshold)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Similarity threshold",
								value: formatScore(config.similarity_threshold)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Responses below these thresholds are escalated instead of answered."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "gap-4 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { children: "Prompts" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "grid gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Classification prompt",
							value: config.classification_prompt_id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, { children: config.classification_prompt_id }) : "—"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "System prompt",
							value: config.system_prompt_id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mono, { children: config.system_prompt_id }) : "—"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "gap-4 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { children: "Active channels" }), config.active_channels && config.active_channels.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: config.active_channels.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "secondary",
							children: humanize(c)
						}, c))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "No channels configured."
					})]
				})
			]
		})]
	}) });
}
//#endregion
export { SettingsPage as component };

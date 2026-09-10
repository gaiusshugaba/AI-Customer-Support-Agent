import { n as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as useRouter, c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, m as createFileRoute, p as lazyRouteComponent, s as Scripts } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { n as Route$10 } from "./live-chats-BZmg40bL.mjs";
import { t as Route$11 } from "./conversations._conversationId-5-c_bhl_.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { t as Route$12 } from "./escalations._caseId-v2lPZ7w5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-BDFGIFSs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-DbsHgNuu.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$9 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "AI Support Platform — FlowStack" },
			{
				name: "description",
				content: "AI customer support platform: live chat, knowledge base ingestion, escalations and error monitoring."
			},
			{
				name: "author",
				content: "Lovable"
			},
			{
				property: "og:title",
				content: "AI Support Platform — FlowStack"
			},
			{
				property: "og:description",
				content: "Live AI support chat plus an operations dashboard for documents, escalations and errors."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:site",
				content: "@Lovable"
			}
		],
		links: [{
			rel: "stylesheet",
			href: styles_default
		}, {
			rel: "icon",
			href: "/favicon.ico",
			type: "image/x-icon"
		}]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$9.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
			richColors: true,
			position: "top-right"
		})]
	});
}
var $$splitComponentImporter$8 = () => import("./routes-C9BNMbtp.mjs");
var Route$8 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "FlowStack Help Centre — AI Customer Support" },
		{
			name: "description",
			content: "Get instant answers from the FlowStack AI support assistant, attach screenshots and hand off to a human agent when you need one."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			property: "og:title",
			content: "FlowStack Help Centre — AI Customer Support"
		},
		{
			property: "og:description",
			content: "Chat with the FlowStack AI support assistant, share screenshots and reach a human agent when needed."
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./activity-HEaWE0_J.mjs");
var Route$7 = createFileRoute("/activity")({
	head: () => ({ meta: [
		{ title: "System Activity — FlowStack Ops" },
		{
			name: "description",
			content: "Unified timeline of AI support activity: conversation turns, escalations, ingestion runs and workflow errors."
		},
		{
			property: "og:title",
			content: "System Activity — FlowStack Ops"
		},
		{
			property: "og:description",
			content: "One timeline for every event recorded by the AI support backend."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./conversations-DpRN26Kb.mjs");
var Route$6 = createFileRoute("/conversations")({
	head: () => ({ meta: [
		{ title: "Conversations — FlowStack Ops" },
		{
			name: "description",
			content: "Search and review historical conversations handled by the FlowStack AI support assistant."
		},
		{
			property: "og:title",
			content: "Conversations — FlowStack Ops"
		},
		{
			property: "og:description",
			content: "Historical AI support conversations with intent, status and escalation context."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./documents-c4I5Wl4p.mjs");
var Route$5 = createFileRoute("/documents")({
	head: () => ({ meta: [
		{ title: "Knowledge Documents — FlowStack Ops" },
		{
			name: "description",
			content: "Manage the AI support knowledge base: uploaded documents, chunk counts, embedding models and ingestion status."
		},
		{
			property: "og:title",
			content: "Knowledge Documents — FlowStack Ops"
		},
		{
			property: "og:description",
			content: "Knowledge base documents powering the AI support assistant."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./errors-DTiEiurR.mjs");
var Route$4 = createFileRoute("/errors")({
	head: () => ({ meta: [
		{ title: "Errors & Health — FlowStack Ops" },
		{
			name: "description",
			content: "Workflow errors and derived system health for the FlowStack AI support platform, straight from the backend logs."
		},
		{
			property: "og:title",
			content: "Errors & Health — FlowStack Ops"
		},
		{
			property: "og:description",
			content: "Diagnose AI support workflow failures and monitor system health."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./escalations-DS3Mjf5s.mjs");
var Route$3 = createFileRoute("/escalations")({
	head: () => ({ meta: [
		{ title: "Escalations — FlowStack Ops" },
		{
			name: "description",
			content: "Track escalated AI support cases, their intake status and the information still missing from customers."
		},
		{
			property: "og:title",
			content: "Escalations — FlowStack Ops"
		},
		{
			property: "og:description",
			content: "Escalated support cases with intake progress and handoff readiness."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./ingestion-C9mmKWID.mjs");
var Route$2 = createFileRoute("/ingestion")({
	head: () => ({ meta: [
		{ title: "Ingestion Activity — FlowStack Ops" },
		{
			name: "description",
			content: "Every knowledge base ingestion run with status, chunk counts and the failure details reported by the workflow."
		},
		{
			property: "og:title",
			content: "Ingestion Activity — FlowStack Ops"
		},
		{
			property: "og:description",
			content: "Audit knowledge base ingestion runs and diagnose failures."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./overview-Vjbg-tr6.mjs");
var Route$1 = createFileRoute("/overview")({
	head: () => ({ meta: [
		{ title: "AI Support Operations — FlowStack Ops" },
		{
			name: "description",
			content: "Operational overview of the FlowStack AI support system: conversations, escalations, knowledge base and system health."
		},
		{
			property: "og:title",
			content: "AI Support Operations — FlowStack Ops"
		},
		{
			property: "og:description",
			content: "Monitor conversations, escalations, knowledge and system health in one console."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./settings-cVmYhsfK.mjs");
var Route = createFileRoute("/settings")({
	head: () => ({ meta: [
		{ title: "Settings — FlowStack Ops" },
		{
			name: "description",
			content: "Tenant configuration for the AI support assistant: thresholds, prompt references and active channels."
		},
		{
			property: "og:title",
			content: "Settings — FlowStack Ops"
		},
		{
			property: "og:description",
			content: "Review the AI support assistant's tenant configuration."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var IndexRoute = Route$8.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$9
});
var ActivityRoute = Route$7.update({
	id: "/activity",
	path: "/activity",
	getParentRoute: () => Route$9
});
var ConversationsRoute = Route$6.update({
	id: "/conversations",
	path: "/conversations",
	getParentRoute: () => Route$9
});
var DocumentsRoute = Route$5.update({
	id: "/documents",
	path: "/documents",
	getParentRoute: () => Route$9
});
var ErrorsRoute = Route$4.update({
	id: "/errors",
	path: "/errors",
	getParentRoute: () => Route$9
});
var EscalationsRoute = Route$3.update({
	id: "/escalations",
	path: "/escalations",
	getParentRoute: () => Route$9
});
var IngestionRoute = Route$2.update({
	id: "/ingestion",
	path: "/ingestion",
	getParentRoute: () => Route$9
});
var LiveChatsRoute = Route$10.update({
	id: "/live-chats",
	path: "/live-chats",
	getParentRoute: () => Route$9
});
var OverviewRoute = Route$1.update({
	id: "/overview",
	path: "/overview",
	getParentRoute: () => Route$9
});
var SettingsRoute = Route.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => Route$9
});
var ConversationsConversationIdRoute = Route$11.update({
	id: "/$conversationId",
	path: "/$conversationId",
	getParentRoute: () => ConversationsRoute
});
var EscalationsCaseIdRoute = Route$12.update({
	id: "/$caseId",
	path: "/$caseId",
	getParentRoute: () => EscalationsRoute
});
var ConversationsRouteChildren = { ConversationsConversationIdRoute };
var ConversationsRouteWithChildren = ConversationsRoute._addFileChildren(ConversationsRouteChildren);
var EscalationsRouteChildren = { EscalationsCaseIdRoute };
var rootRouteChildren = {
	IndexRoute,
	ActivityRoute,
	ConversationsRoute: ConversationsRouteWithChildren,
	DocumentsRoute,
	ErrorsRoute,
	EscalationsRoute: EscalationsRoute._addFileChildren(EscalationsRouteChildren),
	IngestionRoute,
	LiveChatsRoute,
	OverviewRoute,
	SettingsRoute
};
var routeTree = Route$9._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };

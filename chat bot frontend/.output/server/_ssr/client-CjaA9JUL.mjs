import { n as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as cn } from "./format-Dd0mwkMk.mjs";
import { a as Trigger, i as Root3, n as Portal, r as Provider, t as Content2 } from "../_libs/radix-ui__react-tooltip.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/client-CjaA9JUL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MOBILE_BREAKPOINT = 768;
function useIsMobile() {
	const [isMobile, setIsMobile] = import_react.useState(void 0);
	import_react.useEffect(() => {
		if (typeof window === "undefined") return;
		const mql = window.matchMedia(`(max-width: 767px)`);
		const onChange = () => {
			setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		};
		mql.addEventListener("change", onChange);
		setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		return () => mql.removeEventListener("change", onChange);
	}, []);
	return !!isMobile;
}
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Input.displayName = "Input";
var TooltipProvider = Provider;
var Tooltip = Root3;
var TooltipTrigger = Trigger;
var TooltipContent = import_react.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	sideOffset,
	className: cn("z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-tooltip-content-transform-origin)", className),
	...props
}) }));
TooltipContent.displayName = Content2.displayName;
/**
* Default tenant for the current demo deployment.
*
* Tenant identity is resolved at runtime through `resolveTenantId()` so that it
* can later come from the authenticated user's organisation / tenant membership
* (e.g. the `tenant_id` on their `customers` row) instead of being hardcoded.
*/
var DEFAULT_TENANT_ID = "b2b-saas-demo";
/** Kept for the admin operations console, which is scoped to the demo tenant. */
var TENANT_ID = DEFAULT_TENANT_ID;
/** Resolves the tenant for a signed-in customer, falling back to the demo tenant. */
function resolveTenantId(customerTenantId) {
	return customerTenantId && customerTenantId.trim() ? customerTenantId : DEFAULT_TENANT_ID;
}
/** Backend endpoints owned by the n8n workflows. Do not change. */
var WEBHOOKS = {
	/** Customer chat backend. */
	conversationMessage: "https://f6nvuwee.rpcl.app/webhook/conversation-message",
	/** Knowledge ingestion backend — used by this admin console. */
	kbIngest: "https://f6nvuwee.rpcl.app/webhook/kb-ingest"
};
var CHAT_ATTACHMENTS_BUCKET = "chat-attachments";
/** n8n can run long AI/retrieval chains; keep the client patient instead of duplicating sends. */
var CHAT_REQUEST_TIMEOUT_MS = 12e4;
var CHAT_SLOW_NOTICE_MS = 15e3;
var supabase = {
	auth: {
		getSession: () => Promise.resolve({
			data: { session: null },
			error: null
		}),
		onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
	},
	from: () => ({
		select: () => ({ eq: () => ({
			single: () => Promise.resolve({
				data: null,
				error: null
			}),
			order: () => Promise.resolve({
				data: [],
				error: null
			})
		}) }),
		insert: () => Promise.resolve({
			data: null,
			error: null
		}),
		update: () => Promise.resolve({
			data: null,
			error: null
		}),
		delete: () => Promise.resolve({
			data: null,
			error: null
		})
	})
};
//#endregion
export { TENANT_ID as a, TooltipProvider as c, resolveTenantId as d, supabase as f, Input as i, TooltipTrigger as l, CHAT_REQUEST_TIMEOUT_MS as n, Tooltip as o, useIsMobile as p, CHAT_SLOW_NOTICE_MS as r, TooltipContent as s, CHAT_ATTACHMENTS_BUCKET as t, WEBHOOKS as u };

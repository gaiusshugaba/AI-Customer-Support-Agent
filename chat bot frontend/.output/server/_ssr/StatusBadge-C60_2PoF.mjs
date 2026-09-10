import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as cn } from "./format-Dd0mwkMk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/StatusBadge-C60_2PoF.js
var import_jsx_runtime = require_jsx_runtime();
var MAP = {
	success: "bg-success/15 text-success-foreground border-success/30",
	ready_for_agent: "bg-success/15 text-success-foreground border-success/30",
	failed: "bg-destructive/15 text-destructive border-destructive/30",
	error: "bg-destructive/15 text-destructive border-destructive/30",
	awaiting_customer_info: "bg-warning/15 text-warning-foreground border-warning/30",
	pending: "bg-warning/15 text-warning-foreground border-warning/30"
};
function StatusBadge({ status, className }) {
	const key = (status ?? "").toLowerCase();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap", MAP[key] ?? "bg-info/15 text-info-foreground border-info/30", className),
		children: status ?? "unknown"
	});
}
//#endregion
export { StatusBadge as t };

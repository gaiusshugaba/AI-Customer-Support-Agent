import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/escalations._caseId-v2lPZ7w5.js
var $$splitComponentImporter = () => import("./escalations._caseId-DSg0knMP.mjs");
var Route = createFileRoute("/escalations/$caseId")({
	head: () => ({ meta: [
		{ title: "Escalation Case — FlowStack Ops" },
		{
			name: "description",
			content: "Escalation case detail: intake checklist, customer context and the latest message from the customer."
		},
		{
			property: "og:title",
			content: "Escalation Case — FlowStack Ops"
		},
		{
			property: "og:description",
			content: "Review a single escalated AI support case and its handoff readiness."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };

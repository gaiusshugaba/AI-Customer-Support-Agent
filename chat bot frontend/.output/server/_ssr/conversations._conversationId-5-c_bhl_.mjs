import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/conversations._conversationId-5-c_bhl_.js
var $$splitComponentImporter = () => import("./conversations._conversationId-CxK8jwG3.mjs");
var Route = createFileRoute("/conversations/$conversationId")({
	head: () => ({ meta: [
		{ title: "Conversation Transcript — FlowStack Ops" },
		{
			name: "description",
			content: "Full AI support transcript with intent, confidence and retrieval scores per turn, plus escalation context."
		},
		{
			property: "og:title",
			content: "Conversation Transcript — FlowStack Ops"
		},
		{
			property: "og:description",
			content: "Inspect a single AI support conversation turn by turn."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };

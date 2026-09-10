globalThis.__nitro_main__ = import.meta.url;
import { i as HTTPError, n as defineLazyEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { t as HookableCore } from "./_libs/hookable.mjs";
import { r as FastResponse } from "./_libs/h3-v2+rou3+srvx.mjs";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/assets/activity-CTCoMMOh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1140-jiWa/vkKAUSxrXeIvzG1ffJ2LS4\"",
		"mtime": "2026-09-09T16:40:21.387Z",
		"size": 4416,
		"path": "../public/assets/activity-CTCoMMOh.js"
	},
	"/assets/activity-DrOSDE5b.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"744-O7J5+9y0iSUPitncwce9+ceU5Ik\"",
		"mtime": "2026-09-09T16:40:21.415Z",
		"size": 1860,
		"path": "../public/assets/activity-DrOSDE5b.js"
	},
	"/assets/AdminShell-BtDvS-K1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a893-JZOd03ykUUHYcx4oEkHor0alef8\"",
		"mtime": "2026-09-09T16:40:21.368Z",
		"size": 43155,
		"path": "../public/assets/AdminShell-BtDvS-K1.js"
	},
	"/assets/arrow-left-Ddh2RcFe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9b-XUWt71N45C6miZkXgtHzqiXEyM4\"",
		"mtime": "2026-09-09T16:40:21.415Z",
		"size": 155,
		"path": "../public/assets/arrow-left-Ddh2RcFe.js"
	},
	"/assets/badge-0cVdI5fZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2e4-JxoSVdJ1tf6n78COO1lWyJUpPKk\"",
		"mtime": "2026-09-09T16:40:21.415Z",
		"size": 740,
		"path": "../public/assets/badge-0cVdI5fZ.js"
	},
	"/assets/check-CRQZBrzE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"72-0LUsFxnrI+WoVHoxiummnGuI0bw\"",
		"mtime": "2026-09-09T16:40:21.415Z",
		"size": 114,
		"path": "../public/assets/check-CRQZBrzE.js"
	},
	"/assets/client-BFwoDd46.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e3a2-zvLTwoHKCH4y7uKD54jrobMa7VY\"",
		"mtime": "2026-09-09T16:40:21.415Z",
		"size": 58274,
		"path": "../public/assets/client-BFwoDd46.js"
	},
	"/assets/conversations-1Or_gT9j.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"997-GIWVK/7PzPN2Jg9OMVd79fKiV7g\"",
		"mtime": "2026-09-09T16:40:21.415Z",
		"size": 2455,
		"path": "../public/assets/conversations-1Or_gT9j.js"
	},
	"/assets/conversations-CuCVkmJL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7c2-OtoZCupJLFcinlTexRBDD1pOEC4\"",
		"mtime": "2026-09-09T16:40:21.415Z",
		"size": 1986,
		"path": "../public/assets/conversations-CuCVkmJL.js"
	},
	"/assets/conversations._conversationId-Bww-MQWP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"110b-x8IUdnAhsMI7FAMz6dlSXTO5f/8\"",
		"mtime": "2026-09-09T16:40:21.415Z",
		"size": 4363,
		"path": "../public/assets/conversations._conversationId-Bww-MQWP.js"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"a0-CKGXSIe7TSsqDTmGm/nY1t/o5d0\"",
		"mtime": "2026-09-09T14:41:58.623Z",
		"size": 160,
		"path": "../public/robots.txt"
	},
	"/assets/conversations._conversationId-Cn0SpFXv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"40c-SR2HIoKhD+t4HZImzAy6LPBiflc\"",
		"mtime": "2026-09-09T16:40:21.415Z",
		"size": 1036,
		"path": "../public/assets/conversations._conversationId-Cn0SpFXv.js"
	},
	"/assets/customers-CWi26nOF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"179-YDx0vebZ8G1a9WMJtbVTiCV0vSA\"",
		"mtime": "2026-09-09T16:40:21.415Z",
		"size": 377,
		"path": "../public/assets/customers-CWi26nOF.js"
	},
	"/assets/dist-DCxbFs-v.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9033-r2RBls6roxUk5WaK2eYzu2BoiyU\"",
		"mtime": "2026-09-09T16:40:21.415Z",
		"size": 36915,
		"path": "../public/assets/dist-DCxbFs-v.js"
	},
	"/assets/documents-DSLaIPOl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"518-okuCV4b1Fp6ibXnleMODsVKPUFQ\"",
		"mtime": "2026-09-09T16:40:21.431Z",
		"size": 1304,
		"path": "../public/assets/documents-DSLaIPOl.js"
	},
	"/assets/documents-B-go7CRR.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16a7-AdEaL2NMkwk3KeSbxyxi0hyfx2E\"",
		"mtime": "2026-09-09T16:40:21.431Z",
		"size": 5799,
		"path": "../public/assets/documents-B-go7CRR.js"
	},
	"/assets/errors-DsOuGGIq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"194-Hxg0AMQ9CUnqccDKBzVyVw8wRN0\"",
		"mtime": "2026-09-09T16:40:21.431Z",
		"size": 404,
		"path": "../public/assets/errors-DsOuGGIq.js"
	},
	"/assets/errors-DSrClvFo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a99-XJS74H/WA2dWYVH8qryovB3ZFh0\"",
		"mtime": "2026-09-09T16:40:21.431Z",
		"size": 2713,
		"path": "../public/assets/errors-DSrClvFo.js"
	},
	"/assets/escalations-Dn8rZOuV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"30c-TYh7C25rwlPij3wbRWfwwWPbnGs\"",
		"mtime": "2026-09-09T16:40:21.431Z",
		"size": 780,
		"path": "../public/assets/escalations-Dn8rZOuV.js"
	},
	"/assets/escalations-pHSNn9qX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d9d-CEp9O41tYr2mIColPX/EyTHBqiA\"",
		"mtime": "2026-09-09T16:40:21.431Z",
		"size": 3485,
		"path": "../public/assets/escalations-pHSNn9qX.js"
	},
	"/assets/escalations._caseId-DIeON6bu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3e4-vfstrRBvQb4n9xc7ZuNOVQvVVjw\"",
		"mtime": "2026-09-09T16:40:21.447Z",
		"size": 996,
		"path": "../public/assets/escalations._caseId-DIeON6bu.js"
	},
	"/assets/escalations._caseId-DWPyduHN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1281-PJfQ1MddRfc13OXtj8L7PUNzyk4\"",
		"mtime": "2026-09-09T16:40:21.447Z",
		"size": 4737,
		"path": "../public/assets/escalations._caseId-DWPyduHN.js"
	},
	"/assets/Filters-CMcWrDHv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"78d6-XxRHkB/5UBv4UK3eo8sW7rgTcH0\"",
		"mtime": "2026-09-09T16:40:21.368Z",
		"size": 30934,
		"path": "../public/assets/Filters-CMcWrDHv.js"
	},
	"/assets/format-BE23qSBY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1496f-GtcpeLTAnPdWRXdYpsMOg6qcPRo\"",
		"mtime": "2026-09-09T16:40:21.447Z",
		"size": 84335,
		"path": "../public/assets/format-BE23qSBY.js"
	},
	"/assets/index-Cv1Ex0zE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"488b4-m5qoPxJnXcMEcMeb4GcW4FSFRMY\"",
		"mtime": "2026-09-09T16:40:21.368Z",
		"size": 297140,
		"path": "../public/assets/index-Cv1Ex0zE.js"
	},
	"/assets/ingestion-C0Qx6gJV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ad2-6xDxEVA/1ShEomdqUgeySNXtkZw\"",
		"mtime": "2026-09-09T16:40:21.447Z",
		"size": 2770,
		"path": "../public/assets/ingestion-C0Qx6gJV.js"
	},
	"/assets/label-aWUIW6sW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"28b-WubX0fwJPKo0LcSjbv0LREq+asU\"",
		"mtime": "2026-09-09T16:40:21.462Z",
		"size": 651,
		"path": "../public/assets/label-aWUIW6sW.js"
	},
	"/assets/live-chats-B-atJlZS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1061-0bZgK1/88VNpcTdhaXduQLaWqZY\"",
		"mtime": "2026-09-09T16:40:21.462Z",
		"size": 4193,
		"path": "../public/assets/live-chats-B-atJlZS.js"
	},
	"/assets/live-chats-DD6WamBA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cf0-5gtz1S1ia1OwVNTHIJdt184GmLo\"",
		"mtime": "2026-09-09T16:40:21.462Z",
		"size": 3312,
		"path": "../public/assets/live-chats-DD6WamBA.js"
	},
	"/assets/overview-BiJr9_Rd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c34-TYCvVwKq6/UCb+geZnyr63sDp3s\"",
		"mtime": "2026-09-09T16:40:21.462Z",
		"size": 3124,
		"path": "../public/assets/overview-BiJr9_Rd.js"
	},
	"/assets/overview-Dof33KTn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a7a-lAhTeqKBadfQsgovtxWIkQ2okjw\"",
		"mtime": "2026-09-09T16:40:21.462Z",
		"size": 2682,
		"path": "../public/assets/overview-Dof33KTn.js"
	},
	"/assets/preload-helper-B1MnhqL9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"168b-RiojfNSdm5Js18rchobq0Q2Yvwc\"",
		"mtime": "2026-09-09T16:40:21.462Z",
		"size": 5771,
		"path": "../public/assets/preload-helper-B1MnhqL9.js"
	},
	"/assets/Primitives-BeujGpwu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"140c-sbMGgPPjnJnN3poPYgESRYY97oA\"",
		"mtime": "2026-09-09T16:40:21.368Z",
		"size": 5132,
		"path": "../public/assets/Primitives-BeujGpwu.js"
	},
	"/assets/routes-XwvO9pIk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8402-38lsBIyK8cFwO6IpkzQOTBbfWHc\"",
		"mtime": "2026-09-09T16:40:21.462Z",
		"size": 33794,
		"path": "../public/assets/routes-XwvO9pIk.js"
	},
	"/assets/settings-Buw0FUao.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"aab-8VLF/0ySuEjH4BEECMVHdd0BoXk\"",
		"mtime": "2026-09-09T16:40:21.462Z",
		"size": 2731,
		"path": "../public/assets/settings-Buw0FUao.js"
	},
	"/assets/shield-check-Bn23gQmN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"136-Mm4oWsVz5DQRSRvWquT7n0Fu4Qk\"",
		"mtime": "2026-09-09T16:40:21.462Z",
		"size": 310,
		"path": "../public/assets/shield-check-Bn23gQmN.js"
	},
	"/assets/StatusBadge-CX8nmkVl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"307-zeMZD22DAPKBqtMKd8fTokw6giU\"",
		"mtime": "2026-09-09T16:40:21.387Z",
		"size": 775,
		"path": "../public/assets/StatusBadge-CX8nmkVl.js"
	},
	"/assets/styles-DbsHgNuu.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"149f2-789ZvIIiNus5UOvsWoSboyylSDw\"",
		"mtime": "2026-09-09T16:40:21.462Z",
		"size": 84466,
		"path": "../public/assets/styles-DbsHgNuu.css"
	}
};
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_7QN2H8 = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_7QN2H8
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
[].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function useNitroHooks() {
	const nitroApp = useNitroApp();
	const hooks = nitroApp.hooks;
	if (hooks) return hooks;
	return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/_module-handler.mjs
function createHandler(hooks) {
	const nitroApp = useNitroApp();
	const nitroHooks = useNitroHooks();
	return {
		async fetch(request, env, context) {
			globalThis.__env__ = env;
			augmentReq(request, {
				env,
				context
			});
			const ctxExt = {};
			const url = new URL(request.url);
			if (hooks.fetch) {
				const res = await hooks.fetch(request, env, context, url, ctxExt);
				if (res) return res;
			}
			return await nitroApp.fetch(request);
		},
		scheduled(controller, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
				controller,
				env,
				context
			}) || Promise.resolve());
		},
		email(message, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:email", {
				message,
				event: message,
				env,
				context
			}) || Promise.resolve());
		},
		queue(batch, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
				batch,
				event: batch,
				env,
				context
			}) || Promise.resolve());
		},
		tail(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
				traces,
				env,
				context
			}) || Promise.resolve());
		},
		trace(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
				traces,
				env,
				context
			}) || Promise.resolve());
		}
	};
}
function augmentReq(cfReq, ctx) {
	const req = cfReq;
	req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
	req.runtime ??= { name: "cloudflare" };
	req.runtime.cloudflare = {
		...req.runtime.cloudflare,
		...ctx
	};
	req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/cloudflare-module.mjs
var cloudflare_module_default = createHandler({ fetch(cfRequest, env, context, url) {
	if (env.ASSETS && isPublicAssetURL(url.pathname)) return env.ASSETS.fetch(cfRequest);
} });
//#endregion
export { cloudflare_module_default as default };

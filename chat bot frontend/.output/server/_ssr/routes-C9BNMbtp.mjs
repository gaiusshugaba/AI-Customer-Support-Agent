import { n as __toESM } from "../_runtime.mjs";
import { l as require_react_dom, u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as formatRelative, n as cn, t as Button } from "./format-Dd0mwkMk.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as Copy, B as ArrowLeft, C as Headset, F as CircleAlert, O as Eye, R as Check, V as ArrowDown, a as ThumbsUp, b as LoaderCircle, c as ShieldCheck, d as Send, g as Minus, k as EyeOff, m as Paperclip, n as UserRound, o as ThumbsDown, p as RotateCcw, s as Sparkles, t as X, x as LifeBuoy, y as MessageSquarePlus } from "../_libs/lucide-react.mjs";
import { c as TooltipProvider, d as resolveTenantId, f as supabase, i as Input, l as TooltipTrigger, n as CHAT_REQUEST_TIMEOUT_MS, o as Tooltip, p as useIsMobile, r as CHAT_SLOW_NOTICE_MS, s as TooltipContent, t as CHAT_ATTACHMENTS_BUCKET, u as WEBHOOKS } from "./client-CjaA9JUL.mjs";
import { a as useQueryClient, n as queryOptions, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as Label } from "./label-xV-W0LaJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-C9BNMbtp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom());
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
var TURN_COLUMNS = "turn_id, conversation_id, tenant_id, role, text, timestamp";
var ALLOWED_MIME_TYPES = [
	"image/png",
	"image/jpeg",
	"image/jpg",
	"image/webp"
];
function repairRoundOrder(messages) {
	const out = [...messages];
	for (let i = 0; i < out.length - 1; i += 1) {
		const first = out[i];
		const second = out[i + 1];
		if (first.role !== "assistant" || second.role !== "customer") continue;
		if (first.seq == null || second.seq == null) continue;
		if (second.seq !== first.seq + 1) continue;
		if (Math.abs(new Date(second.timestamp).getTime() - new Date(first.timestamp).getTime()) > 5e3) continue;
		out[i] = second;
		out[i + 1] = first;
		i += 1;
	}
	return out;
}
function sortChronologically(messages) {
	return repairRoundOrder([...messages].map((m, index) => ({
		m,
		index
	})).sort((a, b) => {
		const ta = new Date(a.m.timestamp).getTime();
		const tb = new Date(b.m.timestamp).getTime();
		if (ta !== tb) return ta - tb;
		if (a.m.seq != null && b.m.seq != null && a.m.seq !== b.m.seq) return a.m.seq - b.m.seq;
		return a.index - b.index;
	}).map((entry) => entry.m));
}
async function loadCustomerProfile(userId, email) {
	const existing = await supabase.from("customers").select("customer_id, tenant_id, email, name, plan_tier, account_status, custom_fields").eq("customer_id", userId).maybeSingle();
	if (existing.error) throw new Error(existing.error.message);
	if (existing.data) return existing.data;
	const inserted = await supabase.from("customers").insert({
		customer_id: userId,
		tenant_id: resolveTenantId(null),
		email,
		name: email?.split("@")[0] ?? null
	}).select("customer_id, tenant_id, email, name, plan_tier, account_status, custom_fields").single();
	if (inserted.error) throw new Error(inserted.error.message);
	return inserted.data;
}
var customerProfileQuery = (userId, email) => queryOptions({
	queryKey: ["customer-profile", userId],
	queryFn: () => userId ? loadCustomerProfile(userId, email) : Promise.resolve(null),
	enabled: Boolean(userId),
	staleTime: 6e4
});
async function ensureConversation(input) {
	const { error } = await supabase.from("customer_conversations").upsert({
		conversation_id: input.conversationId,
		customer_id: input.customerId,
		tenant_id: input.tenantId,
		...input.title ? { title: input.title.slice(0, 120) } : {},
		last_activity: (/* @__PURE__ */ new Date()).toISOString()
	}, { onConflict: "conversation_id" });
	if (error) throw new Error(error.message);
}
async function fetchMyConversations(customerId, limit = 200) {
	const [convos, turns] = await Promise.all([supabase.from("customer_conversations").select("conversation_id, tenant_id, customer_id, title, created_at, last_activity").eq("customer_id", customerId).order("last_activity", { ascending: false }).limit(limit), supabase.from("conversation_turns").select(TURN_COLUMNS).order("timestamp", { ascending: true }).limit(limit * 10)]);
	if (convos.error) throw new Error(convos.error.message);
	if (turns.error) throw new Error(turns.error.message);
	const byConversation = /* @__PURE__ */ new Map();
	for (const t of turns.data ?? []) {
		const list = byConversation.get(t.conversation_id);
		if (list) list.push(t);
		else byConversation.set(t.conversation_id, [t]);
	}
	return (convos.data ?? []).map((c) => {
		const list = byConversation.get(c.conversation_id) ?? [];
		const last = list[list.length - 1];
		return {
			...c,
			message_count: list.length,
			last_message: last?.text ?? null,
			last_activity: last?.timestamp ?? c.last_activity
		};
	});
}
var myConversationsQuery = (customerId) => queryOptions({
	queryKey: ["my-conversations", customerId],
	queryFn: () => customerId ? fetchMyConversations(customerId) : Promise.resolve([]),
	enabled: Boolean(customerId),
	staleTime: 1e4
});
async function signAttachments(rows) {
	return Promise.all(rows.map(async (row) => ({
		...row,
		url: await signedAttachmentUrl(row.storage_path)
	})));
}
async function signedAttachmentUrl(storagePath) {
	const { data } = await supabase.storage.from(CHAT_ATTACHMENTS_BUCKET).createSignedUrl(storagePath, 3600);
	return data?.signedUrl ?? null;
}
async function fetchConversationMessages(conversationId) {
	const [turnsResult, attachmentsResult] = await Promise.all([supabase.from("conversation_turns").select(TURN_COLUMNS).eq("conversation_id", conversationId).order("turn_id", { ascending: true }), supabase.from("conversation_attachments").select("id, storage_path, file_name, mime_type, file_size, created_at").eq("conversation_id", conversationId).order("created_at", { ascending: true })]);
	if (turnsResult.error) throw new Error(turnsResult.error.message);
	if (attachmentsResult.error) throw new Error(attachmentsResult.error.message);
	const attachments = await signAttachments(attachmentsResult.data ?? []);
	const messages = (turnsResult.data ?? []).map((t) => ({
		id: `turn-${t.turn_id}`,
		seq: t.turn_id,
		role: t.role === "user" || t.role === "customer" ? "customer" : "assistant",
		text: t.text,
		timestamp: t.timestamp,
		attachments: []
	}));
	for (const attachment of attachments) {
		const at = new Date(attachment.created_at).getTime();
		let target;
		let best = Number.POSITIVE_INFINITY;
		for (const m of messages) {
			if (m.role !== "customer") continue;
			const delta = Math.abs(new Date(m.timestamp).getTime() - at);
			if (delta < best) {
				best = delta;
				target = m;
			}
		}
		if (target) target.attachments.push(attachment);
		else messages.push({
			id: `attachment-${attachment.id}`,
			role: "customer",
			text: null,
			timestamp: attachment.created_at,
			attachments: [attachment]
		});
	}
	return sortChronologically(messages);
}
var conversationMessagesQuery = (conversationId, enabled) => queryOptions({
	queryKey: ["chat-messages", conversationId],
	queryFn: () => conversationId ? fetchConversationMessages(conversationId) : Promise.resolve([]),
	enabled: enabled && Boolean(conversationId),
	staleTime: 5e3
});
function validateAttachment(file) {
	const mime = file.type.toLowerCase();
	if (!ALLOWED_MIME_TYPES.includes(mime)) return "Please attach a PNG, JPG or WEBP image.";
	if (file.size > 10485760) return "That image is larger than 10 MB. Please attach a smaller screenshot.";
	return null;
}
async function uploadAttachment(input) {
	const safeName = input.file.name.replace(/[^\w.\-]+/g, "_").slice(-80);
	const storagePath = `${input.tenantId}/${input.customerId}/${input.conversationId}/${crypto.randomUUID()}-${safeName}`;
	if ((await supabase.storage.from("chat-attachments").upload(storagePath, input.file, {
		contentType: input.file.type,
		upsert: false
	})).error) throw new Error("We couldn't upload that screenshot. Please try again.");
	const record = await supabase.from("conversation_attachments").insert({
		tenant_id: input.tenantId,
		customer_id: input.customerId,
		conversation_id: input.conversationId,
		storage_path: storagePath,
		file_name: safeName,
		mime_type: input.file.type,
		file_size: input.file.size
	}).select("id, storage_path, file_name, mime_type, file_size, created_at").single();
	if (record.error) throw new Error("We couldn't attach that screenshot. Please try again.");
	return {
		...record.data,
		url: await signedAttachmentUrl(storagePath)
	};
}
function pickResponse(raw) {
	return (Array.isArray(raw) ? raw[0] : raw) ?? {};
}
function readOutcome(body) {
	const status = String(body["escalation_status"] ?? body["status"] ?? body["decision"] ?? "").toUpperCase();
	if (status.includes("AWAITING") || status.includes("NEEDS_INFO")) {
		const missing = body["missing_information"] ?? body["required_information"];
		return {
			kind: "needs_information",
			prompt: Array.isArray(missing) && missing.length ? String(missing[0]) : null
		};
	}
	if (status.includes("READY_FOR_AGENT") || status.includes("HANDOFF") || status.includes("HUMAN")) return { kind: "handoff" };
	return { kind: "answered" };
}
async function sendChatMessage(input) {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), CHAT_REQUEST_TIMEOUT_MS);
	input.signal?.addEventListener("abort", () => controller.abort());
	try {
		const response = await fetch(WEBHOOKS.conversationMessage, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			signal: controller.signal,
			body: JSON.stringify({
				tenant_id: input.tenantId,
				customer_id: input.customerId,
				conversation_id: input.conversationId,
				text: input.text,
				...input.attachments.length ? { attachments: input.attachments.map((a) => ({
					type: "image",
					mime_type: a.mime_type,
					file_name: a.file_name,
					storage_path: `${CHAT_ATTACHMENTS_BUCKET}/${a.storage_path}`,
					url: a.url
				})) } : {}
			})
		});
		if (response.status === 401 || response.status === 403) throw new Error("Your session has expired. Please sign in again.");
		if (!response.ok) throw new Error("We couldn't send that message. Please try again.");
		const body = pickResponse(await response.json().catch(() => ({})));
		const text = typeof body["response_text"] === "string" ? body["response_text"].trim() : "";
		if (!text) throw new Error("We couldn't read the support reply. Please try again.");
		return {
			text,
			outcome: readOutcome(body)
		};
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError") throw new Error("The support assistant is taking longer than expected. Please try again.");
		if (error instanceof TypeError) throw new Error("We couldn't reach support. Please check your connection and try again.");
		throw error;
	} finally {
		clearTimeout(timeout);
	}
}
/**
* AUTH SESSION → CUSTOMER PROFILE → TENANT.
* The Supabase session is the single source of truth for customer identity;
* `customer_id` is always the authenticated user's ID.
*/
function useCustomerSession() {
	const [session, setSession] = (0, import_react.useState)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let active = true;
		supabase.auth.getSession().then(({ data }) => {
			if (!active) return;
			setSession(data.session ?? null);
			setReady(true);
		});
		const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
			setSession(next ?? null);
			setReady(true);
		});
		return () => {
			active = false;
			sub.subscription.unsubscribe();
		};
	}, []);
	const userId = session?.user?.id ?? null;
	const email = session?.user?.email ?? null;
	const profile = useQuery(customerProfileQuery(userId, email));
	return {
		ready,
		session,
		userId,
		email,
		customer: profile.data ?? null,
		profileLoading: profile.isLoading,
		profileError: profile.isError ? profile.error.message : null,
		tenantId: resolveTenantId(profile.data?.tenant_id ?? null)
	};
}
var CONVERSATION_KEY = (userId) => `flowstack.conversation.${userId}`;
var HANDOFF_TEXT = "Your request has been sent to the support team. A specialist will reply here as soon as possible.";
var NEEDS_INFO_TEXT = "Your issue needs a little more information before we can continue.";
var SCREENSHOT_HINT = "Could you attach a screenshot of the error? Please hide any passwords, card numbers or authentication codes.";
var SUGGESTIONS = [
	"How does billing work?",
	"What are my plan limits?",
	"I'm having a technical issue",
	"I need help with my account"
];
function timeLabel(ts) {
	const d = new Date(ts);
	if (Number.isNaN(d.getTime())) return "";
	return d.toLocaleTimeString(void 0, {
		hour: "numeric",
		minute: "2-digit"
	});
}
function dayKey(ts) {
	const d = new Date(ts);
	return Number.isNaN(d.getTime()) ? "" : d.toDateString();
}
function dayLabel(ts) {
	const d = new Date(ts);
	if (Number.isNaN(d.getTime())) return "";
	const today = /* @__PURE__ */ new Date();
	const yesterday = new Date(today);
	yesterday.setDate(today.getDate() - 1);
	if (d.toDateString() === today.toDateString()) return "Today";
	if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
	return d.toLocaleDateString(void 0, {
		month: "long",
		day: "numeric",
		year: "numeric"
	});
}
function SupportWidget() {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [mounted, setMounted] = (0, import_react.useState)(false);
	const [unread, setUnread] = (0, import_react.useState)(false);
	const [everOpened, setEverOpened] = (0, import_react.useState)(false);
	const openRef = (0, import_react.useRef)(false);
	const isMobile = useIsMobile();
	(0, import_react.useEffect)(() => setMounted(true), []);
	(0, import_react.useEffect)(() => {
		openRef.current = open;
		if (open) setEverOpened(true);
	}, [open]);
	(0, import_react.useEffect)(() => {
		if (!open || !isMobile) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = previous;
		};
	}, [open, isMobile]);
	const openPanel = (0, import_react.useCallback)(() => {
		setOpen(true);
		setUnread(false);
	}, []);
	if (!mounted) return null;
	return (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipProvider, {
		delayDuration: 200,
		children: [everOpened && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"aria-hidden": !open,
			className: cn("fixed z-[9999] flex-col overflow-hidden border border-border bg-card shadow-2xl", open ? "flex animate-support-in" : "hidden", isMobile ? "inset-x-3 bottom-3 h-[calc(100dvh-24px)] max-h-[calc(100dvh-24px)] rounded-2xl" : "bottom-[88px] right-6 w-[400px] max-w-[calc(100vw-32px)] rounded-2xl"),
			style: isMobile ? void 0 : {
				height: "min(640px, calc(100dvh - 112px))",
				maxHeight: "calc(100dvh - 112px)"
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SupportPanel, {
				onClose: () => setOpen(false),
				onMinimize: () => setOpen(false),
				onAssistantMessage: () => {
					if (!openRef.current) setUnread(true);
				}
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed bottom-6 right-6 z-[9999]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "icon",
					"aria-label": open ? "Close support chat" : "Chat with support",
					onClick: () => open ? setOpen(false) : openPanel(),
					className: "relative h-14 w-14 rounded-full shadow-lg shadow-primary/25 transition-transform hover:scale-105 active:scale-95",
					children: [open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-6 w-6" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Headset, { className: "h-6 w-6" }), !open && unread && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-label": "New message from support",
						className: "absolute right-1 top-1 h-3 w-3 rounded-full bg-destructive ring-2 ring-background"
					})]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
				side: "left",
				children: open ? "Close support chat" : "Chat with support"
			})] })
		})]
	}), document.body);
}
function PanelFrame({ title, subtitle, onClose, onMinimize, actions, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		role: "dialog",
		"aria-label": "Customer support chat",
		className: "flex min-h-0 flex-1 flex-col overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex shrink-0 items-center gap-2 border-b border-border bg-primary px-3 py-2.5 text-primary-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Headset, { className: "h-4 w-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1 leading-tight",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-sm font-semibold",
						children: title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-[11px] text-primary-foreground/75",
						children: subtitle
					})]
				}),
				actions,
				onMinimize && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					"aria-label": "Minimize support chat",
					onClick: onMinimize,
					className: "h-8 w-8 text-primary-foreground transition-colors hover:bg-primary-foreground/15 hover:text-primary-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "h-4 w-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					"aria-label": "Close support chat",
					onClick: onClose,
					className: "h-8 w-8 text-primary-foreground transition-colors hover:bg-primary-foreground/15 hover:text-primary-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
				})
			]
		}), children]
	});
}
function SupportPanel({ onClose, onMinimize, onAssistantMessage }) {
	const { ready, userId, email, customer, profileLoading, profileError, tenantId } = useCustomerSession();
	const queryClient = useQueryClient();
	const [conversationId, setConversationId] = (0, import_react.useState)(null);
	const [showHistory, setShowHistory] = (0, import_react.useState)(false);
	const [messages, setMessages] = (0, import_react.useState)([]);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [pendingFile, setPendingFile] = (0, import_react.useState)(null);
	const [previewUrl, setPreviewUrl] = (0, import_react.useState)(null);
	const [sending, setSending] = (0, import_react.useState)(false);
	const [slow, setSlow] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [banner, setBanner] = (0, import_react.useState)(null);
	const [dragging, setDragging] = (0, import_react.useState)(false);
	const [atBottom, setAtBottom] = (0, import_react.useState)(true);
	const [hasNew, setHasNew] = (0, import_react.useState)(false);
	const retryRef = (0, import_react.useRef)(null);
	const fileInputRef = (0, import_react.useRef)(null);
	const scrollRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!userId) {
			setConversationId(null);
			return;
		}
		const stored = window.localStorage.getItem(CONVERSATION_KEY(userId));
		const id = stored ?? crypto.randomUUID();
		if (!stored) window.localStorage.setItem(CONVERSATION_KEY(userId), id);
		setConversationId(id);
	}, [userId]);
	const history = useQuery(myConversationsQuery(userId));
	const stored = useQuery(conversationMessagesQuery(conversationId, Boolean(userId) && !sending));
	(0, import_react.useEffect)(() => {
		if (sending) return;
		if (stored.data) setMessages(stored.data);
	}, [stored.data, sending]);
	(0, import_react.useEffect)(() => {
		if (!pendingFile) {
			setPreviewUrl(null);
			return;
		}
		const url = URL.createObjectURL(pendingFile);
		setPreviewUrl(url);
		return () => URL.revokeObjectURL(url);
	}, [pendingFile]);
	const scrollToBottom = (0, import_react.useCallback)(() => {
		const node = scrollRef.current;
		if (!node) return;
		node.scrollTop = node.scrollHeight;
		setHasNew(false);
	}, []);
	(0, import_react.useEffect)(() => {
		const node = scrollRef.current;
		if (!node) return;
		if (atBottom) {
			node.scrollTop = node.scrollHeight;
			setHasNew(false);
		} else setHasNew(true);
	}, [
		messages.length,
		sending,
		banner
	]);
	const onScroll = () => {
		const node = scrollRef.current;
		if (!node) return;
		const near = node.scrollHeight - node.scrollTop - node.clientHeight < 64;
		setAtBottom(near);
		if (near) setHasNew(false);
	};
	const resetConversationState = (0, import_react.useCallback)(() => {
		setMessages([]);
		setBanner(null);
		setError(null);
		setDraft("");
		setPendingFile(null);
		setSending(false);
		setSlow(false);
		setHasNew(false);
		setAtBottom(true);
		retryRef.current = null;
	}, []);
	const startNewConversation = (0, import_react.useCallback)(() => {
		if (!userId) return;
		const id = crypto.randomUUID();
		window.localStorage.setItem(CONVERSATION_KEY(userId), id);
		setConversationId(id);
		setShowHistory(false);
		resetConversationState();
	}, [userId, resetConversationState]);
	const openConversation = (0, import_react.useCallback)((id) => {
		if (!userId) return;
		window.localStorage.setItem(CONVERSATION_KEY(userId), id);
		setConversationId(id);
		setShowHistory(false);
		resetConversationState();
	}, [userId, resetConversationState]);
	const pickFile = (file) => {
		if (!file) return;
		const problem = validateAttachment(file);
		if (problem) {
			setError(problem);
			return;
		}
		setError(null);
		setPendingFile(file);
	};
	const applyOutcome = (outcome) => {
		if (outcome.kind === "needs_information") setBanner({
			kind: "needs_information",
			text: outcome.prompt ? `${NEEDS_INFO_TEXT} ${outcome.prompt}` : `${NEEDS_INFO_TEXT} ${SCREENSHOT_HINT}`
		});
		else if (outcome.kind === "handoff") setBanner({
			kind: "handoff",
			text: HANDOFF_TEXT
		});
		else setBanner(null);
	};
	const deliver = (0, import_react.useCallback)(async (text, file, attachmentsIn) => {
		if (!userId || !conversationId) return;
		setSending(true);
		setSlow(false);
		setError(null);
		setBanner(null);
		const slowTimer = setTimeout(() => setSlow(true), CHAT_SLOW_NOTICE_MS);
		const localId = crypto.randomUUID();
		let attachments = attachmentsIn;
		try {
			await ensureConversation({
				conversationId,
				customerId: userId,
				tenantId,
				title: text || "Screenshot"
			});
			if (file) attachments = [await uploadAttachment({
				file,
				tenantId,
				customerId: userId,
				conversationId
			})];
			retryRef.current = {
				text,
				attachments
			};
			const sentAt = (/* @__PURE__ */ new Date()).toISOString();
			setMessages((prev) => [...prev, {
				id: localId,
				role: "customer",
				text: text || null,
				timestamp: sentAt,
				attachments,
				pending: true
			}]);
			setDraft("");
			setPendingFile(null);
			const result = await sendChatMessage({
				tenantId,
				customerId: userId,
				conversationId,
				text,
				attachments
			});
			const replyAt = new Date(Math.max(Date.now(), new Date(sentAt).getTime() + 1)).toISOString();
			setMessages((prev) => [...prev.map((m) => m.id === localId ? {
				...m,
				pending: false
			} : m), {
				id: crypto.randomUUID(),
				role: "assistant",
				text: result.text,
				timestamp: replyAt,
				attachments: []
			}]);
			applyOutcome(result.outcome);
			onAssistantMessage?.();
			retryRef.current = null;
			queryClient.invalidateQueries({ queryKey: ["my-conversations", userId] });
		} catch (err) {
			setMessages((prev) => prev.map((m) => m.id === localId ? {
				...m,
				pending: false,
				failed: true
			} : m));
			setError(err instanceof Error ? err.message : "We couldn't send that message. Please try again.");
		} finally {
			clearTimeout(slowTimer);
			setSlow(false);
			setSending(false);
		}
	}, [
		userId,
		conversationId,
		tenantId,
		queryClient,
		onAssistantMessage
	]);
	const submit = (override) => {
		if (sending) return;
		const text = (override ?? draft).trim();
		if (!text && !pendingFile) return;
		deliver(text, pendingFile, []);
	};
	const retry = () => {
		const last = retryRef.current;
		if (!last || sending) return;
		setMessages((prev) => prev.filter((m) => !m.failed));
		deliver(last.text, null, last.attachments);
	};
	const groups = (0, import_react.useMemo)(() => {
		const out = [];
		for (const m of sortChronologically(messages)) {
			const day = dayKey(m.timestamp);
			const last = out[out.length - 1];
			if (last && last.role === m.role && last.day === day) last.items.push(m);
			else out.push({
				key: m.id,
				role: m.role,
				day,
				items: [m]
			});
		}
		return out;
	}, [messages]);
	if (!ready || userId && profileLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelFrame, {
		title: "FlowStack Support",
		subtitle: "Connecting…",
		onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-0 flex-1 items-center justify-center text-sm text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }), " Loading your support session…"]
		})
	});
	if (!userId) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelFrame, {
		title: "FlowStack Support",
		subtitle: "Sign in to start a chat",
		onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthPanel, {})
	});
	const displayName = customer?.name ?? email ?? "Signed in";
	if (showHistory) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PanelFrame, {
		title: "Your conversations",
		subtitle: displayName,
		onClose,
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "icon",
			"aria-label": "Back to chat",
			onClick: () => setShowHistory(false),
			className: "h-8 w-8 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" })
		}),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-h-0 flex-1 space-y-2 overflow-y-auto p-3",
			children: [
				history.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "p-3 text-sm text-muted-foreground",
					children: "Loading your conversations…"
				}),
				!history.isLoading && (history.data ?? []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "p-3 text-sm text-muted-foreground",
					children: "You haven't started a conversation yet."
				}),
				(history.data ?? []).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => openConversation(c.conversation_id),
					className: cn("w-full rounded-lg border border-border p-3 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", c.conversation_id === conversationId && "border-primary/50 bg-accent/60"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm font-medium",
							children: c.title ?? "Support conversation"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 line-clamp-2 text-xs text-muted-foreground",
							children: c.last_message ?? "No messages yet"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-[11px] text-muted-foreground",
							children: [
								c.message_count,
								" message",
								c.message_count === 1 ? "" : "s",
								" ·",
								" ",
								formatRelative(c.last_activity)
							]
						})
					]
				}, c.conversation_id))
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "shrink-0 border-t border-border p-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "w-full",
				onClick: startNewConversation,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquarePlus, { className: "mr-2 h-4 w-4" }), " New conversation"]
			})
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PanelFrame, {
		title: "FlowStack Support",
		subtitle: "Support assistant",
		onClose,
		onMinimize,
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "icon",
			"aria-label": "Your conversations",
			onClick: () => setShowHistory(true),
			className: "h-8 w-8 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "h-4 w-4" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "icon",
			"aria-label": "New conversation",
			onClick: startNewConversation,
			className: "h-8 w-8 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquarePlus, { className: "h-4 w-4" })
		})] }),
		children: [
			profileError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "shrink-0 border-b border-border bg-destructive/10 px-4 py-2 text-xs text-destructive",
				children: "We couldn't load your account details. Support can still answer general questions."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative min-h-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					ref: scrollRef,
					onScroll,
					className: cn("h-full space-y-3 overflow-y-auto overflow-x-hidden p-3", dragging && "bg-accent/40"),
					onDragOver: (e) => {
						e.preventDefault();
						setDragging(true);
					},
					onDragLeave: () => setDragging(false),
					onDrop: (e) => {
						e.preventDefault();
						setDragging(false);
						pickFile(e.dataTransfer.files?.[0] ?? null);
					},
					children: [
						stored.isLoading && messages.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Restoring your conversation…"
						}),
						!stored.isLoading && messages.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-1 pt-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Headset, { className: "h-5 w-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-sm font-semibold",
									children: "FlowStack Support"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: "Hi! What can we help you with?"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 flex flex-col gap-2",
									children: SUGGESTIONS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => submit(s),
										disabled: sending,
										className: "rounded-xl border border-border px-3 py-2 text-left text-sm transition-colors hover:border-primary/40 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
										children: s
									}, s))
								})
							]
						}),
						groups.map((group, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [(index === 0 || groups[index - 1].day !== group.day) && group.day && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 py-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] text-muted-foreground",
										children: dayLabel(group.items[0].timestamp)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" })
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageGroup, {
								group,
								onRetry: retry,
								sending
							})]
						}, group.key)),
						sending && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-start gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-3 py-2.5",
								children: [
									0,
									1,
									2
								].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "h-1.5 w-1.5 animate-support-dot rounded-full bg-muted-foreground",
									style: { animationDelay: `${i * .15}s` }
								}, i))
							}), slow && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-muted-foreground",
								children: "Still working on that…"
							})]
						}),
						banner && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: cn("flex gap-2 rounded-lg border p-3 text-xs", banner.kind === "handoff" ? "border-primary/40 bg-primary/10 text-foreground" : "border-border bg-muted text-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mt-0.5 h-4 w-4 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: banner.text })]
						}),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "mt-0.5 h-4 w-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: error }), retryRef.current && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									className: "mt-2 h-7",
									"aria-label": "Retry message",
									onClick: retry,
									disabled: sending,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "mr-1.5 h-3.5 w-3.5" }), " Retry"]
								})]
							})]
						})
					]
				}), hasNew && !atBottom && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: scrollToBottom,
					className: "absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium shadow-md transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "mr-1 inline h-3.5 w-3.5" }), " New message"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "shrink-0 border-t border-border p-3",
				children: [
					pendingFile && previewUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2 flex items-center gap-3 rounded-xl border border-border p-2 transition-opacity",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: previewUrl,
								alt: `Attachment preview: ${pendingFile.name}`,
								className: "max-h-[160px] max-w-[220px] rounded-lg object-contain"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-xs font-medium",
									children: pendingFile.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[11px] text-muted-foreground",
									children: [(pendingFile.size / 1024 / 1024).toFixed(2), " MB"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								className: "h-7 w-7 shrink-0",
								"aria-label": "Remove attachment",
								onClick: () => setPendingFile(null),
								disabled: sending,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-end gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: fileInputRef,
								type: "file",
								accept: "image/png,image/jpeg,image/jpg,image/webp",
								className: "hidden",
								onChange: (e) => {
									pickFile(e.target.files?.[0] ?? null);
									e.target.value = "";
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "icon",
									"aria-label": "Attach screenshot",
									className: "h-9 w-9 shrink-0 rounded-full",
									onClick: () => fileInputRef.current?.click(),
									disabled: sending,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "h-4 w-4" })
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
								side: "top",
								children: "Attach screenshot (PNG, JPG, WEBP)"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								value: draft,
								onChange: (e) => setDraft(e.target.value),
								onKeyDown: (e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										submit();
									}
								},
								placeholder: "Type your message…",
								"aria-label": "Message",
								rows: 1,
								className: "max-h-28 min-h-9 resize-none rounded-2xl py-2 transition-shadow",
								disabled: sending
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								"aria-label": "Send message",
								className: "h-9 w-9 shrink-0 rounded-full",
								onClick: () => submit(),
								disabled: sending || !draft.trim() && !pendingFile,
								children: sending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4" })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-[11px] text-muted-foreground",
						children: "Please don't share passwords or card numbers in this chat."
					})
				]
			})
		]
	});
}
function MessageGroup({ group, onRetry, sending }) {
	const mine = group.role === "customer";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-col gap-1", mine ? "items-end" : "items-start"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "px-1 text-[11px] font-medium text-muted-foreground",
			children: mine ? "You" : "FlowStack Support"
		}), group.items.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageBubble, {
			message: m,
			mine,
			last: i === group.items.length - 1,
			onRetry,
			sending
		}, m.id))]
	});
}
function MessageBubble({ message, mine, last, onRetry, sending }) {
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [vote, setVote] = (0, import_react.useState)(null);
	const copy = async () => {
		if (!message.text) return;
		try {
			await navigator.clipboard.writeText(message.text);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch {}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("group flex max-w-[88%] flex-col", mine ? "items-end" : "items-start"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("animate-support-in space-y-2 rounded-2xl px-3 py-2 text-sm", mine ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-muted text-foreground", message.failed && "opacity-60 ring-1 ring-destructive"),
			children: [message.text && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "whitespace-pre-wrap break-words",
				children: message.text
			}), message.attachments.map((a) => a.url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: a.url,
				alt: a.file_name,
				className: "max-h-[160px] max-w-[220px] rounded-lg border border-border/40 object-contain"
			}, a.id) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs opacity-80",
				children: a.file_name
			}, a.id))]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-0.5 flex items-center gap-1.5 px-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[10px] text-muted-foreground",
					children: message.pending ? "Sending…" : message.failed ? "Failed to send" : mine && last ? `Sent · ${timeLabel(message.timestamp)}` : timeLabel(message.timestamp)
				}),
				message.failed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onRetry,
					disabled: sending,
					"aria-label": "Retry message",
					className: "text-[10px] font-medium text-destructive underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
					children: "Retry"
				}),
				!mine && message.text && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: copy,
							"aria-label": "Copy response",
							className: "rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
							children: copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3 w-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "h-3 w-3" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setVote(vote === "up" ? null : "up"),
							"aria-label": "Helpful response",
							"aria-pressed": vote === "up",
							className: cn("rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", vote === "up" && "text-primary"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsUp, { className: "h-3 w-3" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setVote(vote === "down" ? null : "down"),
							"aria-label": "Unhelpful response",
							"aria-pressed": vote === "down",
							className: cn("rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", vote === "down" && "text-destructive"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsDown, { className: "h-3 w-3" })
						}),
						copied && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] text-muted-foreground",
							children: "Copied"
						})
					]
				})
			]
		})]
	});
}
function AuthPanel() {
	const [mode, setMode] = (0, import_react.useState)("signin");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [showPassword, setShowPassword] = (0, import_react.useState)(false);
	const passwordRef = (0, import_react.useRef)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [message, setMessage] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const submit = async (e) => {
		e.preventDefault();
		setBusy(true);
		setError(null);
		setMessage(null);
		try {
			if (mode === "signin") {
				const { error: signInError } = await supabase.auth.signInWithPassword({
					email,
					password
				});
				if (signInError) throw new Error("That email or password doesn't look right.");
			} else {
				const { data, error: signUpError } = await supabase.auth.signUp({
					email,
					password,
					options: { emailRedirectTo: window.location.origin }
				});
				if (signUpError) throw new Error(signUpError.message);
				if (!data.session) setMessage("Check your inbox to confirm your email, then sign in.");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: submit,
		className: "flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Sign in so we can see your account and previous conversations."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "support-email",
					children: "Email"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "support-email",
					type: "email",
					autoComplete: "email",
					required: true,
					value: email,
					onChange: (e) => setEmail(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "support-password",
					children: "Password"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						ref: passwordRef,
						id: "support-password",
						type: showPassword ? "text" : "password",
						autoComplete: mode === "signin" ? "current-password" : "new-password",
						required: true,
						minLength: 6,
						className: "pr-10",
						value: password,
						onChange: (e) => setPassword(e.target.value)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": showPassword ? "Hide password" : "Show password",
						"aria-pressed": showPassword,
						onClick: () => {
							setShowPassword((v) => !v);
							passwordRef.current?.focus();
						},
						className: "absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
						children: showPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" })
					})]
				})]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-destructive",
				children: error
			}),
			message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: message
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "submit",
				disabled: busy,
				children: [busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }), mode === "signin" ? "Sign in" : "Create account"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "ghost",
				onClick: () => {
					setMode(mode === "signin" ? "signup" : "signin");
					setError(null);
					setMessage(null);
				},
				children: mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"
			})
		]
	});
}
function SignOutButton({ className }) {
	const { userId } = useCustomerSession();
	if (!userId) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		variant: "outline",
		size: "sm",
		className,
		onClick: async () => {
			window.localStorage.removeItem(CONVERSATION_KEY(userId));
			await supabase.auth.signOut();
		},
		children: "Sign out"
	});
}
var CARDS = [
	{
		icon: Sparkles,
		title: "Instant answers",
		body: "The assistant searches our product documentation to answer plan, billing and setup questions."
	},
	{
		icon: LifeBuoy,
		title: "Share a screenshot",
		body: "Attach a PNG, JPG or WEBP image of what you're seeing so we can diagnose the issue faster."
	},
	{
		icon: ShieldCheck,
		title: "Human handoff",
		body: "If your issue needs a specialist, we collect the details and pass it to our support team."
	}
];
function HelpCentrePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "border-b border-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-2 font-semibold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Headset, { className: "h-5 w-5 text-primary" }), " FlowStack Support"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignOutButton, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						size: "sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/overview",
							children: "Ops console"
						})
					})]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-5xl px-6 py-16",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl",
					children: "Help with FlowStack, whenever you need it"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-xl text-muted-foreground",
					children: "Open the support chat in the corner to start a conversation. Your history is saved to your account, so you can pick up where you left off."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-12 grid gap-4 md:grid-cols-3",
					children: CARDS.map((card) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-xl border border-border bg-card p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(card.icon, { className: "h-5 w-5 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-3 text-base font-medium",
								children: card.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1.5 text-sm text-muted-foreground",
								children: card.body
							})
						]
					}, card.title))
				})
			]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SupportWidget, {})] });
}
//#endregion
export { HelpCentrePage as component };

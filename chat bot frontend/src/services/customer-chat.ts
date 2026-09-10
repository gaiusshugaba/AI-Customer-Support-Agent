import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import {
  ATTACHMENT_MAX_BYTES,
  CHAT_ATTACHMENTS_BUCKET,
  CHAT_REQUEST_TIMEOUT_MS,
  WEBHOOKS,
  resolveTenantId,
} from "@/lib/constants";
import type { ConversationTurn, CustomerRecord } from "@/types/ops";

/* ------------------------------------------------------------------ types */

export type ChatAttachment = {
  id: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  created_at: string;
  url: string | null;
};

export type ChatMessage = {
  id: string;
  role: "customer" | "assistant";
  text: string | null;
  timestamp: string;
  attachments: ChatAttachment[];
  seq?: number;
  pending?: boolean;
  failed?: boolean;
};

export type CustomerConversation = {
  conversation_id: string;
  tenant_id: string;
  customer_id: string;
  title: string | null;
  created_at: string;
  last_activity: string;
  message_count: number;
  last_message: string | null;
};

export type ChatOutcome =
  | { kind: "answered" }
  | { kind: "needs_information"; prompt: string | null }
  | { kind: "handoff" };

export type SendResult = { text: string; outcome: ChatOutcome };

const TURN_COLUMNS = "turn_id, conversation_id, tenant_id, role, text, timestamp";

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

/* ------------------------------------------------------------------ helpers */

function repairRoundOrder(messages: ChatMessage[]): ChatMessage[] {
  const out = [...messages];
  for (let i = 0; i < out.length - 1; i += 1) {
    const first = out[i]!;
    const second = out[i + 1]!;
    if (first.role !== "assistant" || second.role !== "customer") continue;
    if (first.seq == null || second.seq == null) continue;
    if (second.seq !== first.seq + 1) continue;
    const dt = Math.abs(
      new Date(second.timestamp).getTime() - new Date(first.timestamp).getTime(),
    );
    if (dt > 5000) continue;
    out[i] = second;
    out[i + 1] = first;
    i += 1;
  }
  return out;
}

export function sortChronologically(messages: ChatMessage[]): ChatMessage[] {
  const sorted = [...messages]
    .map((m, index) => ({ m, index }))
    .sort((a, b) => {
      const ta = new Date(a.m.timestamp).getTime();
      const tb = new Date(b.m.timestamp).getTime();
      if (ta !== tb) return ta - tb;
      if (a.m.seq != null && b.m.seq != null && a.m.seq !== b.m.seq) return a.m.seq - b.m.seq;
      return a.index - b.index;
    })
    .map((entry) => entry.m);
  return repairRoundOrder(sorted);
}

// --------------------------------------------------------------- customer profile

export async function loadCustomerProfile(
  userId: string,
  email: string | null,
): Promise<CustomerRecord> {
  const existing = await supabase
    .from("customers")
    .select("customer_id, tenant_id, email, name, plan_tier, account_status, custom_fields")
    .eq("customer_id", userId)
    .maybeSingle();
  if (existing.error) throw new Error(existing.error.message);
  if (existing.data) return existing.data as CustomerRecord;

  const inserted = await supabase
    .from("customers")
    .insert({
      customer_id: userId,
      tenant_id: resolveTenantId(null),
      email,
      name: email?.split("@")[0] ?? null,
    })
    .select("customer_id, tenant_id, email, name, plan_tier, account_status, custom_fields")
    .single();
  if (inserted.error) throw new Error(inserted.error.message);
  return inserted.data as CustomerRecord;
}

export const customerProfileQuery = (userId: string | null, email: string | null) =>
  queryOptions({
    queryKey: ["customer-profile", userId],
    queryFn: () => (userId ? loadCustomerProfile(userId, email) : Promise.resolve(null)),
    enabled: Boolean(userId),
    staleTime: 60_000,
  });

// ------------------------------------------------------------- conversations

export async function ensureConversation(input: {
  conversationId: string;
  customerId: string;
  tenantId: string;
  title?: string | null;
}) {
  const { error } = await supabase.from("customer_conversations").upsert(
    {
      conversation_id: input.conversationId,
      customer_id: input.customerId,
      tenant_id: input.tenantId,
      ...(input.title ? { title: input.title.slice(0, 120) } : {}),
      last_activity: new Date().toISOString(),
    },
    { onConflict: "conversation_id" },
  );
  if (error) throw new Error(error.message);
}

export async function fetchMyConversations(customerId: string, limit = 200): Promise<CustomerConversation[]> {
  const [convos, turns] = await Promise.all([
    supabase
      .from("customer_conversations")
      .select("conversation_id, tenant_id, customer_id, title, created_at, last_activity")
      .eq("customer_id", customerId)
      .order("last_activity", { ascending: false })
      .limit(limit),
    supabase
      .from("conversation_turns")
      .select(TURN_COLUMNS)
      .order("timestamp", { ascending: true })
      .limit(limit * 10),
  ]);
  if (convos.error) throw new Error(convos.error.message);
  if (turns.error) throw new Error(turns.error.message);

  const byConversation = new Map<string, ConversationTurn[]>();
  for (const t of (turns.data ?? []) as ConversationTurn[]) {
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
      last_activity: last?.timestamp ?? c.last_activity,
    } as CustomerConversation;
  });
}

export const myConversationsQuery = (customerId: string | null) =>
  queryOptions({
    queryKey: ["my-conversations", customerId],
    queryFn: () => (customerId ? fetchMyConversations(customerId) : Promise.resolve([])),
    enabled: Boolean(customerId),
    staleTime: 10_000,
  });

// ---------------------------------------------------------------- transcript

async function signAttachments(rows: Omit<ChatAttachment, "url">[]): Promise<ChatAttachment[]> {
  return Promise.all(
    rows.map(async (row) => ({
      ...row,
      url: await signedAttachmentUrl(row.storage_path),
    })),
  );
}

export async function signedAttachmentUrl(storagePath: string): Promise<string | null> {
  const { data } = await supabase.storage
    .from(CHAT_ATTACHMENTS_BUCKET)
    .createSignedUrl(storagePath, 3600);
  return data?.signedUrl ?? null;
}

export async function fetchConversationMessages(conversationId: string): Promise<ChatMessage[]> {
  const [turnsResult, attachmentsResult] = await Promise.all([
    supabase
      .from("conversation_turns")
      .select(TURN_COLUMNS)
      .eq("conversation_id", conversationId)
      .order("turn_id", { ascending: true }),
    supabase
      .from("conversation_attachments")
      .select("id, storage_path, file_name, mime_type, file_size, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true }),
  ]);
  if (turnsResult.error) throw new Error(turnsResult.error.message);
  if (attachmentsResult.error) throw new Error(attachmentsResult.error.message);

  const attachments = await signAttachments(
    (attachmentsResult.data ?? []) as Omit<ChatAttachment, "url">[],
  );

  const messages: ChatMessage[] = ((turnsResult.data ?? []) as ConversationTurn[]).map((t) => ({
    id: `turn-${t.turn_id}`,
    seq: t.turn_id,
    role: t.role === "user" || t.role === "customer" ? "customer" : "assistant",
    text: t.text,
    timestamp: t.timestamp,
    attachments: [],
  }));

  for (const attachment of attachments) {
    const at = new Date(attachment.created_at).getTime();
    let target: ChatMessage | undefined;
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
    else
      messages.push({
        id: `attachment-${attachment.id}`,
        role: "customer",
        text: null,
        timestamp: attachment.created_at,
        attachments: [attachment],
      });
  }

  return sortChronologically(messages);
}

export const conversationMessagesQuery = (conversationId: string | null, enabled: boolean) =>
  queryOptions({
    queryKey: ["chat-messages", conversationId],
    queryFn: () =>
      conversationId ? fetchConversationMessages(conversationId) : Promise.resolve([]),
    enabled: enabled && Boolean(conversationId),
    staleTime: 5_000,
  });

// --------------------------------------------------------------- attachments

export function validateAttachment(file: File): string | null {
  const mime = file.type.toLowerCase();
  if (!ALLOWED_MIME_TYPES.includes(mime)) {
    return "Please attach a PNG, JPG or WEBP image.";
  }
  if (file.size > ATTACHMENT_MAX_BYTES) {
    return "That image is larger than 10 MB. Please attach a smaller screenshot.";
  }
  return null;
}

export async function uploadAttachment(input: {
  file: File;
  tenantId: string;
  customerId: string;
  conversationId: string;
}): Promise<ChatAttachment> {
  const safeName = input.file.name.replace(/[^\w.\-]+/g, "_").slice(-80);
  const storagePath = `${input.tenantId}/${input.customerId}/${input.conversationId}/${crypto.randomUUID()}-${safeName}`;

  const upload = await supabase.storage
    .from(CHAT_ATTACHMENTS_BUCKET)
    .upload(storagePath, input.file, { contentType: input.file.type, upsert: false });
  if (upload.error) throw new Error("We couldn't upload that screenshot. Please try again.");

  const record = await supabase
    .from("conversation_attachments")
    .insert({
      tenant_id: input.tenantId,
      customer_id: input.customerId,
      conversation_id: input.conversationId,
      storage_path: storagePath,
      file_name: safeName,
      mime_type: input.file.type,
      file_size: input.file.size,
    })
    .select("id, storage_path, file_name, mime_type, file_size, created_at")
    .single();
  if (record.error) throw new Error("We couldn't attach that screenshot. Please try again.");

  return {
    ...(record.data as Omit<ChatAttachment, "url">),
    url: await signedAttachmentUrl(storagePath),
  };
}

// -------------------------------------------------------------- send to n8n

function pickResponse(raw: unknown): Record<string, unknown> {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return (value ?? {}) as Record<string, unknown>;
}

function readOutcome(body: Record<string, unknown>): ChatOutcome {
  const status = String(
    body["escalation_status"] ?? body["status"] ?? body["decision"] ?? "",
  ).toUpperCase();

  if (status.includes("AWAITING") || status.includes("NEEDS_INFO")) {
    const missing = body["missing_information"] ?? body["required_information"];
    const prompt = Array.isArray(missing) && missing.length ? String(missing[0]) : null;
    return { kind: "needs_information", prompt };
  }
  if (status.includes("READY_FOR_AGENT") || status.includes("HANDOFF") || status.includes("HUMAN")) {
    return { kind: "handoff" };
  }
  return { kind: "answered" };
}

export async function sendChatMessage(input: {
  tenantId: string;
  customerId: string;
  conversationId: string;
  text: string;
  attachments: ChatAttachment[];
  signal?: AbortSignal;
}): Promise<SendResult> {
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
        ...(input.attachments.length
          ? {
              attachments: input.attachments.map((a) => ({
                type: "image",
                mime_type: a.mime_type,
                file_name: a.file_name,
                storage_path: `${CHAT_ATTACHMENTS_BUCKET}/${a.storage_path}`,
                url: a.url,
              })),
            }
          : {}),
      }),
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error("Your session has expired. Please sign in again.");
    }
    if (!response.ok) {
      throw new Error("We couldn't send that message. Please try again.");
    }

    const body = pickResponse(await response.json().catch(() => ({})));
    const text = typeof body["response_text"] === "string" ? body["response_text"].trim() : "";
    if (!text) {
      throw new Error("We couldn't read the support reply. Please try again.");
    }
    return { text, outcome: readOutcome(body) };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(
        "The support assistant is taking longer than expected. Please try again.",
      );
    }
    if (error instanceof TypeError) {
      throw new Error("We couldn't reach support. Please check your connection and try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
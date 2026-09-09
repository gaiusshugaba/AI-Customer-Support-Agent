/**
 * Default tenant for the current demo deployment.
 *
 * Tenant identity is resolved at runtime through `resolveTenantId()` so that it
 * can later come from the authenticated user's organisation / tenant membership
 * (e.g. the `tenant_id` on their `customers` row) instead of being hardcoded.
 */
export const DEFAULT_TENANT_ID = "b2b-saas-demo";

/** Kept for the admin operations console, which is scoped to the demo tenant. */
export const TENANT_ID = DEFAULT_TENANT_ID;

/** Resolves the tenant for a signed-in customer, falling back to the demo tenant. */
export function resolveTenantId(customerTenantId?: string | null): string {
  return customerTenantId && customerTenantId.trim() ? customerTenantId : DEFAULT_TENANT_ID;
}

/** Backend endpoints owned by the n8n workflows. Do not change. */
export const WEBHOOKS = {
  /** Customer chat backend. */
  conversationMessage: "https://f6nvuwee.rpcl.app/webhook/conversation-message",
  /** Knowledge ingestion backend — used by this admin console. */
  kbIngest: "https://f6nvuwee.rpcl.app/webhook/kb-ingest",
} as const;

export const CHAT_ATTACHMENTS_BUCKET = "chat-attachments";
export const ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
export const ATTACHMENT_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

/** n8n can run long AI/retrieval chains; keep the client patient instead of duplicating sends. */
export const CHAT_REQUEST_TIMEOUT_MS = 120_000;
export const CHAT_SLOW_NOTICE_MS = 15_000;

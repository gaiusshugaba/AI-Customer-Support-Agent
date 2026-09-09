import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { TENANT_ID, WEBHOOKS } from "@/lib/constants";
import type { IngestionLogRow, KnowledgeDocument } from "@/types/ops";

const COLUMNS =
  "id, doc_id, tenant_id, title, chunk_count, embedding_model, status, error_message, failed_node, ingested_at";

export async function fetchIngestionLog(limit = 200): Promise<IngestionLogRow[]> {
  const { data, error } = await supabase
    .from("ingestion_log")
    .select(COLUMNS)
    .eq("tenant_id", TENANT_ID)
    .order("ingested_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as IngestionLogRow[];
}

export async function fetchDocuments(): Promise<KnowledgeDocument[]> {
  const rows = await fetchIngestionLog();
  const byDoc = new Map<string, IngestionLogRow[]>();
  for (const row of rows) {
    const key = row.doc_id ?? `untitled-${row.id}`;
    const list = byDoc.get(key);
    if (list) list.push(row);
    else byDoc.set(key, [row]);
  }
  return [...byDoc.entries()]
    .map(([doc_id, history]) => {
      const ordered = [...history].sort((a, b) => b.ingested_at.localeCompare(a.ingested_at));
      const latest = ordered[0]!;
      return {
        doc_id,
        title: latest.title,
        tenant_id: latest.tenant_id,
        status: latest.status,
        chunk_count: latest.chunk_count,
        embedding_model: latest.embedding_model,
        last_ingested: latest.ingested_at,
        history: ordered,
      } satisfies KnowledgeDocument;
    })
    .sort((a, b) => b.last_ingested.localeCompare(a.last_ingested));
}

export const documentsQuery = () =>
  queryOptions({
    queryKey: ["documents", TENANT_ID],
    queryFn: fetchDocuments,
    staleTime: 15_000,
  });

export const ingestionLogQuery = () =>
  queryOptions({
    queryKey: ["ingestion-log", TENANT_ID],
    queryFn: () => fetchIngestionLog(),
    staleTime: 10_000,
  });

/** Uploads a knowledge-base file to the existing n8n ingestion webhook. */
export async function ingestDocument(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(WEBHOOKS.kbIngest, { method: "POST", body: fd });
  const raw = await res.json().catch(() => ({}));
  const data = (Array.isArray(raw) ? raw[0] : raw) ?? {};
  if (!res.ok || data.status === "failed") {
    throw new Error(data.error_message ?? data.message ?? `Upload failed (${res.status})`);
  }
  return data as { doc_id?: string; chunks_indexed?: number; chunk_count?: number };
}

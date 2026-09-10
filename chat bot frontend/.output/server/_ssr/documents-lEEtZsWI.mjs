import { a as TENANT_ID, f as supabase, u as WEBHOOKS } from "./client-CjaA9JUL.mjs";
import { n as queryOptions } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/documents-lEEtZsWI.js
var COLUMNS = "id, doc_id, tenant_id, title, chunk_count, embedding_model, status, error_message, failed_node, ingested_at";
async function fetchIngestionLog(limit = 200) {
	const { data, error } = await supabase.from("ingestion_log").select(COLUMNS).eq("tenant_id", TENANT_ID).order("ingested_at", { ascending: false }).limit(limit);
	if (error) throw new Error(error.message);
	return data ?? [];
}
async function fetchDocuments() {
	const rows = await fetchIngestionLog();
	const byDoc = /* @__PURE__ */ new Map();
	for (const row of rows) {
		const key = row.doc_id ?? `untitled-${row.id}`;
		const list = byDoc.get(key);
		if (list) list.push(row);
		else byDoc.set(key, [row]);
	}
	return [...byDoc.entries()].map(([doc_id, history]) => {
		const ordered = [...history].sort((a, b) => b.ingested_at.localeCompare(a.ingested_at));
		const latest = ordered[0];
		return {
			doc_id,
			title: latest.title,
			tenant_id: latest.tenant_id,
			status: latest.status,
			chunk_count: latest.chunk_count,
			embedding_model: latest.embedding_model,
			last_ingested: latest.ingested_at,
			history: ordered
		};
	}).sort((a, b) => b.last_ingested.localeCompare(a.last_ingested));
}
var documentsQuery = () => queryOptions({
	queryKey: ["documents", TENANT_ID],
	queryFn: fetchDocuments,
	staleTime: 15e3
});
var ingestionLogQuery = () => queryOptions({
	queryKey: ["ingestion-log", TENANT_ID],
	queryFn: () => fetchIngestionLog(),
	staleTime: 1e4
});
/** Uploads a knowledge-base file to the existing n8n ingestion webhook. */
async function ingestDocument(file) {
	const fd = new FormData();
	fd.append("file", file);
	const res = await fetch(WEBHOOKS.kbIngest, {
		method: "POST",
		body: fd
	});
	const raw = await res.json().catch(() => ({}));
	const data = (Array.isArray(raw) ? raw[0] : raw) ?? {};
	if (!res.ok || data.status === "failed") throw new Error(data.error_message ?? data.message ?? `Upload failed (${res.status})`);
	return data;
}
//#endregion
export { ingestionLogQuery as a, ingestDocument as i, fetchDocuments as n, fetchIngestionLog as r, documentsQuery as t };

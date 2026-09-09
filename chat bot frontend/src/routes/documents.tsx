import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/AdminShell";
import { ALL, FilterBar, SearchFilter, SelectFilter } from "@/components/admin/Filters";
import {
  EmptyState,
  ErrorState,
  Mono,
  PageHeader,
  TableShell,
  TableSkeleton,
  Th,
} from "@/components/admin/Primitives";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDateTime, humanize } from "@/lib/format";
import { documentsQuery, ingestDocument } from "@/services/documents";

export const Route = createFileRoute("/documents")({
  head: () => ({
    meta: [
      { title: "Knowledge Documents — FlowStack Ops" },
      {
        name: "description",
        content:
          "Manage the AI support knowledge base: uploaded documents, chunk counts, embedding models and ingestion status.",
      },
      { property: "og:title", content: "Knowledge Documents — FlowStack Ops" },
      {
        property: "og:description",
        content: "Knowledge base documents powering the AI support assistant.",
      },
    ],
  }),
  component: DocumentsPage,
});

function DocumentsPage() {
  const query = useQuery(documentsQuery());
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL);

  const upload = useMutation({
    mutationFn: ingestDocument,
    onSuccess: (data) => {
      const chunks = data.chunks_indexed ?? data.chunk_count;
      toast.success("Document ingested", {
        description: chunks ? `${chunks} chunks indexed.` : undefined,
      });
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
      void queryClient.invalidateQueries({ queryKey: ["ingestion-log"] });
    },
    onError: (error: Error) => toast.error("Ingestion failed", { description: error.message }),
  });

  const rows = query.data ?? [];
  const statuses = useMemo(() => [...new Set(rows.map((r) => r.status))], [rows]);
  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (status !== ALL && r.status !== status) return false;
        if (search) {
          const hay = `${r.doc_id} ${r.title ?? ""}`.toLowerCase();
          if (!hay.includes(search)) return false;
        }
        return true;
      }),
    [rows, search, status],
  );

  return (
    <AdminShell>
      <div className="space-y-4 p-4 md:p-6">
        <PageHeader
          title="Knowledge Documents"
          subtitle="Documents indexed for retrieval by the AI support assistant."
          actions={
            <>
              <Link
                to="/ingestion"
                className="text-sm font-medium text-primary hover:underline"
              >
                Ingestion runs
              </Link>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".pdf,.txt,.md,.docx,.csv,.json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) upload.mutate(file);
                  e.target.value = "";
                }}
              />
              <Button
                onClick={() => inputRef.current?.click()}
                disabled={upload.isPending}
                size="sm"
              >
                <UploadCloud className="h-4 w-4" />
                {upload.isPending ? "Uploading…" : "Upload document"}
              </Button>
            </>
          }
        />

        {upload.isPending && (
          <Card className="p-3 text-sm text-muted-foreground">
            Sending the document to the ingestion workflow — this can take a moment.
          </Card>
        )}

        <FilterBar>
          <SearchFilter label="Search" placeholder="Title or document ID…" onChange={setSearch} />
          <SelectFilter label="Status" value={status} onChange={setStatus} options={statuses} />
        </FilterBar>

        <TableShell>
          <thead className="bg-muted/50">
            <tr>
              <Th>Title</Th>
              <Th>Document ID</Th>
              <Th>Status</Th>
              <Th>Chunks</Th>
              <Th>Embedding model</Th>
              <Th>Last ingested</Th>
            </tr>
          </thead>
          <tbody>
            {query.isError ? (
              <tr>
                <td colSpan={6}>
                  <ErrorState
                    message={(query.error as Error).message}
                    onRetry={() => query.refetch()}
                  />
                </td>
              </tr>
            ) : query.isLoading ? (
              <TableSkeleton cols={6} />
            ) : filtered.length === 0 ? (
              <tr className="border-t border-border">
                <td colSpan={6}>
                  <EmptyState
                    title="No documents indexed"
                    description="Upload a document to send it through the ingestion workflow."
                  />
                </td>
              </tr>
            ) : (
              filtered.map((d) => (
                <tr key={d.doc_id} className="border-t border-border hover:bg-accent/40">
                  <td className="px-4 py-2.5 font-medium">{d.title ?? "Untitled"}</td>
                  <td className="px-4 py-2.5">
                    <Mono>{d.doc_id}</Mono>
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="px-4 py-2.5 tabular-nums">{d.chunk_count ?? "—"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {humanize(d.embedding_model)}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                    {formatDateTime(d.last_ingested)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </TableShell>
      </div>
    </AdminShell>
  );
}

import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

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
import { formatDateTime } from "@/lib/format";
import { ingestionLogQuery } from "@/services/documents";

export const Route = createFileRoute("/ingestion")({
  head: () => ({
    meta: [
      { title: "Ingestion Activity — FlowStack Ops" },
      {
        name: "description",
        content:
          "Every knowledge base ingestion run with status, chunk counts and the failure details reported by the workflow.",
      },
      { property: "og:title", content: "Ingestion Activity — FlowStack Ops" },
      {
        property: "og:description",
        content: "Audit knowledge base ingestion runs and diagnose failures.",
      },
    ],
  }),
  component: IngestionPage,
});

function IngestionPage() {
  const query = useQuery(ingestionLogQuery());
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL);

  const rows = query.data ?? [];
  const statuses = useMemo(() => [...new Set(rows.map((r) => r.status))], [rows]);
  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (status !== ALL && r.status !== status) return false;
        if (search) {
          const hay =
            `${r.doc_id ?? ""} ${r.title ?? ""} ${r.error_message ?? ""} ${r.failed_node ?? ""}`.toLowerCase();
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
          actions={<Link to="/documents" className="text-sm font-medium text-primary hover:underline">Knowledge documents</Link>}
          title="Ingestion Activity"
          subtitle="Ingestion runs reported by the knowledge base workflow."
        />

        <FilterBar>
          <SearchFilter
            label="Search"
            placeholder="Document, node or error text…"
            onChange={setSearch}
          />
          <SelectFilter label="Status" value={status} onChange={setStatus} options={statuses} />
        </FilterBar>

        <TableShell>
          <thead className="bg-muted/50">
            <tr>
              <Th>Ingested at</Th>
              <Th>Document</Th>
              <Th>Status</Th>
              <Th>Chunks</Th>
              <Th>Failed node</Th>
              <Th>Error</Th>
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
                    title="No ingestion runs recorded"
                    description="Runs appear here once the ingestion workflow logs activity."
                  />
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-accent/40">
                  <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                    {formatDateTime(r.ingested_at)}
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="font-medium">{r.title ?? "Untitled"}</p>
                    {r.doc_id && <Mono>{r.doc_id}</Mono>}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-2.5 tabular-nums">{r.chunk_count ?? "—"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.failed_node ?? "—"}</td>
                  <td className="max-w-[26rem] px-4 py-2.5 text-muted-foreground">
                    {r.error_message ?? "—"}
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

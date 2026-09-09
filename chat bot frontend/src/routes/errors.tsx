import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { ALL, FilterBar, SearchFilter, SelectFilter } from "@/components/admin/Filters";
import {
  EmptyState,
  ErrorState,
  PageHeader,
  SectionTitle,
  TableShell,
  TableSkeleton,
  Th,
} from "@/components/admin/Primitives";
import { HealthList } from "@/components/admin/HealthList";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/format";
import { requestErrorsQuery } from "@/services/errors";
import { overviewQuery } from "@/services/overview";

export const Route = createFileRoute("/errors")({
  head: () => ({
    meta: [
      { title: "Errors & Health — FlowStack Ops" },
      {
        name: "description",
        content:
          "Workflow errors and derived system health for the FlowStack AI support platform, straight from the backend logs.",
      },
      { property: "og:title", content: "Errors & Health — FlowStack Ops" },
      {
        property: "og:description",
        content: "Diagnose AI support workflow failures and monitor system health.",
      },
    ],
  }),
  component: ErrorsPage,
});

function ErrorsPage() {
  const query = useQuery(requestErrorsQuery());
  const metrics = useQuery(overviewQuery());
  const [search, setSearch] = useState("");
  const [node, setNode] = useState(ALL);

  const rows = query.data ?? [];
  const nodes = useMemo(
    () => [...new Set(rows.map((r) => r.failed_node).filter((v): v is string => Boolean(v)))],
    [rows],
  );
  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (node !== ALL && r.failed_node !== node) return false;
        if (search) {
          const hay = `${r.error_message ?? ""} ${r.failed_node ?? ""} ${r.status ?? ""}`.toLowerCase();
          if (!hay.includes(search)) return false;
        }
        return true;
      }),
    [rows, search, node],
  );

  return (
    <AdminShell>
      <div className="space-y-5 p-4 md:p-6">
        <PageHeader
          actions={<Link to="/activity" className="text-sm font-medium text-primary hover:underline">Activity feed</Link>}
          title="Errors & Health"
          subtitle="Failures reported by the support workflows, with health derived from real signals."
        />

        <section className="space-y-2">
          <SectionTitle>System health</SectionTitle>
          {metrics.data ? (
            <HealthList indicators={metrics.data.health} />
          ) : (
            <Skeleton className="h-24 w-full rounded-xl" />
          )}
        </section>

        <FilterBar>
          <SearchFilter label="Search" placeholder="Error message or node…" onChange={setSearch} />
          <SelectFilter label="Failed node" value={node} onChange={setNode} options={nodes} />
        </FilterBar>

        <TableShell>
          <thead className="bg-muted/50">
            <tr>
              <Th>Occurred at</Th>
              <Th>Status</Th>
              <Th>Failed node</Th>
              <Th>Error message</Th>
            </tr>
          </thead>
          <tbody>
            {query.isError ? (
              <tr>
                <td colSpan={4}>
                  <ErrorState
                    message={(query.error as Error).message}
                    onRetry={() => query.refetch()}
                  />
                </td>
              </tr>
            ) : query.isLoading ? (
              <TableSkeleton cols={4} />
            ) : filtered.length === 0 ? (
              <tr className="border-t border-border">
                <td colSpan={4}>
                  <EmptyState
                    title="No errors logged"
                    description="Workflow failures recorded by the backend will appear here."
                  />
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-accent/40">
                  <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                    {formatDateTime(r.occurred_at)}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-2.5">{r.failed_node ?? "—"}</td>
                  <td className="max-w-[32rem] px-4 py-2.5 text-muted-foreground">
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

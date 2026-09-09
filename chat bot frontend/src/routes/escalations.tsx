import { createFileRoute, Link } from "@tanstack/react-router";
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
import { formatRelative, humanize, shortId } from "@/lib/format";
import { escalationsQuery, infoList } from "@/services/escalations";

export const Route = createFileRoute("/escalations")({
  head: () => ({
    meta: [
      { title: "Escalations — FlowStack Ops" },
      {
        name: "description",
        content:
          "Track escalated AI support cases, their intake status and the information still missing from customers.",
      },
      { property: "og:title", content: "Escalations — FlowStack Ops" },
      {
        property: "og:description",
        content: "Escalated support cases with intake progress and handoff readiness.",
      },
    ],
  }),
  component: EscalationsPage,
});

function EscalationsPage() {
  const query = useQuery(escalationsQuery());
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL);
  const [type, setType] = useState(ALL);
  const [mode, setMode] = useState(ALL);

  const rows = query.data ?? [];
  const statuses = useMemo(() => [...new Set(rows.map((r) => r.status))], [rows]);
  const types = useMemo(() => [...new Set(rows.map((r) => r.escalation_type))], [rows]);
  const modes = useMemo(() => [...new Set(rows.map((r) => r.handoff_mode))], [rows]);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (status !== ALL && r.status !== status) return false;
        if (type !== ALL && r.escalation_type !== type) return false;
        if (mode !== ALL && r.handoff_mode !== mode) return false;
        if (search) {
          const hay =
            `${r.case_id} ${r.conversation_id} ${r.customer_id ?? ""} ${r.latest_customer_message ?? ""}`.toLowerCase();
          if (!hay.includes(search)) return false;
        }
        return true;
      }),
    [rows, search, status, type, mode],
  );

  return (
    <AdminShell>
      <div className="space-y-4 p-4 md:p-6">
        <PageHeader
          title="Escalations"
          subtitle="Cases the assistant handed off, with intake progress and missing information."
        />

        <FilterBar>
          <SearchFilter
            label="Search"
            placeholder="Case, conversation or customer…"
            onChange={setSearch}
          />
          <SelectFilter label="Status" value={status} onChange={setStatus} options={statuses} />
          <SelectFilter label="Type" value={type} onChange={setType} options={types} />
          <SelectFilter label="Handoff mode" value={mode} onChange={setMode} options={modes} />
        </FilterBar>

        <TableShell>
          <thead className="bg-muted/50">
            <tr>
              <Th>Case</Th>
              <Th>Type</Th>
              <Th>Status</Th>
              <Th>Customer</Th>
              <Th>Missing info</Th>
              <Th>Attempts</Th>
              <Th>Updated</Th>
            </tr>
          </thead>
          <tbody>
            {query.isError ? (
              <tr>
                <td colSpan={7}>
                  <ErrorState
                    message={(query.error as Error).message}
                    onRetry={() => query.refetch()}
                  />
                </td>
              </tr>
            ) : query.isLoading ? (
              <TableSkeleton cols={7} />
            ) : filtered.length === 0 ? (
              <tr className="border-t border-border">
                <td colSpan={7}>
                  <EmptyState
                    title="No escalation cases"
                    description="Cases appear here when the assistant escalates a conversation."
                  />
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const missing = infoList(r.missing_information);
                return (
                  <tr key={r.case_id} className="border-t border-border hover:bg-accent/40">
                    <td className="px-4 py-2.5">
                      <Link
                        to="/escalations/$caseId"
                        params={{ caseId: r.case_id }}
                        className="font-mono text-xs text-primary hover:underline"
                      >
                        {shortId(r.case_id, 12)}
                      </Link>
                      <Link
                        to="/conversations/$conversationId"
                        params={{ conversationId: r.conversation_id }}
                        className="mt-0.5 block text-[11px] text-muted-foreground hover:text-foreground hover:underline"
                      >
                        View conversation
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">{humanize(r.escalation_type)}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-2.5">
                      {r.customer_id ? <Mono>{shortId(r.customer_id, 12)}</Mono> : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {missing.length === 0 ? "None" : `${missing.length} item(s)`}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums">{r.intake_attempts}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                      {formatRelative(r.updated_at)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </TableShell>
      </div>
    </AdminShell>
  );
}

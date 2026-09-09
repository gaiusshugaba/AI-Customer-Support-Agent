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
import { Badge } from "@/components/ui/badge";
import { formatRelative, humanize, shortId } from "@/lib/format";
import { liveConversationsQuery } from "@/services/conversations";
import type { ConversationSummary } from "@/types/ops";

export const Route = createFileRoute("/live-chats")({
  head: () => ({
    meta: [
      { title: "Live Chats — FlowStack Ops" },
      {
        name: "description",
        content:
          "Near real-time view of conversations currently handled by the FlowStack AI support assistant.",
      },
      { property: "og:title", content: "Live Chats — FlowStack Ops" },
      {
        property: "og:description",
        content: "Monitor active AI support conversations, intents and escalations.",
      },
    ],
  }),
  component: LiveChatsPage,
});

const TIME_WINDOWS: Record<string, number> = {
  "Last hour": 60 * 60 * 1000,
  "Last 24 hours": 24 * 60 * 60 * 1000,
  "Last 7 days": 7 * 24 * 60 * 60 * 1000,
};

function LiveChatsPage() {
  const query = useQuery(liveConversationsQuery());
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL);
  const [intent, setIntent] = useState(ALL);
  const [escalation, setEscalation] = useState(ALL);
  const [window, setWindow] = useState("Last 24 hours");

  const rows = query.data ?? [];
  const intents = useMemo(
    () => [...new Set(rows.map((r) => r.intent).filter((v): v is string => Boolean(v)))],
    [rows],
  );
  const statuses = useMemo(() => [...new Set(rows.map((r) => r.status))], [rows]);

  const filtered = useMemo(() => {
    const cutoff = TIME_WINDOWS[window];
    return rows.filter((r) => {
      if (cutoff && Date.now() - new Date(r.last_activity).getTime() > cutoff) return false;
      if (status !== ALL && r.status !== status) return false;
      if (intent !== ALL && r.intent !== intent) return false;
      if (escalation === "Escalated" && !r.escalated) return false;
      if (escalation === "Not escalated" && r.escalated) return false;
      if (search) {
        const hay = `${r.conversation_id} ${r.customer_id ?? ""} ${r.intent ?? ""}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });
  }, [rows, search, status, intent, escalation, window]);

  return (
    <AdminShell>
      <div className="space-y-4 p-4 md:p-6">
        <PageHeader
          title="Live Chats"
          subtitle="Monitor conversations currently being handled by the AI support assistant."
        />

        <FilterBar>
          <SearchFilter
            label="Customer / conversation"
            placeholder="Search by ID or intent…"
            onChange={setSearch}
          />
          <SelectFilter label="Status" value={status} onChange={setStatus} options={statuses} />
          <SelectFilter label="Intent" value={intent} onChange={setIntent} options={intents} />
          <SelectFilter
            label="Escalation"
            value={escalation}
            onChange={setEscalation}
            options={["Escalated", "Not escalated"]}
          />
          <SelectFilter
            label="Time"
            value={window}
            onChange={setWindow}
            options={Object.keys(TIME_WINDOWS)}
            allLabel="Any time"
          />
        </FilterBar>

        <ConversationTable
          rows={filtered}
          loading={query.isLoading}
          error={query.isError ? (query.error as Error).message : null}
          onRetry={() => query.refetch()}
          emptyTitle="No live conversations in this window"
          emptyDescription="Conversations appear here as soon as the AI support workflow records a turn."
        />
      </div>
    </AdminShell>
  );
}

export function ConversationTable({
  rows,
  loading,
  error,
  onRetry,
  emptyTitle,
  emptyDescription,
  showCreated,
}: {
  rows: ConversationSummary[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  emptyTitle: string;
  emptyDescription?: string;
  showCreated?: boolean;
}) {
  if (error) return <TableShell><tbody><tr><td><ErrorState message={error} onRetry={onRetry} /></td></tr></tbody></TableShell>;

  return (
    <TableShell>
      <thead className="bg-muted/50">
        <tr>
          <Th>Customer</Th>
          <Th>Conversation</Th>
          <Th>Intent</Th>
          <Th>Status</Th>
          <Th>Last activity</Th>
          {showCreated && <Th>Created</Th>}
          <Th>Escalation</Th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <TableSkeleton cols={showCreated ? 7 : 6} />
        ) : rows.length === 0 ? (
          <tr className="border-t border-border">
            <td colSpan={showCreated ? 7 : 6}>
              <EmptyState title={emptyTitle} description={emptyDescription} />
            </td>
          </tr>
        ) : (
          rows.map((r) => (
            <tr key={r.conversation_id} className="border-t border-border hover:bg-accent/40">
              <td className="px-4 py-2.5">
                {r.customer_id ? <Mono>{shortId(r.customer_id, 12)}</Mono> : "—"}
              </td>
              <td className="px-4 py-2.5">
                <Link
                  to="/conversations/$conversationId"
                  params={{ conversationId: r.conversation_id }}
                  className="font-mono text-xs text-primary hover:underline"
                >
                  {shortId(r.conversation_id, 12)}
                </Link>
                <span className="ml-2 text-xs text-muted-foreground">{r.turn_count} turns</span>
              </td>
              <td className="px-4 py-2.5">{humanize(r.intent)}</td>
              <td className="px-4 py-2.5">
                <StatusBadge status={r.status} />
              </td>
              <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                {formatRelative(r.last_activity)}
              </td>
              {showCreated && (
                <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                  {formatRelative(r.created_at)}
                </td>
              )}
              <td className="px-4 py-2.5">
                {r.case_id ? (
                  <Link
                    to="/escalations/$caseId"
                    params={{ caseId: r.case_id }}
                    className="inline-flex"
                  >
                    <Badge variant="outline" className="cursor-pointer">
                      Case {shortId(r.case_id)}
                    </Badge>
                  </Link>
                ) : (
                  <span className="text-xs text-muted-foreground">No case</span>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </TableShell>
  );
}

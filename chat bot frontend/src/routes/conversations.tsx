import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { ALL, FilterBar, SearchFilter, SelectFilter } from "@/components/admin/Filters";
import { PageHeader } from "@/components/admin/Primitives";
import { ConversationTable } from "@/routes/live-chats";
import { conversationsQuery } from "@/services/conversations";

export const Route = createFileRoute("/conversations")({
  head: () => ({
    meta: [
      { title: "Conversations — FlowStack Ops" },
      {
        name: "description",
        content:
          "Search and review historical conversations handled by the FlowStack AI support assistant.",
      },
      { property: "og:title", content: "Conversations — FlowStack Ops" },
      {
        property: "og:description",
        content: "Historical AI support conversations with intent, status and escalation context.",
      },
    ],
  }),
  component: ConversationsPage,
});

const RANGES: Record<string, number> = {
  "Last 24 hours": 24 * 60 * 60 * 1000,
  "Last 7 days": 7 * 24 * 60 * 60 * 1000,
  "Last 30 days": 30 * 24 * 60 * 60 * 1000,
};

function ConversationsPage() {
  const query = useQuery(conversationsQuery());
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL);
  const [intent, setIntent] = useState(ALL);
  const [escalated, setEscalated] = useState(ALL);
  const [range, setRange] = useState(ALL);

  const rows = query.data ?? [];
  const intents = useMemo(
    () => [...new Set(rows.map((r) => r.intent).filter((v): v is string => Boolean(v)))],
    [rows],
  );
  const statuses = useMemo(() => [...new Set(rows.map((r) => r.status))], [rows]);

  const filtered = useMemo(() => {
    const cutoff = range === ALL ? null : RANGES[range];
    return rows.filter((r) => {
      if (cutoff && Date.now() - new Date(r.created_at).getTime() > cutoff) return false;
      if (status !== ALL && r.status !== status) return false;
      if (intent !== ALL && r.intent !== intent) return false;
      if (escalated === "Escalated" && !r.escalated) return false;
      if (escalated === "Not escalated" && r.escalated) return false;
      if (search) {
        const hay =
          `${r.conversation_id} ${r.customer_id ?? ""} ${r.case_id ?? ""} ${r.intent ?? ""}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });
  }, [rows, search, status, intent, escalated, range]);

  return (
    <AdminShell>
      <div className="space-y-4 p-4 md:p-6">
        <PageHeader
          title="Conversations"
          subtitle="Search and review conversations handled by the support assistant."
        />

        <FilterBar>
          <SearchFilter
            label="Search"
            placeholder="Conversation, customer or case ID…"
            onChange={setSearch}
          />
          <SelectFilter
            label="Date range"
            value={range}
            onChange={setRange}
            options={Object.keys(RANGES)}
            allLabel="All time"
          />
          <SelectFilter label="Intent" value={intent} onChange={setIntent} options={intents} />
          <SelectFilter label="Status" value={status} onChange={setStatus} options={statuses} />
          <SelectFilter
            label="Escalated"
            value={escalated}
            onChange={setEscalated}
            options={["Escalated", "Not escalated"]}
          />
        </FilterBar>

        <ConversationTable
          rows={filtered}
          loading={query.isLoading}
          error={query.isError ? (query.error as Error).message : null}
          onRetry={() => query.refetch()}
          showCreated
          emptyTitle="No conversations found"
          emptyDescription="Conversations recorded by the support workflows will appear here."
        />
      </div>
    </AdminShell>
  );
}

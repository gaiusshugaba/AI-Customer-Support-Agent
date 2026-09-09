import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { ActivityTimeline } from "@/components/admin/ActivityTimeline";
import { ALL, FilterBar, SearchFilter, SelectFilter } from "@/components/admin/Filters";
import { EmptyState, ErrorState, PageHeader } from "@/components/admin/Primitives";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { humanize } from "@/lib/format";
import { activityQuery } from "@/services/activity";

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "System Activity — FlowStack Ops" },
      {
        name: "description",
        content:
          "Unified timeline of AI support activity: conversation turns, escalations, ingestion runs and workflow errors.",
      },
      { property: "og:title", content: "System Activity — FlowStack Ops" },
      {
        property: "og:description",
        content: "One timeline for every event recorded by the AI support backend.",
      },
    ],
  }),
  component: ActivityPage,
});

const TYPES = [
  "conversation_message",
  "ai_response",
  "escalation_created",
  "escalation_updated",
  "document_ingested",
  "ingestion_failed",
  "workflow_error",
];

function ActivityPage() {
  const query = useQuery(activityQuery());
  const [search, setSearch] = useState("");
  const [type, setType] = useState(ALL);

  const events = query.data ?? [];
  const filtered = useMemo(
    () =>
      events.filter((e) => {
        if (type !== ALL && e.type !== type) return false;
        if (search) {
          const hay = `${e.title} ${e.description ?? ""} ${e.relatedLabel ?? ""}`.toLowerCase();
          if (!hay.includes(search)) return false;
        }
        return true;
      }),
    [events, search, type],
  );

  return (
    <AdminShell>
      <div className="space-y-4 p-4 md:p-6">
        <PageHeader
          actions={<Link to="/overview" className="text-sm font-medium text-primary hover:underline">Overview</Link>}
          title="System Activity"
          subtitle="Every event recorded by the AI support backend, newest first."
        />

        <FilterBar>
          <SearchFilter label="Search" placeholder="Event text or ID…" onChange={setSearch} />
          <SelectFilter
            label="Event type"
            value={type}
            onChange={setType}
            options={TYPES}
            allLabel="All events"
          />
        </FilterBar>

        <Card className="p-0">
          {query.isError ? (
            <ErrorState message={(query.error as Error).message} onRetry={() => query.refetch()} />
          ) : query.isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No activity recorded"
              description="Events appear here once the support workflows write to the backend."
            />
          ) : (
            <ActivityTimeline events={filtered} />
          )}
        </Card>

        {filtered.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} of {events.length} events
            {type !== ALL ? ` · ${humanize(type)}` : ""}
          </p>
        )}
      </div>
    </AdminShell>
  );
}

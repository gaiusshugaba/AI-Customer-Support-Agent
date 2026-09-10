import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AdminShell } from "@/components/admin/AdminShell";
import {
  EmptyState,
  ErrorState,
  MetricCard,
  PageHeader,
  SectionTitle,
} from "@/components/admin/Primitives";
import { ActivityTimeline } from "@/components/admin/ActivityTimeline";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HealthList } from "@/components/admin/HealthList";
import { activityQuery } from "@/services/activity";
import { overviewQuery } from "@/services/overview";

export const Route = createFileRoute("/overview")({
  head: () => ({
    meta: [
      { title: "AI Support Operations — FlowStack Ops" },
      {
        name: "description",
        content:
          "Operational overview of the FlowStack AI support system: conversations, escalations, knowledge base and system health.",
      },
      { property: "og:title", content: "AI Support Operations — FlowStack Ops" },
      {
        property: "og:description",
        content: "Monitor conversations, escalations, knowledge and system health in one console.",
      },
    ],
  }),
  component: OverviewPage,
});

function OverviewPage() {
  const metrics = useQuery(overviewQuery());
  const activity = useQuery(activityQuery());

  return (
    <AdminShell>
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader
          title="AI Support Operations"
          subtitle="Monitor conversations, escalations, knowledge, and system health."
        />

        {metrics.isError ? (
          <Card>
            <ErrorState
              message={(metrics.error as Error).message}
              onRetry={() => metrics.refetch()}
            />
          </Card>
        ) : metrics.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[104px] w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Active conversations"
              to="/live-chats"
              value={metrics.data?.activeConversations ?? 0}
              hint={`${metrics.data?.totalConversations ?? 0} total recorded`}
            />
            <MetricCard
              label="Open escalations"
              to="/escalations"
              value={metrics.data?.openEscalations ?? 0}
              hint={`${metrics.data?.readyForAgent ?? 0} ready for agent`}
            />
            <MetricCard
              label="Documents"
              to="/documents"
              value={metrics.data?.documents ?? 0}
              hint={`${metrics.data?.failedIngestions ?? 0} failed ingestion(s)`}
            />
            <MetricCard
              label="Recent errors"
              to="/errors"
              value={metrics.data?.recentErrors ?? 0}
              hint={`last 24h · ${metrics.data?.totalErrors ?? 0} logged total`}
            />
          </div>
        )}

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <SectionTitle>System health</SectionTitle>
            <Link to="/errors" className="text-xs font-medium text-primary hover:underline">
              Errors &amp; health
            </Link>
          </div>
          {metrics.data ? (
            <HealthList indicators={metrics.data.health} />
          ) : (
            <Skeleton className="h-24 w-full rounded-xl" />
          )}
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <SectionTitle>Recent activity</SectionTitle>
            <Link to="/activity" className="text-xs font-medium text-primary hover:underline">
              View all activity
            </Link>
          </div>
          <Card className="p-0">
            {activity.isError ? (
              <ErrorState
                message={(activity.error as Error).message}
                onRetry={() => activity.refetch()}
              />
            ) : activity.isLoading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : activity.data!.length === 0 ? (
              <EmptyState
                title="No activity recorded yet"
                description="Events appear here once the support workflows write conversations, cases, ingestion runs or errors."
              />
            ) : (
              <ActivityTimeline events={activity.data!.slice(0, 12)} />
            )}
          </Card>
        </section>
      </div>
    </AdminShell>
  );
}
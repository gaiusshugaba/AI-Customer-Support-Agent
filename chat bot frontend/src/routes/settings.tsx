import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AdminShell } from "@/components/admin/AdminShell";
import {
  EmptyState,
  ErrorState,
  Field,
  Mono,
  PageHeader,
  SectionTitle,
} from "@/components/admin/Primitives";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TENANT_ID } from "@/lib/constants";
import { formatScore, humanize } from "@/lib/format";
import { tenantConfigQuery } from "@/services/settings";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — FlowStack Ops" },
      {
        name: "description",
        content:
          "Tenant configuration for the AI support assistant: thresholds, prompt references and active channels.",
      },
      { property: "og:title", content: "Settings — FlowStack Ops" },
      {
        property: "og:description",
        content: "Review the AI support assistant's tenant configuration.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const query = useQuery(tenantConfigQuery());
  const config = query.data ?? null;

  return (
    <AdminShell>
      <div className="space-y-5 p-4 md:p-6">
        <PageHeader
          title="Settings"
          subtitle="Configuration is owned by the backend workflows — this console displays it read-only."
        />

        {query.isError ? (
          <Card>
            <ErrorState message={(query.error as Error).message} onRetry={() => query.refetch()} />
          </Card>
        ) : query.isLoading ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : !config ? (
          <Card>
            <EmptyState
              title="No tenant configuration found"
              description={`No configuration row exists for tenant ${TENANT_ID}.`}
            />
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="gap-4 p-4">
              <SectionTitle>Tenant</SectionTitle>
              <dl className="grid gap-3 sm:grid-cols-2">
                <Field label="Tenant name" value={config.tenant_name ?? "—"} />
                <Field label="Tenant ID" value={<Mono>{config.tenant_id}</Mono>} />
                <Field label="Industry pack" value={humanize(config.industry_pack)} />
              </dl>
            </Card>

            <Card className="gap-4 p-4">
              <SectionTitle>AI thresholds</SectionTitle>
              <dl className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Confidence threshold"
                  value={formatScore(config.confidence_threshold)}
                />
                <Field
                  label="Similarity threshold"
                  value={formatScore(config.similarity_threshold)}
                />
              </dl>
              <p className="text-xs text-muted-foreground">
                Responses below these thresholds are escalated instead of answered.
              </p>
            </Card>

            <Card className="gap-4 p-4">
              <SectionTitle>Prompts</SectionTitle>
              <dl className="grid gap-3">
                <Field
                  label="Classification prompt"
                  value={
                    config.classification_prompt_id ? (
                      <Mono>{config.classification_prompt_id}</Mono>
                    ) : (
                      "—"
                    )
                  }
                />
                <Field
                  label="System prompt"
                  value={config.system_prompt_id ? <Mono>{config.system_prompt_id}</Mono> : "—"}
                />
              </dl>
            </Card>

            <Card className="gap-4 p-4">
              <SectionTitle>Active channels</SectionTitle>
              {config.active_channels && config.active_channels.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {config.active_channels.map((c) => (
                    <Badge key={c} variant="secondary">
                      {humanize(c)}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No channels configured.</p>
              )}
            </Card>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

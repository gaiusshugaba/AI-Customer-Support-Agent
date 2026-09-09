import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { AdminShell } from "@/components/admin/AdminShell";
import {
  EmptyState,
  ErrorState,
  Field,
  Mono,
  PageHeader,
  SectionTitle,
} from "@/components/admin/Primitives";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, formatScore, humanize, shortId } from "@/lib/format";
import { conversationDetailQuery } from "@/services/conversations";
import { customerQuery } from "@/services/customers";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/conversations/$conversationId")({
  head: () => ({
    meta: [
      { title: "Conversation Transcript — FlowStack Ops" },
      {
        name: "description",
        content:
          "Full AI support transcript with intent, confidence and retrieval scores per turn, plus escalation context.",
      },
      { property: "og:title", content: "Conversation Transcript — FlowStack Ops" },
      {
        property: "og:description",
        content: "Inspect a single AI support conversation turn by turn.",
      },
    ],
  }),
  component: ConversationDetailPage,
});

function ConversationDetailPage() {
  const { conversationId } = Route.useParams();
  const detail = useQuery(conversationDetailQuery(conversationId));
  const customerId = detail.data?.escalationCase?.customer_id ?? null;
  const customer = useQuery(customerQuery(customerId));

  const turns = detail.data?.turns ?? [];
  const escalation = detail.data?.escalationCase ?? null;

  return (
    <AdminShell>
      <div className="space-y-5 p-4 md:p-6">
        <Link
          to="/conversations"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to conversations
        </Link>

        <PageHeader
          title="Conversation transcript"
          subtitle={conversationId}
          actions={
            escalation ? (
              <Link to="/escalations/$caseId" params={{ caseId: escalation.case_id }}>
                <Badge variant="outline">Case {shortId(escalation.case_id)}</Badge>
              </Link>
            ) : undefined
          }
        />

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="p-0">
            {detail.isError ? (
              <ErrorState
                message={(detail.error as Error).message}
                onRetry={() => detail.refetch()}
              />
            ) : detail.isLoading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : turns.length === 0 ? (
              <EmptyState
                title="No turns recorded"
                description="This conversation has no messages stored in the backend."
              />
            ) : (
              <ol className="divide-y divide-border">
                {turns.map((t) => {
                  const isUser = t.role === "user" || t.role === "customer";
                  return (
                    <li key={t.turn_id} className="p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                            isUser
                              ? "bg-muted text-muted-foreground"
                              : "bg-primary/10 text-primary",
                          )}
                        >
                          {t.role}
                        </span>
                        <time
                          dateTime={t.timestamp}
                          className="text-xs text-muted-foreground"
                        >
                          {formatDateTime(t.timestamp)}
                        </time>
                        {t.intent && (
                          <Badge variant="secondary" className="text-[11px]">
                            {humanize(t.intent)}
                          </Badge>
                        )}
                        {t.quality_gate_passed !== null && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[11px]",
                              t.quality_gate_passed ? "text-success" : "text-destructive",
                            )}
                          >
                            {t.quality_gate_passed ? "Quality gate passed" : "Quality gate failed"}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-2 text-sm whitespace-pre-wrap">{t.text ?? "—"}</p>
                      <p className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground tabular-nums">
                        <span>Confidence {formatScore(t.confidence_score)}</span>
                        <span>Retrieval {formatScore(t.retrieval_score)}</span>
                      </p>
                    </li>
                  );
                })}
              </ol>
            )}
          </Card>

          <div className="space-y-4">
            <Card className="gap-3 p-4">
              <SectionTitle>Customer context</SectionTitle>
              {customerId === null ? (
                <p className="text-sm text-muted-foreground">
                  No customer is linked to this conversation in the backend.
                </p>
              ) : customer.isLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : customer.data ? (
                <dl className="grid gap-3">
                  <Field label="Name" value={customer.data.name ?? "—"} />
                  <Field label="Email" value={customer.data.email ?? "—"} />
                  <Field label="Plan" value={humanize(customer.data.plan_tier)} />
                  <Field
                    label="Account status"
                    value={<StatusBadge status={customer.data.account_status} />}
                  />
                </dl>
              ) : (
                <div className="space-y-2">
                  <Field label="Customer ID" value={<Mono>{customerId}</Mono>} />
                  <p className="text-sm text-muted-foreground">
                    Customer profile data is unavailable to this console.
                  </p>
                </div>
              )}
            </Card>

            <Card className="gap-3 p-4">
              <SectionTitle>Escalation</SectionTitle>
              {escalation ? (
                <dl className="grid gap-3">
                  <Field label="Type" value={humanize(escalation.escalation_type)} />
                  <Field label="Status" value={<StatusBadge status={escalation.status} />} />
                  <Field label="Handoff mode" value={humanize(escalation.handoff_mode)} />
                  <Field label="Intake attempts" value={escalation.intake_attempts} />
                  <Field label="Updated" value={formatDateTime(escalation.updated_at)} />
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">
                  This conversation has not been escalated.
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

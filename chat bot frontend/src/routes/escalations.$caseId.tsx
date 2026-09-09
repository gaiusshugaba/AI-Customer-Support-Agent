import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, Circle } from "lucide-react";

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
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, humanize, shortId } from "@/lib/format";
import { customerQuery } from "@/services/customers";
import { escalationCaseQuery, infoList } from "@/services/escalations";

export const Route = createFileRoute("/escalations/$caseId")({
  head: () => ({
    meta: [
      { title: "Escalation Case — FlowStack Ops" },
      {
        name: "description",
        content:
          "Escalation case detail: intake checklist, customer context and the latest message from the customer.",
      },
      { property: "og:title", content: "Escalation Case — FlowStack Ops" },
      {
        property: "og:description",
        content: "Review a single escalated AI support case and its handoff readiness.",
      },
    ],
  }),
  component: EscalationCasePage,
});

function Checklist({ items, provided }: { items: string[]; provided: string[] }) {
  if (items.length === 0)
    return <p className="text-sm text-muted-foreground">No intake requirements recorded.</p>;
  const providedSet = new Set(provided.map((p) => p.toLowerCase()));
  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const done = providedSet.has(item.toLowerCase());
        return (
          <li key={item} className="flex items-start gap-2 text-sm">
            {done ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
            ) : (
              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            )}
            <span className={done ? "text-muted-foreground line-through" : undefined}>
              {humanize(item)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function EscalationCasePage() {
  const { caseId } = Route.useParams();
  const query = useQuery(escalationCaseQuery(caseId));
  const kase = query.data ?? null;
  const customer = useQuery(customerQuery(kase?.customer_id ?? null));

  return (
    <AdminShell>
      <div className="space-y-5 p-4 md:p-6">
        <Link
          to="/escalations"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to escalations
        </Link>

        <PageHeader title="Escalation case" subtitle={caseId} />

        {query.isError ? (
          <Card>
            <ErrorState message={(query.error as Error).message} onRetry={() => query.refetch()} />
          </Card>
        ) : query.isLoading ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : !kase ? (
          <Card>
            <EmptyState
              title="Case not found"
              description="This case is not present in the backend."
            />
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-4">
              <Card className="gap-4 p-4">
                <SectionTitle>Case summary</SectionTitle>
                <dl className="grid gap-3 sm:grid-cols-2">
                  <Field label="Type" value={humanize(kase.escalation_type)} />
                  <Field label="Status" value={<StatusBadge status={kase.status} />} />
                  <Field label="Handoff mode" value={humanize(kase.handoff_mode)} />
                  <Field label="Intake attempts" value={kase.intake_attempts} />
                  <Field label="Created" value={formatDateTime(kase.created_at)} />
                  <Field label="Updated" value={formatDateTime(kase.updated_at)} />
                  <Field
                    label="Conversation"
                    value={
                      <Link
                        to="/conversations/$conversationId"
                        params={{ conversationId: kase.conversation_id }}
                        className="font-mono text-xs text-primary hover:underline"
                      >
                        {shortId(kase.conversation_id, 14)}
                      </Link>
                    }
                  />
                  <Field
                    label="Customer ID"
                    value={kase.customer_id ? <Mono>{kase.customer_id}</Mono> : "—"}
                  />
                </dl>
              </Card>

              <Card className="gap-3 p-4">
                <SectionTitle>Latest customer message</SectionTitle>
                <p className="text-sm whitespace-pre-wrap">
                  {kase.latest_customer_message ?? "No message recorded."}
                </p>
              </Card>

              {kase.case_context && Object.keys(kase.case_context).length > 0 && (
                <Card className="gap-3 p-4">
                  <SectionTitle>Case context</SectionTitle>
                  <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
                    {JSON.stringify(kase.case_context, null, 2)}
                  </pre>
                </Card>
              )}
            </div>

            <div className="space-y-4">
              <Card className="gap-3 p-4">
                <SectionTitle>Required information</SectionTitle>
                <Checklist
                  items={infoList(kase.required_information)}
                  provided={infoList(kase.provided_information)}
                />
              </Card>

              <Card className="gap-3 p-4">
                <SectionTitle>Still missing</SectionTitle>
                {infoList(kase.missing_information).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nothing outstanding.</p>
                ) : (
                  <ul className="list-inside list-disc space-y-1 text-sm">
                    {infoList(kase.missing_information).map((m) => (
                      <li key={m}>{humanize(m)}</li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card className="gap-3 p-4">
                <SectionTitle>Customer context</SectionTitle>
                {!kase.customer_id ? (
                  <p className="text-sm text-muted-foreground">No customer linked to this case.</p>
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
                  <p className="text-sm text-muted-foreground">
                    Customer profile data is unavailable to this console.
                  </p>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

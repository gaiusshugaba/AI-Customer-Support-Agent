import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bot,
  FileCheck2,
  FileX2,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { formatDateTime, formatRelative } from "@/lib/format";
import type { ActivityEvent } from "@/types/ops";

const ICONS = {
  conversation_message: MessageSquare,
  ai_response: Bot,
  escalation_created: ShieldAlert,
  escalation_updated: ShieldCheck,
  document_ingested: FileCheck2,
  ingestion_failed: FileX2,
  workflow_error: AlertTriangle,
} as const;

const TONE: Record<ActivityEvent["type"], string> = {
  conversation_message: "text-muted-foreground",
  ai_response: "text-primary",
  escalation_created: "text-warning",
  escalation_updated: "text-info",
  document_ingested: "text-success",
  ingestion_failed: "text-destructive",
  workflow_error: "text-destructive",
};

export function ActivityTimeline({ events }: { events: ActivityEvent[] }) {
  return (
    <ol className="divide-y divide-border">
      {events.map((e) => {
        const Icon = ICONS[e.type];
        const body = (
          <div className="flex min-w-0 items-start gap-3 px-4 py-3">
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${TONE[e.type]}`} aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <p className="text-sm font-medium">{e.title}</p>
                {e.relatedLabel && (
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {e.relatedLabel}
                  </span>
                )}
              </div>
              {e.description && (
                <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{e.description}</p>
              )}
            </div>
            <time
              dateTime={e.timestamp}
              title={formatDateTime(e.timestamp)}
              className="shrink-0 text-xs whitespace-nowrap text-muted-foreground"
            >
              {formatRelative(e.timestamp)}
            </time>
          </div>
        );
        return (
          <li key={e.id}>
            {e.href ? (
              <Link to={e.href as never} className="block transition-colors hover:bg-accent/50">
                {body}
              </Link>
            ) : (
              body
            )}
          </li>
        );
      })}
    </ol>
  );
}

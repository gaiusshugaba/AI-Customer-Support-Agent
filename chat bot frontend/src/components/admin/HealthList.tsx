import { Link } from "@tanstack/react-router";
import { CheckCircle2, CircleHelp, TriangleAlert } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { HealthIndicator } from "@/services/errors";

const CONFIG = {
  healthy: { Icon: CheckCircle2, label: "Healthy", className: "text-success" },
  degraded: { Icon: TriangleAlert, label: "Degraded", className: "text-destructive" },
  unknown: { Icon: CircleHelp, label: "No signal", className: "text-muted-foreground" },
} as const;

const AREA_LINKS: Record<string, string> = {
  "Chat API": "/live-chats",
  "Knowledge ingestion": "/ingestion",
  Database: "/errors",
  "Vector search": "/documents",
};

export function HealthList({ indicators }: { indicators: HealthIndicator[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {indicators.map((h) => {
        const { Icon, label, className } = CONFIG[h.state];
        const to = AREA_LINKS[h.area];
        const card = (
          <Card className="h-full gap-1 p-4 transition-colors hover:border-primary/40 hover:bg-accent/40">
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${className}`} aria-hidden />
              <p className="text-sm font-medium">{h.area}</p>
            </div>
            <p className={`text-xs font-semibold uppercase tracking-wide ${className}`}>{label}</p>
            <p className="text-xs text-muted-foreground">{h.detail}</p>
          </Card>
        );
        return to ? (
          <Link key={h.area} to={to as never} className="block rounded-xl">
            {card}
          </Link>
        ) : (
          <div key={h.area}>{card}</div>
        );
      })}
    </div>
  );
}

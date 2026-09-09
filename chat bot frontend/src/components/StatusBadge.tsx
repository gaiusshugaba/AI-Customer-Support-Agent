import { cn } from "@/lib/utils";

const MAP: Record<string, string> = {
  success: "bg-success/15 text-success-foreground border-success/30",
  ready_for_agent: "bg-success/15 text-success-foreground border-success/30",
  failed: "bg-destructive/15 text-destructive border-destructive/30",
  error: "bg-destructive/15 text-destructive border-destructive/30",
  awaiting_customer_info: "bg-warning/15 text-warning-foreground border-warning/30",
  pending: "bg-warning/15 text-warning-foreground border-warning/30",
};

export function StatusBadge({ status, className }: { status?: string | null; className?: string }) {
  const key = (status ?? "").toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        MAP[key] ?? "bg-info/15 text-info-foreground border-info/30",
        className,
      )}
    >
      {status ?? "unknown"}
    </span>
  );
}

export function Pill({ label, tone }: { label: string; tone: "red" | "green" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        tone === "red"
          ? "bg-destructive/15 text-destructive border-destructive/30"
          : "bg-success/15 text-success-foreground border-success/30",
      )}
    >
      {label}
    </span>
  );
}

import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  FileText,
  Gauge,
  Headset,
  MessageSquare,
  MessagesSquare,
  Settings as SettingsIcon,
  ShieldAlert,
  UploadCloud,
  UserCog,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { TENANT_ID } from "@/lib/constants";

type NavItem = { to: string; label: string; icon: typeof Gauge };

const GROUPS: { label: string | null; items: NavItem[] }[] = [
  { label: null, items: [{ to: "/overview", label: "Overview", icon: Gauge }] },
  {
    label: "Chat operations",
    items: [
      { to: "/live-chats", label: "Live Chats", icon: MessagesSquare },
      { to: "/conversations", label: "Conversations", icon: MessageSquare },
      { to: "/escalations", label: "Escalations", icon: ShieldAlert },
    ],
  },
  {
    label: "Knowledge",
    items: [
      { to: "/documents", label: "Documents", icon: FileText },
      { to: "/ingestion", label: "Ingestion Activity", icon: UploadCloud },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/errors", label: "Errors & Health", icon: AlertTriangle },
      { to: "/activity", label: "Activity", icon: Activity },
    ],
  },
  {
    label: "Configuration",
    items: [{ to: "/settings", label: "Settings", icon: SettingsIcon }],
  },
];

function AdminSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-1 py-1.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Headset className="h-4 w-4" />
          </span>
          <div className="leading-tight group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold tracking-tight text-sidebar-foreground">
              FLOWSTACK
            </p>
            <p className="text-[11px] uppercase tracking-wide text-sidebar-foreground/60">
              AI Support Ops
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {GROUPS.map((group, i) => (
          <SidebarGroup key={group.label ?? `group-${i}`}>
            {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarMenu>
              {group.items.map(({ to, label, icon: Icon }) => {
                const active = pathname === to || pathname.startsWith(`${to}/`);
                return (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton asChild isActive={active} tooltip={label}>
                      <Link to={to} aria-current={active ? "page" : undefined}>
                        <Icon />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-1 py-1 group-data-[collapsible=icon]:hidden">
          <p className="text-[11px] uppercase tracking-wide text-sidebar-foreground/60">
            Current workspace
          </p>
          <p className="text-sm font-medium text-sidebar-foreground">FlowStack</p>
          <p className="font-mono text-[11px] text-sidebar-foreground/60">{TENANT_ID}</p>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Admin profile" className="cursor-default">
              <UserCog />
              <span>Admin profile</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-3">
          <SidebarTrigger aria-label="Toggle navigation" />
          <Separator orientation="vertical" className="mx-1 h-5" />
          <p className="truncate text-sm font-medium">FlowStack AI Support Ops</p>
        </header>
        <div className="min-w-0 flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

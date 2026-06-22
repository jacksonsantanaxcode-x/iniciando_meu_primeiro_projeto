import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, Scissors, CalendarDays, Wallet } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Painel", icon: LayoutDashboard },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/servicos", label: "Serviços", icon: Scissors },
  { to: "/agendamentos", label: "Agendamentos", icon: CalendarDays },
  { to: "/financeiro", label: "Financeiro", icon: Wallet },
] as const;

export function AppShell({ children, title }: { children: ReactNode; title: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside className="hidden md:flex w-64 flex-col border-r border-sidebar-border bg-sidebar">
        <div className="px-6 py-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-md bg-primary flex items-center justify-center">
              <Scissors className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">Barber OS</h1>
              <p className="text-xs text-muted-foreground">Gestão da barbearia</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map((n) => {
            const Icon = n.icon;
            const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  active
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent",
                )}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 min-w-0">
        <header className="border-b border-border bg-card/40 backdrop-blur sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            <nav className="flex md:hidden gap-1">
              {nav.map((n) => {
                const Icon = n.icon;
                const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={cn(
                      "p-2 rounded-md",
                      active ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                    )}
                    aria-label={n.label}
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
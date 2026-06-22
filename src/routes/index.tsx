import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBarberStore, fmtBRL } from "@/lib/barber-store";
import { Users, Scissors, CalendarDays, TrendingUp, TrendingDown, Wallet } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Barber OS — Painel" },
      { name: "description", content: "Sistema de gestão para barbearias: clientes, agendamentos e financeiro." },
      { property: "og:title", content: "Barber OS — Painel" },
      { property: "og:description", content: "Sistema de gestão para barbearias." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const store = useBarberStore();
  const { income, expense, profit } = useMemo(() => {
    const income = store.transactions.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
    const expense = store.transactions.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);
    return { income, expense, profit: income - expense };
  }, [store.transactions]);

  const upcoming = useMemo(
    () =>
      store.appointments
        .filter((a) => a.status === "scheduled" && new Date(a.datetime) >= new Date())
        .sort((a, b) => a.datetime.localeCompare(b.datetime))
        .slice(0, 5),
    [store.appointments],
  );

  const stats = [
    { label: "Receitas", value: fmtBRL(income), icon: TrendingUp, tone: "text-emerald-400" },
    { label: "Despesas", value: fmtBRL(expense), icon: TrendingDown, tone: "text-rose-400" },
    { label: "Lucro", value: fmtBRL(profit), icon: Wallet, tone: profit >= 0 ? "text-primary" : "text-rose-400" },
    { label: "Clientes", value: String(store.clients.length), icon: Users, tone: "text-foreground" },
    { label: "Serviços", value: String(store.services.length), icon: Scissors, tone: "text-foreground" },
    { label: "Agendamentos", value: String(store.appointments.length), icon: CalendarDays, tone: "text-foreground" },
  ];

  return (
    <AppShell title="Painel">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                  <Icon className={`h-4 w-4 ${s.tone}`} />
                </div>
                <div className={`text-2xl font-bold mt-2 ${s.tone}`}>{s.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Próximos agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum agendamento futuro.</p>
          ) : (
            <ul className="divide-y divide-border">
              {upcoming.map((a) => {
                const c = store.clients.find((x) => x.id === a.clientId);
                const s = store.services.find((x) => x.id === a.serviceId);
                return (
                  <li key={a.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{c?.name ?? "—"}</div>
                      <div className="text-sm text-muted-foreground">{s?.name ?? "—"}</div>
                    </div>
                    <div className="text-sm text-right">
                      <div>{new Date(a.datetime).toLocaleDateString("pt-BR")}</div>
                      <div className="text-muted-foreground">
                        {new Date(a.datetime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}

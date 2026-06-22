import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useBarberStore } from "@/lib/barber-store";
import { Plus, Trash2, Check, X } from "lucide-react";

export const Route = createFileRoute("/agendamentos")({
  head: () => ({ meta: [{ title: "Agendamentos — Barber OS" }] }),
  component: AppointmentsPage,
});

function AppointmentsPage() {
  const { appointments, clients, services, addAppointment, updateAppointment, deleteAppointment } = useBarberStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ clientId: "", serviceId: "", date: "", time: "" });

  const sorted = [...appointments].sort((a, b) => b.datetime.localeCompare(a.datetime));

  const statusLabel = { scheduled: "Agendado", done: "Concluído", cancelled: "Cancelado" } as const;
  const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
    scheduled: "default",
    done: "secondary",
    cancelled: "destructive",
  };

  return (
    <AppShell title="Agendamentos">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{appointments.length} agendamento(s)</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button disabled={clients.length === 0 || services.length === 0}>
              <Plus className="h-4 w-4 mr-1" /> Novo agendamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo agendamento</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Cliente</Label>
                <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Serviço</Label>
                <Select value={form.serviceId} onValueChange={(v) => setForm({ ...form, serviceId: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {services.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Data</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                <div><Label>Hora</Label><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
              </div>
            </div>
            <DialogFooter>
              <Button
                disabled={!form.clientId || !form.serviceId || !form.date || !form.time}
                onClick={() => {
                  addAppointment({
                    clientId: form.clientId,
                    serviceId: form.serviceId,
                    datetime: new Date(`${form.date}T${form.time}`).toISOString(),
                    status: "scheduled",
                  });
                  setForm({ clientId: "", serviceId: "", date: "", time: "" });
                  setOpen(false);
                }}
              >Agendar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {clients.length === 0 || services.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">
          Cadastre clientes e serviços antes de criar agendamentos.
        </CardContent></Card>
      ) : sorted.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">Nenhum agendamento.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {sorted.map((a) => {
            const c = clients.find((x) => x.id === a.clientId);
            const s = services.find((x) => x.id === a.serviceId);
            const d = new Date(a.datetime);
            return (
              <Card key={a.id}>
                <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="font-medium">{c?.name ?? "—"} · <span className="text-muted-foreground">{s?.name ?? "—"}</span></div>
                    <div className="text-sm text-muted-foreground">
                      {d.toLocaleDateString("pt-BR")} às {d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant[a.status]}>{statusLabel[a.status]}</Badge>
                    {a.status === "scheduled" && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => updateAppointment(a.id, { status: "done" })}>
                          <Check className="h-4 w-4 mr-1" /> Concluir
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => updateAppointment(a.id, { status: "cancelled" })}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => deleteAppointment(a.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useBarberStore, fmtBRL } from "@/lib/barber-store";
import { Plus, Trash2, Clock } from "lucide-react";

export const Route = createFileRoute("/servicos")({
  head: () => ({ meta: [{ title: "Serviços — Barber OS" }] }),
  component: ServicesPage,
});

function ServicesPage() {
  const { services, addService, deleteService } = useBarberStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", durationMin: "30" });

  return (
    <AppShell title="Serviços">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{services.length} serviço(s)</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Novo serviço</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Cadastrar serviço</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Preço (R$)</Label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
              <div><Label>Duração (min)</Label><Input type="number" value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button
                disabled={!form.name.trim() || !form.price}
                onClick={() => {
                  addService({ name: form.name.trim(), price: Number(form.price), durationMin: Number(form.durationMin) || 30 });
                  setForm({ name: "", price: "", durationMin: "30" });
                  setOpen(false);
                }}
              >Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <Card key={s.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{s.name}</h3>
                  <p className="text-primary font-bold text-lg mt-1">{fmtBRL(s.price)}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" /> {s.durationMin} min
                  </p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => deleteService(s.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
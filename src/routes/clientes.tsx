import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useBarberStore } from "@/lib/barber-store";
import { Plus, Trash2, Phone } from "lucide-react";

export const Route = createFileRoute("/clientes")({
  head: () => ({ meta: [{ title: "Clientes — Barber OS" }] }),
  component: ClientsPage,
});

function ClientsPage() {
  const { clients, addClient, deleteClient } = useBarberStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", notes: "" });

  return (
    <AppShell title="Clientes">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{clients.length} cliente(s) cadastrado(s)</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Novo cliente</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Cadastrar cliente</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Telefone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>Observações</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button
                disabled={!form.name.trim()}
                onClick={() => {
                  addClient({ name: form.name.trim(), phone: form.phone.trim(), notes: form.notes.trim() });
                  setForm({ name: "", phone: "", notes: "" });
                  setOpen(false);
                }}
              >Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {clients.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">Nenhum cliente cadastrado ainda.</CardContent></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{c.name}</h3>
                    {c.phone && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3" /> {c.phone}
                      </p>
                    )}
                    {c.notes && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{c.notes}</p>}
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => deleteClient(c.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useBarberStore, fmtBRL } from "@/lib/barber-store";
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet } from "lucide-react";

export const Route = createFileRoute("/financeiro")({
  head: () => ({ meta: [{ title: "Financeiro — Barber OS" }] }),
  component: FinancePage,
});

function FinancePage() {
  const { transactions, addTransaction, deleteTransaction } = useBarberStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    type: "expense" as "income" | "expense",
    amount: "",
    description: "",
    category: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const { income, expense, profit } = useMemo(() => {
    const income = transactions.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
    const expense = transactions.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);
    return { income, expense, profit: income - expense };
  }, [transactions]);

  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <AppShell title="Financeiro">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-6">
        <Card><CardContent className="p-5">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-sm text-muted-foreground">Receitas</span><TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-2xl font-bold mt-2 text-emerald-400">{fmtBRL(income)}</div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-sm text-muted-foreground">Despesas</span><TrendingDown className="h-4 w-4" />
          </div>
          <div className="text-2xl font-bold mt-2 text-rose-400">{fmtBRL(expense)}</div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Lucro</span><Wallet className={`h-4 w-4 ${profit >= 0 ? "text-primary" : "text-rose-400"}`} />
          </div>
          <div className={`text-2xl font-bold mt-2 ${profit >= 0 ? "text-primary" : "text-rose-400"}`}>{fmtBRL(profit)}</div>
        </CardContent></Card>
      </div>

      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{transactions.length} lançamento(s)</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Novo lançamento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo lançamento</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as "income" | "expense" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Receita</SelectItem>
                    <SelectItem value="expense">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Descrição</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Valor (R$)</Label><Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
                <div><Label>Data</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              </div>
              <div><Label>Categoria</Label><Input placeholder="Ex: Produtos, Aluguel, Serviço" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button
                disabled={!form.amount || !form.description.trim()}
                onClick={() => {
                  addTransaction({
                    type: form.type,
                    amount: Number(form.amount),
                    description: form.description.trim(),
                    category: form.category.trim() || "Geral",
                    date: new Date(form.date).toISOString(),
                  });
                  setForm({ type: "expense", amount: "", description: "", category: "", date: new Date().toISOString().slice(0, 10) });
                  setOpen(false);
                }}
              >Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {sorted.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">Nenhum lançamento ainda.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {sorted.map((t) => (
            <Card key={t.id}>
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{t.description}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.category} · {new Date(t.date).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`font-bold ${t.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                    {t.type === "income" ? "+" : "−"} {fmtBRL(t.amount)}
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => deleteTransaction(t.id)}>
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
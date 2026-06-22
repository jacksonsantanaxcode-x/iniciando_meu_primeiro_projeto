import { useEffect, useState, useCallback } from "react";

export type Client = { id: string; name: string; phone: string; notes?: string };
export type Service = { id: string; name: string; price: number; durationMin: number };
export type Appointment = {
  id: string;
  clientId: string;
  serviceId: string;
  datetime: string; // ISO
  status: "scheduled" | "done" | "cancelled";
};
export type Transaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  date: string; // ISO
};

type Store = {
  clients: Client[];
  services: Service[];
  appointments: Appointment[];
  transactions: Transaction[];
};

const KEY = "barber-store-v1";
const DEFAULT: Store = {
  clients: [],
  services: [
    { id: "s1", name: "Corte de cabelo", price: 40, durationMin: 30 },
    { id: "s2", name: "Barba", price: 30, durationMin: 25 },
    { id: "s3", name: "Corte + Barba", price: 60, durationMin: 50 },
  ],
  appointments: [],
  transactions: [],
};

const listeners = new Set<() => void>();
let cache: Store | null = null;

function read(): Store {
  if (cache) return cache;
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
  } catch {
    cache = DEFAULT;
  }
  return cache!;
}

function write(s: Store) {
  cache = s;
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(s));
  listeners.forEach((l) => l());
}

export function useBarberStore() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const l = () => setTick((t) => t + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  const data = read();

  const update = useCallback((mut: (s: Store) => Store) => {
    write(mut(read()));
  }, []);

  return {
    ...data,
    addClient: (c: Omit<Client, "id">) =>
      update((s) => ({ ...s, clients: [...s.clients, { ...c, id: crypto.randomUUID() }] })),
    updateClient: (id: string, c: Partial<Client>) =>
      update((s) => ({ ...s, clients: s.clients.map((x) => (x.id === id ? { ...x, ...c } : x)) })),
    deleteClient: (id: string) =>
      update((s) => ({ ...s, clients: s.clients.filter((x) => x.id !== id) })),

    addService: (sv: Omit<Service, "id">) =>
      update((s) => ({ ...s, services: [...s.services, { ...sv, id: crypto.randomUUID() }] })),
    updateService: (id: string, sv: Partial<Service>) =>
      update((s) => ({ ...s, services: s.services.map((x) => (x.id === id ? { ...x, ...sv } : x)) })),
    deleteService: (id: string) =>
      update((s) => ({ ...s, services: s.services.filter((x) => x.id !== id) })),

    addAppointment: (a: Omit<Appointment, "id">) =>
      update((s) => ({ ...s, appointments: [...s.appointments, { ...a, id: crypto.randomUUID() }] })),
    updateAppointment: (id: string, a: Partial<Appointment>) =>
      update((s) => {
        const next = s.appointments.map((x) => (x.id === id ? { ...x, ...a } : x));
        // when marking done, auto-create income transaction
        const prev = s.appointments.find((x) => x.id === id);
        const updated = next.find((x) => x.id === id)!;
        let transactions = s.transactions;
        if (prev?.status !== "done" && updated.status === "done") {
          const sv = s.services.find((x) => x.id === updated.serviceId);
          const cl = s.clients.find((x) => x.id === updated.clientId);
          if (sv) {
            transactions = [
              ...transactions,
              {
                id: crypto.randomUUID(),
                type: "income",
                amount: sv.price,
                description: `${sv.name}${cl ? ` — ${cl.name}` : ""}`,
                category: "Serviço",
                date: updated.datetime,
              },
            ];
          }
        }
        return { ...s, appointments: next, transactions };
      }),
    deleteAppointment: (id: string) =>
      update((s) => ({ ...s, appointments: s.appointments.filter((x) => x.id !== id) })),

    addTransaction: (t: Omit<Transaction, "id">) =>
      update((s) => ({ ...s, transactions: [...s.transactions, { ...t, id: crypto.randomUUID() }] })),
    deleteTransaction: (id: string) =>
      update((s) => ({ ...s, transactions: s.transactions.filter((x) => x.id !== id) })),
  };
}

export const fmtBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
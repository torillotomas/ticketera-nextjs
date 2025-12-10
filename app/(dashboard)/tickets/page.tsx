"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";


type Ticket = {
  id: number;
  code: string;
  title: string;
  requester: string;
  status: string;
  priority: string;
  createdAt: string;
};

function statusBadge(status: string) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium border";

  switch (status) {
    case "OPEN":
      return `${base} border-emerald-500/40 bg-emerald-500/10 text-emerald-300`;
    case "IN_PROGRESS":
      return `${base} border-amber-500/40 bg-amber-500/10 text-amber-200`;
    case "RESOLVED":
      return `${base} border-slate-500/40 bg-slate-500/10 text-slate-200`;
    case "PENDING":
      return `${base} border-sky-500/40 bg-sky-500/10 text-sky-200`;
    case "CLOSED":
      return `${base} border-slate-700 bg-slate-900 text-slate-300`;
    default:
      return `${base} border-slate-700 bg-slate-900 text-slate-300`;
  }
}

function priorityBadge(priority: string) {
  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold";

  switch (priority) {
    case "URGENT":
      return `${base} bg-rose-500 text-rose-50`;
    case "HIGH":
      return `${base} bg-orange-500 text-orange-50`;
    case "MEDIUM":
      return `${base} bg-amber-400 text-slate-950`;
    case "LOW":
      return `${base} bg-slate-700 text-slate-50`;
    default:
      return `${base} bg-slate-700 text-slate-50`;
  }
}

type NewTicketForm = {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
};

export default function TicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // estado del modal de creación
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [form, setForm] = useState<NewTicketForm>({
    title: "",
    description: "",
    priority: "MEDIUM",
  });

  // cargar tickets existentes
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/tickets");
        if (!res.ok) {
          throw new Error("No se pudieron cargar los tickets");
        }

        const data = await res.json();
        setTickets(data.tickets ?? []);
      } catch (err: any) {
        console.error(err);
        setError(err.message ?? "Error al cargar tickets");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const STATUS_LABELS: Record<string, string> = {
    OPEN: "Abierto",
    IN_PROGRESS: "En progreso",
    PENDING: "Pendiente",
    RESOLVED: "Resuelto",
    CLOSED: "Cerrado",
  };

  const PRIORITY_LABELS: Record<string, string> = {
    LOW: "Baja",
    MEDIUM: "Media",
    HIGH: "Alta",
    URGENT: "Urgente",
  };

  const openCreateModal = () => {
    setForm({
      title: "",
      description: "",
      priority: "MEDIUM",
    });
    setCreateError(null);
    setShowCreate(true);
  };

  const closeCreateModal = () => {
    if (!creating) {
      setShowCreate(false);
    }
  };

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setCreateError("Título y descripción son obligatorios.");
      return;
    }

    try {
      setCreating(true);
      setCreateError(null);

      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Error al crear el ticket.");
      }

      const data = await res.json();
      const newTicket: Ticket = {
        id: data.ticket.id,
        code: data.ticket.code,
        title: data.ticket.title,
        requester: "Demian (demo)", // por ahora, hasta que conectemos auth
        status: data.ticket.status,
        priority: data.ticket.priority,
        createdAt: data.ticket.createdAt,
      };

      // agregamos el ticket al principio de la lista
      setTickets((prev) => [newTicket, ...prev]);
      setShowCreate(false);
    } catch (err: any) {
      console.error(err);
      setCreateError(err.message ?? "Error al crear el ticket.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-4 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Tickets activos
          </h1>
          <p className="text-sm text-slate-400">
            Vista general de los tickets en la cola de soporte.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800">
            Filtros (próximamente)
          </button>
          <button
            className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 text-xs font-semibold"
            onClick={openCreateModal}
          >
            + Nuevo ticket
          </button>
        </div>
      </div>

      {/* Estados de carga */}
      {loading && (
        <div className="text-sm text-slate-400">Cargando tickets...</div>
      )}

      {error && !loading && (
        <div className="text-sm text-rose-400">Error: {error}</div>
      )}

      {!loading && !error && (
        <>
          {/* Lista de tickets */}
          <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
            <div className="grid grid-cols-12 gap-2 border-b border-slate-800 px-3 py-2 text-[11px] font-medium text-slate-400">
              <div className="col-span-3">Ticket</div>
              <div className="col-span-3">Solicitante</div>
              <div className="col-span-2">Estado</div>
              <div className="col-span-2">Prioridad</div>
              <div className="col-span-2 text-right">Creado</div>
            </div>

            {tickets.length === 0 ? (
              <div className="px-3 py-4 text-sm text-slate-400">
                No hay tickets todavía. Creá uno con el botón &quot;Nuevo
                ticket&quot;.
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    className="grid grid-cols-12 gap-2 px-3 py-3 text-[13px] hover:bg-slate-900/60 cursor-pointer"
                    onClick={() => router.push(`/tickets/${t.id}`)}

                  >
                    <div className="col-span-3">
                      <div className="font-medium text-slate-100">
                        {t.code}
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        {t.title}
                      </div>
                    </div>
                    <div className="col-span-3">
                      <span className="text-slate-200">{t.requester}</span>
                    </div>
                    <div className="col-span-2">
                      <span className={statusBadge(t.status)}>
                        {STATUS_LABELS[t.status] ?? t.status}
                      </span>

                    </div>
                    <div className="col-span-2">
                      <span className={priorityBadge(t.priority)}>
                        {PRIORITY_LABELS[t.priority] ?? t.priority}
                      </span>

                    </div>
                    <div className="col-span-2 text-right text-xs text-slate-400">
                      {new Date(t.createdAt).toLocaleString("es-AR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-500">
            Próximamente: kanban con drag &amp; drop, filtros avanzados,
            asignación por agente y SLA.
          </p>
        </>
      )}

      {/* Modal de creación de ticket */}
      {showCreate && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-lg rounded-2xl bg-slate-950 border border-slate-800 shadow-xl shadow-black/40 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">
                  Nuevo ticket
                </h2>
                <p className="text-xs text-slate-400">
                  Cargá un ticket para soporte. Más adelante esto lo va a hacer
                  cualquier usuario.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCreateModal}
                className="text-slate-400 hover:text-slate-200 text-sm"
                disabled={creating}
              >
                ✕
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleCreate}>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                  placeholder="Ej: No puedo acceder al sistema de facturación"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Descripción
                </label>
                <textarea
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500 min-h-[100px] resize-y"
                  placeholder="Contá qué estabas haciendo, qué error apareció, etc."
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Prioridad
                </label>
                <select
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                  value={form.priority}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      priority: e.target.value as NewTicketForm["priority"],
                    }))
                  }
                >
                  <option value="LOW">Baja</option>
                  <option value="MEDIUM">Media</option>
                  <option value="HIGH">Alta</option>
                  <option value="URGENT">Urgente</option>
                </select>
              </div>

              {createError && (
                <div className="text-xs text-rose-400">{createError}</div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={creating}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
                >
                  {creating ? "Creando..." : "Crear ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { canCreateTicket } from "@/lib/permissions";

type Role = "USER" | "AGENT" | "ADMIN";

type Category = "ACCESS" | "BUG" | "REQUEST" | "HARDWARE" | "NETWORK" | "OTHER";

type Ticket = {
  id: number;
  code?: string; // ✅ puede no venir, lo calculamos
  title: string;
  status: string;
  priority: string;
  category?: Category; // ✅
  createdAt: string;
  creator: {
    name: string;
    email: string;
  };
  assignee?: {
    name: string;
    email: string;
  } | null;
};

type MeUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

type AgentUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
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

const CATEGORY_LABELS: Record<Category, string> = {
  ACCESS: "Acceso",
  BUG: "Bug",
  REQUEST: "Solicitud",
  HARDWARE: "Hardware",
  NETWORK: "Red",
  OTHER: "Otro",
};

function categoryBadge(category: Category) {
  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border";

  switch (category) {
    case "BUG":
      return `${base} border-rose-500/40 bg-rose-500/10 text-rose-200`;
    case "ACCESS":
      return `${base} border-sky-500/40 bg-sky-500/10 text-sky-200`;
    case "REQUEST":
      return `${base} border-emerald-500/40 bg-emerald-500/10 text-emerald-200`;
    case "HARDWARE":
      return `${base} border-amber-500/40 bg-amber-500/10 text-amber-200`;
    case "NETWORK":
      return `${base} border-indigo-500/40 bg-indigo-500/10 text-indigo-200`;
    default:
      return `${base} border-slate-700 bg-slate-900 text-slate-300`;
  }
}

type NewTicketForm = {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  category: Category; // ✅
};

type Tab = "UNASSIGNED" | "MINE" | "BY_AGENT" | "ALL";

export default function TicketsPage() {
  const router = useRouter();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [agents, setAgents] = useState<AgentUser[]>([]);
  const [selectedAgentEmail, setSelectedAgentEmail] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [me, setMe] = useState<MeUser | null>(null);
  const [tab, setTab] = useState<Tab>("UNASSIGNED");
  const [takingId, setTakingId] = useState<number | null>(null);

  // modal creación
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [form, setForm] = useState<NewTicketForm>({
    title: "",
    description: "",
    priority: "MEDIUM",
    category: "OTHER", // ✅
  });

  const ticketCode = (t: Ticket) => t.code ?? `TCK-${String(t.id).padStart(3, "0")}`;

  async function handleTake(ticketId: number) {
    if (!me) return;

    try {
      setTakingId(ticketId);

      const res = await fetch(`/api/tickets/${ticketId}/assign`, {
        method: "PATCH",
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        alert(data?.message || "No se pudo tomar el ticket");
        return;
      }

      // ✅ actualizamos estado local (asignado a mí)
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId ? { ...t, assignee: { name: me.name, email: me.email } } : t
        )
      );
    } catch (err) {
      console.error(err);
      alert("Error al tomar el ticket");
    } finally {
      setTakingId(null);
    }
  }

  // cargar usuario
  useEffect(() => {
    let cancelled = false;

    async function loadMe() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data.ok && data.user) {
          setMe(data.user);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadMe();
    return () => {
      cancelled = true;
    };
  }, []);

  // cargar tickets
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/tickets");
        if (!res.ok) throw new Error("No se pudieron cargar los tickets");

        const data = await res.json();
        setTickets((data.tickets ?? []) as Ticket[]);
      } catch (err: any) {
        console.error(err);
        setError(err.message ?? "Error al cargar tickets");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // cargar agentes (solo ADMIN) ✅ NO pisa selección
  useEffect(() => {
    if (me?.role !== "ADMIN") return;

    let cancelled = false;

    async function loadAgents() {
      try {
        const res = await fetch("/api/users?role=AGENT");
        if (!res.ok) return;

        const data = await res.json();
        if (!cancelled && data.ok && Array.isArray(data.users)) {
          setAgents(data.users);

          // ✅ solo setea default si todavía no hay uno elegido
          setSelectedAgentEmail((prev) => prev || data.users[0]?.email || "");
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadAgents();
    return () => {
      cancelled = true;
    };
  }, [me?.role]);

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

  const unassigned = useMemo(() => tickets.filter((t) => !t.assignee), [tickets]);

  const mine = useMemo(
    () => tickets.filter((t) => t.assignee?.email === me?.email),
    [tickets, me?.email]
  );

  const bySelectedAgent = useMemo(() => {
    if (!selectedAgentEmail) return [];
    return tickets.filter((t) => t.assignee?.email === selectedAgentEmail);
  }, [tickets, selectedAgentEmail]);

  const visibleTickets = useMemo(() => {
    if (me?.role === "ADMIN") {
      if (tab === "UNASSIGNED") return unassigned;
      if (tab === "BY_AGENT") return bySelectedAgent;
      if (tab === "ALL") return tickets;
      return unassigned;
    }

    if (tab === "MINE") return mine;
    return unassigned;
  }, [me?.role, tab, tickets, unassigned, mine, bySelectedAgent]);

  // set tab inicial
  useEffect(() => {
    if (!me) return;
    setTab("UNASSIGNED");
  }, [me?.role]);

  const openCreateModal = () => {
    setForm({ title: "", description: "", priority: "MEDIUM", category: "OTHER" }); // ✅
    setCreateError(null);
    setShowCreate(true);
  };

  const closeCreateModal = () => {
    if (!creating) setShowCreate(false);
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form), // ✅ incluye category
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        throw new Error(data?.message || "Error al crear el ticket.");
      }

      const created = data.ticket as Ticket;

      setTickets((prev) => [created, ...prev]);
      setShowCreate(false);
      setTab("UNASSIGNED");
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
          <h1 className="text-xl font-semibold tracking-tight">Tickets activos</h1>
          <p className="text-sm text-slate-400">
            Vista general de los tickets en la cola de soporte.
          </p>
        </div>
        <div className="flex gap-2">
          {me && canCreateTicket(me.role) && (
            <button
              className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 text-xs font-semibold"
              onClick={openCreateModal}
            >
              + Nuevo ticket
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab("UNASSIGNED")}
            className={
              "rounded-lg px-3 py-1.5 text-xs border " +
              (tab === "UNASSIGNED"
                ? "bg-slate-800 border-slate-600 text-slate-100"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200")
            }
          >
            Sin asignar{" "}
            <span className="ml-1 text-[11px] text-slate-400">({unassigned.length})</span>
          </button>

          {me?.role !== "ADMIN" && (
            <button
              type="button"
              onClick={() => setTab("MINE")}
              className={
                "rounded-lg px-3 py-1.5 text-xs border " +
                (tab === "MINE"
                  ? "bg-slate-800 border-slate-600 text-slate-100"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200")
              }
            >
              Asignados a mí{" "}
              <span className="ml-1 text-[11px] text-slate-400">({mine.length})</span>
            </button>
          )}

          {me?.role === "ADMIN" && (
            <>
              <button
                type="button"
                onClick={() => setTab("BY_AGENT")}
                className={
                  "rounded-lg px-3 py-1.5 text-xs border " +
                  (tab === "BY_AGENT"
                    ? "bg-slate-800 border-slate-600 text-slate-100"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200")
                }
              >
                Por agente{" "}
                <span className="ml-1 text-[11px] text-slate-400">
                  ({selectedAgentEmail ? bySelectedAgent.length : 0})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTab("ALL")}
                className={
                  "rounded-lg px-3 py-1.5 text-xs border " +
                  (tab === "ALL"
                    ? "bg-slate-800 border-slate-600 text-slate-100"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200")
                }
              >
                Todos{" "}
                <span className="ml-1 text-[11px] text-slate-400">({tickets.length})</span>
              </button>
            </>
          )}
        </div>

        {/* Dropdown de agentes */}
        {me?.role === "ADMIN" && tab === "BY_AGENT" && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Agente</span>
            <select
              value={selectedAgentEmail}
              onChange={(e) => setSelectedAgentEmail(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg px-2 py-1"
            >
              {agents.length === 0 && <option value="">(sin agentes)</option>}
              {agents.map((a) => (
                <option key={a.id} value={a.email}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Estados */}
      {loading && <div className="text-sm text-slate-400">Cargando tickets...</div>}
      {error && !loading && <div className="text-sm text-rose-400">Error: {error}</div>}

      {!loading && !error && (
        <>
          <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
            {/* ✅ ahora grid-cols-16 porque agregamos Categoría */}
            <div className="grid grid-cols-16 gap-2 border-b border-slate-800 px-3 py-2 text-[11px] font-medium text-slate-400">
              <div className="col-span-3">Ticket</div>
              <div className="col-span-3">Solicitante</div>
              <div className="col-span-2">Estado</div>
              <div className="col-span-2">Prioridad</div>
              <div className="col-span-2">Categoría</div>

              {me?.role === "AGENT" && tab === "UNASSIGNED" ? (
                <div className="col-span-2 text-right">Acción</div>
              ) : (
                <div className="col-span-4 text-right">Creado</div>
              )}
            </div>

            {visibleTickets.length === 0 ? (
              <div className="px-3 py-4 text-sm text-slate-400">
                {tab === "UNASSIGNED" && "No hay tickets sin asignar."}
                {tab === "MINE" && "No tenés tickets asignados."}
                {tab === "BY_AGENT" && "Ese agente no tiene tickets asignados."}
                {tab === "ALL" && "No hay tickets."}
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {visibleTickets.map((t) => {
                  const cat: Category = (t.category ?? "OTHER") as Category;

                  return (
                    <div
                      key={t.id}
                      className="grid grid-cols-16 gap-2 px-3 py-3 text-[13px] hover:bg-slate-900/60 cursor-pointer"
                      onClick={() => router.push(`/tickets/${t.id}`)}
                    >
                      <div className="col-span-3">
                        <div className="font-medium text-slate-100">{ticketCode(t)}</div>
                        <div className="text-xs text-slate-400 truncate">{t.title}</div>
                      </div>

                      <div className="col-span-3">
                        <span className="text-slate-200">{t.creator?.name ?? "-"}</span>
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

                      {/* ✅ Categoría */}
                      <div className="col-span-2">
                        <span className={categoryBadge(cat)}>
                          {CATEGORY_LABELS[cat] ?? cat}
                        </span>
                      </div>

                      {me?.role === "AGENT" && tab === "UNASSIGNED" ? (
                        <div className="col-span-2 flex justify-end">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTake(t.id);
                            }}
                            disabled={!!t.assignee || takingId === t.id}
                            className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
                          >
                            {takingId === t.id ? "Tomando..." : "Tomar ticket"}
                          </button>
                        </div>
                      ) : (
                        <div className="col-span-4 text-right text-xs text-slate-400">
                          {new Date(t.createdAt).toLocaleString("es-AR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal creación */}
      {showCreate && me && canCreateTicket(me.role) && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-lg rounded-2xl bg-slate-950 border border-slate-800 shadow-xl shadow-black/40 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">Nuevo ticket</h2>
                <p className="text-xs text-slate-400">Cargá un ticket para soporte.</p>
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
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Descripción
                </label>
                <textarea
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500 min-h-[100px] resize-y"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>

              {/* ✅ Categoría */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Categoría
                </label>
                <select
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value as Category }))
                  }
                >
                  <option value="ACCESS">Accesos</option>
                  <option value="BUG">Error / Bug</option>
                  <option value="FEATURE">Mejora / Solicitud</option>
                  <option value="PAYMENTS">Pagos / Facturación</option>
                  <option value="SOFTWARE">Software</option>
                  <option value="HARDWARE">Hardware</option>
                  <option value="NETWORK">Redes/Internet</option>
                  <option value="OTHER">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Prioridad
                </label>
                <select
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100"
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

              {createError && <div className="text-xs text-rose-400">{createError}</div>}

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

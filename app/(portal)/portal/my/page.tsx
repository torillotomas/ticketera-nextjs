"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Ticket = {
  id: number;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  assignee?: { name: string; email: string } | null;
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Abierto",
  IN_PROGRESS: "En progreso",
  PENDING: "Pendiente",
  RESOLVED: "Resuelto",
  CLOSED: "Cerrado",
};

export default function PortalMyTicketsPage() {
  const router = useRouter();
  const params = useSearchParams();
  const created = params.get("created");

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/tickets");
        if (!res.ok) throw new Error("No se pudieron cargar tus solicitudes");
        const data = await res.json();
        setTickets(data.tickets ?? []);
      } catch (err: any) {
        setError(err.message ?? "Error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const sorted = useMemo(
    () => [...tickets].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [tickets]
  );

  return (
    <div className="space-y-4">
      <div>
        <a href="/portal" className="text-[11px] text-slate-400 hover:text-slate-200">
          ← Volver
        </a>
        <h1 className="text-xl font-semibold mt-2">Mis solicitudes</h1>
        <p className="text-sm text-slate-400">Seguimiento de tus tickets.</p>
        <a
          href="/portal/history"
          className="text-xs text-slate-400 hover:text-slate-200"
        >
          Ver historial de tickets cerrados →
        </a>

      </div>

      {created === "1" && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
          Listo ✅ Tu solicitud fue creada.
        </div>
      )}

      {loading && <div className="text-sm text-slate-400">Cargando...</div>}
      {error && !loading && <div className="text-sm text-rose-400">{error}</div>}

      {!loading && !error && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden">
          {sorted.length === 0 ? (
            <div className="px-4 py-5 text-sm text-slate-400">
              Todavía no creaste ninguna solicitud.{" "}
              <a className="text-emerald-300 hover:text-emerald-200" href="/portal/new">
                Crear una
              </a>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {sorted.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => router.push(`/portal/tickets/${t.id}`)} // reutilizamos detalle existente
                  className="w-full text-left px-4 py-4 hover:bg-slate-900/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-slate-100">{t.title}</div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Estado: {STATUS_LABELS[t.status] ?? t.status} ·{" "}
                        {new Date(t.createdAt).toLocaleString("es-AR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      {t.assignee?.name ? `Asignado: ${t.assignee.name}` : "Sin asignar"}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

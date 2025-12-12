"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Category =
  | "ACCESS"
  | "BUG"
  | "FEATURE"
  | "PAYMENTS"
  | "HARDWARE"
  | "OTHER";

type NewTicketForm = {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  category: Category;
};

export default function PortalNewTicketPage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<NewTicketForm>({
    title: "",
    description: "",
    priority: "MEDIUM",
    category: "OTHER",
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      setError("Título y descripción son obligatorios.");
      return;
    }

    try {
      setCreating(true);
      setError(null);

      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form), // 👈 category viaja acá
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        throw new Error(data?.message || "No se pudo crear la solicitud.");
      }

      router.push(`/portal/my?created=1`);
    } catch (err: any) {
      setError(err.message ?? "Error al crear la solicitud.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <a
          href="/portal"
          className="text-[11px] text-slate-400 hover:text-slate-200"
        >
          ← Volver
        </a>

        <h1 className="text-xl font-semibold mt-2">Nueva solicitud</h1>
        <p className="text-sm text-slate-400">
          Contanos qué necesitás y te respondemos por este mismo ticket.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-4"
      >
        {/* Asunto */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Asunto
          </label>
          <input
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
            value={form.title}
            onChange={(e) =>
              setForm((f) => ({ ...f, title: e.target.value }))
            }
            placeholder="Ej: No puedo ingresar al sistema"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Descripción
          </label>
          <textarea
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="Qué estabas haciendo, qué error apareció, etc."
          />
        </div>

        {/* Categoría ✅ */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Categoría
          </label>
          <select
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100"
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                category: e.target.value as Category,
              }))
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

        {/* Prioridad */}
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

        {error && <div className="text-sm text-rose-400">{error}</div>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => router.push("/portal")}
            disabled={creating}
            className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={creating}
            className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {creating ? "Enviando..." : "Crear solicitud"}
          </button>
        </div>
      </form>
    </div>
  );
}

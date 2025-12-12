import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAuthToken } from "@/lib/auth";

export default async function PortalHome() {
  const token = (await cookies()).get("auth")?.value;
  if (!token) redirect("/login");

  try {
    const payload = await verifyAuthToken(token);

    // si es agente/admin, no usa portal
    if (payload.role !== "USER") redirect("/tickets");

    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
          <h1 className="text-2xl font-semibold tracking-tight">Soporte</h1>
          <p className="text-sm text-slate-400 mt-1">
            Creá una solicitud y seguí el estado de tus tickets.
          </p>

          <div className="mt-4 flex gap-2">
            <a
              href="/portal/new"
              className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 text-sm font-semibold"
            >
              + Nueva solicitud
            </a>
            <a
              href="/portal/my"
              className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
            >
              Solicitudes Activas
            </a>
                        <a
              href="/portal/history"
              className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
            >
              Solicitudes Cerradas
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="text-xs text-slate-400">Tu usuario</div>
            <div className="text-sm text-slate-100 font-medium mt-1">{payload.name}</div>
            <div className="text-xs text-slate-400">{payload.email}</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="text-xs text-slate-400">Qué podés hacer</div>
            <div className="text-sm text-slate-100 mt-1">Crear tickets</div>
            <div className="text-xs text-slate-400">Agregar comentarios y adjuntos</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="text-xs text-slate-400">Tip</div>
            <div className="text-sm text-slate-100 mt-1">Adjuntá captura</div>
            <div className="text-xs text-slate-400">Pegando desde el portapapeles</div>
          </div>
        </div>
      </div>
    );
  } catch {
    redirect("/login");
  }
}

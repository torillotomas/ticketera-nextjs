export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="max-w-xl w-full px-6 py-8 rounded-2xl border border-slate-800 shadow-lg shadow-slate-900/40">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">
          Ticketera Help Desk
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          Versión 1.0 - Construida con Next.js, TypeScript y Tailwind.
        </p>

        <div className="space-y-3 text-sm text-slate-300">
          <p>Acá vamos a tener:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-200">
            <li>Login de usuarios</li>
            <li>Panel de tickets (Kanban / lista)</li>
            <li>Historial de cambios y comentarios</li>
            <li>Roles: usuario, agente y admin</li>
          </ul>

          <p className="pt-2 text-xs text-slate-500">
            Próximo paso: separar layout público (login) y layout privado (app).
          </p>
        </div>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import UserBadge from "../components/UserBadge";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 bg-slate-950/80">
        <div className="px-4 py-4 border-b border-slate-800">
          <div className="text-sm font-semibold text-slate-100">
            Ticketera
          </div>
          <div className="text-[11px] text-slate-500">
            by Demian Tomas Torillo
           </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          <Link
            href="/tickets"
            className="block rounded-lg px-3 py-2 bg-slate-900 text-slate-100"
          >
            Tickets
          </Link>
          <button
            type="button"
            className="block w-full text-left rounded-lg px-3 py-2 text-slate-400 hover:bg-slate-900/80 hover:text-slate-100"
          >
            Métricas (próximamente)
          </button>
          <button
            type="button"
            className="block w-full text-left rounded-lg px-3 py-2 text-slate-400 hover:bg-slate-900/80 hover:text-slate-100"
          >
            Configuración (próximamente)
          </button>
        </nav>
      </aside>

      {/* Contenido principal */}
      <section className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-14 border-b border-slate-800 flex items-center justify-between px-4 md:px-6 bg-slate-950/60 backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/40 text-[11px] font-semibold text-emerald-300">
              T
            </span>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Panel
              </div>
              <div className="text-sm font-medium text-slate-100">
                Tickets de soporte
              </div>
            </div>
          </div>

          {/* Usuario logueado + Cerrar sesión */}
          <UserBadge />
        </header>

        {/* Contenido de cada página del dashboard */}
        <div className="flex-1 px-4 md:px-6 py-4 md:py-6 overflow-y-auto">
          {children}
        </div>
      </section>
    </main>
  );
}

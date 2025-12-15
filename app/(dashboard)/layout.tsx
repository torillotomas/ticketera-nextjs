import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { requirePageSession } from "@/lib/requirePageSession";
import UserBadgeClient from "../components/UserBadge";
import SidebarNav from "../components/SidebarNav";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await requirePageSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 bg-slate-950/80">
        <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 bg-slate-950/80">
          <div className="px-4 py-4 border-b border-slate-800">
            <div className="text-sm font-semibold text-slate-100">Ticketera</div>
            <div className="text-[11px] text-slate-500">by Demian Tomas Torillo</div>
          </div>

          <SidebarNav />
        </aside>

      </aside>

      {/* Contenido principal */}
      <section className="flex-1 flex flex-col">
        <header className="h-14 border-b border-slate-800 flex items-center justify-between px-4 md:px-6 bg-slate-950/60 backdrop-blur">
          <div className="flex items-center gap-2">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Panel
              </div>
              <div className="text-sm font-medium text-slate-100">
                Tickets de soporte
              </div>
            </div>
          </div>

          {/* Client component */}
          <UserBadgeClient />
        </header>

        <div className="flex-1 px-4 md:px-6 py-4 md:py-6 overflow-y-auto">
          {children}
        </div>
      </section>
    </main>
  );
}

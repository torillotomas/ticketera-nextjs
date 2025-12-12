import type { ReactNode } from "react";
import UserBadge from "../components/UserBadge";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Header portal */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/80">
        <div className="text-sm font-semibold tracking-tight">
          Portal de Soporte
        </div>

        {/* 👇 logout + user */}
        <UserBadge />
      </header>

      <main className="p-4 max-w-5xl mx-auto">{children}</main>
    </div>
  );
}

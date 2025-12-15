"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SidebarNav() {
  const pathname = usePathname();

  const linkClass = (active: boolean) =>
    active
      ? "block rounded-lg px-3 py-2 bg-slate-900 text-slate-100"
      : "block rounded-lg px-3 py-2 text-slate-400 hover:bg-slate-900/80 hover:text-slate-100";

  return (
    <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
      <Link href="/tickets" className={linkClass(pathname.startsWith("/tickets"))}>
        Tickets
      </Link>

      <Link href="/settings" className={linkClass(pathname.startsWith("/settings"))}>
        Configuración
      </Link>

      <button
        type="button"
        className="block w-full text-left rounded-lg px-3 py-2 text-slate-400 hover:bg-slate-900/80 hover:text-slate-100"
      >
        Métricas (próximamente)
      </button>
    </nav>
  );
}

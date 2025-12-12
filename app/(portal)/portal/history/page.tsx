"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Ticket = {
    id: number;
    title: string;
    status: string;
    priority: string;
    updatedAt: string;
    assignee?: { name: string } | null;
};

export default function PortalHistoryPage() {
    const router = useRouter();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/portal/history");
                const data = await res.json();
                if (res.ok && data.ok) {
                    setTickets(data.tickets);
                }
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    if (loading) {
        return <div className="text-sm text-slate-400">Cargando historial...</div>;
    }

    return (
        <div className="space-y-4">
            <div>
                <a href="/portal" className="text-[11px] text-slate-400 hover:text-slate-200">
                    ← Volver
                </a>
                <h1 className="text-xl font-semibold">Historial de solicitudes</h1>
                <p className="text-sm text-slate-400">
                    Tickets finalizados y cerrados.
                </p>
            </div>

            {tickets.length === 0 ? (
                <div className="text-sm text-slate-400">
                    Todavía no tenés tickets cerrados.
                </div>
            ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                    <div className="divide-y divide-slate-800">
                        {tickets.map((t) => (
                            <div
                                key={t.id}
                                onClick={() => router.push(`/portal/tickets/${t.id}`)}
                                className="px-4 py-3 text-sm hover:bg-slate-900 cursor-pointer"
                            >
                                <div className="font-medium text-slate-100">
                                    TCK-{String(t.id).padStart(3, "0")} — {t.title}
                                </div>
                                <div className="text-xs text-slate-400">
                                    Cerrado ·{" "}
                                    {new Date(t.updatedAt).toLocaleString("es-AR")}
                                    {t.assignee && ` · Atendido por ${t.assignee.name}`}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

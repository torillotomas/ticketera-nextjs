"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Role = "USER" | "AGENT" | "ADMIN";
type MeUser = { id: number; name: string; email: string; role: Role };

type Comment = {
  id: number;
  content: string;
  createdAt: string;
  imageUrl?: string | null;
  author: { name: string };
};

type Ticket = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  creator: { name: string; email: string };
  assignee?: { name: string; email: string } | null;
  comments: Comment[];
};

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

function statusPill(status: string) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium border";
  switch (status) {
    case "OPEN":
      return `${base} border-emerald-500/40 bg-emerald-500/10 text-emerald-300`;
    case "IN_PROGRESS":
      return `${base} border-amber-500/40 bg-amber-500/10 text-amber-200`;
    case "PENDING":
      return `${base} border-sky-500/40 bg-sky-500/10 text-sky-200`;
    case "RESOLVED":
      return `${base} border-slate-500/40 bg-slate-500/10 text-slate-200`;
    case "CLOSED":
      return `${base} border-slate-700 bg-slate-900 text-slate-300`;
    default:
      return `${base} border-slate-700 bg-slate-900 text-slate-300`;
  }
}

function priorityPill(priority: string) {
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

export default function TicketDetailClient({ id }: { id: string }) {
  const router = useRouter();

  const [me, setMe] = useState<MeUser | null>(null);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [closing, setClosing] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);

  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const isClosed = ticket?.status === "CLOSED";

  useEffect(() => {
    let cancelled = false;

    async function loadMe() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data.ok && data.user) setMe(data.user);
      } catch {
        // ignore
      }
    }

    loadMe();
    return () => {
      cancelled = true;
    };
  }, []);

  async function refetchTicket(ticketId: number) {
    const resTicket = await fetch(`/api/tickets/${ticketId}`);
    const dataTicket = await resTicket.json().catch(() => null);
    if (resTicket.ok && dataTicket?.ticket) {
      setTicket(dataTicket.ticket);
    }
  }

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/tickets/${id}`);
        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.ticket) {
          throw new Error(data?.message || "No se pudo cargar el ticket");
        }

        if (!cancelled) setTicket(data.ticket);
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? "Error desconocido");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  function handlePasteImage(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const blob = item.getAsFile();
        if (!blob) return;

        const pastedFile = new File([blob], `captura-${Date.now()}.png`, {
          type: blob.type,
        });

        setFile(pastedFile);
        e.preventDefault();
        break;
      }
    }
  }

  async function handleConfirmClose() {
    if (!ticket) return;

    try {
      setClosing(true);
      setCloseError(null);

      const res = await fetch(`/api/tickets/${ticket.id}/close`, {
        method: "PATCH",
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        throw new Error(data?.message || "No se pudo cerrar el ticket");
      }

      await refetchTicket(ticket.id);
    } catch (err: any) {
      setCloseError(err.message ?? "Error al cerrar el ticket");
    } finally {
      setClosing(false);
    }
  }

  async function handleAddComment() {
    if (!ticket) return;

    if (isClosed) {
      setCommentError("El ticket está cerrado. No se pueden enviar mensajes.");
      return;
    }

    if (!newComment.trim()) {
      setCommentError("Escribí un comentario antes de enviar.");
      return;
    }

    try {
      setPostingComment(true);
      setCommentError(null);

      let imageUrl: string | undefined;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json().catch(() => null);
        if (!uploadRes.ok || !uploadData?.ok) {
          throw new Error(uploadData?.message || "Error al subir la captura");
        }

        imageUrl = uploadData.url;
      }

      const res = await fetch(`/api/tickets/${ticket.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment, imageUrl }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        throw new Error(data?.message || "Error al guardar el comentario");
      }

      await refetchTicket(ticket.id);
      setNewComment("");
      setFile(null);
    } catch (err: any) {
      setCommentError(err.message ?? "Error al guardar el comentario");
    } finally {
      setPostingComment(false);
    }
  }

  if (loading) return <div className="text-sm text-slate-400">Cargando ticket...</div>;
  if (error) return <div className="text-sm text-rose-400">Error: {error}</div>;
  if (!ticket) return <div className="text-sm text-slate-400">Ticket no encontrado.</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <button
          onClick={() => router.push("/portal/my")}
          className="text-[11px] text-slate-400 hover:text-slate-200"
        >
          ← Volver a mis solicitudes
        </button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-100">
              TCK-{String(ticket.id).padStart(3, "0")} — {ticket.title}
            </h1>
            <p className="text-xs text-slate-400">
              Creado el{" "}
              {new Date(ticket.createdAt).toLocaleString("es-AR", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span className={statusPill(ticket.status)}>
                {STATUS_LABELS[ticket.status] ?? ticket.status}
              </span>
              <span className={priorityPill(ticket.priority)}>
                {PRIORITY_LABELS[ticket.priority] ?? ticket.priority}
              </span>

              {/* Confirmar solución: solo USER y solo si está RESOLVED */}
              {me?.role === "USER" && ticket.status === "RESOLVED" && (
                <button
                  type="button"
                  onClick={handleConfirmClose}
                  disabled={closing}
                  className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
                >
                  {closing ? "Cerrando..." : "Confirmar solución"}
                </button>
              )}
            </div>

            {closeError && <div className="text-[11px] text-rose-400">{closeError}</div>}

            {ticket.status === "CLOSED" && (
              <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-[11px] text-slate-400">
                Este ticket está cerrado. Si necesitás más ayuda, creá una nueva solicitud.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left */}
        <div className="md:col-span-2 space-y-4">
          {/* Descripción */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <h2 className="text-sm font-semibold text-slate-200 mb-2">Descripción</h2>
            <p className="text-sm text-slate-200 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Comentarios + Form */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-200 mb-2">Comentarios</h2>

              {ticket.comments.length === 0 ? (
                <div className="text-sm text-slate-500">
                  Todavía no hay mensajes en este ticket.
                </div>
              ) : (
                <div className="space-y-3">
                  {ticket.comments.map((c) => (
                    <div key={c.id} className="border border-slate-800 rounded-lg p-3">
                      <div className="text-[11px] text-slate-400">
                        {c.author.name} · {new Date(c.createdAt).toLocaleString("es-AR")}
                      </div>
                      <div className="text-sm text-slate-200 mt-1 whitespace-pre-wrap">
                        {c.content}
                      </div>

                      {c.imageUrl && (
                        <div className="mt-2">
                          <img
                            src={c.imageUrl}
                            alt="Captura adjunta"
                            className="max-h-64 rounded border border-slate-700 object-contain"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <hr className="border-slate-800" />

            {/* New comment: solo si NO está cerrado */}
            {ticket.status === "CLOSED" ? (
              <div className="text-xs text-slate-400">
                Ticket cerrado: ya no se pueden agregar mensajes.
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Responder / agregar información
                </label>

                <textarea
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500 min-h-[90px]"
                  placeholder="Escribí tu mensaje..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onPaste={handlePasteImage}
                  disabled={postingComment}
                />

                {file && (
                  <div className="text-[11px] text-emerald-400">Imagen adjunta: {file.name}</div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  disabled={postingComment}
                  className="text-xs text-slate-300 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-100 hover:file:bg-slate-700"
                />

                {commentError && <div className="text-[11px] text-rose-400">{commentError}</div>}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddComment}
                    disabled={postingComment}
                    className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
                  >
                    {postingComment ? "Enviando..." : "Enviar"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-200">
            <h2 className="text-xs font-semibold text-slate-300 mb-2">Información</h2>

            <div className="space-y-2 text-xs">
              <div>
                <div className="text-slate-400">Solicitante</div>
                <div>{ticket.creator.name}</div>
                <div className="text-slate-400 text-[11px]">{ticket.creator.email}</div>
              </div>

              <div>
                <div className="text-slate-400">Asignado a</div>
                <div>{ticket.assignee?.name ?? "Sin asignar"}</div>
              </div>

              <div>
                <div className="text-slate-400">Estado</div>
                <div>{STATUS_LABELS[ticket.status] ?? ticket.status}</div>
              </div>

              <div>
                <div className="text-slate-400">Prioridad</div>
                <div>{PRIORITY_LABELS[ticket.priority] ?? ticket.priority}</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="text-xs text-slate-400">
              Podés adjuntar una captura pegándola en el cuadro o usando el selector.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
  creator: {
    name: string;
    email: string;
  };
  assignee?: {
    name: string;
    email: string;
  } | null;
  comments: Comment[];
};

type Role = "USER" | "AGENT" | "ADMIN";

type MeUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
};



export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const [me, setMe] = useState<MeUser | null>(null);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);



  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/tickets/${id}`);
        if (!res.ok) throw new Error("No se pudo cargar el ticket");

        const data = await res.json();
        setTicket(data.ticket);
      } catch (err: any) {
        console.error(err);
        setError(err.message ?? "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    async function loadMe() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data.ok && data.user) {
          setMe(data.user);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadMe();
    return () => {
      cancelled = true;
    };
  }, []);



  if (loading) {
    return <div className="text-sm text-slate-400">Cargando ticket...</div>;
  }

  if (error) {
    return <div className="text-sm text-rose-400">Error: {error}</div>;
  }

  if (!ticket) {
    return <div className="text-sm text-slate-400">Ticket no encontrado.</div>;
  }

  async function handleAddComment() {
    if (!ticket) return;
    if (!newComment.trim()) {
      setCommentError("Escribí un comentario antes de enviar.");
      return;
    }

    try {
      setPostingComment(true);
      setCommentError(null);

      let imageUrl: string | undefined;

      // 1) Si hay archivo, lo subimos
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.ok) {
          throw new Error(uploadData?.message || "Error al subir la captura");
        }

        imageUrl = uploadData.url;
      }

      // 2) Crear comentario con la URL (si la hay)
      const res = await fetch(`/api/tickets/${ticket.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment, imageUrl }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data?.message || "Error al guardar el comentario");
      }

      // 3) Refetch del ticket completo
      const resTicket = await fetch(`/api/tickets/${ticket.id}`);
      if (resTicket.ok) {
        const dataTicket = await resTicket.json();
        setTicket(dataTicket.ticket);
      }

      setNewComment("");
      setFile(null);
    } catch (err: any) {
      console.error(err);
      setCommentError(err.message ?? "Error al guardar el comentario");
    } finally {
      setPostingComment(false);
    }
  }

  function handlePasteImage(
    e: React.ClipboardEvent<HTMLTextAreaElement>
  ) {
    const items = e.clipboardData.items;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.type.startsWith("image/")) {
        const blob = item.getAsFile();
        if (!blob) return;

        const pastedFile = new File(
          [blob],
          `captura-${Date.now()}.png`,
          { type: blob.type }
        );

        setFile(pastedFile); // 👈 ya tenemos la “imagen adjunta”
        e.preventDefault();  // opcional: evita que la pegue como texto raro
        break;
      }
    }
  }



  return (
    <div className="space-y-6">
      {/* Barra superior */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <button
            onClick={() => router.push("/tickets")}
            className="text-[11px] text-slate-400 hover:text-slate-200 mb-1"
          >
            ← Volver al listado
          </button>

          <h1 className="text-xl font-semibold text-slate-100">
            TCK-{String(ticket.id).padStart(3, "0")} — {ticket.title}
          </h1>
          <p className="text-xs text-slate-400">
            Creado por {ticket.creator.name} ({ticket.creator.email}) ·{" "}
            {new Date(ticket.createdAt).toLocaleString("es-AR")}
          </p>
        </div>

        <div className="text-right text-xs text-slate-400 space-y-4">
          {/* TOMAR TICKET (solo AGENT y solo si no está asignado) */}
          {me?.role === "AGENT" && !ticket.assignee && (
            <button
              onClick={async () => {
                const res = await fetch(
                  `/api/tickets/${ticket.id}/assign`,
                  { method: "PATCH" }
                );

                if (res.ok) {
                  window.location.reload();
                } else {
                  const data = await res.json().catch(() => null);
                  alert(data?.message || "No se pudo asignar el ticket");
                }
              }}
              className="rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 px-3 py-1.5 text-xs font-semibold"
            >
              Tomar ticket
            </button>
          )}

          {/* ESTADO */}
          <div className="flex flex-col items-end">
            <label className="text-[11px] text-slate-400 mb-1">Estado</label>
            <select
              className="bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg px-2 py-1"
              value={ticket.status}
              onChange={async (e) => {
                const newStatus = e.target.value;

                const res = await fetch(`/api/tickets/${ticket.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: newStatus }),
                });

                if (res.ok) {
                  setTicket((prev) => prev ? { ...prev, status: newStatus } : prev);
                } else {
                  alert("Error al actualizar estado");
                }
              }}
            >
              <option value="OPEN">ABIERTO</option>
              <option value="IN_PROGRESS">EN PROGRESO</option>
              <option value="PENDING">PENDIENTE</option>
              <option value="RESOLVED">RESUELTO</option>
            </select>
          </div>

          {/* PRIORIDAD */}
          <div className="flex flex-col items-end">
            <label className="text-[11px] text-slate-400 mb-1">Prioridad</label>
            <select
              className="bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg px-2 py-1"
              value={ticket.priority}
              onChange={async (e) => {
                const newPriority = e.target.value;

                const res = await fetch(`/api/tickets/${ticket.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ priority: newPriority }),
                });

                if (res.ok) {
                  setTicket((prev) => prev ? { ...prev, priority: newPriority } : prev);
                } else {
                  alert("Error al actualizar prioridad");
                }
              }}
            >
              <option value="LOW">BAJA</option>
              <option value="MEDIUM">MEDIA</option>
              <option value="HIGH">ALTA</option>
              <option value="URGENT">URGENTE</option>
            </select>
          </div>
        </div>


      </div>

      {/* Cuerpo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Columna principal */}
        <div className="md:col-span-2 space-y-4">
          {/* Descripción */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <h2 className="text-sm font-semibold text-slate-200 mb-2">
              Descripción
            </h2>
            <p className="text-sm text-slate-200 whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>

          {/* Comentarios + Form */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-200 mb-2">
                Comentarios
              </h2>

              {ticket.comments.length === 0 && (
                <div className="text-sm text-slate-500">
                  Aún no hay comentarios en este ticket.
                </div>
              )}

              {ticket.comments.length > 0 && (
                <div className="space-y-3">
                  {ticket.comments.map((c) => (
                    <div
                      key={c.id}
                      className="border border-slate-800 rounded-lg p-3"
                    >
                      <div className="text-[11px] text-slate-400">
                        {c.author.name} ·{" "}
                        {new Date(c.createdAt).toLocaleString("es-AR")}
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

            {/* Formulario para nuevo comentario */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Agregar comentario
              </label>
              <textarea
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500 min-h-[80px]"
                placeholder="Escribí una actualización, respuesta o nota interna..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onPaste={handlePasteImage}          // 👈 acá
                disabled={postingComment}
              />
              {file && (
                <div className="text-[11px] text-emerald-400">
                  Imagen adjunta: {file.name} (pegada desde el portapapeles)
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setFile(f);
                }}
                disabled={postingComment}
                className="text-xs text-slate-300 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-100 hover:file:bg-slate-700"
              />

              {commentError && (
                <div className="text-[11px] text-rose-400">{commentError}</div>
              )}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddComment}
                  disabled={postingComment}
                  className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
                >
                  {postingComment ? "Enviando..." : "Agregar comentario"}
                </button>
              </div>
            </div>
          </div>
        </div>


        {/* Columna lateral (más info) */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-200">
            <h2 className="text-xs font-semibold text-slate-300 mb-2">
              Información
            </h2>
            <div className="space-y-2 text-xs">
              <div>
                <div className="text-slate-400">ID interno</div>
                <div className="font-mono text-slate-100">{ticket.id}</div>
              </div>
              <div>
                <div className="text-slate-400">Creado</div>
                <div>
                  {new Date(ticket.createdAt).toLocaleString("es-AR")}
                </div>
              </div>
              <div>
                <div className="text-slate-400">Solicitante</div>
                <div>{ticket.creator.name}</div>
                <div className="text-slate-400 text-[11px]">
                  {ticket.creator.email}
                </div>
              </div>
              <div>
                <div className="text-slate-400">Asignado a</div>
                <div>{ticket.assignee?.name ?? "Sin asignar"}</div>
              </div>
            </div>
          </div>

          {/* Próximamente: acciones (cambiar estado, prioridad, etc.) */}
        </div>
      </div>
    </div>
  );
}

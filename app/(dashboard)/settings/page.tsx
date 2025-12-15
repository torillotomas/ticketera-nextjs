"use client";

import { useEffect, useState } from "react";

type Me = {
  id: number;
  name: string;
  email: string;
  role: "USER" | "AGENT" | "ADMIN";
  avatarUrl: string | null;
  timezone: string;
  notifOnAssigned: boolean;
  notifOnComment: boolean;
  notifOnResolved: boolean;
};

export default function SettingsPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch("/api/users/me");
      const data = await res.json();
      setMe(data.user);
      setLoading(false);
    })();
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!me) return;
    setSaving(true);

    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: me.name,
        avatarUrl: me.avatarUrl,
        timezone: me.timezone,
        notifOnAssigned: me.notifOnAssigned,
        notifOnComment: me.notifOnComment,
        notifOnResolved: me.notifOnResolved,
      }),
    });

    const data = await res.json();
    setMe(data.user);
    setSaving(false);
    alert("Guardado ✅");
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/users/me/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.error ?? "Error");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    alert("Contraseña actualizada ✅");
  }

  async function logoutAll() {
    const res = await fetch("/api/auth/logout-all", { method: "POST" });

    if (!res.ok) {
      alert("Error al cerrar sesiones");
      return;
    }

    // cerrar sesión local también
    await fetch("/api/auth/logout", { method: "POST" });

    window.location.href = "/login";
  }

  if (loading) return <div className="p-6">Cargando...</div>;
  if (!me) return <div className="p-6">No autorizado</div>;

  return (
    <div className="p-6 max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Configuración</h1>
        <p className="text-slate-300 text-sm">Perfil, preferencias y seguridad.</p>
      </div>

      <form onSubmit={saveProfile} className="rounded-xl border border-slate-800 p-4 space-y-4">
        <h2 className="text-lg font-semibold">Perfil</h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <div className="text-sm text-slate-300">Nombre</div>
            <input
              className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2"
              value={me.name}
              onChange={(e) => setMe({ ...me, name: e.target.value })}
            />
          </label>

          <label className="space-y-1">
            <div className="text-sm text-slate-300">Email (solo lectura)</div>
            <input
              className="w-full rounded-lg bg-slate-950/50 border border-slate-800 px-3 py-2 text-slate-400"
              value={me.email}
              readOnly
            />
          </label>

          <label className="space-y-1 sm:col-span-2">
            <div className="text-sm text-slate-300">Avatar</div>

            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const formData = new FormData();
                formData.append("file", file);

                const res = await fetch("/api/upload/avatar", {
                  method: "POST",
                  body: formData,
                });

                if (!res.ok) {
                  alert("Error al subir imagen");
                  return;
                }

                const data = await res.json();
                setMe({ ...me!, avatarUrl: data.avatarUrl });
              }}
              className="block w-full text-sm text-slate-400
      file:mr-4 file:rounded-lg file:border-0
      file:bg-slate-800 file:px-4 file:py-2
      file:text-slate-100 hover:file:bg-slate-700"
            />
          </label>


          <label className="space-y-1">
            <div className="text-sm text-slate-300">Zona horaria</div>
            <input
              className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2"
              value={me.timezone}
              onChange={(e) => setMe({ ...me, timezone: e.target.value })}
            />
          </label>
        </div>

        <div className="pt-2">
          <h3 className="text-sm font-semibold text-slate-200 mb-2">Notificaciones</h3>
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={me.notifOnAssigned}
                onChange={(e) => setMe({ ...me, notifOnAssigned: e.target.checked })}
              />
              Cuando me asignan un ticket
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={me.notifOnComment}
                onChange={(e) => setMe({ ...me, notifOnComment: e.target.checked })}
              />
              Cuando hay un comentario
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={me.notifOnResolved}
                onChange={(e) => setMe({ ...me, notifOnResolved: e.target.checked })}
              />
              Cuando el ticket se marca como RESOLVED
            </label>
          </div>
        </div>

        <button
          disabled={saving}
          className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-4 py-2 font-medium transition font-semibold"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>

      <form onSubmit={changePassword} className="rounded-xl border border-slate-800 p-4 space-y-4">
        <h2 className="text-lg font-semibold">Seguridad</h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <div className="text-sm text-slate-300">Contraseña actual</div>
            <input
              type="password"
              className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </label>

          <label className="space-y-1">
            <div className="text-sm text-slate-300">Nueva contraseña</div>
            <input
              type="password"
              className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-4 py-2 font-medium transition font-semibold"
          >
            Cambiar contraseña
          </button>


          <button
            type="button"
            onClick={logoutAll}
            className="rounded-lg border border-slate-700 px-4 py-2 font-medium"
          >
            Cerrar sesión en todos los dispositivos
          </button>
        </div>
      </form>
    </div>
  );
}

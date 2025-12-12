"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      setError("Completá todos los campos");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data?.message || "Error al registrarse");
      }

      // USER → portal
      router.push("/portal/my");
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Error al registrarse");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-950 p-6 space-y-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">
            Crear cuenta
          </h1>
          <p className="text-xs text-slate-400">
            Registrate para crear solicitudes de soporte
          </p>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre"
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100"
            value={form.name}
            onChange={(e) =>
              setForm((f) => ({ ...f, name: e.target.value }))
            }
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100"
            value={form.email}
            onChange={(e) =>
              setForm((f) => ({ ...f, email: e.target.value }))
            }
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100"
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
          />

          {error && <div className="text-xs text-rose-400">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {loading ? "Creando cuenta..." : "Registrarme"}
          </button>
        </form>

        <div className="text-xs text-slate-400 text-center">
          ¿Ya tenés cuenta?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-emerald-400 hover:underline"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

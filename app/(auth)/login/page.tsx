"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demian@example.com");
  const [password, setPassword] = useState("1234");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data?.message || "Error al iniciar sesión");
      }

      router.push("/tickets");
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-black/50">
        <h1 className="text-lg font-semibold text-slate-100 mb-1">
          Iniciar sesión
        </h1>
        <p className="text-xs text-slate-400 mb-4">
          Ticketera · Panel de soporte
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs text-slate-300 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="text-xs text-rose-400">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-4 text-[11px] text-slate-500">
          Demo: demian@example.com / 1234
        </p>
      </div>
    </div>
  );
}

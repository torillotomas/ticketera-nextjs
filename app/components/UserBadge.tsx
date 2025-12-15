"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Role = "USER" | "AGENT" | "ADMIN";

type MeUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
};

export default function UserBadge() {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          if (res.status === 401) {
            // no logueado → ir a login
            router.push("/login");
            return;
          }
          return;
        }
        const data = await res.json();
        if (!cancelled && data.ok && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (err) {
      console.error(err);
    } finally {
      setLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <div className="h-6 w-16 rounded-full bg-slate-800 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const roleLabel: Record<Role, string> = {
    USER: "Usuario",
    AGENT: "Agente",
    ADMIN: "Admin",
  };

 return (
  <div className="flex items-center gap-3 text-xs">
    {/* Avatar */}
    {user.avatarUrl ? (
      <img
        src={user.avatarUrl}
        alt={user.name}
        className="h-8 w-8 rounded-full object-cover border border-slate-700"
      />
    ) : (
      <div className="h-8 w-8 rounded-full flex items-center justify-center
                      bg-emerald-500/10 border border-emerald-500/40
                      text-emerald-300 font-semibold text-xs">
        {user.name.charAt(0).toUpperCase()}
      </div>
    )}

    <div className="flex flex-col items-end leading-tight">
      <span className="text-slate-100 font-medium">{user.name}</span>

      <div className="flex items-center gap-2">
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-200">
          {roleLabel[user.role]}
        </span>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="text-[11px] text-slate-400 hover:text-slate-100 disabled:opacity-60"
        >
          {loggingOut ? "Cerrando..." : "Cerrar sesión"}
        </button>
      </div>
    </div>
  </div>
);
}

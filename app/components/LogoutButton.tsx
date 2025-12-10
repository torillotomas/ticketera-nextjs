"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    try {
      setLoading(true);
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="text-xs text-slate-400 hover:text-slate-100"
    >
      {loading ? "Cerrando sesión..." : "Cerrar sesión"}
    </button>
  );
}

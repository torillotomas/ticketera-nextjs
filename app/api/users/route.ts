export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ ok: false, message: "No autenticado" }, { status: 401 });
    }

    if (authUser.role !== "ADMIN") {
      return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const role = (searchParams.get("role") || "").toUpperCase();

    const where: any = {};
    if (role) where.role = role;

    const users = await prisma.user.findMany({
      where,
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ ok: true, users }, { status: 200 });
  } catch (err) {
    console.error("GET /api/users error:", err);
    return NextResponse.json({ ok: false, message: "Error al obtener usuarios" }, { status: 500 });
  }
}

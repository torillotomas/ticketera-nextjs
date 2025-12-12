import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ ok: false, message: "No autenticado" }, { status: 401 });
    }

    // 👤 solo USER
    if (authUser.role !== "USER") {
      return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 403 });
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        creatorId: authUser.userId,
        status: "CLOSED",
      },
      orderBy: { createdAt: "desc" }, // o closedAt si después lo agregás
      include: {
        assignee: { select: { name: true } },
      },
    });

    return NextResponse.json({ ok: true, tickets });
  } catch (err) {
    console.error("GET /api/portal/history error:", err);
    return NextResponse.json(
      { ok: false, message: "Error al obtener historial" },
      { status: 500 }
    );
  }
}

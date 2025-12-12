import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const ticketId = Number(id);

  if (Number.isNaN(ticketId)) {
    return NextResponse.json({ ok: false, message: "ID inválido" }, { status: 400 });
  }

  try {
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ ok: false, message: "No autenticado" }, { status: 401 });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true, status: true, creatorId: true },
    });

    if (!ticket) {
      return NextResponse.json({ ok: false, message: "Ticket no encontrado" }, { status: 404 });
    }

    // ✅ Solo el creador (USER) puede confirmar cierre
    if (authUser.role !== "USER" || ticket.creatorId !== authUser.userId) {
      return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 403 });
    }

    // ✅ Solo se puede cerrar si está RESOLVED
    if (ticket.status !== "RESOLVED") {
      return NextResponse.json(
        { ok: false, message: "Solo podés cerrar tickets en estado RESUELTO" },
        { status: 400 }
      );
    }

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: "CLOSED" },
    });

    return NextResponse.json({ ok: true, ticket: updated });
  } catch (err) {
    console.error("PATCH /api/tickets/[id]/close error:", err);
    return NextResponse.json({ ok: false, message: "Error al cerrar ticket" }, { status: 500 });
  }
}

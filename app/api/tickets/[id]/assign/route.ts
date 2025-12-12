import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> } // ✅ Next 16: params es Promise
) {
  try {
    const { id } = await ctx.params;
    const ticketId = Number(id);

    if (!ticketId || Number.isNaN(ticketId)) {
      return NextResponse.json({ ok: false, message: "ID inválido" }, { status: 400 });
    }

    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ ok: false, message: "No autenticado" }, { status: 401 });
    }

    const { userId, role } = authUser;

    // Solo AGENT o ADMIN pueden "tomar"
    if (role !== "AGENT" && role !== "ADMIN") {
      return NextResponse.json({ ok: false, message: "Sin permisos" }, { status: 403 });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true, assigneeId: true },
    });

    if (!ticket) {
      return NextResponse.json({ ok: false, message: "Ticket no encontrado" }, { status: 404 });
    }

    // Si ya está asignado a otro, no se puede tomar
    if (ticket.assigneeId && ticket.assigneeId !== userId) {
      return NextResponse.json(
        { ok: false, message: "El ticket ya está asignado a otro agente" },
        { status: 409 }
      );
    }

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: { assigneeId: userId },
      include: {
        creator: { select: { name: true, email: true } },
        assignee: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({ ok: true, ticket: updated }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/tickets/[id]/assign error:", err);
    return NextResponse.json(
      { ok: false, message: "Error al asignar ticket" },
      { status: 500 }
    );
  }
}

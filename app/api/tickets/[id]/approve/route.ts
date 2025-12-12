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

  const authUser = await getUserFromRequest(req);
  if (!authUser) {
    return NextResponse.json({ ok: false, message: "No autenticado" }, { status: 401 });
  }

  // ✅ solo USER (o creator) debería aprobar
  if (authUser.role !== "USER") {
    return NextResponse.json({ ok: false, message: "Solo el solicitante puede aprobar" }, { status: 403 });
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    return NextResponse.json({ ok: false, message: "Ticket no encontrado" }, { status: 404 });
  }

  // ✅ solo el creador
  if (ticket.creatorId !== authUser.userId) {
    return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 403 });
  }

  // ✅ solo se puede cerrar si está RESOLVED
  if (ticket.status !== "RESOLVED") {
    return NextResponse.json(
      { ok: false, message: "Solo podés cerrar cuando esté marcado como RESUELTO" },
      { status: 400 }
    );
  }

  const updated = await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: "CLOSED" },
  });

  return NextResponse.json({ ok: true, ticket: updated });
}

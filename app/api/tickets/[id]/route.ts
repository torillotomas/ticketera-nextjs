import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

// GET /api/tickets/:id
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const ticketId = Number(id);

  if (Number.isNaN(ticketId)) {
    return NextResponse.json(
      { ok: false, message: "ID inválido" },
      { status: 400 }
    );
  }

  try {
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json(
        { ok: false, message: "No autenticado" },
        { status: 401 }
      );
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        creator: { select: { name: true, email: true } },
        assignee: { select: { name: true, email: true } },
        comments: {
          include: { author: { select: { name: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { ok: false, message: "Ticket no encontrado" },
        { status: 404 }
      );
    }

    // Permisos: USER solo puede ver tickets propios
    if (
      authUser.role === "USER" &&
      ticket.creatorId !== authUser.userId
    ) {
      return NextResponse.json(
        { ok: false, message: "No autorizado" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      ok: true,
      ticket: {
        ...ticket,
        createdAt: ticket.createdAt.toISOString(),
        comments: ticket.comments.map((c) => ({
          id: c.id,
          content: c.content,
          createdAt: c.createdAt.toISOString(),
          imageUrl: c.imageUrl,
          author: { name: c.author.name },
        })),
      },
    });
  } catch (error) {
    console.error("GET /api/tickets/[id] error:", error);
    return NextResponse.json(
      { ok: false, message: "Error al obtener ticket" },
      { status: 500 }
    );
  }
}

// PATCH /api/tickets/:id
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const ticketId = Number(id);

  if (Number.isNaN(ticketId)) {
    return NextResponse.json(
      { ok: false, message: "ID inválido" },
      { status: 400 }
    );
  }

  try {
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json(
        { ok: false, message: "No autenticado" },
        { status: 401 }
      );
    }

    // USER no puede cambiar estado / prioridad
    if (authUser.role === "USER") {
      return NextResponse.json(
        { ok: false, message: "No tenés permisos para editar tickets" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { status, priority, assigneeId } = body;

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status,
        priority,
        assigneeId,
      },
    });

    return NextResponse.json({ ok: true, ticket: updated });
  } catch (error) {
    console.error("PATCH /api/tickets/[id] error:", error);
    return NextResponse.json(
      { ok: false, message: "Error al actualizar ticket" },
      { status: 500 }
    );
  }
}

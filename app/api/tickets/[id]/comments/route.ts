import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const ticketId = Number(id);

  if (Number.isNaN(ticketId)) {
    return NextResponse.json(
      { ok: false, message: "ID de ticket inválido" },
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

    const body = await req.json();
    const { content, imageUrl } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { ok: false, message: "El comentario no puede estar vacío" },
        { status: 400 }
      );
    }

    // chequear que el usuario tenga acceso al ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true, creatorId: true },
    });

    if (!ticket) {
      return NextResponse.json(
        { ok: false, message: "Ticket no encontrado" },
        { status: 404 }
      );
    }

    if (
      authUser.role === "USER" &&
      ticket.creatorId !== authUser.userId
    ) {
      return NextResponse.json(
        { ok: false, message: "No autorizado" },
        { status: 403 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        ticketId,
        authorId: authUser.userId,
        imageUrl: imageUrl ?? null,
      },
      include: {
        author: { select: { name: true } },
      },
    });

    return NextResponse.json(
      {
        ok: true,
        comment: {
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt.toISOString(),
          imageUrl: comment.imageUrl,
          author: { name: comment.author.name },
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/tickets/[id]/comments error:", error);
    return NextResponse.json(
      { ok: false, message: "Error interno al crear comentario" },
      { status: 500 }
    );
  }
}

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

// GET /api/tickets
export async function GET(req: NextRequest) {

  try {
    const authUser = await getUserFromRequest(req);

    if (!authUser) {
      return NextResponse.json(
        { ok: false, message: "No autenticado" },
        { status: 401 }
      );
    }

    const { userId, role } = authUser;

    const where: any = {};

    where.status = { not: "CLOSED" };


    if (role === "USER") {
      // USER: solo sus tickets
      where.creatorId = userId;
    }

    if (role === "AGENT") {
      // AGENT: sin asignar O asignados a él
      where.OR = [
        { assigneeId: null },
        { assigneeId: userId },
      ];
    }

    // ADMIN: no se aplica filtro (ve todo)

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        creator: { select: { name: true, email: true } },
        assignee: { select: { name: true, email: true } },
      },
    });


    return NextResponse.json({
      ok: true,
      tickets: tickets.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        category: t.category,
        createdAt: t.createdAt.toISOString(),
        creator: t.creator,
        assignee: t.assignee,
      })),
    });
  } catch (err) {
    console.error("GET /api/tickets error:", err);
    return NextResponse.json(
      { ok: false, message: "Error al obtener tickets" },
      { status: 500 }
    );
  }
}

// POST /api/tickets
export async function POST(req: NextRequest) {
  try {
    const authUser = await getUserFromRequest(req);

    if (!authUser) {
      return NextResponse.json(
        { ok: false, message: "No autenticado" },
        { status: 401 }
      );
    }

    const { userId } = authUser;

    const body = await req.json();
    const { title, description, priority, category } = body;

    if (!title || !description) {
      return NextResponse.json(
        { ok: false, message: "Título y descripción son obligatorios" },
        { status: 400 }
      );
    }

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority: priority ?? "MEDIUM",
        category: category ?? "OTHER",
        creatorId: userId,
      },
    });


    return NextResponse.json(
      { ok: true, ticket },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/tickets error:", err);
    return NextResponse.json(
      { ok: false, message: "Error interno al crear ticket" },
      { status: 500 }
    );
  }

}

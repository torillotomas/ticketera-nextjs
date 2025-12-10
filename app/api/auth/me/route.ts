import { NextResponse, type NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getUserFromRequest(req);

    if (!authUser) {
      return NextResponse.json(
        { ok: false, user: null },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, user: null },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, user }, { status: 200 });
  } catch (err) {
    console.error("GET /api/auth/me error:", err);
    return NextResponse.json(
      { ok: false, user: null, message: "Error interno" },
      { status: 500 }
    );
  }
}

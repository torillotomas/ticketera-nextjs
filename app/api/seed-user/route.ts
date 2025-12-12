import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(_req: NextRequest) {
  try {
    const plainPassword = "1234";
    const hashed = await bcrypt.hash(plainPassword, 10);

    const users = [
      {
        name: "Admin Demo",
        email: "admin@example.com",
        role: "ADMIN" as const,
      },
      {
        name: "Agente Demo",
        email: "agent@example.com",
        role: "AGENT" as const,
      },
      {
        name: "Usuario Demo",
        email: "user@example.com",
        role: "USER" as const,
      },
    ];

    const results = [];

    for (const u of users) {
      const user = await prisma.user.upsert({
        where: { email: u.email },
        update: {
          name: u.name,
          password: hashed,
          role: u.role,
        },
        create: {
          name: u.name,
          email: u.email,
          password: hashed,
          role: u.role,
        },
      });

      results.push({
        id: user.id,
        email: user.email,
        role: user.role,
      });
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Usuarios demo creados/actualizados",
        password: plainPassword,
        users: results,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("POST /api/seed-user error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: error.message ?? "Error al crear usuarios demo",
      },
      { status: 500 }
    );
  }
}

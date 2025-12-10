import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(_req: NextRequest) {
  try {
    // 1) Hasheamos siempre "1234"
    const plainPassword = "1234";
    const hashed = await bcrypt.hash(plainPassword, 10);

    // 2) Usamos upsert para crear o ACTUALIZAR el usuario demo
    const user = await prisma.user.upsert({
      where: { email: "demian@example.com" },
      update: {
        name: "Demian Demo",
        password: hashed,   // 👈 acá guardamos el hash, NO "1234"
        role: "AGENT",
      },
      create: {
        name: "Demian Demo",
        email: "demian@example.com",
        password: hashed,   // 👈 hash también al crear
        role: "AGENT",
      },
    });

    console.log("Usuario demo seed:", user);

    return NextResponse.json(
      {
        ok: true,
        user,
        message: "Usuario demo creado/actualizado correctamente",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("POST /api/seed-user error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: error.message ?? "Error al crear usuario demo",
      },
      { status: 500 }
    );
  }
}

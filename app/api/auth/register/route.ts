import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signAuthToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { ok: false, message: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { ok: false, message: "La contraseña debe tener al menos 4 caracteres" },
        { status: 400 }
      );
    }

    const exists = await prisma.user.findUnique({
      where: { email },
    });

    if (exists) {
      return NextResponse.json(
        { ok: false, message: "El email ya está registrado" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: "USER", // 👈 SIEMPRE USER
      },
    });

    // Login automático
    const token = await signAuthToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const res = NextResponse.json(
      {
        ok: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );

    res.cookies.set("auth", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    console.error("POST /api/auth/register error:", err);
    return NextResponse.json(
      { ok: false, message: "Error al crear la cuenta" },
      { status: 500 }
    );
  }
}

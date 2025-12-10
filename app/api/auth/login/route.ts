import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signAuthToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: "Email y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { ok: false, message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const token = await signAuthToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
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
      { status: 200 }
    );

    res.cookies.set("auth", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    return res;
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json(
      { ok: false, message: "Error interno al iniciar sesión" },
      { status: 500 }
    );
  }
}

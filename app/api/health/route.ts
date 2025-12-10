import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      ok: true,
      message: "API OK",
      db: "connected",
    });
  } catch (error) {
    console.error("DB connection error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Database connection failed",
      },
      { status: 500 }
    );
  }
}

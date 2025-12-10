import { NextResponse, type NextRequest } from "next/server";

export async function POST(_req: NextRequest) {
  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.set("auth", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}

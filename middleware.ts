import { NextResponse, type NextRequest } from "next/server";
import { verifyAuthToken } from "./lib/auth";

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/seed-user"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // si es ruta pública, dejamos pasar
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // protegemos /tickets y todo (dashboard)
  if (pathname.startsWith("/tickets") || pathname.startsWith("/api/tickets")) {
    const token = req.cookies.get("auth")?.value;

    if (!token) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      await verifyAuthToken(token);
      return NextResponse.next();
    } catch {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

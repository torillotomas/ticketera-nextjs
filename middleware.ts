import { NextResponse, type NextRequest } from "next/server";
import { verifyAuthTokenEdge } from "./lib/auth-edge";

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/seed-user"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/tickets")) {

    const token = req.cookies.get("auth")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      await verifyAuthTokenEdge(token);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

import { NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-ticketera"
);

export type JwtPayload = {
  userId: number;
  email: string;
  name: string;
  role: "USER" | "AGENT" | "ADMIN";
};

export async function signAuthToken(payload: JwtPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyAuthToken(token: string) {
  const { payload } = await jwtVerify(token, SECRET);
  return payload as JwtPayload;
}

export async function getUserFromRequest(req: NextRequest) {
  const token = req.cookies.get("auth")?.value;
  if (!token) return null;

  try {
    const payload = await verifyAuthToken(token);
    return payload; // { userId, email, name, role }
  } catch {
    return null;
  }
}

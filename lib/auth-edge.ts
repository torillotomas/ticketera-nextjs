import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-ticketera"
);

export async function verifyAuthTokenEdge(token: string) {
  const { payload } = await jwtVerify(token, SECRET);
  return payload;
}

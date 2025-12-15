import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function requireSession(req: NextRequest) {
  const payload = await getUserFromRequest(req);
  if (!payload) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { tokenVersion: true, role: true },
  });

  if (!dbUser) return null;
  if (dbUser.tokenVersion !== payload.tokenVersion) return null;

  return payload;
}

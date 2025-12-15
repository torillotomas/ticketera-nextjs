export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth) return NextResponse.json({ ok: false }, { status: 401 });

  await prisma.user.update({
    where: { id: auth.userId },
    data: { tokenVersion: { increment: 1 } },
  });

  return NextResponse.json({ ok: true });
}

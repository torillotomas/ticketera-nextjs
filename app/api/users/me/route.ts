export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await getUserFromRequest(req);

  if (!auth) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      timezone: true,
      notifOnAssigned: true,
      notifOnComment: true,
      notifOnResolved: true,
    },
  });

  return NextResponse.json({ user });
}
export async function PATCH(req: NextRequest) {
  const auth = await getUserFromRequest(req);

  if (!auth) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();

  const user = await prisma.user.update({
    where: { id: auth.userId },
    data: {
      name: body.name,
      avatarUrl: body.avatarUrl,
      timezone: body.timezone,
      notifOnAssigned: body.notifOnAssigned,
      notifOnComment: body.notifOnComment,
      notifOnResolved: body.notifOnResolved,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      timezone: true,
      notifOnAssigned: true,
      notifOnComment: true,
      notifOnResolved: true,
    },
  });

  return NextResponse.json({ user });
}

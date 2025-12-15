export const runtime = "nodejs";

import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import path from "path";
import fs from "fs/promises";

export async function POST(req: NextRequest) {
  const session = await requireSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // validaciones básicas
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only images allowed" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = path.extname(file.name) || ".png";
  const fileName = `avatar-${session.userId}${ext}`;
  const uploadPath = path.join(
    process.cwd(),
    "public",
    "uploads",
    "avatars",
    fileName
  );

  await fs.writeFile(uploadPath, buffer);

  const avatarUrl = `/uploads/avatars/${fileName}`;

  await prisma.user.update({
    where: { id: session.userId },
    data: { avatarUrl },
  });

  return NextResponse.json({ avatarUrl });
}

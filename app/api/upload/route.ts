import { NextResponse, type NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

// IMPORTANTE: para poder usar fs
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { ok: false, message: "No se recibió ningún archivo" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { ok: false, message: "Solo se permiten imágenes" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop() || "png";
    const randomName = crypto.randomBytes(16).toString("hex");
    const fileName = `${randomName}.${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    const url = `/uploads/${fileName}`;

    return NextResponse.json({ ok: true, url }, { status: 201 });
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json(
      { ok: false, message: "Error al subir archivo" },
      { status: 500 }
    );
  }
}

import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requirePageSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth")?.value;
    if (!token) return null;

    try {
        const payload = await verifyAuthToken(token);

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { tokenVersion: true },
        });

        if (!user) return null;
        if (user.tokenVersion !== payload.tokenVersion) return null;

        return payload;
    } catch {
        return null;
    }
}

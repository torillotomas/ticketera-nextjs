import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAuthToken } from "@/lib/auth";

export default async function Home() {
  const token = (await cookies()).get("auth")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    const me = await verifyAuthToken(token);

    if (me.role === "USER") redirect("/portal");
    redirect("/tickets"); // AGENT o ADMIN
  } catch {
    redirect("/login");
  }
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAuthToken } from "@/lib/auth";
import TicketDetailClient from "./ticket-detail-client";

export default async function PortalTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const token = (await cookies()).get("auth")?.value;
  if (!token) redirect("/login");

  try {
    const payload = await verifyAuthToken(token);

    // Solo USER usa portal
    if (payload.role !== "USER") redirect("/tickets");

    return <TicketDetailClient id={id} />;
  } catch {
    redirect("/login");
  }
}

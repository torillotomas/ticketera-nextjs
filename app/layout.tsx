import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ticketera Help Desk",
  description: "Ticketera tipo Jira-lite hecha en Next.js por Demian :)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

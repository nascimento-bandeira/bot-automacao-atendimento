import type { Metadata } from "next";
import { BottomNav } from "@/components/navigation/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atendimento",
  description: "Agendamento de serviços",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased bg-surface text-slate-900 min-h-screen">
        <main className="pb-24">
          {children}
        </main>

        <BottomNav />
      </body>
    </html>
  );
}

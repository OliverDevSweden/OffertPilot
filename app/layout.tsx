import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OffertPilot - Automatisera dina offertuppföljningar",
  description:
    "Micro-SaaS för städfirmor som automatiserar e-postuppföljningar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

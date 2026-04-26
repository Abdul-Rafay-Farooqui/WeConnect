import type { Metadata } from "next";
import AuthProvider from "@/src/components/auth/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChatWave",
  description: "A pixel-perfect WhatsApp Web clone",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

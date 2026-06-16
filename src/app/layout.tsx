import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "BTGO — Bio Trail GO",
  description: "富士の自然探索 — 生き物発見アプリ",
  icons: { icon: "/logo.png", shortcut: "/logo.png", apple: "/logo.png" },
  other: { google: "notranslate" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" translate="no" className="notranslate" suppressHydrationWarning>
      <body className="notranslate" suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "BTGO — Bio Trail GO",
  description: "富士の自然探索 — 生き物発見アプリ",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <div className="mx-auto w-full max-w-[480px] h-[100dvh] flex flex-col bg-neutral-50 shadow-2xl overflow-hidden">
          <TopNav />
          <main className="flex-1 overflow-y-auto overscroll-contain no-scrollbar">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}

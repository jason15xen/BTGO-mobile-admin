"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiUser } from "react-icons/fi";
import Logo from "@/components/Logo";

const HIDE_ON = ["/register", "/login", "/capture"];

export default function TopNav() {
  const pathname = usePathname();
  if (HIDE_ON.includes(pathname)) return null;

  return (
    <header className="shrink-0 z-40 bg-gradient-to-b from-forest-50/95 to-forest-100/80 backdrop-blur border-b border-forest-200/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_4px_12px_-8px_rgba(16,28,22,0.18)]">
      <div className="h-14 px-5 flex items-center justify-between">
        <Link href="/" className="active:scale-[0.98] transition-transform">
          <Logo size="sm" />
        </Link>
        <Link
          href="/profile"
          aria-label="マイページ"
          className="w-9 h-9 rounded-full bg-gradient-to-b from-white to-neutral-100 active:bg-neutral-200 tile3d flex items-center justify-center text-neutral-600 transition-colors"
        >
          <FiUser size={18} />
        </Link>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiUser } from "react-icons/fi";
import { LuLeaf } from "react-icons/lu";

const HIDE_ON = ["/register", "/capture"];

export default function TopNav() {
  const pathname = usePathname();
  if (HIDE_ON.includes(pathname)) return null;

  return (
    <header className="shrink-0 z-40 bg-neutral-50/85 backdrop-blur border-b border-neutral-200/60">
      <div className="h-14 px-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-forest-500 to-teal-600 flex items-center justify-center text-white shadow-glow"><LuLeaf size={17} /></span>
          <span className="font-bold text-[17px] tracking-tight text-neutral-900">BTGO</span>
        </Link>
        <Link
          href="/profile"
          title="マイページ"
          className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition-colors"
        >
          <FiUser size={18} />
        </Link>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { IconType } from "react-icons";
import { FiHome, FiLayers, FiBookOpen, FiGift, FiCamera } from "react-icons/fi";

const TABS: { href: string; label: string; Icon: IconType }[] = [
  { href: "/", label: "ホーム", Icon: FiHome },
  { href: "/pyramid", label: "ピラミッド", Icon: FiLayers },
  { href: "/encyclopedia", label: "図鑑", Icon: FiBookOpen },
  { href: "/rewards", label: "報酬", Icon: FiGift },
];

// /capture visibility is controlled by AppShell's immersive state (hidden only
// during the camera/analyzing phases), so it's not listed here.
const HIDE_ON = ["/register"];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  if (HIDE_ON.includes(pathname)) return null;

  return (
    <nav className="shrink-0 relative z-10 bg-white border-t border-neutral-200/70 h-[68px] flex items-center justify-around px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_20px_-10px_rgba(16,28,22,0.18)]">
      {TABS.slice(0, 2).map((t) => (
        <TabItem key={t.href} {...t} active={pathname === t.href} />
      ))}

      <button
        onClick={() => router.push("/capture")}
        aria-label="撮影"
        className="-mt-7 w-[58px] h-[58px] rounded-full bg-forest-600 active:scale-95 shadow-glow ring-4 ring-white flex items-center justify-center text-white transition-transform"
      >
        <FiCamera size={24} />
      </button>

      {TABS.slice(2).map((t) => (
        <TabItem key={t.href} {...t} active={pathname === t.href} />
      ))}
    </nav>
  );
}

function TabItem({ href, label, Icon, active }: { href: string; label: string; Icon: IconType; active: boolean }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-0.5 w-16">
      <span
        className={`flex items-center justify-center w-11 h-7 rounded-full transition-colors ${
          active ? "bg-forest-100 text-forest-700" : "text-neutral-500"
        }`}
      >
        <Icon size={21} strokeWidth={active ? 2.6 : 2.2} />
      </span>
      <span className={`text-[11px] tracking-tight ${active ? "text-forest-700 font-bold" : "text-neutral-600 font-semibold"}`}>
        {label}
      </span>
    </Link>
  );
}

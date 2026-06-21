"use client";

import Link from "next/link";
import { rememberCaptureReturn } from "@/lib/captureNav";
import { usePathname, useRouter } from "next/navigation";
import type { IconType } from "react-icons";
import { FiHome, FiLayers, FiBookOpen, FiGift, FiCamera, FiBriefcase } from "react-icons/fi";

const TABS: { href: string; label: string; Icon: IconType }[] = [
  { href: "/", label: "ホーム", Icon: FiHome },
  { href: "/pyramid", label: "ピラミッド", Icon: FiLayers },
  { href: "/encyclopedia", label: "図鑑", Icon: FiBookOpen },
  { href: "/rewards", label: "報酬", Icon: FiGift },
];

// 求人 (jobs) — a separate 地域活性化 category from いきもの投稿. Links out to the
// dedicated 求人 Web site built by this system (set NEXT_PUBLIC_JOBS_URL; placeholder until live).
const JOBS_URL = process.env.NEXT_PUBLIC_JOBS_URL ?? "https://btgo-jobs.example.com";

// /capture visibility is controlled by AppShell's immersive state (hidden only
// during the camera/analyzing phases), so it's not listed here.
const HIDE_ON: string[] = [];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  if (HIDE_ON.includes(pathname)) return null;

  return (
    <nav className="shrink-0 relative z-10 bg-gradient-to-b from-white to-forest-50/80 border-t border-forest-200/80 h-[68px] flex items-center justify-around px-1 pb-[env(safe-area-inset-bottom)] nav3d">
      {TABS.slice(0, 2).map((t) => (
        <TabItem key={t.href} {...t} active={pathname === t.href} />
      ))}

      <button
        onClick={() => {
          rememberCaptureReturn(pathname);
          router.push("/capture");
        }}
        aria-label="撮影"
        className="-mt-7 w-[58px] h-[58px] rounded-full bg-gradient-to-b from-forest-500 to-forest-700 active:scale-90 orb3d ring-4 ring-white flex items-center justify-center text-white transition-transform"
      >
        <FiCamera size={24} className="shrink-0" aria-hidden />
      </button>

      {TABS.slice(2).map((t) => (
        <TabItem key={t.href} {...t} active={pathname === t.href} />
      ))}

      <JobsItem />
    </nav>
  );
}

// Visually distinct from the green nature tabs (gold, filled, briefcase icon, external)
// so users read it as a different category from いきもの投稿.
function JobsItem() {
  return (
    <a
      href={JOBS_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="求人（別サイト）"
      className="flex flex-col items-center gap-0.5 w-16"
    >
      <span className="flex items-center justify-center w-11 h-7 rounded-lg bg-gradient-to-b from-gold-400 to-gold-600 text-white ring-1 ring-gold-300 shadow-[0_2px_8px_rgba(217,119,6,0.45)] active:scale-95 transition-transform">
        <FiBriefcase size={18} />
      </span>
      <span className="text-[11px] tracking-tight font-bold text-gold-600">求人</span>
    </a>
  );
}

function TabItem({ href, label, Icon, active }: { href: string; label: string; Icon: IconType; active: boolean }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-0.5 w-16">
      <span
        className={`flex items-center justify-center w-11 h-7 rounded-full transition-all duration-300 ${
          active ? "bg-forest-100 text-forest-700 scale-110" : "text-neutral-500"
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

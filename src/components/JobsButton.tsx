import { FiBriefcase } from "react-icons/fi";

// External 求人 (jobs) site built by this system. Configure via NEXT_PUBLIC_JOBS_URL;
// placeholder until the site is live.
const JOBS_URL = process.env.NEXT_PUBLIC_JOBS_URL ?? "https://btgo-jobs.example.com";

/**
 * Floating 求人 entry — a separate 地域活性化 category from いきもの投稿, so it is
 * styled distinctly (gold) and links out to the dedicated jobs site. Positioned
 * by the caller (e.g. fixed at the home page's bottom-right).
 */
export default function JobsButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={JOBS_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="求人（別サイト）"
      className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-gold-400 to-gold-600 text-white font-bold text-sm pl-3.5 pr-4 py-3 ring-2 ring-white shadow-[0_8px_20px_-4px_rgba(217,119,6,0.6)] active:scale-95 transition-transform ${className}`}
    >
      <FiBriefcase size={18} />
      求人
    </a>
  );
}

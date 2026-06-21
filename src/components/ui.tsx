import type { ReactNode } from "react";

export function Screen({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 pt-4 pb-6 space-y-4 ${className}`}>{children}</div>;
}

/**
 * Rich gradient page header — vivid emerald→teal band with white text.
 * Pass `gradient` to override the colour for a given screen.
 */
export function PageHero({
  title,
  subtitle,
  gradient = "from-forest-500 via-forest-600 to-teal-600",
  bgImage,
  right,
}: {
  title: string;
  subtitle?: ReactNode;
  gradient?: string;
  /** Optional scenery photo shown behind the colour wash (e.g. ecosystem background). */
  bgImage?: string;
  right?: ReactNode;
}) {
  return (
    <div className="relative px-5 pt-7 pb-14 overflow-hidden shadow-[inset_0_-16px_24px_-16px_rgba(0,0,0,0.28)]">
      {bgImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}
      {/* colour wash — lightly tints the photo with the ecosystem colour (or fills solid when no image) */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} ${bgImage ? "opacity-50" : ""}`} />
      {/* darken just the bottom where the title sits, keeping the scene clear up top */}
      {bgImage && <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />}
      <div className="absolute inset-x-0 top-0 h-px bg-white/25 pointer-events-none" />
      <div className="absolute -top-10 -right-8 w-44 h-44 rounded-full bg-white/15 blur-2xl pointer-events-none" />
      <div className="relative flex items-end justify-between gap-3 text-white">
        <div>
          <h1 className="text-[28px] leading-none font-bold tracking-tight drop-shadow-sm">{title}</h1>
          {subtitle && <p className="text-sm text-white/85 mt-2 drop-shadow-sm">{subtitle}</p>}
        </div>
        {right}
      </div>
    </div>
  );
}

/** Raised white surface card. */
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`card3d rounded-3xl p-5 ${className}`}>{children}</div>;
}

type ProgressTone = "forest" | "gold" | "teal" | "lime" | "aqua";

const FILL_BG: Record<ProgressTone, string> = {
  forest: "linear-gradient(180deg, #a8e850 0%, #6fcf3f 45%, #2b871f 100%)",
  gold: "linear-gradient(180deg, #fcd34d 0%, #f59e0b 60%, #d97706 100%)",
  teal: "linear-gradient(180deg, #2dd4bf 0%, #14b8a6 60%, #0f766e 100%)",
  lime: "linear-gradient(180deg, #bef264 0%, #84cc16 60%, #4d7c0f 100%)",
  aqua: "linear-gradient(180deg, #5eead4 0%, #37a626 50%, #0d9488 100%)",
};

/** Light recessed track with a flush, vivid fill. */
export function ProgressBar({
  value,
  max = 100,
  tone = "forest",
  size = "md",
  shimmer = false,
  className = "",
}: {
  value: number;
  max?: number;
  tone?: ProgressTone;
  size?: "md" | "sm";
  shimmer?: boolean;
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const h = size === "sm" ? "h-2" : "h-4";
  const trackTone =
    tone === "forest" || tone === "aqua" ? "" : `progress-track3d--${tone}`;
  return (
    <div
      className={`progress-track3d ${trackTone} ${h} rounded-full ${className}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`progress-fill3d transition-all duration-700 ease-out ${shimmer ? "progress-fill-shimmer" : ""} ${pct > 0 ? "min-w-[12px]" : ""}`}
        style={{ width: `${pct}%`, background: pct > 0 ? FILL_BG[tone] : undefined }}
      />
    </div>
  );
}

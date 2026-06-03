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
  right,
}: {
  title: string;
  subtitle?: string;
  gradient?: string;
  right?: ReactNode;
}) {
  return (
    <div className={`relative bg-gradient-to-br ${gradient} px-5 pt-7 pb-14 overflow-hidden`}>
      <div className="absolute -top-10 -right-8 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="relative flex items-end justify-between gap-3 text-white">
        <div>
          <h1 className="text-[28px] leading-none font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-white/80 mt-2">{subtitle}</p>}
        </div>
        {right}
      </div>
    </div>
  );
}

/** White surface card. */
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-3xl border border-neutral-200/60 shadow-soft p-5 ${className}`}>
      {children}
    </div>
  );
}

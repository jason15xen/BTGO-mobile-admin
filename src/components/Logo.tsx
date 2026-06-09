"use client";

import { useId } from "react";

type LogoMarkProps = {
  size?: number;
  className?: string;
  /** Nav / cards — gradient tile. Auth hero — larger mark with soft glow. */
  variant?: "tile" | "hero";
};

/** BTGO mark: Fuji trail → ecosystem pyramid → discovery lens. */
export function LogoMark({ size = 32, className = "", variant = "tile" }: LogoMarkProps) {
  const gid = useId().replace(/:/g, "");
  const grad = `btgo-grad-${gid}`;

  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={`shrink-0 ${variant === "hero" ? "drop-shadow-[0_8px_24px_rgba(0,0,0,0.28)]" : "shadow-glow"} ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient id={grad} x1="5" y1="3" x2="27" y2="29" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#54bb44" />
          <stop offset="42%" stopColor="#2b871f" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
      </defs>

      <rect width="32" height="32" rx="9" fill={`url(#${grad})`} />

      {/* Fuji ridge — regional anchor */}
      <path
        d="M4.5 26.8 10.2 20.6 14.2 23.2 18.4 18.2 22.2 20.8 27.5 16.2"
        fill="none"
        stroke="white"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.38"
      />

      {/* Ecosystem pyramid tiers (food chain) */}
      <path d="M6 25.2h20l-2-4.2H8z" fill="white" opacity="0.22" />
      <path d="M8.4 21 23.6 21l-2-3.6H10.4z" fill="white" opacity="0.36" />
      <path d="M10.6 17.4h10.8l-2-3.2h-6.8z" fill="white" opacity="0.52" />
      <path d="M12.8 14.2h6.4l-1.6-2.6h-3.2z" fill="white" opacity="0.72" />

      {/* Discovery trail — Bio Trail GO */}
      <path
        d="M16 24.2v-11.8"
        stroke="white"
        strokeWidth="1"
        strokeDasharray="1.6 2.2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <circle cx="16" cy="23.8" r="1.05" fill="white" opacity="0.85" />
      <circle cx="16" cy="20.2" r="1.05" fill="white" opacity="0.92" />
      <circle cx="16" cy="16.6" r="1.05" fill="white" />
      <circle cx="16" cy="13.1" r="1.05" fill="white" />

      {/* Biodiversity spark */}
      <path
        d="M9.2 19.4c-1.6-1.4-1.4-3.4 0-4.6 1.4 1.2 1.6 3.2 0 4.6z"
        fill="#bef264"
        opacity="0.95"
      />

      {/* Capture lens — discovery at the apex */}
      <circle cx="16" cy="8.8" r="3.1" fill="none" stroke="white" strokeWidth="1.35" />
      <circle cx="16" cy="8.8" r="1.05" fill="white" />
      <path d="M13.2 6h5.6M13.2 11.6h5.6M10.6 8.8h1.2M20.2 8.8h1.2" stroke="white" strokeWidth="0.85" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

type LogoProps = {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  /** Light text on dark backgrounds (auth). */
  inverted?: boolean;
  className?: string;
};

const MARK_SIZE = { sm: 32, md: 40, lg: 56 } as const;

export default function Logo({ size = "sm", showTagline = false, inverted = false, className = "" }: LogoProps) {
  const markSize = MARK_SIZE[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={markSize} variant={size === "lg" ? "hero" : "tile"} />
      <div className="leading-none">
        <span
          className={`font-extrabold tracking-tight ${
            size === "lg" ? "text-[26px]" : size === "md" ? "text-xl" : "text-[17px]"
          } ${inverted ? "text-white" : "text-neutral-900"}`}
        >
          BTGO
        </span>
        {showTagline && (
          <span
            className={`block mt-1 text-[10px] font-semibold tracking-[0.14em] uppercase ${
              inverted ? "text-forest-100/90" : "text-forest-600"
            }`}
          >
            Bio Trail GO
          </span>
        )}
      </div>
    </div>
  );
}

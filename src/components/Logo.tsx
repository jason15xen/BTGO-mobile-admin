"use client";

import Image from "next/image";

type LogoMarkProps = {
  size?: number;
  className?: string;
  variant?: "tile" | "hero";
};

/** Square BTGO brand mark (icon + wordmark). */
export function LogoMark({ size = 32, className = "", variant = "tile" }: LogoMarkProps) {
  return (
    <Image
      src="/logo.png"
      alt=""
      width={size}
      height={size}
      className={`shrink-0 object-contain ${
        variant === "hero" ? "drop-shadow-[0_8px_24px_rgba(0,0,0,0.28)]" : ""
      } ${className}`}
      aria-hidden
    />
  );
}

type LogoProps = {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  inverted?: boolean;
  className?: string;
};

const LOGO_HEIGHT = { sm: 40, md: 56, lg: 88 } as const;

export default function Logo({
  size = "sm",
  showTagline = false,
  inverted = false,
  className = "",
}: LogoProps) {
  const height = showTagline && size !== "lg" ? LOGO_HEIGHT[size] + 8 : LOGO_HEIGHT[size];

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/logo.png"
        alt="BTGO — BIODIVERSITY x ACTION"
        width={height}
        height={height}
        className={`shrink-0 w-auto object-contain ${inverted ? "brightness-0 invert" : ""}`}
        style={{ height, width: "auto" }}
        priority={size === "sm"}
      />
    </div>
  );
}

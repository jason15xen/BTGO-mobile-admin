"use client";

import { useState } from "react";
import local from "@/data/species-images.json";
import remote from "@/data/species-remote.json";

const LOCAL = local as Record<string, string>;
const REMOTE = remote as Record<string, string>;

interface Props {
  speciesId: string;
  emoji: string;
  alt: string;
  className?: string;
  /** rounded etc. applied to wrapper */
  rounded?: string;
}

/**
 * Renders a real species photo loaded directly by the browser (Wikimedia).
 * Falls back to an emoji-on-gradient tile if the image is missing or fails.
 */
export default function SpeciesImage({ speciesId, emoji, alt, className = "", rounded = "" }: Props) {
  const src = LOCAL[speciesId] ?? REMOTE[speciesId];
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-forest-200 to-forest-400 ${rounded} ${className}`}
      >
        <span className="text-[2.5em] leading-none drop-shadow">{emoji}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${rounded} ${className}`}
    />
  );
}

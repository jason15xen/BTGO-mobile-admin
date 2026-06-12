"use client";

import { useEffect, useMemo, useState } from "react";
import Pyramid from "@/components/Pyramid";
import {
  PYRAMID_CELEBRATION_HOLD_MS,
  PYRAMID_DECK_FLIP_MS,
  TERRESTRIAL_PYRAMID_IDS,
} from "@/lib/demoScript";
import type { Ecosystem } from "@/lib/types";

const CONFETTI_COLORS = ["#fbbf24", "#4ade80", "#38bdf8", "#f472b6", "#a78bfa", "#fb923c"];
const SPARKLE_CHARS = ["✨", "⭐", "🌟", "💫", "🎉", "🎊"];

type Phase = "celebrate" | "flip" | "empty";

export function markPyramidCelebrationShown() {
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem("btgo-pyramid-celebrated", "1");
  }
}

export function consumePyramidCelebrationShown(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  if (sessionStorage.getItem("btgo-pyramid-celebrated") !== "1") return false;
  sessionStorage.removeItem("btgo-pyramid-celebrated");
  return true;
}

export default function PyramidCelebrationDeck({
  ecosystem = "terrestrial",
  fullDiscoveredIds = TERRESTRIAL_PYRAMID_IDS,
  embedded = false,
  className = "",
  onComplete,
}: {
  ecosystem?: Ecosystem;
  fullDiscoveredIds?: string[];
  embedded?: boolean;
  className?: string;
  onComplete?: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("celebrate");
  const fullSet = useMemo(() => new Set(fullDiscoveredIds), [fullDiscoveredIds]);
  const emptySet = useMemo(() => new Set<string>(), []);

  const holdMs = useMemo(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return 1200;
    }
    return PYRAMID_CELEBRATION_HOLD_MS;
  }, []);

  useEffect(() => {
    const flipTimer = window.setTimeout(() => setPhase("flip"), holdMs);
    return () => window.clearTimeout(flipTimer);
  }, [holdMs]);

  useEffect(() => {
    if (phase !== "flip") return;
    const doneTimer = window.setTimeout(() => setPhase("empty"), PYRAMID_DECK_FLIP_MS);
    return () => window.clearTimeout(doneTimer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "empty") return;
    onComplete?.();
  }, [phase, onComplete]);

  const showFull = phase === "celebrate" || phase === "flip";
  const discovered = showFull ? fullSet : emptySet;

  return (
    <div className={`pyramid-celebrate-wrap ${className}`}>
      {phase === "celebrate" && <CelebrationDecorations />}
      <div
        className={`${phase === "celebrate" ? "pyramid-celebrate-ring" : ""} ${
          phase === "flip" ? "pyramid-deck-flip" : ""
        } rounded-2xl overflow-hidden transition-shadow`}
        style={phase === "flip" ? { animationDuration: `${PYRAMID_DECK_FLIP_MS}ms` } : undefined}
      >
        <Pyramid
          ecosystem={ecosystem}
          discovered={discovered}
          activeIds={showFull ? fullSet : undefined}
          embedded={embedded}
          highlightId={phase === "celebrate" ? undefined : undefined}
        />
      </div>
      {phase === "empty" && (
        <p className="text-xs text-neutral-500 mt-3 text-center animate-fadeIn">
          未発見の10枠の新しいピラミッドが現れました
        </p>
      )}
    </div>
  );
}

function CelebrationDecorations() {
  const confetti = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: `${4 + (i * 86) / 23}%`,
        delay: `${(i % 8) * 0.22}s`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rot: `${(i * 47) % 360}deg`,
      })),
    [],
  );

  const sparkles = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        left: `${8 + i * 9}%`,
        top: `${6 + (i % 4) * 18}%`,
        delay: `${i * 0.18}s`,
        char: SPARKLE_CHARS[i % SPARKLE_CHARS.length],
      })),
    [],
  );

  return (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-2xl" aria-hidden>
      <div className="pyramid-celebrate-shimmer absolute inset-0 rounded-2xl" />
      {confetti.map((c) => (
        <span
          key={c.id}
          className="pyramid-confetti-piece"
          style={
            {
              "--confetti-x": c.x,
              "--confetti-delay": c.delay,
              "--confetti-color": c.color,
              "--confetti-rot": c.rot,
            } as React.CSSProperties
          }
        />
      ))}
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="pyramid-celebrate-sparkle text-base"
          style={
            {
              left: s.left,
              top: s.top,
              "--sparkle-delay": s.delay,
            } as React.CSSProperties
          }
        >
          {s.char}
        </span>
      ))}
    </div>
  );
}

import type { Species } from "./types";

/** PoC vitality (pw) rules. */

export const INITIAL_PW = 10;
export const MAX_PW = 10; // hard cap — a creature never exceeds 10 pw
export const DECAY_PER_DAY = 1;
export const PW_STRONG_THRESHOLD = 10; // 10以上 = 大きく表示
export const PW_WEAK_THRESHOLD = 3; // 3以下 = 小さく表示
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Food comes in three sizes (any creature can eat any food). */
export const FOOD_VALUES = [1, 3, 9] as const;

/** Food granted on capture — bigger food for rarer finds. */
export function captureFeedPw(species?: Species): number {
  switch (species?.rarity) {
    case "legendary":
      return 9;
    case "rare":
      return 3;
    default:
      return 1;
  }
}

export function applyDecay(
  pw: number,
  lastDecayAt: string,
  now = Date.now(),
): { pw: number; lastDecayAt: string } {
  const last = new Date(lastDecayAt).getTime();
  const days = Math.floor((now - last) / MS_PER_DAY);
  if (days <= 0) return { pw, lastDecayAt };
  return {
    pw: Math.max(0, pw - days * DECAY_PER_DAY),
    lastDecayAt: new Date(last + days * MS_PER_DAY).toISOString(),
  };
}

/** Tile scale from vitality — low pw clearly small, high pw clearly large. */
export function pwTileScale(pw: number): number {
  const clamped = Math.max(1, Math.min(INITIAL_PW, pw));
  if (INITIAL_PW <= 1) return 1;
  // pw 1 → 0.5 (small) … pw 10 → 1.3 (large)
  return 0.5 + ((clamped - 1) / (INITIAL_PW - 1)) * 0.8;
}

/** @deprecated Use pwTileScale — kept for inner image emphasis. */
export function pwScale(pw: number): number {
  return pwTileScale(pw);
}

export type PwVisual = "weak" | "normal" | "strong";

export function pwVisual(pw: number): PwVisual {
  if (pw <= PW_WEAK_THRESHOLD) return "weak";
  if (pw >= PW_STRONG_THRESHOLD) return "strong";
  return "normal";
}

import type { Species } from "./types";

/** PoC vitality (pw) rules. */

export const INITIAL_PW = 10;
export const DECAY_PER_DAY = 1;
export const PW_STRONG_THRESHOLD = 10; // >10 = 大
export const PW_WEAK_THRESHOLD = 3; // <3 = 小

/** Tile size tier from vitality (pw). */
export type PwTileTier = "small" | "medium" | "large";

const PW_TILE_SCALE: Record<PwTileTier, number> = {
  small: 0.58,
  medium: 0.88,
  large: 1.2,
};
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

/** Vitality tier: <3 small, 3–10 medium, >10 large. */
export function pwTileTier(pw: number): PwTileTier {
  if (pw < PW_WEAK_THRESHOLD) return "small";
  if (pw > PW_STRONG_THRESHOLD) return "large";
  return "medium";
}

/** Tile scale from vitality tier. */
export function pwTileScale(pw: number): number {
  if (pw <= 0) return PW_TILE_SCALE.small;
  return PW_TILE_SCALE[pwTileTier(pw)];
}

/** @deprecated Use pwTileScale — kept for inner image emphasis. */
export function pwScale(pw: number): number {
  return pwTileScale(pw);
}

export type PwVisual = "weak" | "normal" | "strong";

export function pwVisual(pw: number): PwVisual {
  if (pw < PW_WEAK_THRESHOLD) return "weak";
  if (pw > PW_STRONG_THRESHOLD) return "strong";
  return "normal";
}

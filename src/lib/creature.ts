import type { Species } from "./types";

/** PoC vitality (pw) rules. */

export const INITIAL_PW = 10;
export const DECAY_PER_DAY = 1;
export const PW_STRONG_THRESHOLD = 10;
export const PW_WEAK_THRESHOLD = 3;
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** PW generated per capture — predators earn more, producers less. */
export function captureFeedPw(species: Species): number {
  const byLevel: Record<Species["trophicLevel"], number> = {
    1: 2,
    2: 3,
    3: 5,
    4: 8,
  };
  return byLevel[species.trophicLevel];
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

/** Tile scale from vitality — low pw small, high pw large (1〜10). */
export function pwTileScale(pw: number): number {
  const clamped = Math.max(1, Math.min(INITIAL_PW, pw));
  if (INITIAL_PW <= 1) return 1;
  return 0.58 + ((clamped - 1) / (INITIAL_PW - 1)) * 0.62;
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

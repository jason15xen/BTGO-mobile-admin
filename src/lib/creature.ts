/** PoC vitality (pw) rules — client-side game loop. */

export const INITIAL_PW = 10;
export const DECAY_PER_DAY = 1;
export const PW_STRONG_THRESHOLD = 10;
export const PW_WEAK_THRESHOLD = 3;
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function applyDecay(pw: number, lastDecayAt: string, now = Date.now()): { pw: number; lastDecayAt: string } {
  const last = new Date(lastDecayAt).getTime();
  const days = Math.floor((now - last) / MS_PER_DAY);
  if (days <= 0) return { pw, lastDecayAt };
  return {
    pw: Math.max(1, pw - days * DECAY_PER_DAY),
    lastDecayAt: new Date(last + days * MS_PER_DAY).toISOString(),
  };
}

/** Two-step size: weak / normal / strong. */
export function pwScale(pw: number): number {
  if (pw <= PW_WEAK_THRESHOLD) return 0.86;
  if (pw >= PW_STRONG_THRESHOLD) return 1.12;
  return 1;
}

export type PwVisual = "weak" | "normal" | "strong";

export function pwVisual(pw: number): PwVisual {
  if (pw <= PW_WEAK_THRESHOLD) return "weak";
  if (pw >= PW_STRONG_THRESHOLD) return "strong";
  return "normal";
}

/** Feed grants +2〜+5 pw when consumed. */
export function rollFeedPw(): number {
  return 2 + Math.floor(Math.random() * 4);
}

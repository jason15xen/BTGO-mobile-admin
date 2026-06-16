import { clearDemoStep, getDemoStep } from "@/lib/demoClient";
import type { DemoCaptureKind } from "@/lib/demoScript";
import type { DiaryEntry, Ecosystem, FeedItem, UserProfile } from "@/lib/types";
import type { PyramidEcoSummary } from "@/lib/pyramidSummary";
import type { UserStats } from "@/lib/game";
import type { OwnedCoupon } from "@/lib/wallet";

export type PlayerState = {
  profile: UserProfile;
  stats: UserStats;
  pyramid: Record<Ecosystem, PyramidEcoSummary>;
  discovered: string[];
  game: GameState;
  avatarPresets: string[];
};

export type GameState = {
  feeds: FeedItem[];
  foodPw: number;
  pwMap: Record<string, number>;
  activeIds: string[];
  extinctIds: string[];
  fencedIds: string[];
  loginBonus: boolean;
  invasive: Record<Ecosystem, boolean>;
  demoPyramidLevel?: number;
  pyramidJustCompleted?: boolean;
};

export type FeedResult =
  | { ok: true; predatorName: string; gained: number; newPw: number; foodPw: number; recovered: boolean }
  | { ok: false; reason: "no-predator" | "invalid-target" | "no-food" | "not-found" | "error" };

export async function fetchPlayer(): Promise<PlayerState | null> {
  const res = await fetch("/api/player");
  if (!res.ok) return null;
  return res.json();
}

export async function updatePlayer(patch: {
  name?: string;
  avatar?: string;
}): Promise<UserProfile | null> {
  const res = await fetch("/api/player", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.profile ?? null;
}

export async function resetDemoFlow(): Promise<void> {
  // Progress lives in localStorage — clearing it is what restarts the demo.
  clearDemoStep();
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.removeItem("btgo-pyramid-celebrated");
    sessionStorage.removeItem("btgo-view-pyramid");
  }
  // Best-effort server cleanup (feeding/pw). Not relied on for progress.
  await fetch("/api/demo/reset", { method: "POST", cache: "no-store" }).catch(() => {});
}

/**
 * Restart the demo exactly once per full document load by clearing the
 * localStorage progress (and best-effort server cleanup).
 *
 * This module is evaluated fresh on every real page load — first visit, F5, or
 * any browser reload — so `demoSessionReset` starts as `null` each time and the
 * progress is cleared (requirement: "restart on F5/reload"). Client-side (SPA)
 * navigation and photo captures reuse the same loaded module, so the memoized
 * promise is returned without clearing — localStorage keeps the captureStep and
 * the initial nine entities never reappear mid-session.
 *
 * All callers await the SAME promise, so concurrent mounts trigger one reset.
 */
let demoSessionReset: Promise<void> | null = null;

export function ensureDemoSessionReady(): Promise<void> {
  if (!demoSessionReset) {
    // Clear the memo if the reset fails so a later mount can retry instead of
    // being permanently blocked by a cached rejection.
    demoSessionReset = resetDemoFlow().catch((e) => {
      demoSessionReset = null;
      throw e;
    });
  }
  return demoSessionReset;
}

export type DemoCaptureState = {
  discovered: string[];
  pyramidLevel: number;
  nextCapture: { speciesId: string; kind: DemoCaptureKind } | null;
};

export async function fetchDemoCaptureState(): Promise<DemoCaptureState | null> {
  const res = await fetch(`/api/capture?step=${getDemoStep()}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return {
    discovered: Array.isArray(data.discovered) ? data.discovered : [],
    pyramidLevel: data.demo?.pyramidLevel ?? 1,
    nextCapture: data.demo?.nextCapture ?? null,
  };
}

export type DemoStateSnapshot = DemoCaptureState & {
  game: GameState;
  pyramidFill: Record<"terrestrial" | "freshwater" | "marine", string[]>;
};

export async function fetchDemoStateSnapshot(): Promise<DemoStateSnapshot | null> {
  const res = await fetch(`/api/demo/state?step=${getDemoStep()}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  const fill = data.pyramidFill ?? {};
  return {
    discovered: Array.isArray(data.discovered) ? data.discovered : [],
    pyramidLevel: data.pyramidLevel ?? 1,
    nextCapture: data.nextCapture ?? null,
    pyramidFill: {
      terrestrial: Array.isArray(fill.terrestrial) ? fill.terrestrial : [],
      freshwater: Array.isArray(fill.freshwater) ? fill.freshwater : [],
      marine: Array.isArray(fill.marine) ? fill.marine : [],
    },
    game: data.game as GameState,
  };
}

export async function fetchGameState(): Promise<GameState> {
  const res = await fetch(`/api/game?step=${getDemoStep()}`, { cache: "no-store" });
  if (!res.ok) {
    return {
      feeds: [],
      foodPw: 0,
      pwMap: {},
      activeIds: [],
      extinctIds: [],
      fencedIds: [],
      loginBonus: false,
      invasive: { terrestrial: false, freshwater: false, marine: false },
      demoPyramidLevel: 1,
      pyramidJustCompleted: false,
    };
  }
  return res.json();
}

export async function postFeed(
  feedId: string,
  targetSpeciesId: string,
): Promise<FeedResult> {
  const res = await fetch("/api/game/feed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ feedId, targetSpeciesId, captureStep: getDemoStep() }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.ok && data.ok) return data;
  return { ok: false, reason: data.reason ?? "error" };
}

export async function postFence(
  speciesId: string,
): Promise<{ ok: true; balance: number } | { ok: false; reason: string }> {
  const res = await fetch("/api/game/fence", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ speciesId }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.ok && data.ok) return data;
  return { ok: false, reason: data.reason ?? "error" };
}

export async function fetchDiary(): Promise<DiaryEntry[]> {
  const res = await fetch("/api/diary");
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data.entries) ? data.entries : [];
}

export async function updateDiary(
  id: string,
  patch: { note?: string; emotion?: string },
): Promise<void> {
  await fetch("/api/diary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...patch }),
  });
}

export async function fetchWallet(): Promise<{ balance: number; coupons: OwnedCoupon[] }> {
  const res = await fetch("/api/wallet");
  if (!res.ok) return { balance: 0, coupons: [] };
  return res.json();
}

export async function purchaseCouponApi(body: {
  storeName: string;
  label: string;
  cost: number;
}): Promise<
  | { ok: true; balance: number; coupon: OwnedCoupon }
  | { ok: false; error: string }
> {
  const res = await fetch("/api/wallet/purchase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

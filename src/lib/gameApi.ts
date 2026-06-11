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
  pwMap: Record<string, number>;
  activeIds: string[];
  invasive: Record<Ecosystem, boolean>;
};

export type FeedResult =
  | { ok: true; predatorName: string; gained: number; newPw: number }
  | { ok: false; reason: "no-predator" | "invalid-target" | "not-found" | "error" };

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

export async function fetchGameState(): Promise<GameState> {
  const res = await fetch("/api/game");
  if (!res.ok) {
    return {
      feeds: [],
      pwMap: {},
      activeIds: [],
      invasive: { terrestrial: false, freshwater: false, marine: false },
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
    body: JSON.stringify({ feedId, targetSpeciesId }),
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

import "server-only";
import { randomUUID } from "node:crypto";
import { DEMO_B_MILE_BALANCE, DEMO_USER } from "@/lib/game";
import type { UserProfile } from "@/lib/types";
import type { OwnedCoupon } from "@/lib/wallet";

const DEFAULT_AVATAR = "🌿";

let profileOverrides: Partial<Pick<UserProfile, "name" | "avatar">> = {};
let balance = DEMO_B_MILE_BALANCE;
let coupons: OwnedCoupon[] = [];

export function getGuestProfile(): UserProfile {
  return {
    id: DEMO_USER.id,
    email: "",
    name: profileOverrides.name ?? DEMO_USER.name,
    avatar: profileOverrides.avatar ?? DEFAULT_AVATAR,
  };
}

export function updateGuestProfile(
  patch: Partial<Pick<UserProfile, "name" | "avatar">>,
): UserProfile {
  if (patch.name !== undefined) profileOverrides.name = patch.name;
  if (patch.avatar !== undefined) profileOverrides.avatar = patch.avatar;
  return getGuestProfile();
}

export function getGuestWallet() {
  return { balance, coupons: [...coupons] };
}

/** Spend B-mile (e.g. 保護柵 = 1 B-mile). Returns the new balance, or null if insufficient. */
export function spendGuestBMile(cost: number): number | null {
  if (cost < 0 || balance < cost) return null;
  balance -= cost;
  return balance;
}

export function purchaseGuestCoupon(input: {
  storeName: string;
  label: string;
  cost: number;
}):
  | { ok: true; balance: number; coupon: OwnedCoupon }
  | { ok: false; error: string } {
  if (balance < input.cost) {
    return { ok: false, error: "insufficient_balance" };
  }
  balance -= input.cost;
  const coupon: OwnedCoupon = {
    id: randomUUID(),
    storeName: input.storeName,
    label: input.label,
    cost: input.cost,
    purchasedAt: new Date().toISOString(),
  };
  coupons.unshift(coupon);
  return { ok: true, balance, coupon };
}

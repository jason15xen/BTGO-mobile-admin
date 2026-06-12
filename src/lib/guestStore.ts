import "server-only";
import { randomUUID } from "node:crypto";
import { DEMO_B_MILE_BALANCE, DEMO_USER } from "@/lib/game";
import { createServerMemory } from "@/lib/serverMemory";
import type { UserProfile } from "@/lib/types";
import type { OwnedCoupon } from "@/lib/wallet";

const DEFAULT_AVATAR = "🌿";

type GuestMemory = {
  profileOverrides: Partial<Pick<UserProfile, "name" | "avatar">>;
  balance: number;
  coupons: OwnedCoupon[];
};

const getMemory = createServerMemory<GuestMemory>("__btgoGuestStore", () => ({
  profileOverrides: {},
  balance: DEMO_B_MILE_BALANCE,
  coupons: [],
}));

export function getGuestProfile(): UserProfile {
  const mem = getMemory();
  return {
    id: DEMO_USER.id,
    email: "",
    name: mem.profileOverrides.name ?? DEMO_USER.name,
    avatar: mem.profileOverrides.avatar ?? DEFAULT_AVATAR,
  };
}

export function updateGuestProfile(
  patch: Partial<Pick<UserProfile, "name" | "avatar">>,
): UserProfile {
  const mem = getMemory();
  if (patch.name !== undefined) mem.profileOverrides.name = patch.name;
  if (patch.avatar !== undefined) mem.profileOverrides.avatar = patch.avatar;
  return getGuestProfile();
}

export function getGuestWallet() {
  const mem = getMemory();
  return { balance: mem.balance, coupons: [...mem.coupons] };
}

export function grantGuestBMile(amount: number): number {
  const mem = getMemory();
  mem.balance += amount;
  return mem.balance;
}

export function spendGuestBMile(cost: number): number | null {
  const mem = getMemory();
  if (cost < 0 || mem.balance < cost) return null;
  mem.balance -= cost;
  return mem.balance;
}

export function purchaseGuestCoupon(input: {
  storeName: string;
  label: string;
  cost: number;
}):
  | { ok: true; balance: number; coupon: OwnedCoupon }
  | { ok: false; error: string } {
  const mem = getMemory();
  if (mem.balance < input.cost) {
    return { ok: false, error: "insufficient_balance" };
  }
  mem.balance -= input.cost;
  const coupon: OwnedCoupon = {
    id: randomUUID(),
    storeName: input.storeName,
    label: input.label,
    cost: input.cost,
    purchasedAt: new Date().toISOString(),
  };
  mem.coupons.unshift(coupon);
  return { ok: true, balance: mem.balance, coupon };
}

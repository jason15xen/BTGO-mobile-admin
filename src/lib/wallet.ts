export type OwnedCoupon = {
  id: string;
  storeName: string;
  label: string;
  cost: number;
  purchasedAt: string;
};

const COUPONS_KEY = "btgo_owned_coupons";
const BALANCE_KEY = "btgo_b_mile_balance";

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadOwnedCoupons(): OwnedCoupon[] {
  return readJson<OwnedCoupon[]>(COUPONS_KEY) ?? [];
}

export function addOwnedCoupon(coupon: Omit<OwnedCoupon, "id" | "purchasedAt">) {
  const list = loadOwnedCoupons();
  const entry: OwnedCoupon = {
    ...coupon,
    id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    purchasedAt: new Date().toISOString(),
  };
  list.unshift(entry);
  try {
    localStorage.setItem(COUPONS_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
  return entry;
}

export function loadBalance(fallback: number): number {
  try {
    const raw = localStorage.getItem(BALANCE_KEY);
    if (raw === null) return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  } catch {
    return fallback;
  }
}

export function saveBalance(balance: number) {
  try {
    localStorage.setItem(BALANCE_KEY, String(balance));
  } catch {
    /* ignore */
  }
}

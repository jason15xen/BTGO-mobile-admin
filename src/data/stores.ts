import type { IconType } from "react-icons";
import { LuCoffee, LuLeaf, LuBike, LuShoppingBag, LuUtensils, LuFlower2, LuMountain } from "react-icons/lu";

export type CouponOffer = {
  id: string;
  /** B-mile cost to purchase. */
  cost: number;
  label: string;
};

/** Three coupon types — shared across all stores. */
export const COUPON_TYPES: CouponOffer[] = [
  { id: "c-10k", cost: 10_000, label: "10,000 B-mileクーポン" },
  { id: "c-50k", cost: 50_000, label: "50,000 B-mileクーポン" },
  { id: "c-100k", cost: 100_000, label: "100,000 B-mileクーポン" },
];

export type StoreBase = {
  id: string;
  name: string;
  prefecture: string;
  city: string;
  postalCode: string;
  Icon: IconType;
};

export type DiscountStore = StoreBase & {
  offer: string;
};

export type FullPriceStore = StoreBase;

/** Stores that sell B-mile coupons at a discount. */
export const DISCOUNT_STORES: DiscountStore[] = [
  {
    id: "green-cafe-fuji",
    name: "グリーンカフェ富士",
    offer: "ドリンク10%OFF",
    prefecture: "静岡県",
    city: "富士宮市",
    postalCode: "418-0066",
    Icon: LuCoffee,
  },
  {
    id: "shizen-do",
    name: "自然堂",
    offer: "全品15%OFF",
    prefecture: "静岡県",
    city: "富士市",
    postalCode: "416-0939",
    Icon: LuLeaf,
  },
  {
    id: "eco-ride-fuji",
    name: "エコライド富士",
    offer: "レンタカー無料1日",
    prefecture: "山梨県",
    city: "富士吉田市",
    postalCode: "403-0005",
    Icon: LuBike,
  },
  {
    id: "fuji-sato-market",
    name: "富士の里直売所",
    offer: "全品5%OFF",
    prefecture: "静岡県",
    city: "富士宮市",
    postalCode: "418-0101",
    Icon: LuShoppingBag,
  },
];

/** Stores without discount — user picks store first. */
export const FULL_PRICE_STORES: FullPriceStore[] = [
  {
    id: "kawaguchi-soba",
    name: "河口湖そば処 山水",
    prefecture: "山梨県",
    city: "富士河口湖町",
    postalCode: "401-0301",
    Icon: LuUtensils,
  },
  {
    id: "fuji-florist",
    name: "富士花工房",
    prefecture: "静岡県",
    city: "富士市",
    postalCode: "416-0952",
    Icon: LuFlower2,
  },
  {
    id: "yamanashi-craft",
    name: "山梨クラフト館",
    prefecture: "山梨県",
    city: "南都留郡忍野村",
    postalCode: "401-0511",
    Icon: LuMountain,
  },
  {
    id: "fujinomiya-foods",
    name: "富士宮やきそば 本店",
    prefecture: "静岡県",
    city: "富士宮市",
    postalCode: "418-0065",
    Icon: LuUtensils,
  },
];

export function storeLocationLabel(s: StoreBase) {
  return `${s.prefecture} ${s.city}（〒${s.postalCode}）`;
}

export function matchesLocationQuery(s: StoreBase, q: string) {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return (
    s.prefecture.toLowerCase().includes(needle) ||
    s.city.toLowerCase().includes(needle) ||
    s.postalCode.replace("-", "").includes(needle.replace("-", "")) ||
    s.name.toLowerCase().includes(needle)
  );
}

/** Discount stores charge 20% fewer B-miles. */
export function couponCost(coupon: CouponOffer, discounted: boolean) {
  return discounted ? Math.round(coupon.cost * 0.8) : coupon.cost;
}

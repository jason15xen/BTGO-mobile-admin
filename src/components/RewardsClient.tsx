"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { LuX, LuMapPin, LuSearch, LuStore, LuPartyPopper } from "react-icons/lu";
import type { UserStats } from "@/lib/game";
import { addOwnedCoupon, loadBalance, saveBalance } from "@/lib/wallet";
import { PageHero, Screen } from "@/components/ui";
import {
  COUPON_TYPES,
  DISCOUNT_STORES,
  FULL_PRICE_STORES,
  couponCost,
  matchesLocationQuery,
  storeLocationLabel,
  type CouponOffer,
  type DiscountStore,
  type FullPriceStore,
} from "@/data/stores";

type PendingPurchase = {
  storeName: string;
  coupon: CouponOffer;
  cost: number;
  discounted: boolean;
};

type PurchaseResult = { storeName: string; couponLabel: string; cost: number };

export default function RewardsClient({ stats }: { stats: UserStats }) {
  const [balance, setBalance] = useState(stats.points);
  const [discountStore, setDiscountStore] = useState<DiscountStore | null>(null);
  const [fullPriceOpen, setFullPriceOpen] = useState(false);
  const [pending, setPending] = useState<PendingPurchase | null>(null);
  const [processing, setProcessing] = useState<PendingPurchase | null>(null);
  const [purchase, setPurchase] = useState<PurchaseResult | null>(null);

  useEffect(() => {
    setBalance(loadBalance(stats.points));
  }, [stats.points]);

  function requestPurchase(storeName: string, coupon: CouponOffer, discounted: boolean) {
    const cost = couponCost(coupon, discounted);
    if (balance < cost) return;
    setPending({ storeName, coupon, cost, discounted });
  }

  function confirmPurchase() {
    if (!pending) return;
    setProcessing(pending);
    setPending(null);
    setDiscountStore(null);
    setFullPriceOpen(false);
  }

  function completePurchase(done: PendingPurchase) {
    setBalance((b) => {
      const next = b - done.cost;
      saveBalance(next);
      return next;
    });
    addOwnedCoupon({ storeName: done.storeName, label: done.coupon.label, cost: done.cost });
    setPurchase({ storeName: done.storeName, couponLabel: done.coupon.label, cost: done.cost });
    setProcessing(null);
  }

  const minCost = Math.min(...COUPON_TYPES.map((c) => couponCost(c, true)));

  return (
    <div className="min-h-full bg-forest-50">
      <PageHero
        title="報酬"
        subtitle="B-mileで地域のクーポンと交換"
        gradient="from-forest-500 to-forest-700"
        right={
          <div className="text-right text-white">
            <div className="text-3xl font-extrabold leading-none">{balance.toLocaleString()}</div>
            <div className="text-xs text-white/80 mt-1">B-mile</div>
          </div>
        }
      />
      <Screen>
        <p className="text-xs text-neutral-500 -mt-2 mb-1">割引クーポン取扱店</p>
        <div className="grid gap-3">
          {DISCOUNT_STORES.map((store) => {
            const affordable = balance >= minCost;
            return (
              <button
                key={store.id}
                type="button"
                onClick={() => setDiscountStore(store)}
                className="card3d rounded-2xl p-4 flex items-center gap-3 text-left w-full active:scale-[0.98] transition-transform duration-200"
              >
                <span className="w-12 h-12 rounded-xl bg-forest-50 text-forest-600 flex items-center justify-center shrink-0">
                  <store.Icon size={22} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-forest-800 text-sm">{store.name}</div>
                  <div className="text-xs text-forest-400">{store.offer}</div>
                  <div className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-0.5">
                    <LuMapPin size={10} className="shrink-0" />
                    {store.city}
                  </div>
                </div>
                <span
                  className={`text-sm font-bold rounded-full px-4 py-2 border-[1.5px] shrink-0 ${
                    affordable
                      ? "bg-forest-600 text-white border-forest-700"
                      : "bg-neutral-100 text-neutral-400 border-neutral-200"
                  }`}
                >
                  {minCost}〜 B-mile
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setFullPriceOpen(true)}
          className="mt-5 w-full card3d rounded-2xl px-4 py-3.5 flex items-center justify-center gap-2 text-sm font-bold text-forest-700 active:scale-[0.99] transition-transform"
        >
          <LuStore size={18} />
          割引なしの店舗から購入
        </button>
      </Screen>

      {discountStore && (
        <CouponSelectModal
          storeName={discountStore.name}
          location={storeLocationLabel(discountStore)}
          balance={balance}
          discounted
          onClose={() => setDiscountStore(null)}
          onSelect={(coupon) => requestPurchase(discountStore.name, coupon, true)}
        />
      )}

      {fullPriceOpen && (
        <FullPriceStoreModal
          balance={balance}
          onClose={() => setFullPriceOpen(false)}
          onSelect={(store, coupon) => requestPurchase(store.name, coupon, false)}
        />
      )}

      {pending && (
        <ConfirmPurchaseModal
          pending={pending}
          balance={balance}
          onCancel={() => setPending(null)}
          onConfirm={confirmPurchase}
        />
      )}

      {processing && (
        <PurchaseProgressModal pending={processing} onComplete={() => completePurchase(processing)} />
      )}

      {purchase && (
        <PurchaseSuccessModal result={purchase} balance={balance} onClose={() => setPurchase(null)} />
      )}
    </div>
  );
}

function Sheet({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center modal-backdrop" onClick={onClose}>
      <div
        className="w-full max-w-[440px] max-h-[88vh] overflow-y-auto no-scrollbar bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl modal-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white z-10 px-5 pt-5 pb-3 border-b border-neutral-100">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500"
            aria-label="閉じる"
          >
            <LuX size={16} />
          </button>
          <h2 className="text-lg font-bold text-neutral-900 pr-10">{title}</h2>
          {subtitle && <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function CouponRow({
  coupon,
  cost,
  affordable,
  onSelect,
}: {
  coupon: CouponOffer;
  cost: number;
  affordable: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!affordable}
      onClick={onSelect}
      className={`w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3.5 border transition-colors ${
        affordable
          ? "border-forest-200 bg-forest-50/50 active:bg-forest-50 active:scale-[0.99]"
          : "border-neutral-200 bg-neutral-50 opacity-60"
      }`}
    >
      <div className="text-left">
        <div className="text-sm font-semibold text-neutral-800">{coupon.label}</div>
        <div className="text-[11px] text-neutral-400 mt-0.5">{cost.toLocaleString()} B-mileで交換</div>
      </div>
      <span
        className={`text-sm font-bold rounded-full px-3.5 py-1.5 shrink-0 ${
          affordable ? "bg-forest-600 text-white" : "bg-neutral-200 text-neutral-400"
        }`}
      >
        {cost.toLocaleString()} B-mile
      </span>
    </button>
  );
}

function CouponSelectModal({
  storeName,
  location,
  balance,
  discounted,
  onClose,
  onSelect,
}: {
  storeName: string;
  location: string;
  balance: number;
  discounted: boolean;
  onClose: () => void;
  onSelect: (coupon: CouponOffer) => void;
}) {
  return (
    <Sheet title={storeName} subtitle="クーポンを選んで購入" onClose={onClose}>
      <div className="flex items-center gap-2 text-xs text-neutral-500 mb-4">
        <LuMapPin size={13} className="text-forest-500 shrink-0" />
        {location}
      </div>
      {discounted && (
        <p className="text-xs text-forest-600 font-semibold mb-3">割引店 — B-mile 20%OFF</p>
      )}
      <div className="space-y-2">
        {COUPON_TYPES.map((coupon) => {
          const cost = couponCost(coupon, discounted);
          return (
            <CouponRow
              key={coupon.id}
              coupon={coupon}
              cost={cost}
              affordable={balance >= cost}
              onSelect={() => onSelect(coupon)}
            />
          );
        })}
      </div>
    </Sheet>
  );
}

function ConfirmPurchaseModal({
  pending,
  balance,
  onCancel,
  onConfirm,
}: {
  pending: PendingPurchase;
  balance: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const after = balance - pending.cost;
  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center modal-backdrop" onClick={onCancel}>
      <div className="w-full max-w-[440px] bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl modal-sheet" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-neutral-900">購入の確認</h2>
        <p className="text-sm text-neutral-500 mt-1">このクーポンを購入しますか？</p>
        <div className="mt-4 rounded-2xl bg-forest-50 border border-forest-100 p-4 space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-neutral-500">店舗</span>
            <span className="font-semibold text-neutral-800 text-right">{pending.storeName}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-neutral-500">クーポン</span>
            <span className="font-semibold text-neutral-800 text-right">{pending.coupon.label}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-neutral-500">消費 B-mile</span>
            <span className="font-bold text-forest-700">−{pending.cost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-3 pt-2 border-t border-forest-100">
            <span className="text-neutral-500">購入後の残高</span>
            <span className="font-bold text-neutral-800">{after.toLocaleString()} B-mile</span>
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-xl py-3 font-bold text-neutral-600 bg-neutral-100">
            キャンセル
          </button>
          <button onClick={onConfirm} className="flex-1 rounded-xl py-3 font-bold text-white bg-forest-600 btn3d">
            購入する
          </button>
        </div>
      </div>
    </div>
  );
}

function CircularProgressRing({ progress }: { progress: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - progress / 100);
  const approving = progress < 100;

  return (
    <div className="relative w-[108px] h-[108px] mx-auto mt-6">
      <div
        className={`absolute inset-0 ${approving ? "animate-spin" : ""}`}
        style={{ animationDuration: "1.1s" }}
      >
        <svg viewBox="0 0 96 96" className="w-full h-full -rotate-90">
          <circle cx="48" cy="48" r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
          <circle
            cx="48"
            cy="48"
            r={r}
            fill="none"
            stroke="#2b871f"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-100"
          />
        </svg>
      </div>
      {approving && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] font-medium text-neutral-400">承認待ち</span>
        </div>
      )}
    </div>
  );
}

function PurchaseProgressModal({
  pending,
  onComplete,
}: {
  pending: PendingPurchase;
  onComplete: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const iv = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + 4, 100);
        if (next >= 100) {
          clearInterval(iv);
          setTimeout(() => onCompleteRef.current(), 400);
        }
        return next;
      });
    }, 80);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center modal-backdrop">
      <div className="w-full max-w-[440px] bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl modal-sheet">
        <h2 className="text-lg font-bold text-neutral-900 text-center animate-pulse">交換処理中…</h2>
        <p className="text-sm text-neutral-500 text-center mt-1">{pending.coupon.label}</p>
        <CircularProgressRing progress={progress} />
        <p className="text-center text-xs text-neutral-400 mt-4">取引の承認を待っています</p>
      </div>
    </div>
  );
}

function FullPriceStoreModal({
  balance,
  onClose,
  onSelect,
}: {
  balance: number;
  onClose: () => void;
  onSelect: (store: FullPriceStore, coupon: CouponOffer) => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<FullPriceStore | null>(null);

  const filtered = useMemo(
    () => FULL_PRICE_STORES.filter((s) => matchesLocationQuery(s, query)),
    [query],
  );

  if (selected) {
    return (
      <CouponSelectModal
        storeName={selected.name}
        location={storeLocationLabel(selected)}
        balance={balance}
        discounted={false}
        onClose={() => setSelected(null)}
        onSelect={(coupon) => onSelect(selected, coupon)}
      />
    );
  }

  return (
    <Sheet title="店舗を選択" subtitle="都道府県・市区町村・郵便番号で検索" onClose={onClose}>
      <div className="relative mb-4">
        <LuSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="例：富士宮市、静岡県、418-0066"
          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-forest-400 focus:ring-1 focus:ring-forest-200"
        />
      </div>
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-6">該当する店舗がありません</p>
        ) : (
          filtered.map((store) => (
            <button
              key={store.id}
              type="button"
              onClick={() => setSelected(store)}
              className="w-full flex items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3 text-left active:bg-forest-50/50 active:scale-[0.99] transition-all"
            >
              <span className="w-10 h-10 rounded-lg bg-forest-50 text-forest-600 flex items-center justify-center shrink-0">
                <store.Icon size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-neutral-800">{store.name}</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">{storeLocationLabel(store)}</div>
              </div>
            </button>
          ))
        )}
      </div>
    </Sheet>
  );
}

function PurchaseSuccessModal({
  result,
  balance,
  onClose,
}: {
  result: PurchaseResult;
  balance: number;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center modal-backdrop" onClick={onClose}>
      <div className="w-full max-w-[440px] bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl text-center modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-forest-100 text-forest-600 flex items-center justify-center animate-popIn celebrate-ring">
          <LuPartyPopper size={28} className="animate-wiggle" />
        </div>
        <h2 className="text-lg font-bold text-neutral-900 opacity-0-start animate-fadeUp stagger-1">クーポンを獲得しました</h2>
        <p className="text-sm text-neutral-600 mt-2">
          {result.storeName}
          <br />
          <span className="font-semibold text-forest-700">{result.couponLabel}</span>
        </p>
        <p className="text-xs text-neutral-400 mt-3">
          −{result.cost.toLocaleString()} B-mile ・ 残り {balance.toLocaleString()} B-mile
        </p>
        <button onClick={onClose} className="w-full mt-5 bg-forest-600 text-white font-bold rounded-xl py-3">
          とじる
        </button>
      </div>
    </div>
  );
}

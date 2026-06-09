"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { IconType } from "react-icons";
import { FiUser, FiCamera, FiLogOut, FiEdit2 } from "react-icons/fi";
import { LuFootprints, LuBird, LuTicket, LuActivity } from "react-icons/lu";
import { useRouter } from "next/navigation";
import type { AppUser } from "@/lib/auth";
import type { UserStats } from "@/lib/game";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { loadBalance, loadOwnedCoupons, type OwnedCoupon } from "@/lib/wallet";
import SpeciesImage from "@/components/SpeciesImage";
import { PageHero, Screen, Card, ProgressBar } from "@/components/ui";

type ProfileTab = "activity" | "coupon";

const BADGES: { name: string; Icon: IconType; color: string; text: string }[] = [
  { name: "はじめの一歩", Icon: LuFootprints, color: "bg-forest-100", text: "text-forest-600" },
  { name: "バードウォッチャー", Icon: LuBird, color: "bg-teal-100", text: "text-teal-600" },
  { name: "自然愛好家", Icon: FiCamera, color: "bg-gold-100", text: "text-gold-600" },
];

interface Recent {
  id: string;
  name: string;
  emoji: string;
  xp: number;
  date: string;
}

const fmtDate = (iso: string) => iso.slice(0, 10).replace(/-/g, "/");

export default function ProfileClient({
  user,
  stats,
  recent,
}: {
  user: AppUser | null;
  stats: UserStats;
  recent: Recent[];
}) {
  const router = useRouter();
  const [coupons, setCoupons] = useState<OwnedCoupon[]>([]);
  const [balance, setBalance] = useState(stats.points);
  const [tab, setTab] = useState<ProfileTab>("activity");

  useEffect(() => {
    setCoupons(loadOwnedCoupons());
    setBalance(loadBalance(stats.points));
  }, [stats.points]);

  async function signOut() {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.push("/");
    router.refresh();
  }

  const name = user?.name ?? "ゲスト";

  return (
    <div className="min-h-full bg-forest-50">
      <PageHero title="マイページ" subtitle={user?.email ?? "ゲストモード — ログインして記録を保存"} gradient="from-forest-500 to-teal-700" />
      <Screen className="space-y-4">
        <Card className="-mt-9 relative z-10 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-b from-forest-100 to-forest-200 text-forest-600 flex items-center justify-center tile3d">
            <FiUser size={38} />
          </div>
          <div className="mt-2 text-lg font-bold text-neutral-900">{name}</div>
          <div className="text-xs text-neutral-400">
            {user?.region ? `${user.region} ・ ` : ""}Lv.{stats.level} {stats.title}
          </div>
          <ProgressBar value={stats.xpInLevel} max={stats.xpForLevel} tone="gold" className="mt-3" />
          <div className="text-[11px] text-neutral-400 mt-1">{stats.xpInLevel} / {stats.xpForLevel} XP</div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <Stat label="発見数" value={stats.discoveries} />
            <Stat label="登録種" value={stats.speciesCount} />
            <Stat label="B-mile" value={balance} />
          </div>

          <div className="mt-4 flex gap-2">
            {user ? (
              <button onClick={signOut} className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-neutral-600 bg-neutral-100 rounded-xl py-2.5">
                <FiLogOut size={15} /> ログアウト
              </button>
            ) : (
              <Link href="/login" className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-forest-600 rounded-xl py-2.5">
                <FiUser size={15} /> ログイン
              </Link>
            )}
            {!user && (
              <Link href="/register" className="flex items-center justify-center gap-1.5 text-sm font-semibold text-neutral-600 bg-neutral-100 rounded-xl py-2.5 px-4">
                <FiEdit2 size={15} /> 登録
              </Link>
            )}
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 rounded-2xl bg-white p-1 ring-1 ring-black/5 shadow-md">
          <button
            type="button"
            onClick={() => setTab("activity")}
            className={`flex-1 h-11 rounded-xl flex items-center justify-center gap-1.5 text-sm font-semibold text-neutral-900 transition-colors ${
              tab === "activity" ? "bg-forest-100" : "bg-white active:bg-neutral-50"
            }`}
          >
            <LuActivity size={16} />
            アクティビティ
          </button>
          <button
            type="button"
            onClick={() => setTab("coupon")}
            className={`flex-1 h-11 rounded-xl flex items-center justify-center gap-1.5 text-sm font-semibold text-neutral-900 transition-colors ${
              tab === "coupon" ? "bg-gold-100" : "bg-white active:bg-neutral-50"
            }`}
          >
            <LuTicket size={16} />
            クーポン
            {coupons.length > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-gold-500 text-white text-[10px] font-bold flex items-center justify-center">
                {coupons.length}
              </span>
            )}
          </button>
        </div>

        <div key={tab} className="tab-content-enter">
          {tab === "activity" ? (
            <ActivityPanel recent={recent} />
          ) : (
            <CouponPanel coupons={coupons} />
          )}
        </div>
      </Screen>
    </div>
  );
}

function ActivityPanel({ recent }: { recent: Recent[] }) {
  return (
    <div className="space-y-5">
      <section>
        <h2 className="font-bold text-neutral-800 mb-3">バッジ</h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {BADGES.map((b) => (
            <div key={b.name} className="flex flex-col items-center gap-1.5 w-20 shrink-0">
              <span className={`w-14 h-14 rounded-full ${b.color} ${b.text} flex items-center justify-center`}>
                <b.Icon size={24} />
              </span>
              <span className="text-[10px] text-neutral-500 text-center leading-tight">{b.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-bold text-neutral-800 mb-3">最近のアクティビティ</h2>
        <div className="space-y-2">
          {recent.length === 0 ? (
            <EmptyState
              icon={LuActivity}
              message="まだ発見がありません"
              hint="撮影して生き物を記録しよう"
              href="/capture"
              action="さがしに行く"
            />
          ) : (
            recent.map((r, i) => (
              <div key={i} className={`card3d rounded-2xl p-3 flex items-center gap-3 opacity-0-start animate-fadeUp ${["stagger-1", "stagger-2", "stagger-3", "stagger-4", "stagger-5", "stagger-6"][i] ?? "stagger-6"}`}>
                <SpeciesImage speciesId={r.id} emoji={r.emoji} alt={r.name} className="w-10 h-10" rounded="rounded-full" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-neutral-800 truncate">{r.name}を発見！</div>
                  <div className="text-[11px] text-neutral-400">{r.date}</div>
                </div>
                <span className="text-sm font-bold text-forest-600 shrink-0">+{r.xp} XP</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function CouponPanel({ coupons }: { coupons: OwnedCoupon[] }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-neutral-800">所持クーポン</h2>
        <Link href="/rewards" className="text-xs font-semibold text-forest-600">
          報酬へ →
        </Link>
      </div>
      <div className="space-y-2">
        {coupons.length === 0 ? (
          <EmptyState
            icon={LuTicket}
            message="まだクーポンがありません"
            hint="B-mileで地域のクーポンと交換しよう"
            href="/rewards"
            action="クーポンを見る"
          />
        ) : (
          coupons.map((c, i) => (
            <div key={c.id} className={`card3d rounded-2xl p-3.5 flex items-center gap-3 opacity-0-start animate-fadeUp ${["stagger-1", "stagger-2", "stagger-3", "stagger-4", "stagger-5", "stagger-6"][i] ?? "stagger-6"}`}>
              <span className="w-11 h-11 rounded-xl bg-gold-50 text-gold-600 flex items-center justify-center shrink-0">
                <LuTicket size={20} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-neutral-800 truncate">{c.label}</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">{c.storeName}</div>
                <div className="text-[11px] text-neutral-400">{fmtDate(c.purchasedAt)} に取得</div>
              </div>
              <span className="text-xs font-bold text-forest-600 shrink-0">{c.cost.toLocaleString()} B-mile</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function EmptyState({
  icon: Icon,
  message,
  hint,
  href,
  action,
}: {
  icon: IconType;
  message: string;
  hint: string;
  href: string;
  action: string;
}) {
  return (
    <div className="card3d rounded-2xl p-6 text-center">
      <span className="w-12 h-12 mx-auto rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center">
        <Icon size={22} />
      </span>
      <p className="text-sm font-semibold text-neutral-700 mt-3">{message}</p>
      <p className="text-xs text-neutral-400 mt-1">{hint}</p>
      <Link href={href} className="inline-block mt-4 text-sm font-bold text-white bg-forest-600 rounded-xl px-5 py-2.5 btn3d">
        {action}
      </Link>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-forest-50 rounded-xl py-2 tile3d">
      <div className="text-lg font-extrabold text-forest-700">{value.toLocaleString()}</div>
      <div className="text-[10px] text-forest-400">{label}</div>
    </div>
  );
}

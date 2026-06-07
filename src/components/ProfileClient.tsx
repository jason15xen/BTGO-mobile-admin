"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { IconType } from "react-icons";
import { FiUser, FiCamera, FiLogOut, FiEdit2 } from "react-icons/fi";
import { LuFootprints, LuBird, LuTicket } from "react-icons/lu";
import type { UserStats } from "@/lib/game";
import { loadBalance, loadOwnedCoupons, type OwnedCoupon } from "@/lib/wallet";
import SpeciesImage from "@/components/SpeciesImage";
import { PageHero, Screen, Card } from "@/components/ui";

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

export default function ProfileClient({ stats, recent }: { stats: UserStats; recent: Recent[] }) {
  const [account, setAccount] = useState<{ name?: string; email?: string; region?: string } | null>(null);
  const [coupons, setCoupons] = useState<OwnedCoupon[]>([]);
  const [balance, setBalance] = useState(stats.points);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("btgo_user");
      if (raw) setAccount(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setCoupons(loadOwnedCoupons());
    setBalance(loadBalance(stats.points));
  }, [stats.points]);

  function signOut() {
    try {
      localStorage.removeItem("btgo_user");
    } catch {
      /* ignore */
    }
    setAccount(null);
  }

  const name = account?.name ?? "ゲスト";

  return (
    <div className="min-h-full bg-forest-50">
      <PageHero title="マイページ" subtitle={account?.email ?? "アカウント・実績"} gradient="from-forest-500 to-teal-700" />
      <Screen>
        {/* Identity / auth */}
        <Card className="-mt-9 relative z-10 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-forest-100 text-forest-600 flex items-center justify-center">
            <FiUser size={38} />
          </div>
          <div className="mt-2 text-lg font-bold text-neutral-900">{name}</div>
          <div className="text-xs text-neutral-400">
            {account?.region ? `${account.region} ・ ` : ""}Lv.{stats.level} {stats.title}
          </div>
          <div className="h-2 mt-3 bg-neutral-100 rounded-full overflow-hidden well3d">
            <div className="h-full bg-gold-400 rounded-full" style={{ width: `${(stats.xpInLevel / stats.xpForLevel) * 100}%` }} />
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">{stats.xpInLevel} / {stats.xpForLevel} XP</div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <Stat label="発見数" value={stats.discoveries} />
            <Stat label="登録種" value={stats.speciesCount} />
            <Stat label="B-mile" value={balance} />
          </div>

          {/* auth actions */}
          <div className="mt-4 flex gap-2">
            {account ? (
              <button onClick={signOut} className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-neutral-600 bg-neutral-100 rounded-xl py-2.5">
                <FiLogOut size={15} /> ログアウト
              </button>
            ) : (
              <Link href="/register" className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-forest-600 rounded-xl py-2.5">
                <FiUser size={15} /> 新規登録 / ログイン
              </Link>
            )}
            <Link href="/register" className="flex items-center justify-center gap-1.5 text-sm font-semibold text-neutral-600 bg-neutral-100 rounded-xl py-2.5 px-4">
              <FiEdit2 size={15} /> 編集
            </Link>
          </div>
        </Card>

        {/* Owned coupons */}
        <div>
          <h2 className="font-bold text-neutral-800 mb-2">所持クーポン</h2>
          <div className="space-y-2">
            {coupons.length === 0 ? (
              <p className="text-sm text-neutral-400">まだクーポンがありません。報酬ページで交換しよう。</p>
            ) : (
              coupons.map((c) => (
                <div key={c.id} className="card3d rounded-2xl p-3.5 flex items-center gap-3">
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
        </div>

        {/* Badges */}
        <div>
          <h2 className="font-bold text-neutral-800 mb-2">バッジ</h2>
          <div className="flex gap-3">
            {BADGES.map((b) => (
              <div key={b.name} className="flex flex-col items-center gap-1 w-20">
                <span className={`w-14 h-14 rounded-full ${b.color} ${b.text} flex items-center justify-center`}>
                  <b.Icon size={24} />
                </span>
                <span className="text-[10px] text-neutral-500 text-center leading-tight">{b.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <h2 className="font-bold text-neutral-800 mb-2">最近のアクティビティ</h2>
          <div className="space-y-2">
            {recent.length === 0 && <p className="text-sm text-neutral-400">まだ発見がありません。撮影してみよう！</p>}
            {recent.map((r, i) => (
              <div key={i} className="card3d rounded-2xl p-3 flex items-center gap-3">
                <SpeciesImage speciesId={r.id} emoji={r.emoji} alt={r.name} className="w-10 h-10" rounded="rounded-full" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-neutral-800">{r.name}を発見！</div>
                  <div className="text-[11px] text-neutral-400">{r.date}</div>
                </div>
                <span className="text-sm font-bold text-forest-600">+{r.xp} XP</span>
              </div>
            ))}
          </div>
        </div>
      </Screen>
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

"use client";

import { useState } from "react";
import type { UserStats } from "@/lib/game";
import SpeciesImage from "@/components/SpeciesImage";
import { PageHero, Screen } from "@/components/ui";

const COUPONS = [
  { name: "グリーンカフェ富士", offer: "ドリンク10%OFF", cost: 150, emoji: "☕" },
  { name: "自然堂", offer: "全品15%OFF", cost: 200, emoji: "🌱" },
  { name: "エコライド富士", offer: "レンタカー無料1日", cost: 300, emoji: "🚲" },
  { name: "富士の里直売所", offer: "全品5%OFF", cost: 100, emoji: "🍙" },
];

const BADGES = [
  { name: "はじめの一歩", emoji: "🥾", color: "bg-forest-100" },
  { name: "バードウォッチャー", emoji: "🐦", color: "bg-sky-100" },
  { name: "自然愛好家", emoji: "📷", color: "bg-amber-100" },
];

interface Recent {
  id: string;
  name: string;
  emoji: string;
  xp: number;
  date: string;
}

export default function RewardsClient({ stats, recent }: { stats: UserStats; recent: Recent[] }) {
  const [tab, setTab] = useState<"coupons" | "profile">("coupons");

  return (
    <div>
      <PageHero
        title="報酬"
        subtitle="ポイントで地域のクーポンと交換"
        gradient="from-gold-400 to-gold-600"
        right={
          <div className="text-right text-white">
            <div className="text-3xl font-extrabold leading-none">{stats.points.toLocaleString()}</div>
            <div className="text-xs text-white/80 mt-1">ポイント</div>
          </div>
        }
      />
      <Screen>
        {/* Tabs */}
        <div className="relative z-10 flex gap-2 bg-white rounded-2xl p-1 border border-neutral-100 shadow-soft -mt-9">
          <button
            onClick={() => setTab("coupons")}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold ${tab === "coupons" ? "bg-forest-600 text-white" : "text-neutral-500"}`}
          >
            クーポン
          </button>
          <button
            onClick={() => setTab("profile")}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold ${tab === "profile" ? "bg-forest-600 text-white" : "text-neutral-500"}`}
          >
            プロフィール
          </button>
        </div>

      {tab === "coupons" ? (
        <div className="grid gap-3">
          {COUPONS.map((c) => {
            const affordable = stats.points >= c.cost;
            return (
              <div
                key={c.name}
                className="bg-white rounded-2xl border border-forest-100 p-4 flex items-center gap-3"
              >
                <span className="w-12 h-12 rounded-xl bg-forest-50 flex items-center justify-center text-2xl">
                  {c.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-forest-800 text-sm">{c.name}</div>
                  <div className="text-xs text-forest-400">{c.offer}</div>
                </div>
                <button
                  disabled={!affordable}
                  className={`text-sm font-bold rounded-full px-4 py-2 ${
                    affordable
                      ? "bg-gold-400 text-forest-900 hover:bg-gold-500"
                      : "bg-forest-100 text-forest-300"
                  }`}
                >
                  {c.cost}pt
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Profile card */}
          <div className="bg-white rounded-3xl border border-forest-100 p-5 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-forest-100 flex items-center justify-center text-4xl">
              🧑‍🌾
            </div>
            <div className="mt-2 font-bold text-forest-800">{stats.title}</div>
            <div className="text-xs text-forest-400">Lv.{stats.level}</div>
            <div className="h-2 mt-3 bg-forest-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gold-400 rounded-full"
                style={{ width: `${(stats.xpInLevel / stats.xpForLevel) * 100}%` }}
              />
            </div>
            <div className="text-[11px] text-forest-400 mt-1">
              {stats.xpInLevel} / {stats.xpForLevel} XP
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4">
              <Stat label="発見数" value={stats.discoveries} />
              <Stat label="登録種" value={stats.speciesCount} />
              <Stat label="ポイント" value={stats.points} />
            </div>
          </div>

          {/* Badges */}
          <div>
            <h2 className="font-bold text-forest-800 mb-2">バッジ</h2>
            <div className="flex gap-3">
              {BADGES.map((b) => (
                <div key={b.name} className="flex flex-col items-center gap-1 w-20">
                  <span className={`w-14 h-14 rounded-full ${b.color} flex items-center justify-center text-2xl`}>
                    {b.emoji}
                  </span>
                  <span className="text-[10px] text-forest-500 text-center leading-tight">{b.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div>
            <h2 className="font-bold text-forest-800 mb-2">最近のアクティビティ</h2>
            <div className="space-y-2">
              {recent.length === 0 && (
                <p className="text-sm text-forest-400">まだ発見がありません。撮影してみよう！</p>
              )}
              {recent.map((r, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-forest-100 p-3 flex items-center gap-3"
                >
                  <SpeciesImage speciesId={r.id} emoji={r.emoji} alt={r.name} className="w-10 h-10" rounded="rounded-full" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-forest-800">{r.name}を発見！</div>
                    <div className="text-[11px] text-forest-400">{r.date}</div>
                  </div>
                  <span className="text-sm font-bold text-forest-600">+{r.xp} XP</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </Screen>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-forest-50 rounded-xl py-2">
      <div className="text-lg font-extrabold text-forest-700">{value.toLocaleString()}</div>
      <div className="text-[10px] text-forest-400">{label}</div>
    </div>
  );
}

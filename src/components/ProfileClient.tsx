"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { IconType } from "react-icons";
import { FiCamera } from "react-icons/fi";
import { LuFootprints, LuBird, LuTicket, LuActivity, LuTrophy, LuLayers } from "react-icons/lu";
import { ECOSYSTEM_LABEL } from "@/data/species";
import type { UserStats } from "@/lib/game";
import { fetchPlayer, fetchWallet, updatePlayer } from "@/lib/gameApi";
import type { PyramidEcoSummary } from "@/lib/pyramidSummary";
import type { Ecosystem, UserProfile } from "@/lib/types";
import type { OwnedCoupon } from "@/lib/wallet";
import SpeciesImage from "@/components/SpeciesImage";
import { PageHero, Screen, Card, ProgressBar } from "@/components/ui";

type ProfileTab = "activity" | "coupon";

const BADGES: { name: string; Icon: IconType; color: string; text: string }[] = [
  { name: "はじめの一歩", Icon: LuFootprints, color: "bg-forest-100", text: "text-forest-600" },
  { name: "バードウォッチャー", Icon: LuBird, color: "bg-teal-100", text: "text-teal-600" },
  { name: "自然愛好家", Icon: FiCamera, color: "bg-gold-100", text: "text-gold-600" },
];

const AVATAR_PRESETS = ["🌿", "🦊", "🐦", "🦋", "🐢", "🌸", "🗻", "🐸"];

interface Recent {
  id: string;
  name: string;
  emoji: string;
  xp: number;
  date: string;
}

const fmtDate = (iso: string) => iso.slice(0, 10).replace(/-/g, "/");

export default function ProfileClient({
  initialProfile,
  stats,
  recent,
  pyramid,
}: {
  initialProfile: UserProfile;
  stats: UserStats;
  recent: Recent[];
  pyramid: Record<Ecosystem, PyramidEcoSummary>;
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [nameDraft, setNameDraft] = useState(initialProfile.name);
  const [saving, setSaving] = useState(false);
  const [coupons, setCoupons] = useState<OwnedCoupon[]>([]);
  const [balance, setBalance] = useState(stats.points);
  const [tab, setTab] = useState<ProfileTab>("activity");
  const [feedCount, setFeedCount] = useState(0);

  useEffect(() => {
    fetchWallet().then((w) => {
      setBalance(w.balance);
      setCoupons(w.coupons);
    });
    fetchPlayer().then((p) => {
      if (p?.game?.feeds) setFeedCount(p.game.feeds.length);
    });
  }, [stats.points]);

  async function saveProfile(patch: Partial<Pick<UserProfile, "name" | "avatar">>) {
    setSaving(true);
    const updated = await updatePlayer(patch);
    if (updated) {
      setProfile(updated);
      setNameDraft(updated.name);
    }
    setSaving(false);
  }

  async function onNameBlur() {
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === profile.name) return;
    await saveProfile({ name: trimmed });
  }

  return (
    <div className="min-h-full bg-forest-50">
      <PageHero title="マイページ" subtitle="富士の自然探索" gradient="from-forest-500 to-teal-700" />
      <Screen className="space-y-4">
        <Card className="-mt-9 relative z-10 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-b from-forest-100 to-forest-200 flex items-center justify-center text-4xl tile3d">
            {profile.avatar}
          </div>

          <div className="flex flex-wrap justify-center gap-1.5 mt-3 px-2">
            {AVATAR_PRESETS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                disabled={saving}
                onClick={() => saveProfile({ avatar: emoji })}
                className={`w-9 h-9 rounded-full text-lg flex items-center justify-center border transition-colors ${
                  profile.avatar === emoji
                    ? "border-forest-500 bg-forest-50 ring-2 ring-forest-200"
                    : "border-neutral-200 bg-white active:bg-forest-50"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={onNameBlur}
            maxLength={20}
            className="mt-3 w-full max-w-[220px] mx-auto block text-center text-lg font-bold text-neutral-900 bg-forest-50 border border-forest-100 rounded-xl px-3 py-2 outline-none focus:border-forest-400"
            placeholder="ユーザー名"
          />

          <div className="text-xs text-neutral-400 mt-2">
            Lv.{stats.level} {stats.title}
          </div>
          <ProgressBar value={stats.xpInLevel} max={stats.xpForLevel} tone="gold" className="mt-3" />
          <div className="text-[11px] text-neutral-400 mt-1">{stats.xpInLevel} / {stats.xpForLevel} XP</div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <Stat label="発見数" value={stats.discoveries} />
            <Stat label="登録種" value={stats.speciesCount} />
            <Stat label="B-mile" value={balance} />
          </div>

          <Link
            href="/ranking"
            className="mt-3 flex items-center justify-center gap-2 w-full rounded-xl bg-gold-50 border border-gold-100 text-gold-800 text-sm font-semibold py-2.5 active:bg-gold-100"
          >
            <LuTrophy size={16} /> 月間ランキングを見る
          </Link>
        </Card>

        <Card className="!p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-neutral-800 mb-3">
            <LuLayers size={16} className="text-forest-600" />
            ピラミッド進捗
            <span className="ml-auto text-xs font-normal text-neutral-400">餌 {feedCount} 個</span>
          </div>
          <div className="space-y-2">
            {(["terrestrial", "freshwater", "marine"] as Ecosystem[]).map((eco) => {
              const p = pyramid[eco];
              return (
                <div key={eco}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-600">{ECOSYSTEM_LABEL[eco]}</span>
                    <span className="font-semibold text-forest-700">{p.found}/{p.total} 種 · {p.pct}%</span>
                  </div>
                  <ProgressBar value={p.pct} size="sm" />
                </div>
              );
            })}
          </div>
          <Link href="/pyramid" className="block text-center text-xs font-semibold text-forest-600 mt-3">
            ピラミッドを見る →
          </Link>
        </Card>

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

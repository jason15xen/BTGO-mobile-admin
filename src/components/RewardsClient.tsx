"use client";

import type { IconType } from "react-icons";
import { LuCoffee, LuLeaf, LuBike, LuShoppingBag } from "react-icons/lu";
import type { UserStats } from "@/lib/game";
import { PageHero, Screen } from "@/components/ui";

const COUPONS: { name: string; offer: string; cost: number; Icon: IconType }[] = [
  { name: "グリーンカフェ富士", offer: "ドリンク10%OFF", cost: 150, Icon: LuCoffee },
  { name: "自然堂", offer: "全品15%OFF", cost: 200, Icon: LuLeaf },
  { name: "エコライド富士", offer: "レンタカー無料1日", cost: 300, Icon: LuBike },
  { name: "富士の里直売所", offer: "全品5%OFF", cost: 100, Icon: LuShoppingBag },
];

export default function RewardsClient({ stats }: { stats: UserStats }) {
  return (
    <div>
      <PageHero
        title="報酬"
        subtitle="B-mileで地域のクーポンと交換"
        gradient="from-gold-400 to-gold-600"
        right={
          <div className="text-right text-white">
            <div className="text-3xl font-extrabold leading-none">{stats.points.toLocaleString()}</div>
            <div className="text-xs text-white/80 mt-1">B-mile</div>
          </div>
        }
      />
      <Screen>
        <div className="grid gap-3 -mt-2">
          {COUPONS.map((c) => {
            const affordable = stats.points >= c.cost;
            return (
              <div key={c.name} className="card3d rounded-2xl p-4 flex items-center gap-3">
                <span className="w-12 h-12 rounded-xl bg-forest-50 text-forest-600 flex items-center justify-center">
                  <c.Icon size={22} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-forest-800 text-sm">{c.name}</div>
                  <div className="text-xs text-forest-400">{c.offer}</div>
                </div>
                <button
                  disabled={!affordable}
                  className={`text-sm font-bold rounded-full px-4 py-2 border-[1.5px] btn3d ${
                    affordable ? "bg-gold-400 text-forest-900 border-gold-600/50 hover:bg-gold-500" : "bg-neutral-100 text-neutral-400 border-neutral-200"
                  }`}
                >
                  {c.cost} B-mile
                </button>
              </div>
            );
          })}
        </div>
      </Screen>
    </div>
  );
}

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
    <div className="min-h-full bg-forest-50">
      <PageHero
        title="報酬"
        subtitle="B-mileで地域のクーポンと交換"
        gradient="from-forest-500 to-forest-700"
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
                    affordable ? "bg-forest-600 text-white border-forest-700 hover:bg-forest-700" : "bg-neutral-100 text-neutral-400 border-neutral-200"
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

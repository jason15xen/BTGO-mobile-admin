"use client";

import { useState } from "react";
import { LuLightbulb } from "react-icons/lu";
import Pyramid from "@/components/Pyramid";
import { ECOSYSTEM_LABEL } from "@/data/species";
import { ECO_THEME } from "@/lib/theme";
import { PageHero, Screen, Card } from "@/components/ui";
import type { Ecosystem } from "@/lib/types";

const TABS: { key: Ecosystem }[] = [
  { key: "terrestrial" },
  { key: "freshwater" },
  { key: "marine" },
];

export default function PyramidClient({
  discovered,
  totals,
}: {
  discovered: string[];
  totals: Record<string, number>;
}) {
  const [eco, setEco] = useState<Ecosystem>("terrestrial");
  const set = new Set(discovered);

  // count discovered within this ecosystem
  const total = totals[eco] ?? 0;

  return (
    <div>
      <PageHero
        title="生態系ピラミッド"
        subtitle="発見した生き物で食物連鎖を完成させよう"
        gradient={`${ECO_THEME[eco].gradient}`}
        bgImage={`/eco/${eco}.webp`}
      />
      <Screen>
        {/* Ecosystem tabs — each uses its real scenery as the background */}
        <div className="relative z-10 flex gap-2 -mt-9">
          {TABS.map((t) => {
            const Icon = ECO_THEME[t.key].Icon;
            const activeTab = eco === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setEco(t.key)}
                className={`relative flex-1 h-14 rounded-2xl overflow-hidden ring-2 transition-all ${
                  activeTab ? "ring-white shadow-md scale-[1.03]" : "ring-white/40 opacity-90"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/eco/${t.key}.webp`} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div
                  className={`absolute inset-0 ${
                    activeTab ? `bg-gradient-to-br ${ECO_THEME[t.key].gradient} opacity-55` : "bg-black/45"
                  }`}
                />
                <span className="relative h-full flex items-center justify-center gap-1.5 text-white font-bold text-sm drop-shadow">
                  <Icon size={15} /> {ECOSYSTEM_LABEL[t.key]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Pyramid */}
        <Card>
          <Pyramid ecosystem={eco} discovered={set} />
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-neutral-400">グレーの枠は未発見の生き物</span>
            <span className={`font-semibold ${ECO_THEME[eco].text}`}>
              {[...set].filter((id) => id.startsWith(eco[0] + "-")).length} / {total} 種
            </span>
          </div>
        </Card>

        <div className="bg-gold-300/30 border border-gold-300/50 rounded-2xl p-4 text-sm text-neutral-600 flex gap-2">
          <LuLightbulb className="text-gold-600 shrink-0 mt-0.5" size={16} />
          <span>空いている枠をうめると「ピラミッドコンプリート」ボーナス +20pt がもらえます。近くの生き物を探しに行こう！</span>
        </div>
      </Screen>
    </div>
  );
}

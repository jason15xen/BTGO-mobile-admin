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
      <PageHero title="生態系ピラミッド" subtitle="発見した生き物で食物連鎖を完成させよう" gradient={`${ECO_THEME[eco].gradient}`} />
      <Screen>
        {/* Ecosystem tabs */}
        <div className="relative z-10 flex gap-2 bg-white rounded-2xl p-1 border border-neutral-100 shadow-soft -mt-9">
          {TABS.map((t) => {
            const Icon = ECO_THEME[t.key].Icon;
            return (
              <button
                key={t.key}
                onClick={() => setEco(t.key)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                  eco === t.key ? `bg-gradient-to-r ${ECO_THEME[t.key].gradient} text-white shadow` : "text-neutral-500"
                }`}
              >
                <Icon size={15} /> {ECOSYSTEM_LABEL[t.key]}
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

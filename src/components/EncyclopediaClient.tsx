"use client";

import { useState } from "react";
import { FiCamera } from "react-icons/fi";
import { SPECIES, RARITY_LABEL } from "@/data/species";
import type { Species } from "@/lib/types";
import type { Discovery } from "@/lib/game";
import SpeciesImage from "@/components/SpeciesImage";
import SpeciesDetailSheet from "@/components/SpeciesDetailSheet";
import { RARITY_THEME } from "@/lib/theme";
import { PageHero, Screen, Card, ProgressBar } from "@/components/ui";

type Filter = "all" | "terrestrial" | "freshwater" | "marine";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "terrestrial", label: "陸域" },
  { key: "freshwater", label: "淡水域" },
  { key: "marine", label: "海域" },
];

const rarityBadge = (r: string) =>
  RARITY_THEME[r as keyof typeof RARITY_THEME]?.chip ?? "bg-white/80 text-neutral-600";

export default function EncyclopediaClient({ discoveries }: { discoveries: Record<string, Discovery> }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Species | null>(null);

  const discoveredCount = Object.keys(discoveries).length;
  const pct = Math.round((discoveredCount / SPECIES.length) * 100);

  // Only species the user has actually discovered.
  const list = SPECIES.filter(
    (s) => discoveries[s.id] && (filter === "all" || s.ecosystem === filter)
  );

  return (
    <div className="min-h-full bg-forest-50">
      <PageHero title="図鑑" subtitle="発見した生き物のコレクション" gradient="from-forest-500 to-forest-700" />
      <Screen>
        {/* progress */}
        <Card className="-mt-9 relative z-10">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-sm text-neutral-500">発見した生き物</div>
              <div className="text-2xl font-extrabold text-neutral-800 mt-0.5">
                {discoveredCount}
                <span className="text-base font-bold text-neutral-400"> / {SPECIES.length} 種類</span>
              </div>
            </div>
            <div className="text-3xl font-extrabold text-forest-600">{pct}%</div>
          </div>
          <ProgressBar value={pct} className="mt-3" />
        </Card>

        {/* filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f.key ? "bg-forest-600 text-white shadow" : "bg-white text-neutral-500 border border-neutral-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* grid (discovered only) */}
        {list.length === 0 ? (
          <Card className="text-center py-10">
            <div className="w-12 h-12 mx-auto rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
              <FiCamera size={22} />
            </div>
            <p className="text-sm text-neutral-500 mt-2">まだ発見した生き物がいません。<br />撮影して図鑑をうめよう！</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {list.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                className="text-left rounded-2xl p-1.5 bg-white border border-neutral-100 shadow-soft active:scale-[0.96] transition-transform duration-200"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden">
                  <SpeciesImage speciesId={s.id} emoji={s.emoji} alt={s.nameJa} className="w-full h-full" rounded="rounded-xl" />
                  <span className={`absolute top-1.5 left-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full shadow ${rarityBadge(s.rarity)}`}>
                    {RARITY_LABEL[s.rarity]}
                  </span>
                  {s.invasive && (
                    <span className="absolute top-1.5 right-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-coral-500 text-white shadow">外来種</span>
                  )}
                </div>
                <div className="px-1 pt-2 pb-0.5">
                  <div className="font-semibold text-neutral-800 text-sm truncate">{s.nameJa}</div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[11px] text-neutral-400 truncate">{s.category}</span>
                    <span className="text-[11px] text-neutral-400">×{discoveries[s.id].count}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </Screen>

      {selected && discoveries[selected.id] && (
        <SpeciesDetailSheet species={selected} discovery={discoveries[selected.id]} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

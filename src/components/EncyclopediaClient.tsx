"use client";

import { useState } from "react";
import { SPECIES, RARITY_LABEL, ECOSYSTEM_LABEL } from "@/data/species";
import type { Species } from "@/lib/types";
import SpeciesImage from "@/components/SpeciesImage";
import { RARITY_THEME } from "@/lib/theme";
import { PageHero, Screen, Card } from "@/components/ui";
import { FiAlertTriangle } from "react-icons/fi";

type Filter = "all" | "terrestrial" | "freshwater" | "marine";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "terrestrial", label: "陸域" },
  { key: "freshwater", label: "淡水域" },
  { key: "marine", label: "海域" },
];

const rarityBadge = (r: string) =>
  RARITY_THEME[r as keyof typeof RARITY_THEME]?.chip ?? "bg-white/80 text-neutral-600";

export default function EncyclopediaClient({ counts }: { counts: Record<string, number> }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Species | null>(null);

  const discoveredCount = Object.keys(counts).length;
  const pct = Math.round((discoveredCount / SPECIES.length) * 100);
  const list = SPECIES.filter((s) => filter === "all" || s.ecosystem === filter);

  return (
    <div>
      <PageHero title="図鑑" subtitle="発見した生き物のコレクション" gradient="from-teal-500 to-forest-700" />
      <Screen>
        {/* progress */}
        <Card className="-mt-9 relative z-10">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-sm text-neutral-500">コレクション進捗</div>
              <div className="text-2xl font-extrabold text-neutral-800 mt-0.5">
                {discoveredCount}
                <span className="text-base font-bold text-neutral-400"> / {SPECIES.length} 種類</span>
              </div>
            </div>
            <div className="text-3xl font-extrabold text-aqua-600">{pct}%</div>
          </div>
          <div className="h-2.5 mt-3 bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-aqua-400 to-ocean-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </Card>

        {/* filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f.key ? "bg-aqua-600 text-white shadow" : "bg-white text-neutral-500 border border-neutral-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* grid */}
        <div className="grid grid-cols-2 gap-4">
          {list.map((s) => {
            const found = counts[s.id] > 0;
            return (
              <button
                key={s.id}
                onClick={() => found && setSelected(s)}
                className={`text-left rounded-2xl overflow-hidden border transition-all ${
                  found ? "bg-white border-neutral-100 shadow-soft active:scale-[0.98]" : "bg-neutral-100/60 border-dashed border-neutral-200"
                }`}
              >
                <div className="relative aspect-square">
                  {found ? (
                    <>
                      <SpeciesImage speciesId={s.id} emoji={s.emoji} alt={s.nameJa} className="w-full h-full" />
                      <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full shadow ${rarityBadge(s.rarity)}`}>
                        {RARITY_LABEL[s.rarity]}
                      </span>
                      {s.invasive && (
                        <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-coral-500 text-white shadow">
                          外来種
                        </span>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300 text-3xl">？？？</div>
                  )}
                </div>
                {found ? (
                  <div className="p-3">
                    <div className="font-semibold text-neutral-800 text-sm truncate">{s.nameJa}</div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[11px] text-neutral-400 truncate">{s.category}</span>
                      <span className="text-[11px] text-neutral-400">×{counts[s.id]}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 text-sm text-neutral-300 font-medium">未発見</div>
                )}
              </button>
            );
          })}
        </div>
      </Screen>

      {/* detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-56">
              <SpeciesImage speciesId={selected.id} emoji={selected.emoji} alt={selected.nameJa} className="w-full h-full" />
              <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full shadow ${rarityBadge(selected.rarity)}`}>
                {RARITY_LABEL[selected.rarity]}
              </span>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold text-neutral-900">{selected.nameJa}</h2>
              <p className="text-sm italic text-neutral-400">{selected.nameSci}</p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <Field label="生態系" value={ECOSYSTEM_LABEL[selected.ecosystem]} />
                <Field label="分類" value={selected.category} />
                <Field label="栄養段階" value={`Lv.${selected.trophicLevel}`} />
                <Field label="観察回数" value={`${counts[selected.id]} 回`} />
              </dl>
              {selected.invasive && (
                <div className="mt-3 text-sm text-coral-600 bg-coral-100 rounded-lg px-3 py-2 flex items-center gap-2"><FiAlertTriangle size={15} /> 外来種 — 発見時は報告にご協力ください</div>
              )}
              <button onClick={() => setSelected(null)} className="w-full mt-5 bg-neutral-800 hover:bg-neutral-900 text-white font-bold rounded-xl py-3 transition-colors">
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-neutral-50 rounded-xl px-3 py-2">
      <dt className="text-[11px] text-neutral-400">{label}</dt>
      <dd className="font-semibold text-neutral-700">{value}</dd>
    </div>
  );
}

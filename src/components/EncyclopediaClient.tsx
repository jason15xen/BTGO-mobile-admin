"use client";

import { useEffect, useState } from "react";
import { FiCamera } from "react-icons/fi";
import { LuBookOpen, LuNotebookPen } from "react-icons/lu";
import { SPECIES, RARITY_LABEL, SPECIES_BY_ID } from "@/data/species";
import type { Species } from "@/lib/types";
import type { Discovery } from "@/lib/game";
import type { DiaryEntry } from "@/lib/types";
import { fetchDiary } from "@/lib/gameApi";
import SpeciesImage from "@/components/SpeciesImage";
import SpeciesDetailSheet from "@/components/SpeciesDetailSheet";
import { RARITY_THEME } from "@/lib/theme";
import { PageHero, Screen, Card, ProgressBar } from "@/components/ui";

type View = "collection" | "diary";
type Filter = "all" | "terrestrial" | "freshwater" | "marine";

const fmtDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
};

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "terrestrial", label: "陸域" },
  { key: "freshwater", label: "淡水域" },
  { key: "marine", label: "海域" },
];

const rarityBadge = (r: string) =>
  RARITY_THEME[r as keyof typeof RARITY_THEME]?.chip ?? "bg-white/80 text-neutral-600";

export default function EncyclopediaClient({
  userId,
  discoveries,
}: {
  userId: string;
  discoveries: Record<string, Discovery>;
}) {
  const [view, setView] = useState<View>("collection");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Species | null>(null);
  const [diary, setDiary] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    if (view !== "diary") return;
    fetchDiary().then(setDiary);
  }, [userId, view]);

  const discoveredCount = Object.keys(discoveries).length;
  const pct = Math.round((discoveredCount / SPECIES.length) * 100);

  // Only species the user has actually discovered.
  const list = SPECIES.filter(
    (s) => discoveries[s.id] && (filter === "all" || s.ecosystem === filter)
  );

  return (
    <div className="min-h-full bg-forest-50">
      <PageHero
        title="図鑑"
        subtitle={view === "collection" ? "発見した生き物のコレクション" : "撮影した記録"}
        gradient="from-forest-500 to-forest-700"
      />
      <Screen>
        <div className="relative z-10 -mt-6 flex gap-1 rounded-2xl bg-white p-1 float3d">
          <button
            onClick={() => setView("collection")}
            className={`flex-1 h-10 rounded-xl flex items-center justify-center gap-1.5 text-sm font-semibold ${
              view === "collection" ? "bg-forest-100 text-forest-800" : "text-neutral-500"
            }`}
          >
            <LuBookOpen size={15} /> 図鑑
          </button>
          <button
            onClick={() => setView("diary")}
            className={`flex-1 h-10 rounded-xl flex items-center justify-center gap-1.5 text-sm font-semibold ${
              view === "diary" ? "bg-forest-100 text-forest-800" : "text-neutral-500"
            }`}
          >
            <LuNotebookPen size={15} /> 日記
          </button>
        </div>

        {view === "diary" ? (
          <DiaryList entries={diary} />
        ) : (
        <>
        <Card className="relative z-10">
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
        </>
        )}
      </Screen>

      {selected && discoveries[selected.id] && (
        <SpeciesDetailSheet species={selected} discovery={discoveries[selected.id]} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function DiaryList({ entries }: { entries: DiaryEntry[] }) {
  if (entries.length === 0) {
    return (
      <Card className="text-center py-12">
        <div className="w-12 h-12 mx-auto rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
          <LuNotebookPen size={22} />
        </div>
        <p className="text-sm text-neutral-500 mt-2">まだ日記がありません。<br />撮影するとここに記録されます。</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((e) => {
        const sp = SPECIES_BY_ID[e.speciesId];
        return (
          <Card key={e.id} className="!p-3 flex gap-3">
            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-neutral-100">
              {e.photoData ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={e.photoData} alt={sp?.nameJa ?? ""} className="w-full h-full object-cover" />
              ) : (
                <SpeciesImage speciesId={e.speciesId} emoji={sp?.emoji ?? "❓"} alt={sp?.nameJa ?? ""} className="w-full h-full" rounded="rounded-xl" />
              )}
            </div>
            <div className="flex-1 min-w-0 py-0.5">
              <div className="font-bold text-neutral-800 truncate">{sp?.nameJa ?? "不明"}</div>
              <div className="text-xs italic text-neutral-400 truncate">{sp?.nameSci}</div>
              <div className="text-xs text-neutral-500 mt-2">{fmtDateTime(e.observedAt)}</div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

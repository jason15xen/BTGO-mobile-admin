import Link from "next/link";
import type { IconType } from "react-icons";
import { FiCamera } from "react-icons/fi";
import { LuTrees, LuDroplet, LuWaves, LuSparkles } from "react-icons/lu";
import SpeciesImage from "@/components/SpeciesImage";
import UserGreeting from "@/components/UserGreeting";
import { readObservations } from "@/lib/dataStore";
import { computeUserStats } from "@/lib/game";
import { SPECIES, SPECIES_BY_ID } from "@/data/species";
import type { Ecosystem } from "@/lib/types";

export const dynamic = "force-dynamic";

const ECOS: { key: Ecosystem; label: string; Icon: IconType; bar: string; text: string }[] = [
  { key: "terrestrial", label: "陸域", Icon: LuTrees, bar: "bg-forest-500", text: "text-forest-600" },
  { key: "freshwater", label: "淡水域", Icon: LuDroplet, bar: "bg-teal-500", text: "text-teal-600" },
  { key: "marine", label: "海域", Icon: LuWaves, bar: "bg-lime-500", text: "text-lime-600" },
];

export default async function HomePage() {
  const obs = await readObservations();
  const stats = computeUserStats(obs);

  const discoveredByEco = new Map<string, Set<string>>();
  for (const o of obs) {
    const sp = SPECIES_BY_ID[o.speciesId];
    if (!sp) continue;
    if (!discoveredByEco.has(sp.ecosystem)) discoveredByEco.set(sp.ecosystem, new Set());
    discoveredByEco.get(sp.ecosystem)!.add(sp.id);
  }
  const totalByEco = new Map<string, number>();
  for (const s of SPECIES) totalByEco.set(s.ecosystem, (totalByEco.get(s.ecosystem) ?? 0) + 1);

  const overallHealth = Math.round((new Set(obs.map((o) => o.speciesId)).size / SPECIES.length) * 100);
  const latestDate = obs[0]?.observedAt.slice(0, 10);
  const todaySpecies = new Set(obs.filter((o) => o.observedAt.slice(0, 10) === latestDate).map((o) => o.speciesId)).size;
  const rare = SPECIES.find((s) => s.rarity === "legendary") ?? SPECIES[0];

  return (
    <div className="pb-2">
      {/* Gradient hero */}
      <section className="relative bg-gradient-to-br from-forest-500 via-forest-600 to-teal-700 px-5 pt-6 pb-16 overflow-hidden">
        <div className="absolute -top-12 -right-10 w-52 h-52 rounded-full bg-lime-400/20 blur-3xl" />
        <div className="relative text-white">
          <p className="text-sm text-white/75"><UserGreeting /></p>
          <h1 className="text-2xl font-bold mt-1 leading-snug">富士の自然を、探しにいこう。</h1>
          <div className="mt-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="bg-lime-400 text-forest-900 text-[11px] font-bold rounded-full px-2.5 py-1">Lv.{stats.level}</span>
              <span className="font-semibold text-sm">{stats.title}</span>
            </span>
            <span className="text-xs text-white/70">{stats.xpInLevel} / {stats.xpForLevel} XP</span>
          </div>
          <div className="h-2 mt-2 bg-black/15 rounded-full overflow-hidden">
            <div className="h-full bg-lime-400 rounded-full" style={{ width: `${(stats.xpInLevel / stats.xpForLevel) * 100}%` }} />
          </div>
        </div>
      </section>

      <div className="px-5 -mt-10 relative z-10 space-y-4">
        {/* Primary CTA */}
        <Link href="/capture" className="flex items-center gap-4 bg-white rounded-3xl border border-neutral-200/60 shadow-soft p-4 active:scale-[0.99] transition-transform">
          <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-forest-500 to-teal-600 flex items-center justify-center shadow-glow shrink-0 text-white">
            <FiCamera size={26} />
          </span>
          <div className="flex-1">
            <div className="font-bold text-neutral-900 text-[17px]">生き物を見つける</div>
            <div className="text-xs text-neutral-400 mt-0.5">カメラで撮影 → AIが種を判定</div>
          </div>
          <span className="text-forest-500 text-2xl">›</span>
        </Link>

        {/* Colorful stat tiles */}
        <div className="grid grid-cols-3 gap-3">
          <Tile value={todaySpecies} unit="種" label="今日の発見" bg="bg-forest-50" num="text-forest-600" />
          <Tile value={stats.speciesCount} unit="種" label="登録種数" bg="bg-teal-50" num="text-teal-600" />
          <Tile value={overallHealth} unit="%" label="健康度" bg="bg-lime-50" num="text-lime-600" />
        </div>

        {/* Ecosystem health */}
        <section className="bg-white rounded-3xl border border-neutral-200/60 shadow-soft p-5">
          <h2 className="font-semibold text-neutral-800 mb-4">エコシステムの健康度</h2>
          <div className="space-y-3.5">
            {ECOS.map((e) => {
              const pct = Math.round(((discoveredByEco.get(e.key)?.size ?? 0) / (totalByEco.get(e.key) ?? 1)) * 100);
              return (
                <div key={e.key} className="flex items-center gap-3">
                  <span className="w-20 text-sm text-neutral-500 flex items-center gap-1.5"><e.Icon className={e.text} size={15} /> {e.label}</span>
                  <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${e.bar}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className={`w-9 text-right text-sm font-bold ${e.text}`}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Rare alert */}
        <section className="relative overflow-hidden bg-gradient-to-r from-gold-400 to-gold-500 rounded-3xl shadow-soft p-4 flex items-center gap-4 text-white">
          <SpeciesImage speciesId={rare.id} emoji={rare.emoji} alt={rare.nameJa} className="w-16 h-16" rounded="rounded-2xl ring-2 ring-white/50" />
          <div className="flex-1">
            <div className="text-[11px] font-bold text-white/90 flex items-center gap-1"><LuSparkles size={12} /> レアアラート</div>
            <div className="text-[17px] font-bold leading-tight mt-0.5">{rare.nameJa}</div>
            <div className="text-xs text-white/85">が近くに出現中</div>
          </div>
          <Link href="/capture" className="text-sm font-bold bg-white/20 rounded-full px-3 py-1.5">探す</Link>
        </section>
      </div>
    </div>
  );
}

function Tile({ value, unit, label, bg, num }: { value: number; unit: string; label: string; bg: string; num: string }) {
  return (
    <div className={`${bg} rounded-2xl p-3.5`}>
      <div className={`text-[26px] font-bold leading-none ${num}`}>
        {value}
        <span className="text-xs font-semibold opacity-60 ml-0.5">{unit}</span>
      </div>
      <div className="text-[11px] text-neutral-500 mt-2">{label}</div>
    </div>
  );
}

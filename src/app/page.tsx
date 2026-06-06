import Link from "next/link";
import { FiCamera } from "react-icons/fi";
import { LuLeaf, LuSparkles } from "react-icons/lu";
import SpeciesImage from "@/components/SpeciesImage";
import UserGreeting from "@/components/UserGreeting";
import { readObservations } from "@/lib/dataStore";
import { computeUserStats } from "@/lib/game";
import { SPECIES } from "@/data/species";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const obs = await readObservations();
  const stats = computeUserStats(obs);

  const overallHealth = Math.round((new Set(obs.map((o) => o.speciesId)).size / SPECIES.length) * 100);
  const healthLabel = overallHealth >= 70 ? "良好" : overallHealth >= 40 ? "ふつう" : "要観察";
  const latestDate = obs[0]?.observedAt.slice(0, 10);
  const todaySpecies = new Set(obs.filter((o) => o.observedAt.slice(0, 10) === latestDate).map((o) => o.speciesId)).size;
  const rare = SPECIES.find((s) => s.rarity === "legendary") ?? SPECIES[0];

  return (
    <div className="px-5 pt-5 pb-6 space-y-5">
      {/* Greeting + headline */}
      <header>
        <p className="text-sm text-forest-500"><UserGreeting /></p>
        <h1 className="text-[27px] leading-snug font-extrabold tracking-tight text-forest-800 mt-1">
          富士の自然探索へ<br />出かけよう！
        </h1>
      </header>

      {/* Level */}
      <section>
        <div className="flex items-center gap-2">
          <span className="bg-forest-600 text-white text-[11px] font-bold rounded-full px-2.5 py-0.5">Lv.{stats.level}</span>
          <span className="font-semibold text-forest-800 text-sm">{stats.title}</span>
          <span className="ml-auto text-xs text-neutral-400">{stats.xpInLevel} / {stats.xpForLevel} XP</span>
        </div>
        <div className="h-2.5 mt-2 bg-neutral-200/70 rounded-full overflow-hidden well3d">
          <div className="h-full bg-forest-500 rounded-full" style={{ width: `${(stats.xpInLevel / stats.xpForLevel) * 100}%` }} />
        </div>
      </section>

      {/* Ecosystem health */}
      <section>
        <div className="text-sm font-semibold text-forest-700">エコシステムの健康度</div>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-3xl font-extrabold text-forest-600">{overallHealth}%</span>
          <span className="text-sm font-semibold text-forest-500">{healthLabel}</span>
        </div>
        <div className="h-2 mt-1.5 bg-neutral-200/70 rounded-full overflow-hidden well3d">
          <div className="h-full bg-gradient-to-r from-forest-400 to-forest-600 rounded-full" style={{ width: `${overallHealth}%` }} />
        </div>
      </section>

      {/* Hero photo + capture */}
      <Link href="/capture" className="block relative rounded-3xl overflow-hidden h-56 shadow-soft active:scale-[0.99] transition-transform">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/eco/fuji.webp" alt="富士山" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5">
          <span className="w-[68px] h-[68px] rounded-full bg-forest-600 ring-4 ring-white/40 flex items-center justify-center text-white shadow-glow">
            <FiCamera size={30} />
          </span>
          <span className="text-white font-bold text-lg drop-shadow">生き物を見つける</span>
        </div>
      </Link>

      {/* Two info cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card3d rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">今日の発見</span>
            <LuLeaf size={15} className="text-forest-500" />
          </div>
          <div className="text-[26px] font-extrabold text-forest-700 leading-none mt-1.5">
            {todaySpecies}<span className="text-sm font-bold text-neutral-400 ml-1">種類</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1.5">みんなの発見</div>
        </div>

        <Link href="/capture" className="card3d rounded-2xl p-4">
          <div className="text-xs font-semibold text-gold-600 flex items-center gap-1"><LuSparkles size={12} /> レアアラート</div>
          <div className="flex items-center gap-2 mt-1.5">
            <SpeciesImage speciesId={rare.id} emoji={rare.emoji} alt={rare.nameJa} className="w-10 h-10 shrink-0" rounded="rounded-lg" />
            <div className="min-w-0">
              <div className="text-sm font-bold text-neutral-800 leading-tight truncate">{rare.nameJa}</div>
              <div className="text-[11px] text-neutral-400">が出没しています！</div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

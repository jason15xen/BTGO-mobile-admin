import CaptureLink from "@/components/CaptureLink";
import { FiCamera } from "react-icons/fi";
import { LuLeaf } from "react-icons/lu";
import HomeRareAlert from "@/components/HomeRareAlert";
import UserGreeting from "@/components/UserGreeting";
import { ProgressBar } from "@/components/ui";
import { readObservations } from "@/lib/dataStore";
import { computeUserStats } from "@/lib/game";
import { getGuestProfile } from "@/lib/guestStore";
import { SPECIES } from "@/data/species";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = getGuestProfile();
  const obs = await readObservations();
  const stats = computeUserStats(obs, user.id);

  const latestDate = obs[0]?.observedAt.slice(0, 10);
  const todaySpecies = new Set(obs.filter((o) => o.observedAt.slice(0, 10) === latestDate).map((o) => o.speciesId)).size;
  const rare = SPECIES.find((s) => s.rarity === "legendary") ?? SPECIES[0];
  const rareObs = obs.find((o) => o.speciesId === rare.id);
  const rareNews = {
    speciesId: rare.id,
    nameJa: rare.nameJa,
    nameSci: rare.nameSci,
    emoji: rare.emoji,
    area: rareObs?.area ?? "富士山麓",
    observedAt: rareObs?.observedAt ?? obs[0]?.observedAt ?? new Date().toISOString(),
  };

  return (
    <div className="flex flex-col min-h-full px-5 pt-5 pb-5 gap-4">
      <header className="opacity-0-start animate-fadeUp">
        <p className="text-sm text-forest-500">
          <UserGreeting initialName={user.name} />
        </p>
        <h1 className="text-[27px] leading-snug font-extrabold tracking-tight text-forest-800 mt-1">
          富士の自然探索へ<br />出かけよう！
        </h1>
      </header>

      <section className="opacity-0-start animate-fadeUp stagger-1">
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-b from-forest-500 to-forest-700 text-white text-[11px] font-bold rounded-full px-2.5 py-0.5 badge3d">Lv.{stats.level}</span>
            <span className="font-semibold text-forest-800 text-sm">{stats.title}</span>
            <span className="ml-auto text-xs text-neutral-400">{stats.xpInLevel} / {stats.xpForLevel} XP</span>
          </div>
          <ProgressBar value={stats.xpInLevel} max={stats.xpForLevel} shimmer className="mt-2" />
        </section>

      <section className="relative flex flex-1 flex-col min-h-0 rounded-3xl overflow-hidden opacity-0-start animate-scaleIn stagger-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/eco/terrestrial.webp" alt="" className="absolute inset-0 w-full h-full object-cover object-center" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" aria-hidden />

        <div className="relative flex flex-1 flex-col items-center justify-center gap-2.5 py-8">
          <CaptureLink
            aria-label="生き物を見つける"
            className="w-[68px] h-[68px] rounded-full bg-gradient-to-b from-forest-500 to-forest-700 ring-4 ring-white/50 flex items-center justify-center text-white orb3d animate-float celebrate-ring active:scale-90 transition-transform"
          >
            <FiCamera size={30} className="animate-bounceSoft" />
          </CaptureLink>
          <span className="text-white font-bold text-lg drop-shadow pointer-events-none select-none animate-fadeIn stagger-3">生き物を見つける</span>
        </div>

        <div className="relative grid grid-cols-2 gap-3 p-4">
          <div className="card3d rounded-2xl px-3.5 py-3 opacity-0-start animate-fadeUp stagger-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">今日の発見</span>
              <LuLeaf size={15} className="text-forest-500" />
            </div>
            <div className="text-[26px] font-extrabold text-forest-700 leading-none mt-1">
              {todaySpecies}<span className="text-sm font-bold text-neutral-400 ml-1">種類</span>
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">みんなの発見</div>
          </div>

          <HomeRareAlert news={rareNews} />
        </div>
      </section>
    </div>
  );
}

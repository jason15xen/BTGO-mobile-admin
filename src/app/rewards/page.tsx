import { readObservations } from "@/lib/dataStore";
import { computeUserStats, myObservations, rewardFor } from "@/lib/game";
import { SPECIES_BY_ID } from "@/data/species";
import RewardsClient from "@/components/RewardsClient";

export const dynamic = "force-dynamic";

export default async function RewardsPage() {
  const obs = await readObservations();
  const stats = computeUserStats(obs);
  const mine = myObservations(obs);

  const recent = mine.slice(0, 6).map((o) => {
    const sp = SPECIES_BY_ID[o.speciesId];
    return {
      id: o.speciesId,
      name: sp?.nameJa ?? "不明",
      emoji: sp?.emoji ?? "❓",
      xp: sp ? rewardFor(sp).xp : 0,
      date: o.observedAt.slice(0, 10),
    };
  });

  return <RewardsClient stats={stats} recent={recent} />;
}

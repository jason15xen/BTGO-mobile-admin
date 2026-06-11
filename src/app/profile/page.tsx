import { readObservations } from "@/lib/dataStore";
import { computeUserStats, myObservations, rewardFor } from "@/lib/game";
import { getGuestProfile } from "@/lib/guestStore";
import { pyramidSummary } from "@/lib/pyramidSummary";
import { SPECIES_BY_ID, PYRAMID_TOTAL } from "@/data/species";
import ProfileClient from "@/components/ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = getGuestProfile();
  const obs = await readObservations();
  const stats = computeUserStats(obs, user.id);
  const mine = myObservations(obs, user.id);
  const discovered = [...new Set(mine.map((o) => o.speciesId))];
  const pyramid = pyramidSummary(discovered, PYRAMID_TOTAL);

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

  return (
    <ProfileClient
      initialProfile={user}
      stats={stats}
      recent={recent}
      pyramid={pyramid}
    />
  );
}

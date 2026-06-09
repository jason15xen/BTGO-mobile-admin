import { readObservations } from "@/lib/dataStore";
import { getCurrentUser, resolveUserId } from "@/lib/auth";
import { computeUserStats, myObservations, rewardFor } from "@/lib/game";
import { SPECIES_BY_ID } from "@/data/species";
import ProfileClient from "@/components/ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const userId = resolveUserId(user);
  const obs = await readObservations();
  const stats = computeUserStats(obs, userId);
  const mine = myObservations(obs, userId);

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

  return <ProfileClient user={user} stats={stats} recent={recent} />;
}

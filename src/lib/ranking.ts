import { SPECIES_BY_ID } from "@/data/species";
import { rewardFor } from "@/lib/game";
import type { Observation } from "@/lib/types";

export interface RankEntry {
  rank: number;
  userId: string;
  userName: string;
  score: number;
  speciesCount: number;
  captureCount: number;
}

/** PoC overall ranking — current calendar month, scored by B-mile equivalent. */
export function monthlyRanking(allObs: Observation[], month = new Date()): RankEntry[] {
  const prefix = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
  const monthObs = allObs.filter((o) => o.observedAt.startsWith(prefix));

  const byUser = new Map<string, { name: string; score: number; species: Set<string>; count: number }>();

  for (const o of monthObs) {
    const sp = SPECIES_BY_ID[o.speciesId];
    if (!sp) continue;
    const cur = byUser.get(o.userId) ?? { name: o.userName, score: 0, species: new Set<string>(), count: 0 };
    cur.score += rewardFor(sp).points;
    cur.species.add(o.speciesId);
    cur.count++;
    byUser.set(o.userId, cur);
  }

  return [...byUser.entries()]
    .map(([userId, v]) => ({
      rank: 0,
      userId,
      userName: v.name,
      score: v.score,
      speciesCount: v.species.size,
      captureCount: v.count,
    }))
    .sort((a, b) => b.score - a.score || b.speciesCount - a.speciesCount)
    .map((e, i) => ({ ...e, rank: i + 1 }));
}

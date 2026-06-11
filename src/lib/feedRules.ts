import { SPECIES } from "@/data/species";
import type { Ecosystem, FeedItem, Species } from "@/lib/types";

export function validPredatorsForFeed(feed: FeedItem, discovered: Set<string>): Species[] {
  return SPECIES.filter(
    (s) =>
      s.ecosystem === feed.ecosystem &&
      s.trophicLevel === feed.trophicLevel + 1 &&
      discovered.has(s.id),
  );
}

export function invasiveForEcosystem(
  speciesIds: Set<string>,
  discovered: Set<string>,
  eco: Ecosystem,
): boolean {
  return [...speciesIds].some((id) => {
    if (!discovered.has(id)) return false;
    const sp = SPECIES.find((s) => s.id === id);
    return sp?.invasive && sp.ecosystem === eco;
  });
}

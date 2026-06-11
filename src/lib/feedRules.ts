import { SPECIES } from "@/data/species";
import type { Ecosystem, FeedItem, Species } from "@/lib/types";

/**
 * Targets that can eat a piece of food. Food is generic (a single type), so
 * ANY discovered creature — any ecosystem, any trophic level — can eat it.
 */
export function validPredatorsForFeed(_feed: FeedItem, discovered: Set<string>): Species[] {
  return SPECIES.filter((s) => discovered.has(s.id));
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

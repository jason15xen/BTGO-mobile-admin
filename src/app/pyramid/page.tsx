import { readObservations } from "@/lib/dataStore";
import { myObservations } from "@/lib/game";
import { SPECIES } from "@/data/species";
import PyramidClient from "@/components/PyramidClient";

export const dynamic = "force-dynamic";

export default async function PyramidPage() {
  const obs = await readObservations();
  const mine = myObservations(obs);
  const discovered = Array.from(new Set(mine.map((o) => o.speciesId)));

  // Per-ecosystem completion (user's discovered species / total).
  const totals = { terrestrial: 0, freshwater: 0, marine: 0 } as Record<string, number>;
  for (const s of SPECIES) totals[s.ecosystem]++;

  return <PyramidClient discovered={discovered} totals={totals} />;
}

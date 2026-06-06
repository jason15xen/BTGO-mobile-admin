import { readObservations } from "@/lib/dataStore";
import { discoveriesByUser } from "@/lib/game";
import { SPECIES } from "@/data/species";
import PyramidClient from "@/components/PyramidClient";

export const dynamic = "force-dynamic";

export default async function PyramidPage() {
  const obs = await readObservations();
  const discoveries = discoveriesByUser(obs);
  const discovered = Object.keys(discoveries);

  // Per-ecosystem completion (user's discovered species / total).
  const totals = { terrestrial: 0, freshwater: 0, marine: 0 } as Record<string, number>;
  for (const s of SPECIES) totals[s.ecosystem]++;

  return <PyramidClient discovered={discovered} totals={totals} discoveries={discoveries} />;
}

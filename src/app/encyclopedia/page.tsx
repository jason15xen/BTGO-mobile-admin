import { readObservations } from "@/lib/dataStore";
import { myObservations } from "@/lib/game";
import EncyclopediaClient from "@/components/EncyclopediaClient";

export const dynamic = "force-dynamic";

export default async function EncyclopediaPage() {
  const obs = await readObservations();
  const mine = myObservations(obs);

  // count per species for the demo user
  const counts: Record<string, number> = {};
  for (const o of mine) counts[o.speciesId] = (counts[o.speciesId] ?? 0) + 1;

  return <EncyclopediaClient counts={counts} />;
}

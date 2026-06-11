import { readObservations } from "@/lib/dataStore";
import { DEMO_USER, discoveriesByUser } from "@/lib/game";
import { PYRAMID_TOTAL } from "@/data/species";
import PyramidClient from "@/components/PyramidClient";

export const dynamic = "force-dynamic";

export default async function PyramidPage() {
  const obs = await readObservations();
  const discoveries = discoveriesByUser(obs, DEMO_USER.id);
  const discovered = Object.keys(discoveries);

  const totals = {
    terrestrial: PYRAMID_TOTAL,
    freshwater: PYRAMID_TOTAL,
    marine: PYRAMID_TOTAL,
  };

  return <PyramidClient userId={DEMO_USER.id} discovered={discovered} totals={totals} discoveries={discoveries} />;
}

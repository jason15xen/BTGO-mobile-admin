import { getCurrentUser, resolveUserId } from "@/lib/auth";
import { readObservations } from "@/lib/dataStore";
import { discoveriesByUser } from "@/lib/game";
import { PYRAMID_TOTAL } from "@/data/species";
import PyramidClient from "@/components/PyramidClient";

export const dynamic = "force-dynamic";

export default async function PyramidPage() {
  const user = await getCurrentUser();
  const userId = resolveUserId(user);
  const obs = await readObservations();
  const discoveries = discoveriesByUser(obs, userId);
  const discovered = Object.keys(discoveries);

  const totals = {
    terrestrial: PYRAMID_TOTAL,
    freshwater: PYRAMID_TOTAL,
    marine: PYRAMID_TOTAL,
  };

  return <PyramidClient userId={userId} discovered={discovered} totals={totals} discoveries={discoveries} />;
}

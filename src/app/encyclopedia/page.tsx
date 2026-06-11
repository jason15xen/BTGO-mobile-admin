import { readObservations } from "@/lib/dataStore";
import { DEMO_USER, discoveriesByUser } from "@/lib/game";
import EncyclopediaClient from "@/components/EncyclopediaClient";

export const dynamic = "force-dynamic";

export default async function EncyclopediaPage() {
  const obs = await readObservations();
  const discoveries = discoveriesByUser(obs, DEMO_USER.id);
  return <EncyclopediaClient userId={DEMO_USER.id} discoveries={discoveries} />;
}

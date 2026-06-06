import { readObservations } from "@/lib/dataStore";
import { discoveriesByUser } from "@/lib/game";
import EncyclopediaClient from "@/components/EncyclopediaClient";

export const dynamic = "force-dynamic";

export default async function EncyclopediaPage() {
  const obs = await readObservations();
  const discoveries = discoveriesByUser(obs);
  return <EncyclopediaClient discoveries={discoveries} />;
}

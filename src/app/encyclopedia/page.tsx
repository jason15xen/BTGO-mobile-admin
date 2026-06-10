import { getCurrentUser, resolveUserId } from "@/lib/auth";
import { readObservations } from "@/lib/dataStore";
import { discoveriesByUser } from "@/lib/game";
import EncyclopediaClient from "@/components/EncyclopediaClient";

export const dynamic = "force-dynamic";

export default async function EncyclopediaPage() {
  const user = await getCurrentUser();
  const obs = await readObservations();
  const discoveries = discoveriesByUser(obs, resolveUserId(user));
  return <EncyclopediaClient userId={resolveUserId(user)} discoveries={discoveries} />;
}

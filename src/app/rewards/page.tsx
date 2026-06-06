import { readObservations } from "@/lib/dataStore";
import { computeUserStats } from "@/lib/game";
import RewardsClient from "@/components/RewardsClient";

export const dynamic = "force-dynamic";

export default async function RewardsPage() {
  const obs = await readObservations();
  const stats = computeUserStats(obs);
  return <RewardsClient stats={stats} />;
}

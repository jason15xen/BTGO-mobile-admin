import { readObservations } from "@/lib/dataStore";
import { DEMO_USER, computeUserStats } from "@/lib/game";
import RewardsClient from "@/components/RewardsClient";

export const dynamic = "force-dynamic";

export default async function RewardsPage() {
  const obs = await readObservations();
  const stats = computeUserStats(obs, DEMO_USER.id);
  return <RewardsClient stats={stats} />;
}

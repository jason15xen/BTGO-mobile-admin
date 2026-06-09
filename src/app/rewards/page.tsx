import { getCurrentUser, resolveUserId } from "@/lib/auth";
import { readObservations } from "@/lib/dataStore";
import { computeUserStats } from "@/lib/game";
import RewardsClient from "@/components/RewardsClient";

export const dynamic = "force-dynamic";

export default async function RewardsPage() {
  const user = await getCurrentUser();
  const obs = await readObservations();
  const stats = computeUserStats(obs, resolveUserId(user));
  return <RewardsClient stats={stats} />;
}

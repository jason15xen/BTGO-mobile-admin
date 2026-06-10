import { getCurrentUser, resolveUserId } from "@/lib/auth";
import { readObservations } from "@/lib/dataStore";
import { monthlyRanking } from "@/lib/ranking";
import RankingClient from "@/components/RankingClient";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const user = await getCurrentUser();
  const userId = resolveUserId(user);
  const obs = await readObservations();
  const entries = monthlyRanking(obs);
  return <RankingClient entries={entries} myUserId={userId} />;
}

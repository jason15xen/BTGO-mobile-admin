import { readObservations } from "@/lib/dataStore";
import { DEMO_USER } from "@/lib/game";
import { monthlyRanking } from "@/lib/ranking";
import RankingClient from "@/components/RankingClient";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const obs = await readObservations();
  const entries = monthlyRanking(obs);
  return <RankingClient entries={entries} myUserId={DEMO_USER.id} />;
}

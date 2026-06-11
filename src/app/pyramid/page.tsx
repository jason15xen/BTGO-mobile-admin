import { getDemoDiscoveredIds, getDemoPyramidLevel } from "@/lib/demoState";
import { DEMO_USER, type Discovery } from "@/lib/game";
import { PYRAMID_TOTAL } from "@/data/species";
import PyramidClient from "@/components/PyramidClient";

export const dynamic = "force-dynamic";

export default async function PyramidPage() {
  const discovered = getDemoDiscoveredIds();
  const discoveries: Record<string, Discovery> = {};
  for (const id of discovered) {
    discoveries[id] = {
      count: 1,
      firstFound: new Date().toISOString(),
      area: "デモ",
      lat: 35.36,
      lng: 138.73,
    };
  }

  const totals = {
    terrestrial: PYRAMID_TOTAL,
    freshwater: PYRAMID_TOTAL,
    marine: PYRAMID_TOTAL,
  };

  return (
    <PyramidClient
      userId={DEMO_USER.id}
      discovered={discovered}
      totals={totals}
      discoveries={discoveries}
      demoPyramidLevel={getDemoPyramidLevel()}
    />
  );
}

import { NextResponse } from "next/server";
import { readObservations } from "@/lib/dataStore";
import { DEMO_USER } from "@/lib/game";
import { getGameState } from "@/lib/gameStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const obs = await readObservations();
    const discovered = obs
      .filter((o) => o.userId === DEMO_USER.id)
      .map((o) => o.speciesId);
    return NextResponse.json(getGameState(discovered));
  } catch (e) {
    return NextResponse.json(
      {
        error: "game_state_failed",
        message: e instanceof Error ? e.message : String(e),
        feeds: [],
        pwMap: {},
        activeIds: [],
        invasive: { terrestrial: false, freshwater: false, marine: false },
      },
      { status: 500 },
    );
  }
}

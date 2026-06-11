import { NextResponse } from "next/server";
import { getGameState } from "@/lib/gameStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(getGameState([]));
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

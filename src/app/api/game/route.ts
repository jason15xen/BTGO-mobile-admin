import { NextResponse } from "next/server";
import { syncDemoStep } from "@/lib/demoState";
import { getGameState } from "@/lib/gameStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    syncDemoStep(Number(new URL(req.url).searchParams.get("step") ?? 0));
    return NextResponse.json(getGameState([]), {
      headers: { "Cache-Control": "no-store" },
    });
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

import { NextResponse } from "next/server";
import {
  getDemoCaptureStep,
  getDemoDiscoveredIds,
  getDemoPyramidLevel,
  getNextScriptedCapture,
  getPyramidFilledMap,
} from "@/lib/demoState";
import { DEMO_CAPTURE_SCRIPT } from "@/lib/demoScript";
import { getGameState } from "@/lib/gameStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Single snapshot of demo script + game state (avoids inconsistent reads). */
export async function GET() {
  try {
    const step = getDemoCaptureStep();
    const next = getNextScriptedCapture();
    return NextResponse.json(
      {
        discovered: getDemoDiscoveredIds(),
        pyramidFill: getPyramidFilledMap(),
        pyramidLevel: getDemoPyramidLevel(),
        captureStep: step,
        nextCapture: next,
        capturesRemaining: next ? DEMO_CAPTURE_SCRIPT.length - step : 0,
        game: getGameState([]),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return NextResponse.json(
      { error: "demo_state_failed", message: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}

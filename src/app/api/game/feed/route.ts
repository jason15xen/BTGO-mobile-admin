import { NextResponse } from "next/server";
import { getDemoDiscoveredIds, syncDemoStep } from "@/lib/demoState";
import { feedToTarget } from "@/lib/gameStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { feedId, targetSpeciesId, captureStep } = await req.json();
    syncDemoStep(Number(captureStep ?? 0));
    if (!feedId || typeof feedId !== "string") {
      return NextResponse.json({ ok: false, reason: "error" }, { status: 400 });
    }
    if (!targetSpeciesId || typeof targetSpeciesId !== "string") {
      return NextResponse.json({ ok: false, reason: "invalid-target" }, { status: 400 });
    }

    const discovered = new Set(getDemoDiscoveredIds());

    const result = feedToTarget(feedId, targetSpeciesId, discovered);
    if (result === "no-predator") {
      return NextResponse.json({ ok: false, reason: "no-predator" });
    }
    if (result === "invalid-target") {
      return NextResponse.json({ ok: false, reason: "invalid-target" });
    }
    if (result === "no-food") {
      return NextResponse.json({ ok: false, reason: "no-food" });
    }
    if (!result) {
      return NextResponse.json({ ok: false, reason: "not-found" });
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json(
      { ok: false, reason: "error", message: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}

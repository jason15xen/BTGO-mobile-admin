import { NextResponse } from "next/server";
import { readObservations } from "@/lib/dataStore";
import { DEMO_USER } from "@/lib/game";
import { feedToTarget } from "@/lib/gameStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { feedId, targetSpeciesId } = await req.json();
    if (!feedId || typeof feedId !== "string") {
      return NextResponse.json({ ok: false, reason: "error" }, { status: 400 });
    }
    if (!targetSpeciesId || typeof targetSpeciesId !== "string") {
      return NextResponse.json({ ok: false, reason: "invalid-target" }, { status: 400 });
    }

    const all = await readObservations();
    const discovered = new Set(
      all.filter((o) => o.userId === DEMO_USER.id).map((o) => o.speciesId),
    );

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

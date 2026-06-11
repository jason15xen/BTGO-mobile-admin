import { NextResponse } from "next/server";
import { placeFence } from "@/lib/gameStore";
import { spendGuestBMile } from "@/lib/guestStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Fence cost — 1 B-mile (free during 駆除イベント; PoC keeps the paid path). */
const FENCE_COST = 1;

export async function POST(req: Request) {
  try {
    const { speciesId } = await req.json();
    if (!speciesId || typeof speciesId !== "string") {
      return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
    }
    const result = placeFence(speciesId);
    if (result === "not-invasive") return NextResponse.json({ ok: false, reason: "not-invasive" });
    if (result === "already") return NextResponse.json({ ok: false, reason: "already" });

    const balance = spendGuestBMile(FENCE_COST);
    if (balance === null) return NextResponse.json({ ok: false, reason: "no-bmile" });

    return NextResponse.json({ ok: true, balance, cost: FENCE_COST });
  } catch {
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}

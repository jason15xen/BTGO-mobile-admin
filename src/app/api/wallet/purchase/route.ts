import { NextResponse } from "next/server";
import { purchaseGuestCoupon } from "@/lib/guestStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { storeName, label, cost } = await req.json();
    if (!storeName || !label || typeof cost !== "number") {
      return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
    }

    const result = purchaseGuestCoupon({ storeName, label, cost });
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}

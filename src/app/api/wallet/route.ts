import { NextResponse } from "next/server";
import { getGuestWallet } from "@/lib/guestStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const doc = getGuestWallet();
    return NextResponse.json({ balance: doc.balance, coupons: doc.coupons });
  } catch (e) {
    return NextResponse.json(
      { error: "wallet_failed", message: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}

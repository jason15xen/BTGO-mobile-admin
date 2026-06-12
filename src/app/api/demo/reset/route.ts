import { NextResponse } from "next/server";
import { resetDemoFlow } from "@/lib/demoReset";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    resetDemoFlow();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}

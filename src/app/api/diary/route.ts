import { NextResponse } from "next/server";
import { readObservations } from "@/lib/dataStore";
import { getGuestProfile } from "@/lib/guestStore";
import { getAnnotation, setAnnotation, weatherFor } from "@/lib/diaryStore";
import type { DiaryEntry } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Auto nature journal — one entry per capture (newest first). */
export async function GET() {
  try {
    const user = getGuestProfile();
    const obs = await readObservations();
    const entries: DiaryEntry[] = obs
      .filter((o) => o.userId === user.id)
      .map((o) => {
        const a = getAnnotation(o.id);
        return {
          id: o.id,
          speciesId: o.speciesId,
          userId: o.userId,
          observedAt: o.observedAt,
          area: o.area,
          weather: weatherFor(o.id + o.observedAt),
          note: a.note,
          emotion: a.emotion,
        };
      });
    return NextResponse.json({ entries });
  } catch {
    return NextResponse.json({ entries: [] });
  }
}

/** Save a note / emotion stamp for an entry. */
export async function POST(req: Request) {
  try {
    const { id, note, emotion } = await req.json();
    if (!id || typeof id !== "string") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const patch: { note?: string; emotion?: string } = {};
    if (note !== undefined) patch.note = String(note).slice(0, 200);
    if (emotion !== undefined) patch.emotion = String(emotion);
    const annotation = setAnnotation(id, patch);
    return NextResponse.json({ ok: true, annotation });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

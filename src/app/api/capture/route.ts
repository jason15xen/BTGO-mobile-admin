import { NextResponse } from "next/server";
import { getCurrentUser, isAuthConfigured, resolveUserId, resolveUserName } from "@/lib/auth";
import { addObservation, readObservations } from "@/lib/dataStore";
import { SPECIES_BY_ID } from "@/data/species";
import { rewardForCapture } from "@/lib/game";
import type { Observation } from "@/lib/types";

// Always run on the Node.js runtime (fs access), never Edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SPOTS = [
  { name: "河口湖", lat: 35.517, lng: 138.754 },
  { name: "山中湖", lat: 35.418, lng: 138.872 },
  { name: "白糸の滝", lat: 35.323, lng: 138.595 },
  { name: "青木ヶ原樹海", lat: 35.47, lng: 138.62 },
  { name: "富士山五合目", lat: 35.36, lng: 138.73 },
  { name: "富士市街", lat: 35.161, lng: 138.676 },
  { name: "田子の浦", lat: 35.13, lng: 138.7 },
];

export async function GET() {
  try {
    const user = await getCurrentUser();
    const userId = resolveUserId(user);
    const all = await readObservations();
    const discovered = Array.from(
      new Set(all.filter((o) => o.userId === userId).map((o) => o.speciesId)),
    );
    return NextResponse.json({ discovered, userId });
  } catch {
    return NextResponse.json({ discovered: [], userId: "u-demo" });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (isAuthConfigured() && !user) {
      return NextResponse.json(
        { error: "unauthorized", message: "ログインが必要です。" },
        { status: 401 },
      );
    }

    const userId = resolveUserId(user);
    const userName = resolveUserName(user);

    const { speciesId } = await req.json();
    const species = SPECIES_BY_ID[speciesId];
    if (!species) {
      return NextResponse.json({ error: "unknown species" }, { status: 400 });
    }

    const spot = SPOTS[Math.floor(Math.random() * SPOTS.length)];
    const jitter = () => (Math.random() - 0.5) * 0.02;

    // Read existing data (falls back to bundled seed; never throws).
    let all: Observation[] = [];
    try {
      all = await readObservations();
    } catch {
      all = [];
    }

    const observation: Observation = {
      id: `obs-cap-${Date.now()}`,
      speciesId,
      userId,
      userName,
      lat: Number((spot.lat + jitter()).toFixed(5)),
      lng: Number((spot.lng + jitter()).toFixed(5)),
      area: spot.name,
      observedAt: new Date().toISOString(),
      status: "verified",
    };

    // Persist if possible; ignore on read-only hosts (e.g. Vercel).
    try {
      await addObservation(observation);
    } catch {
      /* ignore */
    }

    const isNewSpecies = !all.some(
      (o) => o.userId === userId && o.speciesId === speciesId,
    );
    const reward = rewardForCapture(species, isNewSpecies);
    const myDiscovered = Array.from(
      new Set(
        all
          .concat(observation)
          .filter((o) => o.userId === userId)
          .map((o) => o.speciesId),
      ),
    );

    return NextResponse.json({ observation, reward, isNewSpecies, myDiscovered, userId });
  } catch (e) {
    // Last-resort guard so the capture flow never breaks the demo.
    return NextResponse.json(
      { error: "capture_failed", message: e instanceof Error ? e.message : String(e) },
      { status: 200 }
    );
  }
}

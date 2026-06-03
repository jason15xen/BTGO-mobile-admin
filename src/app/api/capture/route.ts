import { NextResponse } from "next/server";
import { addObservation, readObservations } from "@/lib/dataStore";
import { SPECIES_BY_ID } from "@/data/species";
import { DEMO_USER, rewardFor } from "@/lib/game";
import type { Observation } from "@/lib/types";

// Capture locations around the Mt. Fuji region (matches the dashboard hotspots).
const SPOTS = [
  { name: "河口湖", lat: 35.517, lng: 138.754 },
  { name: "山中湖", lat: 35.418, lng: 138.872 },
  { name: "白糸の滝", lat: 35.323, lng: 138.595 },
  { name: "青木ヶ原樹海", lat: 35.47, lng: 138.62 },
  { name: "富士山五合目", lat: 35.36, lng: 138.73 },
  { name: "富士市街", lat: 35.161, lng: 138.676 },
  { name: "田子の浦", lat: 35.13, lng: 138.7 },
];

export async function POST(req: Request) {
  const { speciesId } = await req.json();
  const species = SPECIES_BY_ID[speciesId];
  if (!species) {
    return NextResponse.json({ error: "unknown species" }, { status: 400 });
  }

  const spot = SPOTS[Math.floor(Math.random() * SPOTS.length)];
  const jitter = () => (Math.random() - 0.5) * 0.02;

  const all = await readObservations();
  const observation: Observation = {
    id: `obs-cap-${Date.now()}`,
    speciesId,
    userId: DEMO_USER.id,
    userName: DEMO_USER.name,
    lat: Number((spot.lat + jitter()).toFixed(5)),
    lng: Number((spot.lng + jitter()).toFixed(5)),
    area: spot.name,
    observedAt: new Date().toISOString(),
    status: "verified",
  };
  await addObservation(observation);

  const reward = rewardFor(species);
  const isNewSpecies = !all.some(
    (o) => o.userId === DEMO_USER.id && o.speciesId === speciesId
  );

  const myDiscovered = Array.from(
    new Set(
      all
        .concat(observation)
        .filter((o) => o.userId === DEMO_USER.id)
        .map((o) => o.speciesId)
    )
  );

  return NextResponse.json({ observation, reward, isNewSpecies, myDiscovered });
}

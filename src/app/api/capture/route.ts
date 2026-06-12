import { NextResponse } from "next/server";
import { addObservation } from "@/lib/dataStore";
import { getGuestProfile, grantGuestBMile } from "@/lib/guestStore";
import { SPECIES_BY_ID } from "@/data/species";
import {
  advanceDemoCapture,
  getDemoCaptureStep,
  getDemoDiscoveredIds,
  getDemoPyramidLevel,
  getNextScriptedCapture,
  syncDemoStep,
} from "@/lib/demoState";
import { DEMO_CAPTURE_SCRIPT, PYRAMID_COMPLETE_REWARD } from "@/lib/demoScript";
import { rewardForCapture } from "@/lib/game";
import { completeCapture } from "@/lib/gameStore";
import type { Observation } from "@/lib/types";

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

export async function GET(req: Request) {
  try {
    const user = getGuestProfile();
    syncDemoStep(Number(new URL(req.url).searchParams.get("step") ?? 0));
    const next = getNextScriptedCapture();
    const step = getDemoCaptureStep();
    return NextResponse.json({
      discovered: getDemoDiscoveredIds(),
      userId: user.id,
      demo: {
        pyramidLevel: getDemoPyramidLevel(),
        captureStep: step,
        nextCapture: next,
        capturesRemaining: next ? DEMO_CAPTURE_SCRIPT.length - step : 0,
      },
    });
  } catch {
    return NextResponse.json({ discovered: [], userId: null });
  }
}

export async function POST(req: Request) {
  try {
    const user = getGuestProfile();
    // Progress is client-authoritative (localStorage): the client sends its
    // current step and we mirror it before deriving anything. The photo payload
    // is otherwise not authoritative — any capture advances the scripted step,
    // with no enforced order and no "wrong species" rejection.
    const body = await req.json().catch(() => ({}));
    syncDemoStep(Number(body?.captureStep ?? 0));

    const next = getNextScriptedCapture();
    if (!next) {
      // Demo already finished — every pyramid slot is filled.
      return NextResponse.json({
        done: true,
        myDiscovered: getDemoDiscoveredIds(),
        userId: user.id,
        demo: {
          pyramidLevel: getDemoPyramidLevel(),
          captureStep: getDemoCaptureStep(),
          nextCapture: null,
        },
      });
    }

    const speciesId = next.speciesId;
    const species = SPECIES_BY_ID[speciesId];
    if (!species) {
      return NextResponse.json({ error: "unknown species" }, { status: 400 });
    }

    const spot = SPOTS[Math.floor(Math.random() * SPOTS.length)];
    const jitter = () => (Math.random() - 0.5) * 0.02;

    const observation: Observation = {
      id: `obs-cap-${Date.now()}`,
      speciesId,
      userId: user.id,
      userName: user.name,
      lat: Number((spot.lat + jitter()).toFixed(5)),
      lng: Number((spot.lng + jitter()).toFixed(5)),
      area: spot.name,
      observedAt: new Date().toISOString(),
      status: "verified",
    };

    try {
      await addObservation(observation);
    } catch {
      /* ignore */
    }

    const feedOnly = next.kind === "re_discover";
    const alreadyDiscovered = feedOnly;
    const onPyramidBefore = getDemoDiscoveredIds();
    const isNewOnPyramid = !feedOnly && !onPyramidBefore.includes(speciesId);

    const { pwValue, onPyramid, pyramidComplete, newPyramidLevel } = completeCapture(
      speciesId,
      { feedOnly },
    );

    advanceDemoCapture();

    let reward = rewardForCapture(species, isNewOnPyramid);
    if (pyramidComplete) {
      reward = { ...PYRAMID_COMPLETE_REWARD };
      grantGuestBMile(PYRAMID_COMPLETE_REWARD.points);
    } else if (feedOnly) {
      reward = { xp: 0, points: 0 };
    }

    return NextResponse.json({
      observation,
      reward,
      recognizedSpeciesId: speciesId,
      isNewSpecies: isNewOnPyramid,
      alreadyDiscovered,
      myDiscovered: getDemoDiscoveredIds(),
      userId: user.id,
      feed: { pwValue },
      feedOnly,
      onPyramid,
      pyramidComplete,
      demoPyramidLevel: newPyramidLevel,
      demo: {
        pyramidLevel: newPyramidLevel,
        captureStep: getDemoCaptureStep(),
        nextCapture: getNextScriptedCapture(),
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: "capture_failed", message: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}

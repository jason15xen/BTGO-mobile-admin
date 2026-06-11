import { NextResponse } from "next/server";
import { readObservations } from "@/lib/dataStore";
import { discoveriesByUser, computeUserStats } from "@/lib/game";
import { getGuestProfile, updateGuestProfile } from "@/lib/guestStore";
import { getGameState } from "@/lib/gameStore";
import { pyramidSummary } from "@/lib/pyramidSummary";
import { PYRAMID_TOTAL } from "@/data/species";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AVATAR_PRESETS = ["🌿", "🦊", "🐦", "🦋", "🐢", "🌸", "🗻", "🐸"];

export async function GET() {
  try {
    const user = getGuestProfile();
    const obs = await readObservations();
    const discoveries = discoveriesByUser(obs, user.id);
    const discovered = Object.keys(discoveries);
    const stats = computeUserStats(obs, user.id);
    const pyramid = pyramidSummary(discovered, PYRAMID_TOTAL);
    const game = getGameState(discovered);

    return NextResponse.json({
      profile: user,
      stats,
      pyramid,
      discovered,
      game,
      avatarPresets: AVATAR_PRESETS,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "player_failed", message: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 20) : undefined;
    const avatar = typeof body.avatar === "string" ? body.avatar.slice(0, 8) : undefined;

    if (name !== undefined && name.length < 1) {
      return NextResponse.json({ error: "invalid_name" }, { status: 400 });
    }

    const profile = updateGuestProfile({ name, avatar });
    return NextResponse.json({ profile });
  } catch (e) {
    return NextResponse.json(
      { error: "update_failed", message: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}

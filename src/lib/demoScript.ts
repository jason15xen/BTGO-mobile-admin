import { SPECIES, PYRAMID_SLOTS } from "@/data/species";
import type { Ecosystem, Species } from "@/lib/types";

export const DEMO_PYRAMID_ECO: Ecosystem = "terrestrial";

export const PYRAMID_COMPLETE_REWARD = { points: 30, xp: 150 } as const;

export type DemoCaptureKind = "new_species" | "re_discover";

export type DemoCaptureEntry = {
  speciesId: string;
  kind: DemoCaptureKind;
};

/** All pyramid slot species for an ecosystem (10 each). */
export function pyramidSpeciesForEco(ecosystem: Ecosystem): Species[] {
  const inEco = SPECIES.filter((s) => s.ecosystem === ecosystem);
  const levels = [4, 3, 2, 1] as const;
  return levels.flatMap((level) =>
    inEco.filter((s) => s.trophicLevel === level).slice(0, PYRAMID_SLOTS[level]),
  );
}

export function terrestrialPyramidSpecies(): Species[] {
  return pyramidSpeciesForEco("terrestrial");
}

/** All 10 terrestrial pyramid slot IDs (for completion celebration). */
export const TERRESTRIAL_PYRAMID_IDS = terrestrialPyramidSpecies().map((s) => s.id);

export const PYRAMID_CELEBRATION_HOLD_MS = 5000;
export const PYRAMID_DECK_FLIP_MS = 1350;

/** 9 terrestrial + 1 pre-discovered freshwater (アオサギ). */
export const DEMO_INITIAL_INDIVIDUALS: { speciesId: string; pw: number }[] = [
  { speciesId: "t-kingfisher", pw: 10 },
  { speciesId: "t-fox", pw: 8 },
  { speciesId: "t-stagbeetle", pw: 7 },
  { speciesId: "t-monarch", pw: 6 },
  { speciesId: "t-bee", pw: 5 },
  { speciesId: "t-sakura", pw: 120 },
  { speciesId: "t-fern", pw: 7 },
  { speciesId: "t-bamboo", pw: 2 },
  { speciesId: "t-grass", pw: 2 },
  { speciesId: "f-heron", pw: 8 },
];

const FW_UNDISCOVERED = pyramidSpeciesForEco("freshwater")
  .map((s) => s.id)
  .filter((id) => id !== "f-heron");

const MARINE_UNDISCOVERED = pyramidSpeciesForEco("marine").map((s) => s.id);

/** Full demo capture sequence after the initial 9+1 state. */
export const DEMO_CAPTURE_SCRIPT: DemoCaptureEntry[] = [
  { speciesId: "t-hawk", kind: "new_species" },
  { speciesId: "f-heron", kind: "re_discover" },
  ...FW_UNDISCOVERED.map((speciesId) => ({ speciesId, kind: "new_species" as const })),
  ...MARINE_UNDISCOVERED.map((speciesId) => ({ speciesId, kind: "new_species" as const })),
];

export function isTerrestrialSlot(speciesId: string): boolean {
  return terrestrialPyramidSpecies().some((s) => s.id === speciesId);
}

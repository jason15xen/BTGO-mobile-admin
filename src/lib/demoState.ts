import "server-only";
import {
  DEMO_CAPTURE_SCRIPT,
  DEMO_INITIAL_INDIVIDUALS,
  type DemoCaptureEntry,
} from "@/lib/demoScript";
import { createServerMemory } from "@/lib/serverMemory";
import type { Ecosystem } from "@/lib/types";

type DemoMemory = {
  terrestrialRound: number;
  captureStep: number;
  pyramidJustCompleted: boolean;
};

const getMemory = createServerMemory<DemoMemory>("__btgoDemoState", () => ({
  terrestrialRound: 1,
  captureStep: 0,
  pyramidJustCompleted: false,
}));

export function getDemoPyramidLevel() {
  return getMemory().terrestrialRound;
}

export function getTerrestrialRound() {
  return getMemory().terrestrialRound;
}

export function getDemoCaptureStep() {
  return getMemory().captureStep;
}

export function consumePyramidJustCompleted() {
  const mem = getMemory();
  const v = mem.pyramidJustCompleted;
  mem.pyramidJustCompleted = false;
  return v;
}

export function getNextScriptedCapture(): DemoCaptureEntry | null {
  const mem = getMemory();
  if (mem.captureStep >= DEMO_CAPTURE_SCRIPT.length) return null;
  return DEMO_CAPTURE_SCRIPT[mem.captureStep];
}

export function getDemoDiscoveredIds(): string[] {
  const ecosystems: Ecosystem[] = ["terrestrial", "freshwater", "marine"];
  const ids = new Set<string>();
  for (const eco of ecosystems) {
    for (const id of getPyramidFilledIds(eco)) ids.add(id);
  }
  return [...ids];
}

/** Authoritative filled pyramid slots per ecosystem (drives UI). */
export function getPyramidFilledIds(ecosystem: Ecosystem): string[] {
  const mem = getMemory();
  const prefix = ecosystem === "terrestrial" ? "t-" : ecosystem === "freshwater" ? "f-" : "m-";

  // Terrestrial pyramid is "flipped" into an empty deck once completed (round > 1).
  if (ecosystem === "terrestrial" && mem.terrestrialRound > 1) {
    return [];
  }

  const filled = new Set<string>();

  // Pre-discovered initial individuals that belong to THIS ecosystem only.
  // (The 9 terrestrial entities on round 1; the lone pre-discovered freshwater
  // heron stays on the freshwater pyramid across rounds.)
  for (const { speciesId } of DEMO_INITIAL_INDIVIDUALS) {
    if (speciesId.startsWith(prefix)) filled.add(speciesId);
  }

  for (let i = 0; i < mem.captureStep; i++) {
    const cap = DEMO_CAPTURE_SCRIPT[i];
    if (cap.kind !== "new_species") continue;
    if (!cap.speciesId.startsWith(prefix)) continue;
    filled.add(cap.speciesId);
  }

  return [...filled];
}

export function getPyramidFilledMap(): Record<Ecosystem, string[]> {
  return {
    terrestrial: getPyramidFilledIds("terrestrial"),
    freshwater: getPyramidFilledIds("freshwater"),
    marine: getPyramidFilledIds("marine"),
  };
}

/** Species that should exist as game individuals for the current demo step. */
export function getDemoActiveSpeciesIds(): string[] {
  return getDemoDiscoveredIds();
}

export function advanceDemoCapture(entry: DemoCaptureEntry) {
  const mem = getMemory();
  const expected = getNextScriptedCapture();
  if (!expected || expected.speciesId !== entry.speciesId || expected.kind !== entry.kind) {
    return { ok: false as const, reason: "unexpected_capture" as const };
  }
  mem.captureStep++;
  return { ok: true as const, step: mem.captureStep };
}

export function markTerrestrialPyramidCompleted() {
  const mem = getMemory();
  mem.pyramidJustCompleted = true;
  mem.terrestrialRound++;
}

export function shouldSeedInitialPyramid(): boolean {
  return getMemory().terrestrialRound === 1;
}

export function getDemoInitialIndividuals() {
  const round = getMemory().terrestrialRound;
  if (round === 1) return DEMO_INITIAL_INDIVIDUALS;
  return DEMO_INITIAL_INDIVIDUALS.filter((i) => i.speciesId.startsWith("f-"));
}

/** @deprecated use getDemoDiscoveredIds */
export function getDemoPyramidDiscovered(): string[] {
  return getDemoDiscoveredIds();
}

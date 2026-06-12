import "server-only";
import {
  DEMO_CAPTURE_SCRIPT,
  DEMO_INITIAL_INDIVIDUALS,
  type DemoCaptureEntry,
} from "@/lib/demoScript";
import { createServerMemory } from "@/lib/serverMemory";

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
  const mem = getMemory();
  const ids = new Set(getDemoInitialIndividualIds(mem.terrestrialRound));
  for (let i = 0; i < mem.captureStep; i++) {
    const cap = DEMO_CAPTURE_SCRIPT[i];
    if (cap.kind === "new_species") ids.add(cap.speciesId);
  }
  // After terrestrial Lv.1 completes, the deck resets — terrestrial slots start undiscovered again.
  if (mem.terrestrialRound > 1) {
    return [...ids].filter((id) => !id.startsWith("t-"));
  }
  return [...ids];
}

function getDemoInitialIndividualIds(terrestrialRound: number): string[] {
  if (terrestrialRound > 1) {
    return DEMO_INITIAL_INDIVIDUALS.filter((i) => i.speciesId.startsWith("f-")).map((i) => i.speciesId);
  }
  return DEMO_INITIAL_INDIVIDUALS.map((i) => i.speciesId);
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

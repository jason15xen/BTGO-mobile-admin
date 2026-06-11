import "server-only";
import {
  DEMO_CAPTURE_SCRIPT,
  DEMO_INITIAL_INDIVIDUALS,
  type DemoCaptureEntry,
} from "@/lib/demoScript";

let terrestrialRound = 1;
let captureStep = 0;
let pyramidJustCompleted = false;

export function getDemoPyramidLevel() {
  return terrestrialRound;
}

export function getTerrestrialRound() {
  return terrestrialRound;
}

export function getDemoCaptureStep() {
  return captureStep;
}

export function consumePyramidJustCompleted() {
  const v = pyramidJustCompleted;
  pyramidJustCompleted = false;
  return v;
}

export function getNextScriptedCapture(): DemoCaptureEntry | null {
  if (captureStep >= DEMO_CAPTURE_SCRIPT.length) return null;
  return DEMO_CAPTURE_SCRIPT[captureStep];
}

/** Species the demo treats as discovered (for pyramid / feed UI). */
export function getDemoDiscoveredIds(): string[] {
  const ids = new Set(getDemoInitialIndividualIds());
  for (let i = 0; i < captureStep; i++) {
    const cap = DEMO_CAPTURE_SCRIPT[i];
    if (cap.kind === "new_species") ids.add(cap.speciesId);
  }
  return [...ids];
}

function getDemoInitialIndividualIds(): string[] {
  if (terrestrialRound > 1) {
    return DEMO_INITIAL_INDIVIDUALS.filter((i) => i.speciesId.startsWith("f-")).map((i) => i.speciesId);
  }
  return DEMO_INITIAL_INDIVIDUALS.map((i) => i.speciesId);
}

export function advanceDemoCapture(entry: DemoCaptureEntry) {
  const expected = getNextScriptedCapture();
  if (!expected || expected.speciesId !== entry.speciesId || expected.kind !== entry.kind) {
    return { ok: false as const, reason: "unexpected_capture" as const };
  }
  captureStep++;
  return { ok: true as const, step: captureStep };
}

export function markTerrestrialPyramidCompleted() {
  pyramidJustCompleted = true;
  terrestrialRound++;
}

export function shouldSeedInitialPyramid(): boolean {
  return terrestrialRound === 1;
}

export function getDemoInitialIndividuals() {
  if (terrestrialRound === 1) return DEMO_INITIAL_INDIVIDUALS;
  return DEMO_INITIAL_INDIVIDUALS.filter((i) => i.speciesId.startsWith("f-"));
}

/** @deprecated use getDemoDiscoveredIds */
export function getDemoPyramidDiscovered(): string[] {
  return getDemoDiscoveredIds();
}

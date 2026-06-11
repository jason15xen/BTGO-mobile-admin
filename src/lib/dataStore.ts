import "server-only";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Observation } from "./types";
import seed from "@/data/seedObservations.json";

const SEED = seed as Observation[];
const STORE_PATH = join(process.cwd(), "..", "shared", "observations.json");
let memory: Observation[] | null = null;

async function readLegacyObservations(): Promise<Observation[]> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const data = JSON.parse(raw) as Observation[];
    if (Array.isArray(data) && data.length > 0) return data;
  } catch {
    /* fall through */
  }
  if (memory) return memory;
  return SEED;
}

async function addLegacyObservation(obs: Observation): Promise<void> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const all = JSON.parse(raw) as Observation[];
    all.unshift(obs);
    await writeFile(STORE_PATH, JSON.stringify(all, null, 2), "utf8");
    return;
  } catch {
    /* read-only */
  }
  memory = [obs, ...(memory ?? SEED)];
}

export async function readObservations(): Promise<Observation[]> {
  return readLegacyObservations();
}

export async function addObservation(obs: Observation): Promise<void> {
  return addLegacyObservation(obs);
}

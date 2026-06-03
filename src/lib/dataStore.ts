import "server-only";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Observation } from "./types";

// Shared store lives one level up from this project's root.
// user-app cwd = <repo>/user-app  ->  <repo>/shared/observations.json
const STORE_PATH = join(process.cwd(), "..", "shared", "observations.json");

export async function readObservations(): Promise<Observation[]> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as Observation[];
  } catch {
    return [];
  }
}

export async function addObservation(obs: Observation): Promise<void> {
  const all = await readObservations();
  all.unshift(obs);
  await writeFile(STORE_PATH, JSON.stringify(all, null, 2), "utf8");
}

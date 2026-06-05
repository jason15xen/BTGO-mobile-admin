import "server-only";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Observation } from "./types";
import seed from "@/data/seedObservations.json";

// Bundled demo dataset — always available (works on Vercel / read-only hosts).
const SEED = seed as Observation[];

// In local dev a writable shared store powers the live link to the dashboard.
// On Vercel this path is outside the deployment and read-only, so we fall back
// to the bundled SEED above.
const STORE_PATH = join(process.cwd(), "..", "shared", "observations.json");

let memory: Observation[] | null = null; // in-memory captures when fs is read-only

export async function readObservations(): Promise<Observation[]> {
  // 1) writable shared file (local dev)
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const data = JSON.parse(raw) as Observation[];
    if (Array.isArray(data) && data.length > 0) return data;
  } catch {
    /* not available — fall through */
  }
  // 2) in-memory (captures made this server instance) on top of the seed
  if (memory) return memory;
  return SEED;
}

export async function addObservation(obs: Observation): Promise<void> {
  // Try to persist to the shared file (local dev → live link to dashboard).
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const all = JSON.parse(raw) as Observation[];
    all.unshift(obs);
    await writeFile(STORE_PATH, JSON.stringify(all, null, 2), "utf8");
    return;
  } catch {
    /* read-only host (e.g. Vercel) — keep it in memory so the session still works */
  }
  memory = [obs, ...(memory ?? SEED)];
}

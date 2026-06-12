import "server-only";
import { clearServerMemory } from "@/lib/serverMemory";

const DEMO_STATE_KEY = "__btgoDemoState";
const GAME_STORE_KEY = "__btgoGameStore";
const GUEST_STORE_KEY = "__btgoGuestStore";

/** Reset scripted demo + pyramid game state (e.g. on full page refresh). */
export function resetDemoFlow() {
  clearServerMemory(DEMO_STATE_KEY);
  clearServerMemory(GAME_STORE_KEY);
  clearServerMemory(GUEST_STORE_KEY);
}

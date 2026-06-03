import type { Observation, Species } from "./types";
import { SPECIES_BY_ID } from "@/data/species";

export const DEMO_USER = { id: "u-demo", name: "あなた" };

export const XP_PER_LEVEL = 1000;

// Title for each level — "森の守り人" (Forest Guardian) etc.
const LEVEL_TITLES = [
  "はじめての探索者",
  "新米レンジャー",
  "森の見習い",
  "森の守り人",
  "自然の案内人",
  "生態系マイスター",
  "富士の賢者",
];

export function levelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)] ?? "探索者";
}

/** Reward for logging one observation, mirroring the AI-result screen. */
export function rewardFor(species: Species): { xp: number; points: number } {
  const rareBonus = species.rarity === "rare" ? 30 : species.rarity === "legendary" ? 60 : 0;
  const invasiveBonus = species.invasive ? 20 : 0;
  return {
    xp: 150 + rareBonus * 2,
    points: 30 + rareBonus + invasiveBonus,
  };
}

export interface UserStats {
  discoveries: number;
  speciesCount: number;
  points: number;
  xp: number;
  level: number;
  title: string;
  xpInLevel: number;
  xpForLevel: number;
}

export function computeUserStats(allObs: Observation[]): UserStats {
  const mine = allObs.filter((o) => o.userId === DEMO_USER.id);
  const species = new Set<string>();
  let xp = 0;
  let points = 0;
  for (const o of mine) {
    const sp = SPECIES_BY_ID[o.speciesId];
    if (!sp) continue;
    species.add(o.speciesId);
    const r = rewardFor(sp);
    xp += r.xp;
    points += r.points;
  }
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  return {
    discoveries: mine.length,
    speciesCount: species.size,
    points,
    xp,
    level,
    title: levelTitle(level),
    xpInLevel: xp % XP_PER_LEVEL,
    xpForLevel: XP_PER_LEVEL,
  };
}

export function myObservations(allObs: Observation[]): Observation[] {
  return allObs.filter((o) => o.userId === DEMO_USER.id);
}

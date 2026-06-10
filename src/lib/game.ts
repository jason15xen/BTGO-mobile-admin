import type { Observation, Species } from "./types";
import { SPECIES_BY_ID } from "@/data/species";

export const DEMO_USER = { id: "u-demo", name: "あなた" };

/** PoC demo balance — lets you test coupon purchases. */
export const DEMO_B_MILE_BALANCE = 1_000_000;

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

/** PoC: full reward on first discovery, reduced on re-capture. */
export function rewardForCapture(species: Species, isNewSpecies: boolean): { xp: number; points: number } {
  const base = rewardFor(species);
  if (isNewSpecies) return base;
  return {
    xp: Math.max(40, Math.round(base.xp * 0.25)),
    points: Math.max(10, Math.round(base.points * 0.3)),
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

export function computeUserStats(allObs: Observation[], userId: string = DEMO_USER.id): UserStats {
  const mine = allObs.filter((o) => o.userId === userId);
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
    points: Math.max(points, DEMO_B_MILE_BALANCE),
    xp,
    level,
    title: levelTitle(level),
    xpInLevel: xp % XP_PER_LEVEL,
    xpForLevel: XP_PER_LEVEL,
  };
}

export function myObservations(allObs: Observation[], userId: string = DEMO_USER.id): Observation[] {
  return allObs.filter((o) => o.userId === userId);
}

export interface Discovery {
  count: number;
  /** earliest observation date (when first discovered) */
  firstFound: string;
  /** most recent find location */
  area: string;
  lat: number;
  lng: number;
}

/** Per-species discovery info for the current user (date, location, count). */
export function discoveriesByUser(allObs: Observation[], userId: string = DEMO_USER.id): Record<string, Discovery> {
  const map: Record<string, Discovery> = {};
  const latest: Record<string, string> = {};
  for (const o of allObs) {
    if (o.userId !== userId) continue;
    const d = map[o.speciesId];
    if (!d) {
      map[o.speciesId] = { count: 1, firstFound: o.observedAt, area: o.area, lat: o.lat, lng: o.lng };
      latest[o.speciesId] = o.observedAt;
    } else {
      d.count++;
      if (o.observedAt < d.firstFound) d.firstFound = o.observedAt;
      if (o.observedAt > latest[o.speciesId]) {
        latest[o.speciesId] = o.observedAt;
        d.area = o.area;
        d.lat = o.lat;
        d.lng = o.lng;
      }
    }
  }
  return map;
}
